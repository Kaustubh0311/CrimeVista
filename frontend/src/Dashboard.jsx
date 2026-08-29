import { useEffect, useState } from "react";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";

import CrimeUpload from "./CrimeUpload";

import NagpurMap from "./NagpurMap";

import NagpurHeatmap from "./NagpurHeatmap";

import "./Dashboard.css";


function Dashboard({ token, onLogout }) {


    const [user, setUser] = useState(null);

    const [statistics, setStatistics] =
        useState(null);

    const [error, setError] = useState("");


    /*
     * =========================================
     * LOAD USER
     * =========================================
     */

    useEffect(() => {

        fetch(
            "http://127.0.0.1:8000/auth/me",
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        )

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Failed to load user"
                );

            }

            return response.json();

        })

        .then(data => {

            setUser(data);

        })

        .catch(error => {

            console.error(error);

            setError(
                "Unable to load user information"
            );

        });

    }, [token]);


    /*
     * =========================================
     * LOAD CRIME STATISTICS
     * =========================================
     */

    useEffect(() => {

        fetch(
            "http://127.0.0.1:8000/crimes/statistics",
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        )

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Failed to load statistics"
                );

            }

            return response.json();

        })

        .then(data => {

            setStatistics(data);

        })

        .catch(error => {

            console.error(error);

            setError(
                "Unable to load crime statistics"
            );

        });

    }, [token]);


    /*
     * =========================================
     * LOADING
     * =========================================
     */

    if (!user && !error) {

        return (

            <div className="dashboard-loading">

                Loading CrimeVista...

            </div>

        );

    }


    /*
     * =========================================
     * ERROR
     * =========================================
     */

    if (error && !user) {

        return (

            <div className="dashboard-error">

                <p>
                    {error}
                </p>

                <button
                    onClick={onLogout}
                >
                    Logout
                </button>

            </div>

        );

    }


    return (

        <div className="dashboard">


            {/* =====================================
                HEADER
               ===================================== */}

            <header className="dashboard-header">

                <div>

                    <span className="dashboard-tag">

                        CRIME INTELLIGENCE SYSTEM

                    </span>

                    <h1>

                        CrimeVista

                    </h1>

                </div>


                <div className="header-user">

                    <div>

                        <strong>

                            {user.name}

                        </strong>

                        <small>

                            {user.role}

                        </small>

                    </div>


                    <button
                        onClick={onLogout}
                        className="logout-button"
                    >

                        LOGOUT

                    </button>

                </div>

            </header>


            {/* =====================================
                ADMIN UPLOAD
               ===================================== */}

            {user.role === "admin" && (

                <section>

                    <CrimeUpload
                        token={token}
                    />

                </section>

            )}


            {/* =====================================
                STATISTICS
               ===================================== */}

            <section className="analytics-section">

                <div className="section-heading">

                    <div>

                        <span>
                            LIVE INTELLIGENCE
                        </span>

                        <h2>
                            Crime Overview
                        </h2>

                    </div>

                </div>


                {!statistics ? (

                    <p>
                        Loading statistics...
                    </p>

                ) : (

                    <>


                        {/* =========================
                            STAT CARDS
                           ========================= */}

                        <div className="stat-grid">


                            {/* TOTAL CRIMES */}

                            <div className="stat-card">

                                <span>
                                    TOTAL CRIMES
                                </span>

                                <strong>

                                    {
                                        statistics
                                            .total_crimes
                                    }

                                </strong>

                            </div>


                            {/* LOCATIONS */}

                            <div className="stat-card">

                                <span>
                                    LOCATIONS
                                </span>

                                <strong>

                                    {
                                        statistics
                                            .total_locations
                                    }

                                </strong>

                            </div>


                            {/* CRIME TYPES */}

                            <div className="stat-card">

                                <span>
                                    CRIME TYPES
                                </span>

                                <strong>

                                    {
                                        statistics
                                            .crime_types
                                            .length
                                    }

                                </strong>

                            </div>


                            {/* DATA STATUS */}

                            <div className="stat-card">

                                <span>
                                    DATA STATUS
                                </span>

                                <strong
                                    className="online"
                                >

                                    LIVE

                                </strong>

                            </div>


                        </div>


                        {/* =========================
                            CHARTS
                           ========================= */}

                        <div className="charts-grid">


                            {/* =========================
                                CRIME TYPE BAR CHART
                               ========================= */}

                            <div className="chart-card">

                                <div className="chart-header">

                                    <span>
                                        CRIME DISTRIBUTION
                                    </span>

                                    <h3>
                                        Crime by Type
                                    </h3>

                                </div>


                                <ResponsiveContainer
                                    width="100%"
                                    height={300}
                                >

                                    <BarChart
                                        data={
                                            statistics
                                                .crime_types
                                        }
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#222"
                                        />

                                        <XAxis
                                            dataKey="name"
                                            stroke="#777"
                                        />

                                        <YAxis
                                            stroke="#777"
                                        />

                                        <Tooltip />

                                        <Bar
                                            dataKey="count"
                                            fill="#a00000"
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            </div>


                            {/* =========================
                                CRIME PIE CHART
                               ========================= */}

                            <div className="chart-card">

                                <div className="chart-header">

                                    <span>
                                        CRIME PROFILE
                                    </span>

                                    <h3>
                                        Crime Categories
                                    </h3>

                                </div>


                                <ResponsiveContainer
                                    width="100%"
                                    height={300}
                                >

                                    <PieChart>

                                        <Pie
                                            data={
                                                statistics
                                                    .crime_types
                                            }

                                            dataKey="count"

                                            nameKey="name"

                                            cx="50%"

                                            cy="50%"

                                            outerRadius={100}

                                            label
                                        >

                                            {
                                                statistics
                                                    .crime_types
                                                    .map(
                                                        (
                                                            entry,
                                                            index
                                                        ) => (

                                                            <Cell
                                                                key={
                                                                    index
                                                                }

                                                                fill={
                                                                    [
                                                                        "#a00000",
                                                                        "#c00000",
                                                                        "#720000",
                                                                        "#e00000",
                                                                        "#4d0000"
                                                                    ][
                                                                        index % 5
                                                                    ]
                                                                }
                                                            />

                                                        )
                                                    )
                                            }

                                        </Pie>

                                        <Tooltip />

                                    </PieChart>

                                </ResponsiveContainer>

                            </div>


                        </div>


                        {/* =========================
                            LOCATION CHART
                           ========================= */}

                        <div className="chart-card location-chart">

                            <div className="chart-header">

                                <span>
                                    GEOGRAPHICAL DISTRIBUTION
                                </span>

                                <h3>
                                    Crimes by Location
                                </h3>

                            </div>


                            <ResponsiveContainer
                                width="100%"
                                height={320}
                            >

                                <BarChart
                                    data={
                                        statistics
                                            .locations
                                    }
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#222"
                                    />

                                    <XAxis
                                        dataKey="name"
                                        stroke="#777"
                                    />

                                    <YAxis
                                        stroke="#777"
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="count"
                                        fill="#700000"
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>


                    </>

                )}

            </section>


            {/* =====================================
                PHASE 6 — NAGPUR GEOSPATIAL MAP
               ===================================== */}

            <section className="geospatial-section">

                <NagpurMap
                    token={token}
                />

            </section>


            {/* =====================================
                PHASE 7 — NAGPUR CRIME HEATMAP
               ===================================== */}

            <section className="heatmap-section">

                <NagpurHeatmap
                    token={token}
                />

            </section>


        </div>

    );

}


export default Dashboard;