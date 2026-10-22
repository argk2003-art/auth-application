
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

const API_URL = "http://localhost:8080/api/auth";

async function getCsrfToken() {
    const response = await fetch(`${API_URL}/csrf`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Unable to obtain CSRF token.");
    }

    const data = await response.json();
    return data.token;
}

async function handleLogout() {
    try {
        const csrfToken = await getCsrfToken();

        const response = await fetch(`${API_URL}/logout`, {
            method: "POST",
            credentials: "include",
            headers: {
                "X-XSRF-TOKEN": csrfToken,
            },
        });

        if (!response.ok) {
            throw new Error(`Logout failed: ${response.status}`);
        }

        // Clear frontend authentication state and navigate to login.
        // Call your existing logout callback here.
    } catch (error) {
        console.error("Logout error:", error);
    }
}

const backgroundImage =
    "/vecteezy_nature-background-nature-wallpaper-scenic-landscape-with-a_73610641.jpg";

export default function Login({ onLogin }) {
    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(true);

    async function handleLogin(event) {
        event.preventDefault();

        if (loading) return;

        setError("");
        setLoading(true);


        try {
            // Step 1: Obtain a CSRF token from Spring Boot
            const csrfToken = await getCsrfToken();

            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                },
                credentials: "include",
                body: JSON.stringify({
                    identifier: identifier.trim(),
                    password,
                }),
            });

            // Keep your existing response-handling code below here


            // Safely handle JSON or unexpected server responses.
            const responseText = await response.text();
            let data = {};

            if (responseText) {
                try {
                    data = JSON.parse(responseText);
                } catch {
                    throw new Error(
                        `Unexpected server response (${response.status}).`
                    );
                }
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    `Login failed (${response.status}).`
                );
            }

            if (
                !data.id ||
                !data.username ||
                !data.email
            ) {
                throw new Error(
                    "Login response is missing user details. Check AuthController."
                );
            }

            if (typeof onLogin !== "function") {
                throw new Error(
                    "Login handler is missing. Check App.jsx."
                );
            }

            // Save the authenticated user through the App component.
            // The backend session cookie is managed by the browser.
            onLogin(data, rememberMe);

            // App.jsx may also navigate after updating authentication.
            // This navigation ensures the dashboard route is requested.
            navigate("/dashboard", { replace: true });

        } catch (err) {
            console.error("Login error:", err);

            if (err instanceof TypeError) {
                setError(
                    "Cannot connect to the authentication server. " +
                    "Check that Spring Boot is running and CORS is configured."
                );
            } else {
                setError(
                    err.message ||
                    "Unable to sign in. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            className="login-page"
            style={{
                backgroundImage: `url("${backgroundImage}")`,
            }}
        >
            <section className="login-card">
                <div className="brand">✦ VERDANT</div>

                <div className="leaf">🌿</div>

                <h1>Welcome Back</h1>

                <p className="subtitle">
                    Sign in to continue to your account
                </p>

                <form onSubmit={handleLogin}>
                    <label className="input-box">
                        <span aria-hidden="true">✉</span>

                        <input
                            type="text"
                            name="identifier"
                            placeholder="Email or username"
                            autoComplete="username"
                            value={identifier}
                            onChange={(event) =>
                                setIdentifier(event.target.value)
                            }
                            disabled={loading}
                            required
                        />
                    </label>

                    <label className="input-box">
                        <span aria-hidden="true">🔒</span>

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            disabled={loading}
                            required
                        />
                    </label>

                    {error && (
                        <p
                            className="login-error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    <div className="login-options">
                        <label className="remember">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(event) =>
                                    setRememberMe(event.target.checked)
                                }
                                disabled={loading}
                            />
                            Remember me
                        </label>

                        <a href="/forgot-password">
                            Forgot password?
                        </a>
                    </div>

                    <button
                        className="sign-in"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <p className="register">
                        <a href="/register">
                            Create an account
                        </a>
                    </p>
                </form>
            </section>
        </main>
    );
}
