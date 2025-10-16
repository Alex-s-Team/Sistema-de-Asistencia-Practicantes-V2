import '../css/app.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

import LoginPage from './pages/Login/LoginPage.jsx';

// Log #1: Para ver si el archivo se está ejecutando
console.log("app.jsx se está ejecutando");

const container = document.getElementById('app');

if (container) {
    // Log #2: Para ver si se encontró el div #app
    console.log("Contenedor #app encontrado. Renderizando React...");

    const root = ReactDOM.createRoot(container);
    root.render(
        <React.StrictMode>
            <LoginPage />
        </React.StrictMode>
    );
} else {
    // Log #3: Para ver si NO se encontró el div #app
    console.error("Error Crítico: No se encontró el contenedor #app en el DOM. React no puede montarse.");
}