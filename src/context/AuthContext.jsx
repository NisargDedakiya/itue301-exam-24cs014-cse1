import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [member, setMember] = useState(() => {
        try {
            const saved = localStorage.getItem("fitzone_member");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("fitzone_token") || null;
    });

    const [role, setRole] = useState(() => {
        return localStorage.getItem("fitzone_role") || null;
    });

    function login(memberData, userToken, userRole = "member") {
        setMember(memberData);
        setToken(userToken);
        setRole(userRole);
        try {
            localStorage.setItem("fitzone_member", JSON.stringify(memberData));
            localStorage.setItem("fitzone_token", userToken);
            localStorage.setItem("fitzone_role", userRole);
        } catch (e) {
            console.error("Storage error:", e);
        }
    }

    function logout() {
        setMember(null);
        setToken(null);
        setRole(null);
        try {
            localStorage.removeItem("fitzone_member");
            localStorage.removeItem("fitzone_token");
            localStorage.removeItem("fitzone_role");
        } catch (e) {
            console.error("Storage error:", e);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                member,
                token,
                role,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}