import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="page">
      <h1>Welcome to AskDB</h1>
      <p className="hero-description">
        AskDB is an intelligent database query assistant that revolutionizes how you interact with your data. 
        Connect your database, ask questions in natural language, and get instant responses with beautiful 
        chart visualizations.
      </p>
      
      <div className="main-features">
        <h2>What is AskDB?</h2>
        <p>
          AskDB is a powerful web application that bridges the gap between complex database queries and 
          intuitive data exploration. Simply connect your MySQL database, ask questions about your data 
          in plain English, and receive comprehensive answers displayed in easy-to-understand chart formats.
        </p>
        
        <div className="key-benefits">
          <h3>Key Benefits</h3>
          <ul>
            <li><strong>Natural Language Queries:</strong> Ask questions about your data without writing SQL</li>
            <li><strong>Visual Data Insights:</strong> Get responses in beautiful chart formats for better understanding</li>
            <li><strong>Secure Database Connection:</strong> Connect to your MySQL database with encrypted credentials</li>
            <li><strong>Real-time Interaction:</strong> Chat-based interface for seamless data exploration</li>
            <li><strong>Query Optimization:</strong> Get suggestions for better database performance</li>
          </ul>
        </div>
      </div>

      <div className="getting-started">
        <h2>Getting Started</h2>
        <ol>
          <li>Navigate to the <strong>Chat</strong> page</li>
          <li>Click on <strong>"Connect Your DB"</strong> button</li>
          <li>Enter your MySQL database credentials</li>
          <li>Start asking questions about your data</li>
          <li>View results in interactive chart formats</li>
        </ol>
      </div>
    </div>
  );
};

export default Home;