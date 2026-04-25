import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./ChatWidget.css";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  const apiBase = process.env.REACT_APP_API_BASE || `http://${window.location.hostname}:7000`;
  const token = localStorage.getItem("auth-token");

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${apiBase}/api/auth/me`, {
        headers: { "auth-token": token },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        initSocket(data.user);
        fetchHistory();
      }
    } catch (err) {
      console.error("Error fetching user for chat:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${apiBase}/api/chat/history`, {
        headers: { "auth-token": token },
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Error fetching chat history:", err);
    }
  };

  const initSocket = (userData) => {
    if (socketRef.current) return;

    const socket = io(apiBase);
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", userData._id);
    });

    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socket.on("messageSent", (message) => {
      // Message saved successfully, we already added it locally maybe?
      // Actually let's just use the server broadcast to keep things synced
    });
  };

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (!input.trim() || !user) return;

    const messageData = {
      senderId: user._id,
      senderName: user.name,
      message: input,
      isAdmin: false,
    };

    socketRef.current.emit("sendMessage", messageData);
    
    // Optimistic update
    setMessages(prev => [...prev, { ...messageData, timestamp: new Date(), _id: Date.now() }]);
    setInput("");
  };

  if (!token) return null;

  return (
    <div className={`chat-widget ${isOpen ? "open" : ""}`}>
      {isOpen ? (
        <div className="chat-window shadow-xl">
          <div className="chat-header">
            <h3>Live Support</h3>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              ×
            </button>
          </div>
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="empty-chat">
                👋 Hello! How can we help you today?
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-bubble ${msg.isAdmin ? "admin" : "user"}`}
              >
                <div className="message-content">{msg.message}</div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend} className="send-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
          <div className="toggle-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
          </div>
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
