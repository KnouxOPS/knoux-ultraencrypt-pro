
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Create a dummy index.css if it's referenced but not meant to exist.
// For this project, Tailwind is loaded via CDN, so index.css might be empty or not needed.
// If index.css is truly not needed and App.css/other CSS files handle all, remove the import.
// For now, assuming it might be an empty file or placeholder.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
