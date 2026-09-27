import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { installMockServer } from './mock/mockServer.ts';
import { seedDemoData } from './mock/seedData.ts';
import './index.css';

installMockServer();
void seedDemoData();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
