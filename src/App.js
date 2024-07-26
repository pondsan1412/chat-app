import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css'; // Ensure you have appropriate styling here

const socket = io('http://localhost:3000');

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const messageEndRef = useRef(null);

  useEffect(() => {
    socket.on('message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.on('init', (msgs) => {
      setMessages(msgs);
    });

    return () => {
      socket.off('message');
      socket.off('init');
    };
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('message', { text: message, username });
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage(e);
    }
  };

  const handleSetUsername = (e) => {
    if (e.key === 'Enter' && username.trim()) {
      localStorage.setItem('username', username);
    }
  };

  const handleChangeUsername = () => {
    localStorage.removeItem('username');
    setUsername('');
  };

  return (
    <div className="chat-container">
      <div className="username-container">
        <input
          type="text"
          placeholder="Enter your name..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleSetUsername}
          className="username-input"
        />
        <button onClick={handleChangeUsername} className="change-username-button">
          Change Name
        </button>
      </div>
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.username || 'Anonymous'}:</strong> {msg.text}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
        <textarea
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="message-input"
        />
        <button type="submit" className="send-button">Send</button>
      </form>
    </div>
  );
};

export default App;
