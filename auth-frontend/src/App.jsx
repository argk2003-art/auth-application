
import { useState } from "react";
import {
    Routes,
    Route,
    Navigate,
    useNavigate,
} from "react-router-dom";

import Login from "./components/Login/Login";
import DashboardPage from "./components/dashbord/Dashboard";
import "./App.css";

export default function App() {
    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        try {
            const savedUser = sessionStorage.getItem("loggedInUser");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            sessionStorage.removeItem("loggedInUser");
            return null;
        }
    });

    function handleLogin(userData, rememberMe) {
        if (rememberMe) {
            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(userData)
            );
            sessionStorage.removeItem("loggedInUser");
        } else {
            sessionStorage.setItem(
                "loggedInUser",
                JSON.stringify(userData)
            );
            localStorage.removeItem("loggedInUser");
        }

        setUser(userData);
        navigate("/dashboard", { replace: true });
    }

    async function handleLogout() {
        try {
            const response = await fetch(
                "http://localhost:8080/api/auth/logout",
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                console.error("Backend logout failed:", response.status);
            }
        } catch (err) {
            console.error("Logout request failed:", err);
        } finally {
            sessionStorage.removeItem("loggedInUser");
            setUser(null);
            navigate("/", { replace: true });
        }
    }

    return (
        <Routes>
            <Route
                path="/"
                element={
                    user ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <Login onLogin={handleLogin} />
                    )
                }
            />

            <Route
                path="/dashboard"
                element={
                    user ? (
                        <DashboardPage
                            user={user}
                            onLogout={handleLogout}
                        />
                    ) : (
                        <Navigate to="/" replace />
                    )
                }
            />

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
}
