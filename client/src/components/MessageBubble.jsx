import React from 'react';
import { format } from 'date-fns';

export default function MessageBubble({ message, currentUser, conversationType }) {
  const isMine = message.sender && (message.sender._id === currentUser._id || message.sender === currentUser._id);

  return (
    <div className={`flex flex-col mb-1 max-w-[75%] message-bubble-container animate-spring-pop transform transition-transform hover:scale-[1.01] duration-200 ${isMine ? 'items-end' : 'items-start'}`}>
      
      {/* Sender name for group chats if not mine */}
      {!isMine && conversationType === 'group' && message.sender?.username && (
        <span className="text-xs text-green-400 font-medium ml-2 mb-1">
          {message.sender.username}
        </span>
      )}

      {/* Bubble */}
      <div 
        className={`px-4 py-2 text-[14.5px] leading-relaxed relative group ${
          isMine 
            ? 'bg-gradient-to-r from-[#25D366] to-[#00d4ff] text-white rounded-2xl rounded-tr-none shadow-[0_4px_15px_rgba(37,211,102,0.25)] border border-green-400/20' 
            : 'dark-glass text-gray-100 rounded-2xl rounded-tl-none'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        
        {/* Timestamp on hover */}
        <div className={`timestamp-hover text-[11px] ${isMine ? 'text-white/80 text-right' : 'text-gray-400 text-right'} flex items-center justify-end gap-1 font-medium tracking-wide`}>
          {format(new Date(message.createdAt), 'HH:mm')}
          {isMine && (
            <svg className="w-3.5 h-3.5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
