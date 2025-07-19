import React from 'react';
import ReactDOM from 'react-dom/client';
import DesktopPetUI from './components/DesktopPetUI';
import './desktop-pet-styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <DesktopPetUI />
  </React.StrictMode>
);
