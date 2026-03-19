import React, { useState } from 'react';
import { Users, User, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function ChatList({ conversations, activeConversation, setActiveConversation, currentUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const getConversationName = (conv) => {
    if (conv.type === 'group') return conv.name;
    const otherMember = conv.members.find((m) => m._id !== currentUser._id);
    return otherMember ? otherMember.username : 'Unknown User';
  };

  const filteredConversations = conversations.filter(conv => 
    getConversationName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      
      {/* Search Bar */}
      <div className="p-3 bg-white/80 dark:bg-[#111827]/80 border-b border-gray-200/50 dark:border-gray-800/50 shrink-0 transition-colors duration-300">
        <div className="relative flex items-center bg-gray-100 dark:bg-[#1f2937] rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all duration-300">
          <Search size={18} className={`text-gray-500 dark:text-gray-400 transition-colors ${searchQuery ? 'text-green-500 dark:text-green-500 animate-pulse' : ''}`} />
          <input 
            type="text" 
            placeholder="Search or start new chat" 
            className="bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-200 ml-3 w-full placeholder-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full scroll-smooth transition-opacity duration-300">
        {filteredConversations.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-gray-500 text-sm italic animate-pop-in h-full">
            <Search size={32} className="mb-3 text-gray-400 dark:text-gray-600 opacity-50" />
            <p>No chats found</p>
          </div>
        ) : (
          filteredConversations.map((conv, index) => {
            const isActive = activeConversation?._id === conv._id;
            
            return (
              <div
                key={conv._id}
                onClick={() => setActiveConversation(conv)}
                className={`group flex items-center p-3 cursor-pointer transition-all duration-300 relative border-b border-gray-200/50 dark:border-gray-800/30 hover:bg-gray-50 dark:hover:bg-[#1f2937] hover:-translate-y-[2px] hover:shadow-lg animate-slide-in-left ${isActive ? 'bg-gray-100/80 dark:bg-[#1f2937]/80' : 'bg-transparent'}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Animated Left Border for active or hover */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-green-500 transition-all duration-300 ${isActive ? 'scale-y-100 opacity-100 shadow-[2px_0_10px_rgba(37,211,102,0.5)]' : 'scale-y-0 opacity-0 group-hover:scale-y-50 group-hover:opacity-50'}`}></div>
                
                <div className="relative shrink-0 mr-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-400 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:ring-2 ring-green-500/50 overflow-hidden shadow-sm">
                    {conv.type === 'group' ? 
                      <Users size={22} className="text-white dark:text-gray-300" /> : 
                      <User size={22} className="text-white dark:text-gray-300" />
                    }
                  </div>
                  {/* Dummy Online pulsing ring for visual styling */}
                  {index % 3 === 0 && conv.type !== 'group' && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-[#111827] shadow-[0_0_8px_rgba(37,211,102,0.8)]"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-medium truncate transition-colors duration-200 text-[15px] ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400'}`}>
                      {getConversationName(conv)}
                    </h3>
                    <span className={`text-[11px] ml-2 shrink-0 ${isActive ? 'text-green-600 dark:text-green-500 font-medium' : 'text-gray-500'}`}>
                      {conv.updatedAt ? format(new Date(conv.updatedAt), 'HH:mm') : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[13px] text-gray-500 truncate pr-2">
                      {conv.type === 'group' ? 'You joined this group.' : 'Say hello!'}
                    </p>
                    
                    {/* Dummy Unread Badge for demonstration */}
                    {index === 1 && !isActive && (
                      <div className="bg-green-500 text-white dark:text-[#0a0f1e] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(37,211,102,0.4)] animate-pulse shrink-0">
                        2
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
