import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './ui/App';
import ThemeToggle from './ui/ThemeToggle';
import './ui/styles.css';
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeToggle />
    <App />
  </React.StrictMode>,
);
