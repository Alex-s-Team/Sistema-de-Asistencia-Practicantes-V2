// resources/js/Context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../Services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verificar autenticación al cargar
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/me');
            setUser(response.data.user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            localStorage.removeItem('token');
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            // Asegurarse de que los datos estén en el formato correcto
            const credentials = {
                email: email.trim(),
                password: password
            };

            console.log('Intentando login con:', { email: credentials.email });

            const response = await api.post('/login', credentials);
            
            const { token, user: userData } = response.data;

            // Guardar token
            localStorage.setItem('token', token);
            
            // Configurar header de autorización
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Actualizar estado
            setUser(userData);
            setIsAuthenticated(true);

            return userData;
        } catch (error) {
            console.error('Error en login:', error);
            
            // Limpiar estado en caso de error
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            setIsAuthenticated(false);

            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};