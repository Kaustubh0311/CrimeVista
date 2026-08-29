import { useState } from "react";

import LandingPage from "./LandingPage";
import Login from "./Login";
import Dashboard from "./Dashboard";


function App() {

    const [token, setToken] = useState(
        localStorage.getItem(
            "access_token"
        )
    );


    const [showLanding, setShowLanding] =
        useState(true);


    const handleLogin = (newToken) => {

        setToken(newToken);

        setShowLanding(false);

    };


    const handleLogout = () => {

        localStorage.removeItem(
            "access_token"
        );

        setToken(null);

        setShowLanding(true);

    };


    /*
     * =====================================
     * LANDING PAGE
     * =====================================
     */

    if (!token && showLanding) {

        return (

            <LandingPage

                onLogin={() => {

                    setShowLanding(false);

                }}

                onRegister={() => {

                    setShowLanding(false);

                }}

            />

        );

    }


    /*
     * =====================================
     * LOGIN PAGE
     * =====================================
     */

    if (!token) {

        return (

            <Login
                onLogin={handleLogin}
            />

        );

    }


    /*
     * =====================================
     * DASHBOARD
     * =====================================
     */

    return (

        <Dashboard

            token={token}

            onLogout={handleLogout}

        />

    );

}


export default App;