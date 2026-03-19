import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ChevronDown, MoreVertical, Search, Phone, Video } from 'lucide-react';
import api from '../api';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

export default function ChatWindow({ conversation, currentUser, socket, onMessageSent }) {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showScrollDown, setShowScrollDown] = useState(false);
  const scrollRef = useRef();
  const containerRef = useRef();

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

  // Handle scroll detection for the scroll-to-bottom button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // Show button if scrolled up more than 100px from bottom
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
  };

  // Auto-scroll to latest message
  const scrollToBottom = (smooth = true) => {
    scrollRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
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
    return other ? other.username : 'Unknown User';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0a0f1e] relative shadow-inner overflow-hidden transition-colors duration-300">
      {/* Background noise and textures */}
      <div className="noise-bg mix-blend-overlay"></div>
      
      {/* Subtle Chat background pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-[0.03] pointer-events-none"></div>

      {/* Header */}
      <div className="frosted-header px-6 py-3.5 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
              {getChatName()[0]?.toUpperCase()}
            </div>
            {conversation.type !== 'group' && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#111827]"></div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="font-semibold text-gray-800 dark:text-gray-100 text-lg tracking-wide">{getChatName()}</div>
            <div className={`text-xs font-medium transition-colors ${typingUsers.size > 0 ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {typingUsers.size > 0 ? 'typing...' : (conversation.type === 'group' ? `${conversation.members.length} members` : 'online')}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
          <button className="hover:text-green-500 dark:hover:text-green-400 transition-colors hidden sm:block"><Video size={20} /></button>
          <button className="hover:text-green-500 dark:hover:text-green-400 transition-colors hidden sm:block"><Phone size={19} /></button>
          <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block"></div>
          <button className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"><Search size={19} /></button>
          <button className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"><MoreVertical size={20} /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 z-10 scroll-smooth relative"
        onScroll={handleScroll}
        ref={containerRef}
      >
        {messages.length > 0 && (
          <div className="flex justify-center my-6">
            <div className="theme-glass px-4 py-1.5 rounded-full text-xs text-gray-500 dark:text-gray-300 font-medium tracking-wider uppercase shadow-sm">
              Today
            </div>
          </div>
        )}

        {/* Security Notification */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/70 dark:bg-[#1f2937]/70 backdrop-blur-sm border border-yellow-500/20 px-4 py-2 rounded-lg text-xs text-yellow-600 dark:text-yellow-500/80 font-medium text-center max-w-sm shadow-sm flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500/20 flex items-center justify-center shrink-0">🔒</div>
            Messages are end-to-end encrypted. Nobody outside of this chat can read them.
          </div>
        </div>

        {messages.map((m, index) => {
          const isMine = m.sender && (m.sender._id === currentUser._id || m.sender === currentUser._id);
          return (
            <div 
              key={m._id || index}
              className={`w-full flex ${isMine ? 'justify-end' : 'justify-start'} ${isMine ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}
            >
              <MessageBubble message={m} currentUser={currentUser} conversationType={conversation.type} />
            </div>
          );
        })}
        
        {/* Typing Indicator Bubble */}
        {typingUsers.size > 0 && (
          <div className="flex justify-start animate-spring-pop w-full mb-2">
            <div className="theme-glass rounded-2xl rounded-tl-none px-4 py-3 shadow-md flex space-x-1.5 items-center">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full typing-dot"></div>
            </div>
          </div>
        )}
        
        {/* Invisible div to scroll to */}
        <div ref={scrollRef} className="h-1"></div>
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollDown && (
        <button 
          onClick={() => scrollToBottom()}
          className="absolute bottom-24 right-6 z-30 w-10 h-10 rounded-full theme-glass flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-all duration-300 shadow-md animate-pop-in"
        >
          <ChevronDown size={24} />
        </button>
      )}

      {/* Input Area */}
      <div className="z-20">
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
