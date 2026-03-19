import React from 'react';
import { format } from 'date-fns';

export default function MessageBubble({ message, currentUser, conversationType }) {
  const isMine = message.sender && (message.sender._id === currentUser._id || message.sender === currentUser._id);
  
  // Format time
  let timeString = '';
  if (message.createdAt) {
    try {
      timeString = format(new Date(message.createdAt), 'HH:mm');
    } catch(e) {}
  }

  return (
    <div className={`message-bubble-container max-w-[75%] flex flex-col ${isMine ? 'items-end' : 'items-start'} group hover:scale-[1.02] transform transition-transform duration-200 cursor-default`}>
      <div 
        className={`rounded-2xl px-4 py-2.5 shadow-sm border ${
          isMine 
            ? 'bg-gradient-to-br from-[#dcf8c6] to-[#c1f0a1] rounded-tr-none border-[#bce2a4]' 
            : 'bg-white rounded-tl-none border-gray-100'
        }`}
      >
        {!isMine && conversationType === 'group' && message.sender?.username && (
          <div className="text-[11px] font-bold text-green-600 mb-1 tracking-wide uppercase">
            {message.sender.username}
          </div>
        )}
        <div className="text-[15px] text-gray-800 break-words leading-relaxed">
          {message.text}
        </div>
      </div>
      
      {/* Hover timestamp */}
      <div className={`text-[11px] text-gray-500 font-medium timestamp-hover ${isMine ? 'pr-2' : 'pl-2'}`}>
        {timeString}
      </div>
    </div>
  );
}
