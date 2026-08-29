import "./LandingPage.css";


function LandingPage({ onLogin, onRegister }) {

    return (

        <div className="landing-page">


            {/* ==============================
                NAVBAR
               ============================== */}

            <nav className="landing-navbar">

                <div className="landing-logo">

                    <span className="logo-mark">
                        C
                    </span>

                    <span>
                        CRIMEVISTA
                    </span>

                </div>


                <div className="landing-nav-links">

                    <a href="#features">
                        Features
                    </a>

                    <a href="#about">
                        About
                    </a>

                    <button
                        className="nav-login"
                        onClick={onLogin}
                    >
                        Login
                    </button>

                    <button
                        className="nav-register"
                        onClick={onRegister}
                    >
                        Sign Up
                    </button>

                </div>

            </nav>


            {/* ==============================
                HERO
               ============================== */}

            <section className="landing-hero">

                <div className="hero-content">

                    <div className="hero-label">

                        NAGPUR CRIME INTELLIGENCE

                    </div>


                    <h1>

                        Understanding Crime.
                        <br />

                        <span>
                            Mapping Risk.
                        </span>

                    </h1>


                    <p>

                        CrimeVista is a geospatial crime
                        intelligence platform designed to
                        analyze historical crime data,
                        visualize crime patterns and identify
                        high-risk areas across Nagpur.

                    </p>


                    <div className="hero-buttons">

                        <button
                            className="primary-button"
                            onClick={onRegister}
                        >

                            GET STARTED

                            <span>
                                →
                            </span>

                        </button>


                        <button
                            className="secondary-button"
                            onClick={() => {

                                document
                                    .getElementById("features")
                                    ?.scrollIntoView({
                                        behavior: "smooth"
                                    });

                            }}
                        >

                            EXPLORE CRIMEVISTA

                        </button>

                    </div>

                </div>


                {/* ==============================
                    HERO VISUAL
                   ============================== */}

                <div className="hero-visual">

                    <div className="radar">

                        <div className="radar-circle circle-one">
                        </div>

                        <div className="radar-circle circle-two">
                        </div>

                        <div className="radar-circle circle-three">
                        </div>


                        <div className="radar-line">
                        </div>


                        <div className="crime-point point-one">
                        </div>

                        <div className="crime-point point-two">
                        </div>

                        <div className="crime-point point-three">
                        </div>

                    </div>

                </div>

            </section>


            {/* ==============================
                FEATURES
               ============================== */}

            <section
                id="features"
                className="features-section"
            >

                <div className="section-label">

                    CORE CAPABILITIES

                </div>


                <h2>

                    From Crime Data
                    <span>
                        to Intelligence
                    </span>

                </h2>


                <p className="section-description">

                    CrimeVista transforms raw crime records
                    into meaningful visual intelligence
                    that helps understand crime patterns
                    across Nagpur.

                </p>


                <div className="feature-grid">


                    <div className="feature-card">

                        <div className="feature-number">
                            01
                        </div>

                        <h3>
                            Crime Analytics
                        </h3>

                        <p>

                            Analyze crime records using
                            statistics, trends and
                            category-based insights.

                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-number">
                            02
                        </div>

                        <h3>
                            Geospatial Mapping
                        </h3>

                        <p>

                            Visualize where crimes occur
                            using geographical coordinates
                            across Nagpur.

                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-number">
                            03
                        </div>

                        <h3>
                            Crime Hotspots
                        </h3>

                        <p>

                            Identify areas where crime
                            incidents are geographically
                            concentrated.

                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-number">
                            04
                        </div>

                        <h3>
                            Data-Driven Intelligence
                        </h3>

                        <p>

                            Convert historical crime data
                            into information that can support
                            better decision-making.

                        </p>

                    </div>


                </div>

            </section>


            {/* ==============================
                ABOUT
               ============================== */}

            <section
                id="about"
                className="about-section"
            >

                <div className="about-content">

                    <div>

                        <div className="section-label">

                            ABOUT CRIMEVISTA

                        </div>


                        <h2>

                            A Smarter View
                            <br />

                            of Crime in Nagpur

                        </h2>

                    </div>


                    <div className="about-text">

                        <p>

                            CrimeVista is a CSE final-year
                            project focused on combining
                            data analytics, geospatial
                            visualization and machine
                            learning for crime intelligence.

                        </p>


                        <p>

                            The system works with historical
                            crime records and transforms them
                            into dashboards, geographical
                            visualizations and hotspot
                            insights.

                        </p>


                    </div>

                </div>

            </section>


            {/* ==============================
                CTA
               ============================== */}

            <section className="cta-section">

                <div>

                    <div className="section-label">

                        CRIME INTELLIGENCE STARTS HERE

                    </div>


                    <h2>

                        Explore CrimeVista

                    </h2>


                    <p>

                        Access the platform and explore
                        crime intelligence for Nagpur.

                    </p>


                    <div className="cta-buttons">

                        <button
                            className="primary-button"
                            onClick={onLogin}
                        >

                            LOGIN

                        </button>


                        <button
                            className="secondary-button"
                            onClick={onRegister}
                        >

                            CREATE ACCOUNT

                        </button>

                    </div>

                </div>

            </section>


            {/* ==============================
                FOOTER
               ============================== */}

            <footer className="landing-footer">

                <div>

                    © 2026 CrimeVista

                </div>

                <div>

                    Nagpur Crime Intelligence Platform

                </div>

            </footer>


        </div>

    );

}


export default LandingPage;