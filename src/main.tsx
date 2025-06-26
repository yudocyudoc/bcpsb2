// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; // Tu componente App principal
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from "@/components/ui/sonner"; // Importa Toaster
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster richColors position="top-right" /> {/* Añade Toaster aquí */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);