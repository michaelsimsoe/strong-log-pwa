import { useState } from 'react';
import './App.css';
import ErrorBoundary from './components/shared/ErrorBoundary';

function App() {
  const [count, setCount] = useState(0);

  return (
    <ErrorBoundary>
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <h1>StrongLog</h1>
            <p>Track your strength training progress</p>
          </div>
        </header>
        <main className="app-main">
          <div className="main-content">
            <h2>Welcome to StrongLog</h2>
            <p>Your personal strength training companion</p>
            <div className="action-container">
              <button
                onClick={() => setCount(count => count + 1)}
                className="primary-button"
                aria-label="Increment counter"
              >
                You clicked {count} times
              </button>
            </div>
          </div>
        </main>
        <footer className="app-footer">
          <div className="footer-content">
            <p>StrongLog PWA - Version 1.0</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
