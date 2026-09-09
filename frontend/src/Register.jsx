import { useState } from "react";
import "./Register.css";

function Register({ onRegister, onBackToLogin }) {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password,
                        role: role
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                setError(
                    data.detail ||
                    "Registration failed"
                );

                setLoading(false);

                return;
            }

            localStorage.setItem(
                "access_token",
                data.access_token
            );

            onRegister(data.access_token);

        } catch (error) {

            console.error(error);

            setError(
                "Unable to connect to CrimeVista server"
            );

        }

        setLoading(false);
    };


    return (

        <div className="register-page">

            <div className="register-background"></div>

            <header className="register-header">

                <div className="brand-small">

                    <span className="brand-dot"></span>

                    CRIMEVISTA

                </div>

                <div className="system-status">

                    <span className="status-dot"></span>

                    SYSTEM ONLINE

                </div>

            </header>


            <main className="register-container">

                <section className="register-intro">

                    <div className="classification">

                        NAGPUR CRIME INTELLIGENCE

                    </div>

                    <h1>

                        CREATE

                        <span>

                            ACCOUNT

                        </span>

                    </h1>

                    <p className="register-title">

                        JOIN CRIMEVISTA

                    </p>

                    <p className="register-description">

                        Create your CrimeVista account and
                        access the platform according to your
                        selected role.

                    </p>

                    <div className="role-info">

                        <div>

                            <span>01</span>

                            USER

                        </div>

                        <div>

                            <span>02</span>

                            OFFICER

                        </div>

                        <div>

                            <span>03</span>

                            ADMIN

                        </div>

                    </div>

                </section>


                <section className="register-card">

                    <div className="register-card-header">

                        <div className="security-icon">

                            ◉

                        </div>

                        <div>

                            <p className="register-label">

                                ACCOUNT REGISTRATION

                            </p>

                            <h2>

                                Create Account

                            </h2>

                        </div>

                    </div>


                    <div className="divider">

                        <span>

                            REGISTRATION REQUIRED

                        </span>

                    </div>


                    <form onSubmit={handleRegister}>

                        <div className="input-group">

                            <label>

                                FULL NAME

                            </label>

                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                required
                            />

                        </div>


                        <div className="input-group">

                            <label>

                                EMAIL

                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                            />

                        </div>


                        <div className="input-group">

                            <label>

                                PASSWORD

                            </label>

                            <input
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                required
                                minLength={6}
                            />

                        </div>


                        <div className="input-group">

                            <label>

                                ACCOUNT TYPE

                            </label>

                            <select
                                value={role}
                                onChange={(event) =>
                                    setRole(event.target.value)
                                }
                            >

                                <option value="user">
                                    USER
                                </option>

                                <option value="officer">
                                    OFFICER
                                </option>

                                <option value="admin">
                                    ADMIN
                                </option>

                            </select>

                        </div>


                        {error && (

                            <div className="register-error">

                                <span>!</span>

                                {error}

                            </div>

                        )}


                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >

                            {loading
                                ? "CREATING ACCOUNT..."
                                : "CREATE ACCOUNT"
                            }

                        </button>

                    </form>


                    <div className="login-link">

                        Already have an account?

                        <button
                            type="button"
                            onClick={onBackToLogin}
                        >

                            LOGIN

                        </button>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Register;