import './bootstrap';
import '../css/app.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AnimatedLogos from './components/AnimatedLogos';

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <AnimatedLogos />
    </React.StrictMode>
);