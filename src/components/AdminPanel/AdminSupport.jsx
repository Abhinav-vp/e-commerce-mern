import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './AdminSupport.css';

const AdminSupport = ({ apiBase }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [admin, setAdmin] = useState(null);
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const token = localStorage.getItem('auth-token');

  useEffect(() => {
    fetchAdmin();
    fetchActiveChats();
  }, []);

  const fetchAdmin = async () => {
    try {
      const res = await fetch(`${apiBase}/api/auth/me`, {
        headers: { 'auth-token': token },
      });
      const data = await res.json();
      if (data.success) {
        setAdmin(data.user);
        initSocket();
      }
    } catch (err) {
      console.error('Error fetching admin:', err);
    }
  };

  const fetchActiveChats = async () => {
    try {
      const res = await fetch(`${apiBase}/api/chat/admin/users`, {
        headers: { 'auth-token': token },
      });
      const data = await res.json();
      if (data.success) {
        // userIds is an array of strings
        // In a real app, we'd fetch user details for each ID
        // For now, we'll just show IDs as user labels
        setConversations(data.userIds.map(id => ({ id, name: `User ${id.slice(-4)}` })));
      }
    } catch (err) {
      console.error('Error fetching active chats:', err);
    }
  };

  const fetchHistory = async (userId) => {
    try {
      const res = await fetch(`${apiBase}/api/chat/admin/history/${userId}`, {
        headers: { 'auth-token': token },
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const initSocket = () => {
    if (socketRef.current) return;
    const socket = io(apiBase);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinAdmin');
    });

    socket.on('receiveMessage', (message) => {
      // If it's for the currently selected user, add it to messages
      if (selectedUser && (message.senderId === selectedUser.id || message.receiverId === selectedUser.id)) {
        setMessages((prev) => [...prev, message]);
      } else {
        // If it's a new conversation, add to list
        setConversations(prev => {
          if (!prev.find(c => c.id === message.senderId)) {
            return [...prev, { id: message.senderId, name: `User ${message.senderId.slice(-4)}` }];
          }
          return prev;
        });
      }
    });

    socket.on('messageSent', (message) => {
      if (selectedUser && message.receiverId === selectedUser.id) {
        setMessages((prev) => [...prev, message]);
      }
    });
  };

  useEffect(() => {
    if (selectedUser) {
      fetchHistory(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!input.trim() || !selectedUser || !admin) return;

    const messageData = {
      senderId: admin._id,
      receiverId: selectedUser.id,
      senderName: admin.name,
      message: input,
      isAdmin: true,
    };

    socketRef.current.emit('sendMessage', messageData);
    
    // Optimistic update
    setMessages(prev => [...prev, { ...messageData, timestamp: new Date(), _id: Date.now() }]);
    setInput('');
  };

  return (
    <div className="admin-support-container">
      <div className="conversations-sidebar">
        <h3>Active Chats</h3>
        {conversations.length === 0 && <p className="no-chats">No active chats</p>}
        <div className="conv-list">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conv-item ${selectedUser?.id === conv.id ? 'active' : ''}`}
              onClick={() => setSelectedUser(conv)}
            >
              <div className="user-avatar">{conv.name[0]}</div>
              <div className="user-info">
                <span className="user-name">{conv.name}</span>
                <span className="user-status">online</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-area">
        {selectedUser ? (
          <>
            <div className="chat-area-header">
              <h3>Chat with {selectedUser.name}</h3>
            </div>
            <div className="chat-area-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`msg-bubble ${msg.isAdmin ? 'admin' : 'user'}`}>
                  <div className="msg-content">{msg.message}</div>
                  <div className="msg-time">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-area-input">
              <input
                type="text"
                placeholder="Reply to user..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend}>Send</button>
            </div>
          </>
        ) : (
          <div className="select-chat-placeholder">
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupport;
