import { useState } from "react";
import "./Login.css";


function Login({ onLogin }) {

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);


    const handleLogin = async (event) => {

        event.preventDefault();

        setError("");

        setLoading(true);


        try {

            const response = await fetch(
                "http://127.0.0.1:8000/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                setError(
                    data.detail ||
                    "Invalid email or password"
                );

                setLoading(false);

                return;
            }


            localStorage.setItem(
                "access_token",
                data.access_token
            );


            onLogin(
                data.access_token
            );


        } catch (error) {

            setError(
                "Unable to connect to CrimeVista server"
            );

            setLoading(false);

        }

    };


    return (

        <div className="login-page">


            {/* Background Effects */}

            <div className="background-grid"></div>

            <div className="red-glow glow-one"></div>

            <div className="red-glow glow-two"></div>

            <div className="scan-line"></div>


            {/* Top Header */}

            <header className="system-header">

                <div className="brand-small">

                    <span className="brand-dot"></span>

                    CRIMEVISTA

                </div>


                <div className="system-status">

                    <span className="status-dot"></span>

                    SYSTEM ONLINE

                </div>

            </header>


            {/* Main Content */}

            <main className="login-container">


                {/* Left Information */}

                <section className="login-intro">

                    <div className="classification">

                        CLASSIFIED SYSTEM

                    </div>


                    <h1>

                        CRIME

                        <span>

                            VISTA

                        </span>

                    </h1>


                    <p className="intro-title">

                        CRIME INTELLIGENCE PLATFORM

                    </p>


                    <p className="intro-description">

                        A centralized platform for crime
                        intelligence, geospatial analysis,
                        predictive insights and operational
                        decision support.

                    </p>


                    <div className="system-lines">

                        <div>

                            <span>01</span>

                            CRIME DATA

                        </div>


                        <div>

                            <span>02</span>

                            GEOSPATIAL INTELLIGENCE

                        </div>


                        <div>

                            <span>03</span>

                            PREDICTIVE ANALYTICS

                        </div>

                    </div>

                </section>


                {/* Login Box */}

                <section className="login-card">


                    <div className="corner corner-top-left"></div>

                    <div className="corner corner-top-right"></div>

                    <div className="corner corner-bottom-left"></div>

                    <div className="corner corner-bottom-right"></div>


                    <div className="login-card-header">


                        <div className="security-icon">

                            ◉

                        </div>


                        <div>

                            <p className="login-label">

                                SECURE ACCESS

                            </p>

                            <h2>

                                Welcome Back

                            </h2>

                        </div>


                    </div>


                    <div className="divider">

                        <span>

                            AUTHENTICATION REQUIRED

                        </span>

                    </div>


                    <form onSubmit={handleLogin}>


                        {/* Email */}

                        <div className="input-group">

                            <label>

                                EMAIL / OFFICER ID

                            </label>


                            <div className="input-wrapper">

                                <span className="input-icon">

                                    @

                                </span>


                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={
                                        (event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* Password */}

                        <div className="input-group">

                            <label>

                                PASSWORD

                            </label>


                            <div className="input-wrapper">

                                <span className="input-icon">

                                    ●

                                </span>


                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={
                                        (event) =>
                                            setPassword(
                                                event.target.value
                                            )
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* Error */}

                        {error && (

                            <div className="login-error">

                                <span>!</span>

                                {error}

                            </div>

                        )}


                        {/* Login Button */}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >

                            {loading ? (

                                <>
                                    AUTHENTICATING
                                    <span className="loading-dots">
                                        ...
                                    </span>
                                </>

                            ) : (

                                <>
                                    AUTHENTICATE

                                    <span className="arrow">

                                        →

                                    </span>
                                </>

                            )}

                        </button>


                    </form>


                    {/* Security Status */}

                    <div className="security-status">

                        <span className="secure-pulse"></span>

                        <span>

                            ENCRYPTED CONNECTION

                        </span>

                        <span className="status-divider">

                            //

                        </span>

                        <span>

                            SECURE

                        </span>

                    </div>


                </section>

            </main>


            {/* Bottom Footer */}

            <footer className="system-footer">

                <span>

                    CRIMEVISTA INTELLIGENCE SYSTEM

                </span>


                <span>

                    SYSTEM // 01.0

                </span>


                <span>

                    AUTHORIZED PERSONNEL ONLY

                </span>

            </footer>


        </div>

    );

}


export default Login;