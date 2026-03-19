import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

export default function MessageInput({ onSend, socket, conversationId, currentUser }) {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (text.trim() === '') return;
    
    // Clear typing indicator instantly
    if (socket) {
      socket.emit('stopTyping', { conversationId, senderId: currentUser._id });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    onSend(text);
    setText('');
  };

  const handleInputChange = (e) => {
    setText(e.target.value);

    // Typing emit logic
    if (socket) {
      socket.emit('typing', { conversationId, senderId: currentUser._id });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', { conversationId, senderId: currentUser._id });
      }, 1500);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <div className="bg-[#f0f2f5] px-4 py-3 flex items-center border-t shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
      <form onSubmit={handleSend} className="flex-1 flex items-center bg-white rounded-full pr-1 pl-4 shadow-sm border border-gray-200 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 transition-all duration-300">
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 py-3 focus:outline-none bg-transparent text-gray-800 placeholder-gray-400 text-[15px]"
          value={text}
          onChange={handleInputChange}
        />
        <button 
          type="submit" 
          className="ml-2 bg-green-500 text-white rounded-full p-2.5 hover:bg-green-600 hover:shadow-md transition-all duration-300 active:scale-90 active:rotate-12 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none disabled:active:rotate-0 flex items-center justify-center my-1"
          disabled={text.trim() === ''}
        >
          <Send size={18} className="translate-x-[1px]" />
        </button>
      </form>
    </div>
  );
}
