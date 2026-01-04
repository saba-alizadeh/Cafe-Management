import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_BASE_URL = 'http://localhost:8000/api'; // Update with your backend URL

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Helper function to attach JWT to API calls
const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Handle token expiration
    if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('cafeUser');
        window.dispatchEvent(new CustomEvent('authExpired'));
        // Return a response that indicates auth failure
        return response;
    }

    return response;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tempPhone, setTempPhone] = useState(null);
    const [token, setToken] = useState(null);

    const logout = () => {
        setUser(null);
        setTempPhone(null);
        setToken(null);
        localStorage.removeItem('cafeUser');
        localStorage.removeItem('cafeTempPhone');
        localStorage.removeItem('authToken');
    };

    useEffect(() => {
        // Check for stored authentication on app load
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('cafeUser');
        
        if (storedToken) {
            setToken(storedToken);
            // Optionally, fetch fresh user data from backend
            fetchUserProfile(storedToken);
        } else if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        
        setLoading(false);

        // Listen for auth expiration events
        const handleAuthExpired = () => {
            setUser(null);
            setTempPhone(null);
            setToken(null);
            localStorage.removeItem('cafeUser');
            localStorage.removeItem('cafeTempPhone');
            localStorage.removeItem('authToken');
            // Redirect based on current path
            if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/manager')) {
                window.location.href = '/admin-login';
            } else {
                window.location.href = '/';
            }
        };

        window.addEventListener('authExpired', handleAuthExpired);
        return () => {
            window.removeEventListener('authExpired', handleAuthExpired);
        };
    }, []);

    const fetchUserProfile = async (authToken) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                localStorage.setItem('cafeUser', JSON.stringify(userData));
            } else if (response.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('cafeUser');
                setToken(null);
                setUser(null);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const login = (userData, isNewUser = false) => {
        const userDataWithFlag = {
            ...userData,
            isNewUser,
            isLoggedIn: true
        };
        setUser(userDataWithFlag);
        localStorage.setItem('cafeUser', JSON.stringify(userDataWithFlag));
        localStorage.removeItem('cafeTempPhone');
        setTempPhone(null);
    };

    const setUnloggedPhone = (phone) => {
        setTempPhone(phone);
        localStorage.setItem('cafeTempPhone', phone);
    };

    const markUserAsRegistered = () => {
        if (user) {
            const updatedUser = { ...user, isNewUser: false };
            setUser(updatedUser);
            localStorage.setItem('cafeUser', JSON.stringify(updatedUser));
        }
    };

    const setAuthToken = (authToken) => {
        setToken(authToken);
        localStorage.setItem('authToken', authToken);
    };

    const value = {
        user,
        login,
        logout,
        loading,
        tempPhone,
        setUnloggedPhone,
        markUserAsRegistered,
        token,
        setAuthToken,
        fetchWithAuth,
        fetchUserProfile,
        apiBaseUrl: API_BASE_URL
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export { fetchWithAuth };
