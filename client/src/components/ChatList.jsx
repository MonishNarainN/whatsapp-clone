import React from 'react';
import { Users, User } from 'lucide-react';
import { format } from 'date-fns';

export default function ChatList({ conversations, activeConversation, setActiveConversation, currentUser }) {
  
  const getConversationName = (conv) => {
    if (conv.type === 'group') return conv.name;
    const otherMember = conv.members.find((m) => m._id !== currentUser._id);
    return otherMember ? otherMember.username : 'Unknown User';
  };

  return (
    <div className="flex-1 overflow-y-auto w-full">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-gray-400 text-sm italic animate-pop-in">No conversations yet.</div>
      ) : (
        conversations.map((conv, index) => {
          const isActive = activeConversation?._id === conv._id;
          
          return (
            <div
              key={conv._id}
              onClick={() => setActiveConversation(conv)}
              className={`group flex items-center p-3 cursor-pointer transition-all duration-300 relative bg-white hover:bg-gray-50 animate-slide-in-left`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Animated Left Border for active or hover */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-green-500 transition-all duration-300 ${isActive ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 group-hover:scale-y-50 group-hover:opacity-50'}`}></div>
              
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_10px_rgba(37,211,102,0.4)] group-hover:ring-2 ring-green-400 border border-white">
                {conv.type === 'group' ? <Users size={22} className="text-gray-600" /> : <User size={22} className="text-gray-600" />}
              </div>
              
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className={`font-semibold truncate transition-colors duration-200 ${isActive ? 'text-green-700' : 'text-gray-800 group-hover:text-green-600'}`}>
                    {getConversationName(conv)}
                  </h3>
                  <span className={`text-xs ${isActive ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                    {conv.updatedAt ? format(new Date(conv.updatedAt), 'HH:mm') : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 truncate">
                    {conv.type === 'group' ? 'Group Chat' : 'Direct Message'}
                  </p>
                  
                  {/* Dummy Unread Badge for demonstration of animation */}
                  {index === 0 && !isActive && (
                    <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm">
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
  );
}
