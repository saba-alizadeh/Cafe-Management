import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tempPhone, setTempPhone] = useState(null); // Temporarily store phone for unlogged users

    useEffect(() => {
        // Check for stored authentication on app load
        const storedUser = localStorage.getItem('cafeUser');
        const storedPhone = localStorage.getItem('cafeTempPhone');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        if (storedPhone) {
            setTempPhone(storedPhone);
        }
        setLoading(false);
    }, []);

    const login = (userData, isNewUser = false) => {
        // Add isNewUser flag to track if profile completion is needed
        const userDataWithFlag = {
            ...userData,
            isNewUser,
            isLoggedIn: true
        };
        setUser(userDataWithFlag);
        localStorage.setItem('cafeUser', JSON.stringify(userDataWithFlag));
        // Clear temp phone once logged in
        localStorage.removeItem('cafeTempPhone');
        setTempPhone(null);
    };

    const setUnloggedPhone = (phone) => {
        // Store phone for users who authenticated but not completed profile
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

    const logout = () => {
        setUser(null);
        setTempPhone(null);
        localStorage.removeItem('cafeUser');
        localStorage.removeItem('cafeTempPhone');
    };

    const value = {
        user,
        login,
        logout,
        loading,
        tempPhone,
        setUnloggedPhone,
        markUserAsRegistered
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
