import React from 'react';
import DataChart from './DataChart';
import type { Message } from '../store/messagesSlice';
import './ChatMessage.css';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`message ${message.sender}`}>
      <div className="message-content">
        {message.sender === 'bot' && (
          <div className="message-avatar bot-avatar">
            🤖
          </div>
        )}
        { !message.text.startsWith('```sql') && !message?.chartData &&
        <div className="message-bubble">
          <div className="message-text">{message.text}</div>
          <div className="message-time">{formatTime(message.timestamp)}</div>
        </div>
        }
        {
          message.text.startsWith('```sql') && !message?.chartData && (
            <div className="message-bubble">
              <div className="message-text">Didn't find any data to display. Please try a different query.</div>
              <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
          )
        }
        {message.sender === 'user' && (
          <div className="message-avatar user-avatar">
            👤
          </div>
        )}
      </div>
      
      {/* Render chart if chart data is available */}
      {message.chartData && (
        <div className="message-chart">
          <DataChart
            data={message.chartData.data}
            chartType={message.chartData.chartType}
            chartExplanation={message.chartData.chartExplanation}
            sqlQuery={message.chartData.sqlQuery}
          />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;