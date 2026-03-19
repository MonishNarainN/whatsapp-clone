import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import api from '../api';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

export default function ChatWindow({ conversation, currentUser, socket, onMessageSent }) {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const scrollRef = useRef();

  // Fetch messages when conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/conversations/${conversation._id}/messages`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    };
    fetchMessages();
  }, [conversation]);

  // Handle Socket events
  useEffect(() => {
    if (!socket) return;
    
    socket.emit('joinRoom', conversation._id);

    const handleReceiveMessage = (msg) => {
      if (msg.conversationId === conversation._id) {
        setMessages((prev) => [...prev, msg]);
        // Also if they sent a message, they stopped typing
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(msg.sender._id || msg.sender);
          return newSet;
        });
      }
    };

    const handleTyping = ({ conversationId, senderId }) => {
      if (conversationId === conversation._id && senderId !== currentUser._id) {
        setTypingUsers((prev) => new Set(prev).add(senderId));
      }
    };

    const handleStopTyping = ({ conversationId, senderId }) => {
      if (conversationId === conversation._id) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(senderId);
          return newSet;
        });
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
    };
  }, [socket, conversation, currentUser._id]);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSendMessage = async (text) => {
    try {
      await api.post(`/conversations/${conversation._id}/messages`, {
        sender: currentUser._id,
        text,
      });

      if (socket) {
        socket.emit('sendMessage', {
          conversationId: conversation._id,
          sender: { _id: currentUser._id, username: currentUser.username },
          text,
        });
      }
      onMessageSent();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const getChatName = () => {
    if (conversation.type === 'group') return conversation.name;
    const other = conversation.members.find((m) => m._id !== currentUser._id);
    return other ? other.username : 'Unknown';
  };

  return (
    <div className="flex flex-col h-full bg-[#efeae2] relative shadow-inner">
      {/* Background patterned overlay for cooler UI */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md px-6 py-4 flex items-center shadow-sm z-10 sticky top-0">
        <div className="flex flex-col">
          <div className="font-bold text-gray-800 text-lg">{getChatName()}</div>
          <div className="text-xs text-green-600 font-medium h-4">
            {typingUsers.size > 0 ? 'typing...' : (conversation.type === 'group' ? `${conversation.members.length} members` : '')}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10 scroll-smooth">
        {messages.map((m, index) => {
          const isMine = m.sender && (m.sender._id === currentUser._id || m.sender === currentUser._id);
          return (
            <div 
              ref={index === messages.length - 1 && typingUsers.size === 0 ? scrollRef : null} 
              key={m._id || index}
              className={`w-full flex ${isMine ? 'justify-end' : 'justify-start'} ${isMine ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}
            >
              <MessageBubble message={m} currentUser={currentUser} conversationType={conversation.type} />
            </div>
          );
        })}
        
        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div ref={scrollRef} className="flex justify-start animate-fade-slide-up w-full">
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100 flex space-x-1 items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="z-10">
        <MessageInput 
          onSend={handleSendMessage} 
          socket={socket} 
          conversationId={conversation._id} 
          currentUser={currentUser} 
        />
      </div>
    </div>
  );
}
