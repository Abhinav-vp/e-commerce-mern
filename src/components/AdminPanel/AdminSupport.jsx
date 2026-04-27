import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchActiveChats = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/chat/admin/users`, {
        headers: { 'auth-token': token },
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.userIds.map(id => ({ id, name: `User ${id.slice(-4)}` })));
      }
    } catch (err) {
      console.error('Error fetching active chats:', err);
    }
  }, [apiBase, token]);

  const fetchHistory = useCallback(async (userId) => {
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
  }, [apiBase, token, scrollToBottom]);

  const fetchAdmin = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/auth/me`, {
        headers: { 'auth-token': token },
      });
      const data = await res.json();
      if (data.success) {
        setAdmin(data.user);
        // We'll call initSocket here, but initSocket shouldn't be a dependency of fetchAdmin
        // unless we want to recreate it.
      }
    } catch (err) {
      console.error('Error fetching admin:', err);
    }
  }, [apiBase, token]);

  useEffect(() => {
    fetchAdmin();
    fetchActiveChats();
  }, [fetchAdmin, fetchActiveChats]);

  useEffect(() => {
    if (selectedUser) {
      fetchHistory(selectedUser.id);
    }
  }, [selectedUser, fetchHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Re-define initSocket properly with refs to avoid closure issues
  const selectedUserRef = useRef(selectedUser);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    if (admin && !socketRef.current) {
      const socket = io(apiBase);
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('joinAdmin');
      });

      socket.on('receiveMessage', (message) => {
        const curSelected = selectedUserRef.current;
        if (curSelected && (message.senderId === curSelected.id || message.receiverId === curSelected.id)) {
          setMessages((prev) => [...prev, message]);
        } else {
          setConversations(prev => {
            if (!prev.find(c => c.id === message.senderId)) {
              return [...prev, { id: message.senderId, name: `User ${message.senderId.slice(-4)}` }];
            }
            return prev;
          });
        }
      });

      socket.on('messageSent', (message) => {
        const curSelected = selectedUserRef.current;
        if (curSelected && message.receiverId === curSelected.id) {
          setMessages((prev) => [...prev, message]);
        }
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [admin, apiBase]);

  const handleSend = () => {
    if (!input.trim() || !selectedUser || !admin || !socketRef.current) return;

    const messageData = {
      senderId: admin._id,
      receiverId: selectedUser.id,
      senderName: admin.name,
      message: input,
      isAdmin: true,
    };

    socketRef.current.emit('sendMessage', messageData);
    
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
