import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import api from '../api';

export default function CreateGroupModal({ onClose, currentUser, onGroupCreated }) {
  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data.filter((u) => u._id !== currentUser._id));
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    fetchUsers();
  }, [currentUser]);

  const toggleUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (groupName.trim() === '') return setError('Group name is required');
    if (selectedUsers.length === 0) return setError('Select at least one other member');

    try {
      const allMembers = [...selectedUsers, currentUser._id];
      const res = await api.post('/conversations', {
        type: 'group',
        name: groupName,
        members: allMembers,
        createdBy: currentUser._id,
      });
      onGroupCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create group');
    }
  };

  const handleCreateDM = async (userId) => {
    try {
      const res = await api.post('/conversations', {
        type: 'dm',
        members: [userId, currentUser._id],
        createdBy: currentUser._id,
      });
      onGroupCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create DM');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-slide-up" style={{ animationDuration: '0.2s' }}>
      {/* Container scales up from center */}
      <div className="glass shadow-2xl rounded-2xl p-6 w-[400px] max-h-[85vh] flex flex-col relative animate-pop-in">
        
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 hover:bg-gray-200 flex items-center justify-center transition-all"
        >
          <X size={18} />
        </button>
        
        <h2 className="text-2xl font-bold mb-5 text-gray-800">New Chat</h2>
        
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded animate-pop-in">{error}</p>}

        {/* Create Group Form */}
        <div className="mb-6 pb-6 border-b border-gray-200/50">
          <input
            type="text"
            placeholder="New Group Name"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all mb-3 text-sm"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <button 
            onClick={handleSubmit}
            className="group w-full bg-green-500 text-white rounded-lg p-3 font-semibold hover:bg-green-600 disabled:opacity-50 disabled:hover:bg-green-500 transition-all flex items-center justify-center shadow-md hover:shadow-lg active:scale-95 duration-200"
            disabled={groupName.trim() === '' || selectedUsers.length === 0}
          >
            Create Group
            <ArrowRight size={18} className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </button>
        </div>

        {/* User List */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700 text-sm tracking-wide uppercase">Contacts</h3>
          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
            {selectedUsers.length} selected
          </span>
        </div>

        <div className="overflow-y-auto flex-1 pr-2 -mr-2 space-y-1 scroll-smooth">
          {users.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">Loading users...</div>
          ) : (
            users.map((u) => {
              const isSelected = selectedUsers.includes(u._id);
              return (
                <div 
                  key={u._id} 
                  className={`flex justify-between items-center p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    isSelected ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white/50 border-transparent hover:bg-gray-50'
                  }`}
                  onClick={() => toggleUser(u._id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className={`font-medium ${isSelected ? 'text-green-800' : 'text-gray-800'}`}>{u.username}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleCreateDM(u._id)}
                      className="bg-gray-100 text-gray-600 text-[11px] font-medium px-3 py-1.5 rounded-full hover:bg-gray-200 hover:text-gray-800 transition-colors"
                    >
                      Message
                    </button>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                      isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'
                    }`} onClick={() => toggleUser(u._id)}>
                      {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
