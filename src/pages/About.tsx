import React from 'react';

const About: React.FC = () => {
  return (
    <div className="page">
      <h1>About AskDB</h1>
      <p>
        AskDB is a modern React application built with TypeScript, Redux, and React Router.
        This project demonstrates best practices for building scalable React applications.
      </p>
      <div className="tech-stack">
        <h2>Technology Stack</h2>
        <ul>
          <li><strong>React 19</strong> - UI library</li>
          <li><strong>TypeScript</strong> - Type safety</li>
          <li><strong>Redux Toolkit</strong> - State management</li>
          <li><strong>Redux Persist</strong> - State persistence across sessions</li>
          <li><strong>React Router</strong> - Client-side routing</li>
          <li><strong>React Redux</strong> - React bindings for Redux</li>
        </ul>
      </div>
    </div>
  );
};

export default About;