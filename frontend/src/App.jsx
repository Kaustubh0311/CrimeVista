import { useState } from "react";

import LandingPage from "./LandingPage";
import Login from "./login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import UserDashboard from "./UserDashboard";


function App() {

    const [token, setToken] = useState(
        localStorage.getItem("access_token")
    );

    const [user, setUser] = useState(null);

    const [page, setPage] = useState(
        token ? "loading" : "landing"
    );


    const loadUser = async (accessToken) => {

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/auth/me",
                {
                    headers: {
                        Authorization:
                            `Bearer ${accessToken}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Unable to load user");
            }

            const data = await response.json();

            setUser(data);

            if (data.role === "user") {
                setPage("user");
            } else {
                setPage("dashboard");
            }

        } catch (error) {

            console.error(error);

            localStorage.removeItem("access_token");

            setToken(null);
            setUser(null);
            setPage("landing");
        }
    };


    const handleLogin = async (newToken) => {

        setToken(newToken);

        await loadUser(newToken);
    };


    const handleRegister = async (newToken) => {

        setToken(newToken);

        await loadUser(newToken);
    };


    const handleLogout = () => {

        localStorage.removeItem(
            "access_token"
        );

        setToken(null);
        setUser(null);
        setPage("landing");
    };


    if (page === "landing") {

        return (

            <LandingPage

                onLogin={() => {
                    setPage("login");
                }}

                onRegister={() => {
                    setPage("register");
                }}

            />

        );
    }


    if (page === "login") {

        return (

            <Login
                onLogin={handleLogin}
            />

        );
    }


    if (page === "register") {

        return (

            <Register
                onRegister={handleRegister}

                onBackToLogin={() => {
                    setPage("login");
                }}

            />

        );
    }


    if (page === "loading") {

        loadUser(token);

        return (
            <div>
                Loading CrimeVista...
            </div>
        );
    }


    if (page === "user") {

        return (

            <UserDashboard
                token={token}
                user={user}
                onLogout={handleLogout}
            />

        );
    }


    return (

        <Dashboard

            token={token}

            onLogout={handleLogout}

        />

    );
}


export default App;