import React, { useState } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaUser, FaRobot } from 'react-icons/fa';
import './ChatButton.css';

const ChatButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! How can we help you today?", sender: "bot", time: new Date() }
    ]);
    const [inputMessage, setInputMessage] = useState("");

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim() === "") return;

        
        const userMessage = {
            id: messages.length + 1,
            text: inputMessage,
            sender: "user",
            time: new Date()
        };
        setMessages([...messages, userMessage]);
        setInputMessage("");
        setTimeout(() => {
            const botResponse = {
                id: messages.length + 2,
                text: "Thank you for your message. One of our representatives will get back to you shortly.",
                sender: "bot",
                time: new Date()
            };
            setMessages(prev => [...prev, botResponse]);
        }, 1000);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <div className={`chat-button-container ${isOpen ? 'open' : ''}`}>
                <button
                    className={`chat-button ${isOpen ? 'active' : ''}`}
                    onClick={toggleChat}
                    aria-label="Chat with us">
                    {isOpen ? <FaTimes /> : <FaComments />}
                </button>

                {isOpen && (
                    <div className="chat-window">
                        <div className="chat-header">
                            <div className="chat-header-info">
                                <h4>Chat with us</h4>
                                <p>We typically reply in a few minutes</p>
                            </div>
                            <button className="close-chat" onClick={toggleChat}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="chat-messages">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`message ${message.sender === 'bot' ? 'bot-message' : 'user-message'}`}
                                >
                                    <div className="message-avatar">
                                        {message.sender === 'bot' ? <FaRobot /> : <FaUser />}
                                    </div>
                                    <div className="message-content">
                                        <div className="message-text">{message.text}</div>
                                        <span className="message-time">{formatTime(message.time)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form className="chat-input-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Type your message..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                className="chat-input"
                            />
                            <button type="submit" className="send-button">
                                <FaPaperPlane />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
};

export default ChatButton;