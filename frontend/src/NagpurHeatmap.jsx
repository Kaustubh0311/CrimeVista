import { useEffect, useMemo, useState } from "react";
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./NagpurHeatmap.css";

const nagpurCenter = [21.1458, 79.0882];

function NagpurHeatmap({ token }) {
    const [crimes, setCrimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [crimeType, setCrimeType] = useState("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        loadCrimes();
    }, [token]);

    const loadCrimes = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://127.0.0.1:8000/crimes",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Unable to load crime data");
            }

            const data = await response.json();

            const records = Array.isArray(data)
                ? data
                : data.crimes || data.data || [];

            const nagpurRecords = records.filter((crime) => {
                const lat = Number(crime.latitude);
                const lng = Number(crime.longitude);

                return (
                    Number.isFinite(lat) &&
                    Number.isFinite(lng) &&
                    lat >= 20.95 &&
                    lat <= 21.35 &&
                    lng >= 78.85 &&
                    lng <= 79.35
                );
            });

            setCrimes(nagpurRecords);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const crimeTypes = useMemo(() => {
        const types = crimes
            .map((crime) => crime.crime_type)
            .filter(Boolean);

        return ["ALL", ...new Set(types)];
    }, [crimes]);

    const filteredCrimes = useMemo(() => {
        return crimes.filter((crime) => {
            const typeMatch =
                crimeType === "ALL" ||
                crime.crime_type === crimeType;

            let dateMatch = true;

            if (crime.crime_date) {
                const date =
                    String(crime.crime_date).split("T")[0];

                if (startDate && date < startDate) {
                    dateMatch = false;
                }

                if (endDate && date > endDate) {
                    dateMatch = false;
                }
            }

            return typeMatch && dateMatch;
        });
    }, [crimes, crimeType, startDate, endDate]);

    /*
     * Create geographic hotspot groups.
     *
     * Nearby coordinates are rounded so that several
     * records in the same area become one hotspot.
     */
    const hotspots = useMemo(() => {
        const groups = {};

        filteredCrimes.forEach((crime) => {
            const lat = Number(crime.latitude);
            const lng = Number(crime.longitude);

            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                return;
            }

            const key =
                `${lat.toFixed(3)}_${lng.toFixed(3)}`;

            if (!groups[key]) {
                groups[key] = {
                    latitude: lat,
                    longitude: lng,
                    count: 0,
                    crimes: [],
                    location:
                        crime.location || "Nagpur"
                };
            }

            groups[key].count += 1;
            groups[key].crimes.push(crime);
        });

        return Object.values(groups)
            .sort((a, b) => b.count - a.count);
    }, [filteredCrimes]);

    const maxCount =
        hotspots.length > 0
            ? hotspots[0].count
            : 1;

    const totalHotspots = hotspots.length;

    const highRiskCount = hotspots.filter(
        (spot) =>
            spot.count >= Math.max(3, maxCount * 0.7)
    ).length;

    const mediumRiskCount = hotspots.filter(
        (spot) =>
            spot.count >= Math.max(2, maxCount * 0.35) &&
            spot.count < Math.max(3, maxCount * 0.7)
    ).length;

    const resetFilters = () => {
        setCrimeType("ALL");
        setStartDate("");
        setEndDate("");
    };

    const getIntensity = (count) => {
        const ratio = count / maxCount;

        if (ratio >= 0.7) {
            return {
                label: "HIGH",
                className: "high"
            };
        }

        if (ratio >= 0.35) {
            return {
                label: "MEDIUM",
                className: "medium"
            };
        }

        return {
            label: "LOW",
            className: "low"
        };
    };

    return (
        <div className="hotspot-page">

            {/* FILTERS */}

            <div className="hotspot-filter-bar">

                <div className="hotspot-filter">

                    <label>Crime Type</label>

                    <select
                        value={crimeType}
                        onChange={(e) =>
                            setCrimeType(e.target.value)
                        }
                    >
                        {crimeTypes.map((type) => (
                            <option
                                key={type}
                                value={type}
                            >
                                {type === "ALL"
                                    ? "All Crime Types"
                                    : type}
                            </option>
                        ))}
                    </select>

                </div>

                <div className="hotspot-filter">

                    <label>From Date</label>

                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) =>
                            setStartDate(e.target.value)
                        }
                    />

                </div>

                <div className="hotspot-filter">

                    <label>To Date</label>

                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) =>
                            setEndDate(e.target.value)
                        }
                    />

                </div>

                <button
                    className="hotspot-reset"
                    onClick={resetFilters}
                >
                    ↻ Reset
                </button>

            </div>

            {/* SUMMARY */}

            <div className="hotspot-stat-grid">

                <div className="hotspot-stat-card">

                    <div className="hotspot-stat-icon">
                        🔥
                    </div>

                    <div>
                        <span>Total Hotspots</span>
                        <strong>
                            {totalHotspots}
                        </strong>
                    </div>

                </div>

                <div className="hotspot-stat-card">

                    <div className="hotspot-stat-icon">
                        🚨
                    </div>

                    <div>
                        <span>High Intensity</span>
                        <strong>
                            {highRiskCount}
                        </strong>
                    </div>

                </div>

                <div className="hotspot-stat-card">

                    <div className="hotspot-stat-icon">
                        ⚠️
                    </div>

                    <div>
                        <span>Medium Intensity</span>
                        <strong>
                            {mediumRiskCount}
                        </strong>
                    </div>

                </div>

                <div className="hotspot-stat-card">

                    <div className="hotspot-stat-icon">
                        📊
                    </div>

                    <div>
                        <span>Records Analyzed</span>
                        <strong>
                            {filteredCrimes.length}
                        </strong>
                    </div>

                </div>

            </div>

            {error && (
                <div className="hotspot-error">
                    ⚠️ {error}
                </div>
            )}

            {/* MAIN AREA */}

            <div className="hotspot-main">

                {/* MAP */}

                <div className="hotspot-map-card">

                    <div className="hotspot-card-header">

                        <div>
                            <h2>
                                Nagpur Crime Density
                            </h2>

                            <p>
                                Geographic concentration of
                                reported crime records
                            </p>
                        </div>

                        <div className="map-legend">

                            <div>
                                <span className="legend-dot high-dot"></span>
                                High
                            </div>

                            <div>
                                <span className="legend-dot medium-dot"></span>
                                Medium
                            </div>

                            <div>
                                <span className="legend-dot low-dot"></span>
                                Low
                            </div>

                        </div>

                    </div>

                    <div className="hotspot-map-container">

                        {loading ? (

                            <div className="hotspot-loading">

                                <div className="loading-spinner"></div>

                                <p>
                                    Analyzing Nagpur crime
                                    density...
                                </p>

                            </div>

                        ) : (

                            <MapContainer
                                center={nagpurCenter}
                                zoom={11}
                                scrollWheelZoom={true}
                                className="hotspot-map"
                            >

                                <TileLayer
                                    attribution='&copy; OpenStreetMap contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                {hotspots.map(
                                    (spot, index) => {

                                        const intensity =
                                            getIntensity(
                                                spot.count
                                            );

                                        let radius = 7;

                                        if (
                                            intensity.label ===
                                            "HIGH"
                                        ) {
                                            radius = 15;
                                        } else if (
                                            intensity.label ===
                                            "MEDIUM"
                                        ) {
                                            radius = 11;
                                        }

                                        return (
                                            <CircleMarker
                                                key={
                                                    `${spot.latitude}-${spot.longitude}-${index}`
                                                }
                                                center={[
                                                    spot.latitude,
                                                    spot.longitude
                                                ]}
                                                radius={radius}
                                                pathOptions={{
                                                    fillOpacity: 0.65,
                                                    weight: 2
                                                }}
                                            >

                                                <Popup>

                                                    <div className="hotspot-popup">

                                                        <h3>
                                                            🔥 Hotspot
                                                        </h3>

                                                        <p>
                                                            <strong>
                                                                Area:
                                                            </strong>{" "}
                                                            {
                                                                spot.location
                                                            }
                                                        </p>

                                                        <p>
                                                            <strong>
                                                                Reports:
                                                            </strong>{" "}
                                                            {
                                                                spot.count
                                                            }
                                                        </p>

                                                        <p>
                                                            <strong>
                                                                Intensity:
                                                            </strong>{" "}
                                                            {
                                                                intensity.label
                                                            }
                                                        </p>

                                                    </div>

                                                </Popup>

                                            </CircleMarker>
                                        );
                                    }
                                )}

                            </MapContainer>

                        )}

                    </div>

                </div>

                {/* RANKING */}

                <div className="hotspot-ranking-card">

                    <div className="hotspot-card-header">

                        <div>
                            <h2>
                                Top Hotspots
                            </h2>

                            <p>
                                Areas ranked by reported activity
                            </p>
                        </div>

                    </div>

                    <div className="ranking-list">

                        {hotspots.length === 0 ? (

                            <div className="empty-hotspots">

                                <div>📍</div>

                                <h3>
                                    No hotspot data
                                </h3>

                                <p>
                                    No records match the
                                    selected filters.
                                </p>

                            </div>

                        ) : (

                            hotspots
                                .slice(0, 10)
                                .map((spot, index) => {

                                    const intensity =
                                        getIntensity(
                                            spot.count
                                        );

                                    const percentage =
                                        Math.max(
                                            8,
                                            (spot.count /
                                                maxCount) *
                                                100
                                        );

                                    return (
                                        <div
                                            className="ranking-item"
                                            key={
                                                `${spot.latitude}-${spot.longitude}-${index}`
                                            }
                                        >

                                            <div className="rank-number">
                                                {index + 1}
                                            </div>

                                            <div className="rank-content">

                                                <div className="rank-top">

                                                    <strong>
                                                        {
                                                            spot.location
                                                        }
                                                    </strong>

                                                    <span
                                                        className={`intensity-badge ${intensity.className}`}
                                                    >
                                                        {
                                                            intensity.label
                                                        }
                                                    </span>

                                                </div>

                                                <div className="rank-bar">

                                                    <div
                                                        className="rank-bar-fill"
                                                        style={{
                                                            width: `${percentage}%`
                                                        }}
                                                    ></div>

                                                </div>

                                                <div className="rank-bottom">

                                                    <span>
                                                        {
                                                            spot.count
                                                        }{" "}
                                                        reports
                                                    </span>

                                                    <span>
                                                        {
                                                            spot.latitude.toFixed(
                                                                3
                                                            )
                                                        }
                                                        ,{" "}
                                                        {
                                                            spot.longitude.toFixed(
                                                                3
                                                            )
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        </div>
                                    );
                                })

                        )}

                    </div>

                </div>

            </div>

            {/* EXPLANATION */}

            <div className="hotspot-explanation">

                <div className="explanation-icon">
                    💡
                </div>

                <div>

                    <strong>
                        How hotspot intensity works
                    </strong>

                    <p>
                        CrimeVista groups nearby reported crime
                        coordinates and compares their historical
                        activity. Areas with relatively higher
                        concentrations are shown with greater
                        visual intensity. This represents historical
                        reporting density and should not be treated
                        as a prediction that a crime will occur at
                        a specific location.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default NagpurHeatmap;