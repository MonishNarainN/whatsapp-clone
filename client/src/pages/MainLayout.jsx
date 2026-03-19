import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, MessageCircle } from 'lucide-react';
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

    // Global listener for background notifications
    const handleGlobalMessage = () => {
      if (document.hidden) {
        document.title = '(1) New message';
        // In a real app we'd change the favicon href here
      }
    };

    newSocket.on('receiveMessage', handleGlobalMessage);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        document.title = 'WhatsApp Clone';
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      newSocket.off('receiveMessage', handleGlobalMessage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      newSocket.close();
    };
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
    <div className="relative flex h-screen items-center justify-center p-4 lg:p-6 animate-fade-slide-up overflow-hidden bg-[#0a0f1e] text-slate-100">
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="mesh-bg absolute inset-0 opacity-10"></div>
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-green-500 rounded-full mix-blend-screen filter blur-[120px] orb-1 opacity-20"></div>
        <div className="absolute top-[60%] right-[10%] w-[400px] h-[400px] bg-[#00d4ff] rounded-full mix-blend-screen filter blur-[120px] orb-2 opacity-20"></div>
        <div className="absolute bottom-[20%] left-[50%] w-[600px] h-[600px] bg-purple-600 rounded-full mix-blend-screen filter blur-[150px] orb-3 opacity-20"></div>
      </div>

      <div className="flex w-full h-full max-w-[1600px] mx-auto dark-glass rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-gray-700/50">
        
        {/* Left Panel */}
        <div className="w-[380px] min-w-[320px] flex flex-col bg-[#111827]/80 border-r border-gray-700/50 backdrop-blur-md z-20">
          <div className="p-4 bg-[#0a0f1e]/60 flex justify-between items-center border-b border-gray-700/50 backdrop-blur-xl shrink-0">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => setActiveConversation(null)}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-[#00d4ff] flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300 ring-2 ring-transparent group-hover:ring-green-400 group-hover:shadow-[0_0_15px_rgba(37,211,102,0.5)]">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0f1e]"></div>
              </div>
              <div className="font-semibold text-gray-200 group-hover:text-green-400 transition-colors">
                {user?.username}
              </div>
            </div>
            <div className="flex space-x-1 text-gray-400">
              <button onClick={() => setIsGroupModalOpen(true)} title="New Chat" className="p-2.5 rounded-full hover:bg-gray-800 hover:text-green-400 transition-colors duration-200 active:scale-95">
                <Plus size={20} />
              </button>
              <button onClick={handleLogout} title="Logout" className="p-2.5 rounded-full hover:bg-gray-800 hover:text-red-400 transition-colors duration-200 active:scale-95">
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
        <div className="flex-1 flex flex-col bg-[#0a0f1e]/90 relative transition-opacity duration-300 z-10 overflow-hidden" key={activeConversation ? activeConversation._id : 'empty'}>
          <div className="noise-bg"></div>
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
            <div className="flex-1 flex flex-col items-center justify-center bg-transparent animate-pop-in relative z-10 h-full">
              <div className="w-32 h-32 mb-8 rounded-full bg-gradient-to-br from-[#111827] to-[#1f2937] flex items-center justify-center text-gray-600 shadow-2xl border border-gray-700/50 animate-pulse-badge">
                <MessageCircle size={64} strokeWidth={1} className="text-gray-500" />
              </div>
              <h2 className="text-3xl font-light text-gray-300 mb-3 tracking-wide">WhatsApp Web</h2>
              <p className="text-gray-500 max-w-md text-center text-[15px] leading-relaxed">
                Send and receive messages seamlessly. Your personal conversations are end-to-end encrypted.
              </p>
              <div className="mt-8 px-4 py-2 bg-[#111827] rounded-full border border-gray-800 text-xs text-gray-600 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                End-to-end Encrypted
              </div>
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
