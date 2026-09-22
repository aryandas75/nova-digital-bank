import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    loginUser,
    logoutUser,
    getProfile,
} from "../api/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {
        const savedUser =
            localStorage.getItem("bankUser");

        return savedUser
            ? JSON.parse(savedUser)
            : null;
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const data = await getProfile();

                setUser(data.user);

                localStorage.setItem(
                    "bankUser",
                    JSON.stringify(data.user)
                );

            } catch (error) {

                setUser(null);

                localStorage.removeItem("bankUser");

            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    const login = async (credentials) => {

        const data = await loginUser(credentials);

        setUser(data.user);

        localStorage.setItem(
            "bankUser",
            JSON.stringify(data.user)
        );

        return data;
    };

    /*
     * Used when the current JWT is still valid.
     */
    const logout = async () => {

        try {
            await logoutUser();

        } catch (error) {
            console.log("Logout error:", error);

        } finally {

            setUser(null);

            localStorage.removeItem("bankUser");
        }
    };

    /*
     * Used after password change.
     *
     * The backend invalidates the old JWT when the password
     * changes, so we don't call the logout API.
     */
    const clearAuth = () => {

        setUser(null);

        localStorage.removeItem("bankUser");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                clearAuth,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () =>
    useContext(AuthContext);