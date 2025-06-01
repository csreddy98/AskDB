import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addMessage, clearMessages, setTyping } from '../store/messagesSlice';
import type { Message } from '../store/messagesSlice';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import DatabaseConnection from '../components/DatabaseConnection';
import DataChart from '../components/DataChart';
import { config, getApiEndpoint } from '../config';
import ApiService, { handleApiError } from '../utils/apiService';
import './Chat.css';

interface DatabaseCredentials {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

const Chat: React.FC = () => {
  const messages = useSelector((state: RootState) => state.messages.messages);
  const isTyping = useSelector((state: RootState) => state.messages.isTyping);
  const dispatch = useDispatch();
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbConnection, setDbConnection] = useState<DatabaseCredentials | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Check if database is connected
    if (!dbConnection) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: '⚠️ Please connect to a database first before asking questions.',
        sender: 'bot',
        timestamp: new Date(),
      };
      dispatch(addMessage(errorMessage));
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    dispatch(addMessage(userMessage));
    dispatch(setTyping(true));

    try {
      const response = await ApiService.sendGeminiChatMessage(
        text.trim(),
        dbConnection,
        1000,
        0.7
      );

      // Create bot message with chart data if available
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message || response.response || 'I received your message but couldn\'t generate a proper response.',
        sender: 'bot',
        timestamp: new Date(),
      };

      // Add chart data if response contains data for visualization
      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        botMessage.chartData = {
          data: response.data,
          chartType: response.chart_type || 'bar_chart',
          chartExplanation: response.chart_explanation,
          sqlQuery: response.sql_query,
        };
      }

      dispatch(addMessage(botMessage));
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ Error: ${handleApiError(error)}`,
        sender: 'bot',
        timestamp: new Date(),
      };
      dispatch(addMessage(errorMessage));
    } finally {
      dispatch(setTyping(false));
    }
  };

  const clearChat = () => {
    dispatch(clearMessages());
  };

  const handleDatabaseConnect = (credentials: DatabaseCredentials) => {
    setDbConnection(credentials);
    setConnectionStatus('connected');
    const connectionMessage: Message = {
      id: Date.now().toString(),
      text: `✅ Successfully connected to database "${credentials.database}" on ${credentials.host}:${credentials.port}. You can now ask me questions about your database!`,
      sender: 'bot',
      timestamp: new Date(),
    };
    dispatch(addMessage(connectionMessage));
    setIsDbModalOpen(false);
  };

  const disconnectDatabase = () => {
    setDbConnection(null);
    setConnectionStatus('disconnected');
    const disconnectionMessage: Message = {
      id: Date.now().toString(),
      text: '🔌 Database connection has been disconnected.',
      sender: 'bot',
      timestamp: new Date(),
    };
    dispatch(addMessage(disconnectionMessage));
  };

  const getStatusIcon = () => {
    const getTooltipText = () => {
      switch (connectionStatus) {
        case 'connected':
          return `Connected to MySQL Database
Host: ${dbConnection?.host}:${dbConnection?.port}
Database: ${dbConnection?.database}
Username: ${dbConnection?.username}
Status: Active Connection`;
        case 'connecting':
          return `Connecting to MySQL Database...
Please wait while we establish the connection`;
        case 'error':
          return `Connection Failed
Unable to connect to the database
Please check your credentials and try again`;
        default:
          return `Database Not Connected
Click "Connect Your DB" to establish a connection
Supported: MySQL Database`;
      }
    };

    switch (connectionStatus) {
      case 'connected':
        return <span className="status-icon connected" title={getTooltipText()}>🟢</span>;
      case 'connecting':
        return <span className="status-icon connecting" title={getTooltipText()}>🟡</span>;
      case 'error':
        return <span className="status-icon error" title={getTooltipText()}>🔴</span>;
      default:
        return <span className="status-icon disconnected" title={getTooltipText()}>⚫</span>;
    }
  };

  return (
    <div className="page">
      <div className="chat-header">
        <h1>AskDB Chat Assistant</h1>
        <div className="header-buttons">
          <div className="db-connection-section">
            {getStatusIcon()}
            <button 
              onClick={() => dbConnection ? disconnectDatabase() : setIsDbModalOpen(true)} 
              className={`connect-db-btn ${dbConnection ? 'connected' : ''}`}
            >
              {dbConnection ? '🔌 Disconnect DB' : '🔗 Connect Your DB'}
            </button>
          </div>
          <button onClick={clearChat} className="clear-chat-btn">
            Clear Chat
          </button>
        </div>
      </div>
      
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isTyping && (
            <div className="typing-indicator">
              <div className="typing-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>

      <DatabaseConnection
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onConnect={handleDatabaseConnect}
      />
    </div>
  );
};

export default Chat;