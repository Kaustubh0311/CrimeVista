import { useEffect, useState } from "react";
import "./CrimeAlerts.css";

function CrimeAlerts({ token }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://127.0.0.1:8000/crimes"
            );

            if (!response.ok) {
                throw new Error("Unable to load crime data");
            }

            const result = await response.json();

            const crimeData = Array.isArray(result)
                ? result
                : result.crimes || result.data || [];

            // Nagpur geographic boundary
            const nagpurCrimes = crimeData.filter((crime) => {
                const lat = Number(crime.latitude);
                const lng = Number(crime.longitude);

                return (
                    !isNaN(lat) &&
                    !isNaN(lng) &&
                    lat >= 20.95 &&
                    lat <= 21.35 &&
                    lng >= 78.85 &&
                    lng <= 79.35
                );
            });

            // Count crimes area-wise
            const areaCounts = {};

            nagpurCrimes.forEach((crime) => {
                const area =
                    crime.location ||
                    crime.area ||
                    "Unknown Area";

                if (!areaCounts[area]) {
                    areaCounts[area] = 0;
                }

                areaCounts[area]++;
            });

            const generatedAlerts = Object.entries(areaCounts)
                .map(([area, count]) => {
                    let level = "LOW";
                    let icon = "🟢";
                    let message =
                        "Crime activity is currently relatively low.";

                    if (count >= 8) {
                        level = "HIGH";
                        icon = "🔴";
                        message =
                            "High crime activity has been recorded in this area. Stay alert and prefer safer public routes.";
                    } else if (count >= 4) {
                        level = "MEDIUM";
                        icon = "🟠";
                        message =
                            "Crime activity is elevated in this area. Maintain awareness while travelling.";
                    }

                    return {
                        id: area,
                        area,
                        count,
                        level,
                        icon,
                        message,
                    };
                })
                .filter((alert) => alert.level !== "LOW")
                .sort((a, b) => b.count - a.count);

            setAlerts(generatedAlerts);
        } catch (err) {
            console.error(err);
            setError("Unable to load crime alerts.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="crime-alerts">

            <div className="alerts-header">
                <div>
                    <h2>Crime Alerts</h2>
                    <p>
                        Area-wise safety alerts based on recorded
                        Nagpur crime activity.
                    </p>
                </div>

                <button
                    className="refresh-alerts"
                    onClick={fetchAlerts}
                >
                    🔄 Refresh
                </button>
            </div>

            {loading && (
                <div className="alerts-state">
                    Loading crime alerts...
                </div>
            )}

            {error && (
                <div className="alerts-error">
                    {error}
                </div>
            )}

            {!loading && !error && alerts.length === 0 && (
                <div className="no-alerts">
                    <div className="no-alert-icon">🛡️</div>

                    <h3>No Active Alerts</h3>

                    <p>
                        No medium or high activity areas were
                        detected in the available Nagpur records.
                    </p>
                </div>
            )}

            <div className="alerts-list">
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={`alert-card ${alert.level.toLowerCase()}`}
                    >
                        <div className="alert-icon">
                            {alert.icon}
                        </div>

                        <div className="alert-content">

                            <div className="alert-top">
                                <h3>
                                    {alert.level === "HIGH"
                                        ? "High Crime Activity"
                                        : "Elevated Crime Activity"}
                                </h3>

                                <span className="alert-level">
                                    {alert.level}
                                </span>
                            </div>

                            <h4>
                                📍 {alert.area}
                            </h4>

                            <p>
                                {alert.message}
                            </p>

                            <div className="alert-stats">
                                <span>
                                    📊 {alert.count} recorded incidents
                                </span>

                                <span>
                                    🏙️ Nagpur
                                </span>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

            <div className="alerts-disclaimer">
                <strong>⚠️ Important:</strong>

                <span>
                    These alerts are generated from historical
                    recorded crime data. They indicate areas with
                    relatively higher recorded activity and do not
                    guarantee that an incident will occur.
                </span>
            </div>

        </div>
    );
}

export default CrimeAlerts;