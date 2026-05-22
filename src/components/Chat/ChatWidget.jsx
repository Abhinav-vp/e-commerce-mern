import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import "./ChatWidget.css";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  const apiBase = process.env.REACT_APP_API_BASE || `http://${window.location.hostname}:7000`;
  const token = localStorage.getItem("auth-token");

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchHistory = useCallback(async () => {
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
  }, [apiBase, token]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/auth/me`, {
        headers: { "auth-token": token },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        fetchHistory();
      }
    } catch (err) {
      console.error("Error fetching user for chat:", err);
    }
  }, [apiBase, token, fetchHistory]);

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  useEffect(() => {
    if (user && !socketRef.current) {
      const socket = io(apiBase);
      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("join", user._id);
      });

      socket.on("receiveMessage", (message) => {
        setMessages((prev) => [...prev, message]);
        // We need to check isOpen here. Since this is an event handler set once, 
        // we should use a ref for isOpen if we want to avoid recreating the handler.
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [user, apiBase]);

  // Use a ref for isOpen to be accessed in the socket handler without recreating it
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Re-attach or handle receiveMessage with ref-based logic
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.off("receiveMessage");
      socketRef.current.on("receiveMessage", (message) => {
        setMessages((prev) => [...prev, message]);
        if (!isOpenRef.current) {
          setUnreadCount((prev) => prev + 1);
        }
      });

      socketRef.current.on("aiTyping", (typing) => {
        setIsTyping(typing);
        if (typing) {
          scrollToBottom();
        }
      });
    }
  }, [user]); // Re-run when user (and thus socket) changes

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen, messages, scrollToBottom]);

  const handleSend = () => {
    if (!input.trim() || !user || !socketRef.current) return;

    const messageData = {
      senderId: user._id,
      senderName: user.name,
      message: input,
      isAdmin: false,
    };

    socketRef.current.emit("sendMessage", messageData);
    
    setMessages(prev => [...prev, { ...messageData, timestamp: new Date(), _id: Date.now() }]);
    setInput("");
  };

  if (!token) return null;

  return (
    <div className={`chat-widget ${isOpen ? "open" : ""}`}>
      {isOpen ? (
        <div className="chat-window shadow-xl">
          <div className="chat-header">
            <h3>AI Assistant</h3>
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
            {isTyping && (
              <div className="message-bubble admin typing">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
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
