import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, MessageSquare } from 'lucide-react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import CreateGroupModal from '../components/CreateGroupModal';
import api from '../api';
import { io } from 'socket.io-client';

export default function MainLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_REACT_APP_SOCKET_URL || import.meta.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.get(`/conversations/${user._id}`);
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen items-center justify-center p-4 lg:p-8 animate-fade-slide-up overflow-hidden">
      <div className="flex w-full h-full max-w-7xl mx-auto glass rounded-2xl overflow-hidden shadow-2xl relative">
        
        {/* Left Panel */}
        <div className="w-1/3 min-w-[300px] flex flex-col bg-white/60 border-r border-gray-200/50 backdrop-blur-md z-10">
          <div className="p-5 bg-white/80 flex justify-between items-center border-b border-gray-200/50 backdrop-blur-lg">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => setActiveConversation(null)}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform duration-300">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                {user?.username}
              </div>
            </div>
            <div className="flex space-x-2 text-gray-500">
              <button onClick={() => setIsGroupModalOpen(true)} title="New Chat" className="p-2 rounded-full hover:bg-gray-100 hover:text-green-600 transition-colors duration-200">
                <Plus size={20} />
              </button>
              <button onClick={handleLogout} title="Logout" className="p-2 rounded-full hover:bg-gray-100 hover:text-red-500 transition-colors duration-200">
                <LogOut size={20} />
              </button>
            </div>
          </div>
          
          <ChatList 
            conversations={conversations} 
            activeConversation={activeConversation}
            setActiveConversation={setActiveConversation}
            currentUser={user}
          />
        </div>

        {/* Right Panel */}
        <div className="w-2/3 flex flex-col bg-[#e5ddd5]/50 relative transition-opacity duration-500" key={activeConversation ? activeConversation._id : 'empty'}>
          {activeConversation ? (
            <div className="absolute inset-0 animate-fade-slide-up">
              <ChatWindow 
                conversation={activeConversation} 
                currentUser={user} 
                socket={socket} 
                onMessageSent={fetchConversations} 
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/80 animate-pop-in">
              <div className="w-24 h-24 mb-6 rounded-full bg-green-100 flex items-center justify-center text-green-500 shadow-inner">
                <MessageSquare size={48} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-light text-gray-600 mb-2">WhatsApp Web for Windows</h2>
              <p className="text-gray-400 max-w-md text-center">Send and receive messages without keeping your phone online. Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
            </div>
          )}
        </div>
      </div>

      {isGroupModalOpen && (
        <CreateGroupModal 
          onClose={() => setIsGroupModalOpen(false)} 
          currentUser={user}
          onGroupCreated={(newGroup) => {
            setConversations([newGroup, ...conversations]);
            setIsGroupModalOpen(false);
            setActiveConversation(newGroup);
          }}
        />
      )}
    </div>
  );
}
