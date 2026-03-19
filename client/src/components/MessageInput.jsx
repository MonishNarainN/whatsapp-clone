import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';

export default function MessageInput({ onSend, socket, conversationId, currentUser }) {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

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
    
    // Focus back on input after sending
    inputRef.current?.focus();
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
    <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl px-4 py-3 flex items-center border-t border-gray-200/50 dark:border-gray-700/50 relative transition-colors duration-300">
      {/* Top Border Glow Effect on Focus happens via a focus-within peer class in Tailwind but we'll do an absolute overlay */}
      <div className="absolute top-0 left-0 right-0 h-px bg-transparent transition-colors duration-300 peer-focus-within:bg-green-500 shadow-[0_0_10px_rgba(37,211,102,0.8)] opacity-0 peer-focus-within:opacity-100"></div>

      <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mr-2 shrink-0">
        <button className="hover:text-green-500 dark:hover:text-green-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95">
          <Smile size={22} className="opacity-90" />
        </button>
        <button className="hover:text-green-500 dark:hover:text-green-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95">
          <Paperclip size={20} className="opacity-90" />
        </button>
      </div>

      <form 
        onSubmit={handleSend} 
        className="flex-1 flex items-center bg-gray-100/90 dark:bg-[#1f2937]/90 rounded-2xl pr-1.5 pl-4 shadow-inner border border-gray-300 dark:border-gray-700 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500/50 transition-all duration-300 group peer"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message"
          className="flex-1 py-3.5 focus:outline-none bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-500 text-[15px]"
          value={text}
          onChange={handleInputChange}
        />
        <button 
          type="submit" 
          className="ml-2 btn-shimmer text-white rounded-full p-2.5 disabled:opacity-50 disabled:hover:shadow-none disabled:active:scale-100 disabled:btn-shimmer-none flex items-center justify-center my-1.5 transform transition-all duration-300 active:scale-90 shadow-md group-focus-within:shadow-[0_0_15px_rgba(37,211,102,0.3)]"
          disabled={text.trim() === ''}
        >
          <Send size={18} className="translate-x-[1px] transition-transform duration-300 group-focus-within:-rotate-12" />
        </button>
      </form>
    </div>
  );
}
