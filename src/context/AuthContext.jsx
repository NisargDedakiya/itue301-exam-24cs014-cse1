import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

function AuthProvider({ children }) {
    const [member, setMember] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);

    function login(memberData, userToken, userRole) {
        setMember(memberData);
        setToken(userToken);
        setRole(userRole);
    }

    function logout() {
        setMember(null);
        setToken(null);
        setRole(null);
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

function useAuth() {
    return useContext(AuthContext);
}

export { AuthProvider, useAuth };