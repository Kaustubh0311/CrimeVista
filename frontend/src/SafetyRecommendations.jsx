import { useEffect, useMemo, useState } from "react";
import "./SafetyRecommendations.css";

function SafetyRecommendations({ token }) {
    const [crimes, setCrimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCrimeData();
    }, []);

    const fetchCrimeData = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://127.0.0.1:8000/crimes",
                {
                    headers: token
                        ? {
                              Authorization: `Bearer ${token}`,
                          }
                        : {},
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch crime data");
            }

            const result = await response.json();

            const data = Array.isArray(result)
                ? result
                : result.crimes || result.data || [];

            /*
             * Keep only records that belong to Nagpur.
             * We use the same geographic boundary already
             * used in the other User Dashboard modules.
             */
            const nagpurData = data.filter((crime) => {
                const latitude = Number(crime.latitude);
                const longitude = Number(crime.longitude);

                return (
                    !Number.isNaN(latitude) &&
                    !Number.isNaN(longitude) &&
                    latitude >= 20.95 &&
                    latitude <= 21.35 &&
                    longitude >= 78.85 &&
                    longitude <= 79.35
                );
            });

            setCrimes(nagpurData);
        } catch (err) {
            console.error("Safety recommendation error:", err);
            setError("Unable to load safety recommendations.");
        } finally {
            setLoading(false);
        }
    };

    /*
     * Analyse crime records area-wise.
     */
    const areaAnalysis = useMemo(() => {
        const areas = {};

        crimes.forEach((crime) => {
            const area =
                crime.location ||
                crime.area ||
                crime.locality ||
                "Unknown Area";

            const crimeType =
                crime.crime_type ||
                crime.type ||
                crime.category ||
                "Other";

            if (!areas[area]) {
                areas[area] = {
                    name: area,
                    total: 0,
                    types: {},
                };
            }

            areas[area].total += 1;

            if (!areas[area].types[crimeType]) {
                areas[area].types[crimeType] = 0;
            }

            areas[area].types[crimeType] += 1;
        });

        return Object.values(areas)
            .map((area) => {
                const sortedTypes = Object.entries(area.types)
                    .sort((a, b) => b[1] - a[1]);

                const dominantCrime =
                    sortedTypes.length > 0
                        ? sortedTypes[0][0]
                        : "General activity";

                let risk = "LOW";

                if (area.total >= 8) {
                    risk = "HIGH";
                } else if (area.total >= 4) {
                    risk = "MEDIUM";
                }

                return {
                    ...area,
                    risk,
                    dominantCrime,
                };
            })
            .sort((a, b) => b.total - a.total);
    }, [crimes]);

    /*
     * Overall Nagpur activity.
     */
    const overallStats = useMemo(() => {
        const total = crimes.length;

        const areas = new Set(
            crimes.map(
                (crime) =>
                    crime.location ||
                    crime.area ||
                    crime.locality ||
                    "Unknown Area"
            )
        );

        const highRiskAreas = areaAnalysis.filter(
            (area) => area.risk === "HIGH"
        ).length;

        const mediumRiskAreas = areaAnalysis.filter(
            (area) => area.risk === "MEDIUM"
        ).length;

        return {
            total,
            areas: areas.size,
            highRiskAreas,
            mediumRiskAreas,
        };
    }, [crimes, areaAnalysis]);

    /*
     * Generate recommendations according to activity.
     */
    const getRecommendation = (area) => {
        if (area.risk === "HIGH") {
            return {
                icon: "🚨",
                title: "High Activity Area",
                text:
                    "Historical records show relatively high crime activity in this area. Stay alert, prefer well-lit public routes and avoid isolated locations when possible.",
            };
        }

        if (area.risk === "MEDIUM") {
            return {
                icon: "⚠️",
                title: "Elevated Activity",
                text:
                    "Crime activity is moderately elevated based on available historical records. Maintain awareness of your surroundings, especially during less busy hours.",
            };
        }

        return {
            icon: "🛡️",
            title: "General Safety",
            text:
                "Recorded activity is relatively low in the available data. Continue following normal safety practices and remain aware of your surroundings.",
        };
    };

    if (loading) {
        return (
            <div className="recommendation-loading">
                <div className="recommendation-spinner">
                    ⏳
                </div>

                <h3>
                    Analysing Nagpur crime activity...
                </h3>

                <p>
                    Generating area-based safety recommendations.
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="recommendation-error">
                <div className="error-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load recommendations
                </h3>

                <p>
                    {error}
                </p>

                <button
                    onClick={fetchCrimeData}
                    className="retry-button"
                >
                    🔄 Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="safety-recommendations">

            {/* =====================================================
               HEADER
            ===================================================== */}

            <div className="recommendation-header">

                <div>
                    <span className="recommendation-label">
                        CRIMEVISTA INTELLIGENCE
                    </span>

                    <h2>
                        Safety Recommendations
                    </h2>

                    <p>
                        Area-based safety guidance generated from
                        historical crime activity in Nagpur.
                    </p>
                </div>

                <button
                    className="refresh-recommendations"
                    onClick={fetchCrimeData}
                >
                    🔄 Refresh
                </button>

            </div>


            {/* =====================================================
               SUMMARY
            ===================================================== */}

            <div className="recommendation-summary">

                <div className="recommendation-stat">

                    <div className="recommendation-stat-icon">
                        📊
                    </div>

                    <div>
                        <span>
                            Recorded Incidents
                        </span>

                        <strong>
                            {overallStats.total}
                        </strong>
                    </div>

                </div>


                <div className="recommendation-stat">

                    <div className="recommendation-stat-icon">
                        📍
                    </div>

                    <div>
                        <span>
                            Areas Analysed
                        </span>

                        <strong>
                            {overallStats.areas}
                        </strong>
                    </div>

                </div>


                <div className="recommendation-stat high-stat">

                    <div className="recommendation-stat-icon">
                        🔴
                    </div>

                    <div>
                        <span>
                            High Activity
                        </span>

                        <strong>
                            {overallStats.highRiskAreas}
                        </strong>
                    </div>

                </div>


                <div className="recommendation-stat medium-stat">

                    <div className="recommendation-stat-icon">
                        🟠
                    </div>

                    <div>
                        <span>
                            Elevated Activity
                        </span>

                        <strong>
                            {overallStats.mediumRiskAreas}
                        </strong>
                    </div>

                </div>

            </div>


            {/* =====================================================
               GENERAL SAFETY GUIDANCE
            ===================================================== */}

            <div className="general-safety-card">

                <div className="general-safety-icon">
                    🛡️
                </div>

                <div>

                    <h3>
                        General Safety Guidance
                    </h3>

                    <p>
                        Use CrimeVista's historical information to
                        understand activity patterns, while continuing
                        to follow normal personal safety practices.
                    </p>

                    <div className="safety-guidance-list">

                        <span>
                            ✓ Prefer well-lit public routes
                        </span>

                        <span>
                            ✓ Stay aware of your surroundings
                        </span>

                        <span>
                            ✓ Keep personal belongings secure
                        </span>

                        <span>
                            ✓ Avoid isolated locations when possible
                        </span>

                    </div>

                </div>

            </div>


            {/* =====================================================
               AREA RECOMMENDATIONS
            ===================================================== */}

            <div className="area-recommendations-section">

                <div className="section-title">

                    <div>
                        <h2>
                            Area-wise Recommendations
                        </h2>

                        <p>
                            Recommendations based on recorded
                            historical activity.
                        </p>
                    </div>

                </div>


                {areaAnalysis.length === 0 ? (

                    <div className="no-recommendations">

                        <div>
                            📊
                        </div>

                        <h3>
                            Not Enough Data
                        </h3>

                        <p>
                            There is currently no usable Nagpur crime
                            data available for generating area-based
                            recommendations.
                        </p>

                    </div>

                ) : (

                    <div className="recommendation-grid">

                        {areaAnalysis.map((area) => {

                            const recommendation =
                                getRecommendation(area);

                            return (
                                <div
                                    className={`recommendation-card ${area.risk.toLowerCase()}`}
                                    key={area.name}
                                >

                                    <div className="recommendation-card-top">

                                        <div className="recommendation-area-icon">
                                            📍
                                        </div>

                                        <div className="recommendation-area-info">

                                            <h3>
                                                {area.name}
                                            </h3>

                                            <span>
                                                Nagpur
                                            </span>

                                        </div>

                                        <span
                                            className={`risk-badge ${area.risk.toLowerCase()}`}
                                        >
                                            {area.risk}
                                        </span>

                                    </div>


                                    <div className="activity-count">

                                        <strong>
                                            {area.total}
                                        </strong>

                                        <span>
                                            recorded incidents
                                        </span>

                                    </div>


                                    <div className="dominant-crime">

                                        <span>
                                            Most recorded category
                                        </span>

                                        <strong>
                                            {area.dominantCrime}
                                        </strong>

                                    </div>


                                    <div className="recommendation-message">

                                        <div className="recommendation-message-icon">
                                            {recommendation.icon}
                                        </div>

                                        <div>

                                            <strong>
                                                {recommendation.title}
                                            </strong>

                                            <p>
                                                {recommendation.text}
                                            </p>

                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </div>


            {/* =====================================================
               DISCLAIMER
            ===================================================== */}

            <div className="recommendation-disclaimer">

                <div className="disclaimer-icon">
                    ℹ️
                </div>

                <div>

                    <strong>
                        How these recommendations work
                    </strong>

                    <p>
                        Recommendations are generated from historical
                        and aggregated crime records available to
                        CrimeVista. They are intended for public
                        awareness and safety decision support. They do
                        not predict individual people, guarantee future
                        incidents, or replace official emergency
                        services.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default SafetyRecommendations;