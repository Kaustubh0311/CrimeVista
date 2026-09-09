import { useState } from "react";

import "./UserDashboard.css";

import NagpurMap from "./NagpurMap";
import NagpurHeatmap from "./NagpurHeatmap";
import CrimePrediction from "./CrimePrediction";
import CrimeTrends from "./CrimeTrends";
import AreaExplorer from "./AreaExplorer";
import CrimeReports from "./CrimeReports";
import CrimeAlerts from "./CrimeAlerts";
import SafetyRecommendations from "./SafetyRecommendations";


function UserDashboard({ user, token, onLogout }) {

    const [activePage, setActivePage] = useState("overview");


    const menuItems = [
        {
            id: "overview",
            icon: "🏠",
            label: "Overview",
        },
        {
            id: "map",
            icon: "🗺️",
            label: "Crime Map",
        },
        {
            id: "hotspots",
            icon: "🔥",
            label: "Hotspots",
        },
        {
            id: "trends",
            icon: "📊",
            label: "Crime Trends",
        },
        {
            id: "forecast",
            icon: "🔮",
            label: "Risk Forecast",
        },
        {
            id: "areas",
            icon: "📍",
            label: "Area Explorer",
        },
        {
            id: "safety",
            icon: "🛡️",
            label: "Safety Recommendations",
        },
        {
            id: "alerts",
            icon: "🚨",
            label: "Crime Alerts",
        },
        {
            id: "reports",
            icon: "📄",
            label: "Reports",
        },
        {
            id: "profile",
            icon: "👤",
            label: "My Profile",
        },
    ];


    const renderPage = () => {

        switch (activePage) {

            /* =====================================================
               CRIME MAP
            ===================================================== */

            case "map":
                return (
                    <div className="page-section">

                        <div className="page-heading">

                            <h1>Crime Map</h1>

                            <p>
                                Explore reported crime locations across Nagpur.
                            </p>

                        </div>


                        <div className="dashboard-card large-card">

                            <NagpurMap token={token} />

                        </div>

                    </div>
                );


            /* =====================================================
               HOTSPOTS
            ===================================================== */

            case "hotspots":
                return (
                    <div className="page-section">

                        <div className="page-heading">

                            <h1>Crime Hotspots</h1>

                            <p>
                                Visualize areas with higher concentrations
                                of reported crime.
                            </p>

                        </div>


                        <div className="dashboard-card large-card">

                            <NagpurHeatmap token={token} />

                        </div>

                    </div>
                );


            /* =====================================================
               CRIME TRENDS
            ===================================================== */

            case "trends":
                return (
                    <div className="page-section">

                        <div className="page-heading">

                            <h1>Crime Trends</h1>

                            <p>
                                Analyze historical crime activity across
                                Nagpur using interactive charts.
                            </p>

                        </div>


                        <CrimeTrends token={token} />

                    </div>
                );


            /* =====================================================
               RISK FORECAST
            ===================================================== */

            case "forecast":
                return (
                    <div className="page-section">

                        <div className="page-heading">

                            <h1>Risk Forecast</h1>

                            <p>
                                View aggregate crime activity forecasts
                                for available areas.
                            </p>

                        </div>


                        <CrimePrediction token={token} />

                    </div>
                );


            /* =====================================================
               AREA EXPLORER
            ===================================================== */

            case "areas":
                return (
                    <div className="page-section">

                        <div className="page-heading">

                            <h1>Area Explorer</h1>

                            <p>
                                Explore historical crime activity
                                across different areas of Nagpur.
                            </p>

                        </div>


                        <AreaExplorer token={token} />

                    </div>
                );


            /* =====================================================
               CRIME ALERTS - STEP 7
            ===================================================== */

            case "alerts":
                return (
                    <div className="page-section">

                        <div className="page-heading">

                            <h1>
                                Crime Alerts
                            </h1>

                            <p>
                                Stay informed about areas with elevated
                                recorded crime activity in Nagpur.
                            </p>

                        </div>


                        <CrimeAlerts token={token} />

                    </div>
                );

            /* =====================================================
                SAFETY RECOMMENDATIONS - STEP 8
            ===================================================== */

              case "recommendations":
                 return (
                     <div className="page-section">

                         <div className="page-heading">

                                <h1>
                                  Safety Recommendations
                                </h1>

                                <p>
                                       Get area-based safety guidance using
                                     historical crime activity in Nagpur.
                                 </p>

                         </div>

                         <SafetyRecommendations token={token} />

                       </div>
                  );
            /* =====================================================
               SAFETY CENTER
            ===================================================== */

            case "safety":
                return (
                    <div className="page-section">

                        <div className="page-heading">

                            <h1>Safety Center</h1>

                            <p>
                                Useful information and general safety guidance.
                            </p>

                        </div>


                        <div className="safety-grid">

                            <div className="safety-card">

                                <div className="safety-icon">
                                    🚨
                                </div>

                                <h3>
                                    Emergency Awareness
                                </h3>

                                <p>
                                    Stay alert in unfamiliar or high-activity
                                    areas and seek appropriate emergency
                                    assistance when necessary.
                                </p>

                            </div>


                            <div className="safety-card">

                                <div className="safety-icon">
                                    📱
                                </div>

                                <h3>
                                    Digital Safety
                                </h3>

                                <p>
                                    Protect your passwords and personal
                                    information and avoid sharing sensitive
                                    information with unknown sources.
                                </p>

                            </div>


                            <div className="safety-card">

                                <div className="safety-icon">
                                    👥
                                </div>

                                <h3>
                                    Public Safety
                                </h3>

                                <p>
                                    Remain aware of your surroundings,
                                    especially in crowded or unfamiliar
                                    locations.
                                </p>

                            </div>


                            <div className="safety-card">

                                <div className="safety-icon">
                                    🛡️
                                </div>

                                <h3>
                                    Stay Informed
                                </h3>

                                <p>
                                    Use CrimeVista's maps and statistics to
                                    understand historical crime activity in
                                    different areas.
                                </p>

                            </div>

                        </div>

                    </div>
                );


            /* =====================================================
               REPORTS
            ===================================================== */

            case "reports":
                return (
                    <div className="page-section">

                        <div className="page-heading">

                            <h1>
                                Reports
                            </h1>

                            <p>
                                Generate and review aggregated
                                crime reports for Nagpur.
                            </p>

                        </div>


                        <CrimeReports token={token} />

                    </div>
                );


            /* =====================================================
               PROFILE
            ===================================================== */

            case "profile":
                return (
                    <div className="page-section">

                        <div className="page-heading">

                            <h1>
                                My Profile
                            </h1>

                            <p>
                                View your CrimeVista account information.
                            </p>

                        </div>


                        <div className="profile-card">

                            <div className="profile-avatar">

                                {user?.name?.charAt(0)?.toUpperCase() || "U"}

                            </div>


                            <div className="profile-details">

                                <h2>
                                    {user?.name || "User"}
                                </h2>


                                <div className="profile-row">

                                    <span>
                                        Name
                                    </span>

                                    <strong>
                                        {user?.name || "-"}
                                    </strong>

                                </div>


                                <div className="profile-row">

                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {user?.email || "-"}
                                    </strong>

                                </div>


                                <div className="profile-row">

                                    <span>
                                        Role
                                    </span>

                                    <strong className="role-badge">
                                        {user?.role || "user"}
                                    </strong>

                                </div>


                                <div className="profile-row">

                                    <span>
                                        Status
                                    </span>

                                    <strong className="active-badge">
                                        Active
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <button
                            className="profile-logout"
                            onClick={onLogout}
                        >
                            🚪 Logout
                        </button>

                    </div>
                );


            /* =====================================================
               OVERVIEW
            ===================================================== */

            case "overview":
            default:

                return (
                    <div className="page-section">

                        <div className="page-heading">

                            <h1>
                                Welcome to CrimeVista
                            </h1>

                            <p>
                                Nagpur Crime Intelligence & Public Safety
                                Dashboard
                            </p>

                        </div>


                        {/* WELCOME CARD */}

                        <div className="welcome-card">

                            <div>

                                <span className="welcome-label">
                                    PUBLIC SAFETY PORTAL
                                </span>


                                <h2>
                                    Welcome, {user?.name || "User"} 👋
                                </h2>


                                <p>
                                    Explore historical crime activity,
                                    hotspots, maps and safety information
                                    for Nagpur.
                                </p>

                            </div>


                            <div className="welcome-icon">
                                🛡️
                            </div>

                        </div>


                        {/* STATISTICS */}

                        <div className="stats-grid">

                            <div className="stat-card">

                                <div className="stat-icon">
                                    🚨
                                </div>

                                <div>

                                    <span>
                                        Total Reports
                                    </span>

                                    <h2>
                                        —
                                    </h2>

                                </div>

                            </div>


                            <div className="stat-card">

                                <div className="stat-icon">
                                    📅
                                </div>

                                <div>

                                    <span>
                                        Recent Activity
                                    </span>

                                    <h2>
                                        —
                                    </h2>

                                </div>

                            </div>


                            <div className="stat-card">

                                <div className="stat-icon">
                                    📍
                                </div>

                                <div>

                                    <span>
                                        Areas Covered
                                    </span>

                                    <h2>
                                        —
                                    </h2>

                                </div>

                            </div>


                            <div className="stat-card">

                                <div className="stat-icon">
                                    🔥
                                </div>

                                <div>

                                    <span>
                                        Hotspots
                                    </span>

                                    <h2>
                                        —
                                    </h2>

                                </div>

                            </div>

                        </div>


                        {/* QUICK ACCESS */}

                        <div className="quick-section">

                            <h2>
                                Quick Access
                            </h2>


                            <div className="quick-grid">

                                <button
                                    onClick={() => setActivePage("map")}
                                    className="quick-card"
                                >

                                    <span>
                                        🗺️
                                    </span>

                                    <div>

                                        <strong>
                                            Explore Crime Map
                                        </strong>

                                        <small>
                                            View reported locations
                                        </small>

                                    </div>

                                </button>


                                <button
                                    onClick={() => setActivePage("hotspots")}
                                    className="quick-card"
                                >

                                    <span>
                                        🔥
                                    </span>

                                    <div>

                                        <strong>
                                            View Hotspots
                                        </strong>

                                        <small>
                                            Explore crime concentration
                                        </small>

                                    </div>

                                </button>


                                <button
                                    onClick={() => setActivePage("trends")}
                                    className="quick-card"
                                >

                                    <span>
                                        📊
                                    </span>

                                    <div>

                                        <strong>
                                            Crime Trends
                                        </strong>

                                        <small>
                                            Analyze historical trends
                                        </small>

                                    </div>

                                </button>


                                <button
                                    onClick={() => setActivePage("areas")}
                                    className="quick-card"
                                >

                                    <span>
                                        📍
                                    </span>

                                    <div>

                                        <strong>
                                            Area Explorer
                                        </strong>

                                        <small>
                                            Explore individual areas
                                        </small>

                                    </div>

                                </button>


                                <button
                                    onClick={() => setActivePage("forecast")}
                                    className="quick-card"
                                >

                                    <span>
                                        🔮
                                    </span>

                                    <div>

                                        <strong>
                                            Risk Forecast
                                        </strong>

                                        <small>
                                            View aggregate forecast
                                        </small>

                                    </div>

                                </button>


                                <button
                                    onClick={() => setActivePage("alerts")}
                                    className="quick-card"
                                >

                                    <span>
                                        🚨
                                    </span>

                                    <div>

                                        <strong>
                                            Crime Alerts
                                        </strong>

                                        <small>
                                            View area safety alerts
                                        </small>

                                    </div>

                                </button>
                                
                                <button
                                     onClick={() => setActivePage("recommendations")}
                                     className="quick-card"
                                 >

                                    <span>
                                        🧠
                                    </span>

                                 <div>

                                      <strong>
                                            Safety Recommendations
                                       </strong>

                                       <small> 
                                            Get area-based safety guidance
                                       </small>

                                 </div>

                                   </button>

                                <button
                                    onClick={() => setActivePage("safety")}
                                    className="quick-card"
                                >

                                    <span>
                                        🛡️
                                    </span>

                                    <div>

                                        <strong>
                                            Safety Center
                                        </strong>

                                        <small>
                                            Read safety information
                                        </small>

                                    </div>

                                </button>

                            </div>

                        </div>


                        {/* INFORMATION NOTICE */}

                        <div className="dashboard-notice">

                            <strong>
                                ℹ️ About CrimeVista
                            </strong>

                            <p>
                                CrimeVista presents historical and aggregated
                                crime information for Nagpur. Forecasts and
                                visualizations are intended for awareness and
                                decision support and do not predict individual
                                people or guarantee future incidents.
                            </p>

                        </div>

                    </div>
                );
        }
    };


    return (

        <div className="user-dashboard">


            {/* =====================================================
               SIDEBAR
            ===================================================== */}

            <aside className="user-sidebar">


                {/* LOGO */}

                <div className="sidebar-logo">

                    <div className="logo-symbol">
                        CV
                    </div>


                    <div>

                        <h2>
                            CrimeVista
                        </h2>

                        <span>
                            Public Safety
                        </span>

                    </div>

                </div>


                {/* LOCATION */}

                <div className="sidebar-location">

                    📍

                    <span>
                        Nagpur
                    </span>

                </div>


                {/* NAVIGATION */}

                <nav className="sidebar-nav">

                    <p className="nav-title">
                        MAIN MENU
                    </p>


                    {menuItems.slice(0, 6).map((item) => (

                        <button
                            key={item.id}
                            className={`nav-item ${
                                activePage === item.id ? "active" : ""
                            }`}
                            onClick={() => setActivePage(item.id)}
                        >

                            <span className="nav-icon">
                                {item.icon}
                            </span>

                            <span>
                                {item.label}
                            </span>

                        </button>

                    ))}


                    <p className="nav-title secondary-title">
                        INFORMATION
                    </p>


                    {menuItems.slice(6).map((item) => (

                        <button
                            key={item.id}
                            className={`nav-item ${
                                activePage === item.id ? "active" : ""
                            }`}
                            onClick={() => setActivePage(item.id)}
                        >

                            <span className="nav-icon">
                                {item.icon}
                            </span>

                            <span>
                                {item.label}
                            </span>

                        </button>

                    ))}

                </nav>


                {/* SIDEBAR BOTTOM */}

                <div className="sidebar-bottom">

                    <div className="mini-profile">

                        <div className="mini-avatar">

                            {user?.name?.charAt(0)?.toUpperCase() || "U"}

                        </div>


                        <div>

                            <strong>
                                {user?.name || "User"}
                            </strong>

                            <span>
                                Public User
                            </span>

                        </div>

                    </div>


                    <button
                        className="sidebar-logout"
                        onClick={onLogout}
                    >

                        🚪 Logout

                    </button>

                </div>

            </aside>


            {/* =====================================================
               MAIN CONTENT
            ===================================================== */}

            <main className="user-main">


                {/* HEADER */}

                <header className="user-header">

                    <div>

                        <span className="header-small">
                            CRIMEVISTA / NAGPUR
                        </span>


                        <h2>

                            {
                                menuItems.find(
                                    (item) =>
                                        item.id === activePage
                                )?.label || "Overview"
                            }

                        </h2>

                    </div>


                    <div className="header-user">

                        <div className="header-user-info">

                            <strong>
                                {user?.name || "User"}
                            </strong>

                            <span>
                                Public User
                            </span>

                        </div>


                        <div className="header-avatar">

                            {user?.name?.charAt(0)?.toUpperCase() || "U"}

                        </div>

                    </div>

                </header>


                {/* PAGE CONTENT */}

                <div className="user-content">

                    {renderPage()}

                </div>


            </main>

        </div>
    );
}


export default UserDashboard;