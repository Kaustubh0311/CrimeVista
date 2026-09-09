import { useEffect, useMemo, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./NagpurMap.css";

const nagpurCenter = [21.1458, 79.0882];

const defaultIcon = new L.Icon({
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function MapCenterUpdater({ selectedCrime }) {
    const map = useMap();

    useEffect(() => {
        if (selectedCrime?.latitude && selectedCrime?.longitude) {
            map.flyTo(
                [selectedCrime.latitude, selectedCrime.longitude],
                14,
                {
                    duration: 0.8
                }
            );
        }
    }, [selectedCrime, map]);

    return null;
}

function NagpurMap({ token }) {
    const [crimes, setCrimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [crimeType, setCrimeType] = useState("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [selectedCrime, setSelectedCrime] = useState(null);

    useEffect(() => {
        fetchCrimes();
    }, [token]);

    const fetchCrimes = async () => {
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

            const nagpurCrimes = records.filter((crime) => {
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

            setCrimes(nagpurCrimes);
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
                const crimeDate =
                    String(crime.crime_date).split("T")[0];

                if (startDate && crimeDate < startDate) {
                    dateMatch = false;
                }

                if (endDate && crimeDate > endDate) {
                    dateMatch = false;
                }
            }

            return typeMatch && dateMatch;
        });
    }, [crimes, crimeType, startDate, endDate]);

    const resetFilters = () => {
        setCrimeType("ALL");
        setStartDate("");
        setEndDate("");
        setSelectedCrime(null);
    };

    return (
        <div className="nagpur-map-page">

            <div className="map-toolbar">

                <div className="map-filter">

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

                <div className="map-filter">

                    <label>From Date</label>

                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) =>
                            setStartDate(e.target.value)
                        }
                    />

                </div>

                <div className="map-filter">

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
                    className="reset-map-btn"
                    onClick={resetFilters}
                >
                    ↻ Reset
                </button>

            </div>

            <div className="map-summary">

                <div>
                    <strong>
                        {filteredCrimes.length}
                    </strong>

                    <span>
                        Crimes displayed
                    </span>
                </div>

                <div>
                    <strong>
                        {crimes.length}
                    </strong>

                    <span>
                        Nagpur records
                    </span>
                </div>

                <div>
                    <strong>
                        {crimeTypes.length - 1}
                    </strong>

                    <span>
                        Crime categories
                    </span>
                </div>

            </div>

            {error && (
                <div className="map-error">
                    ⚠️ {error}
                </div>
            )}

            <div className="map-layout">

                <div className="map-container-wrapper">

                    {loading ? (
                        <div className="map-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading Nagpur crime map...</p>
                        </div>
                    ) : (
                        <MapContainer
                            center={nagpurCenter}
                            zoom={11}
                            scrollWheelZoom={true}
                            className="nagpur-map"
                        >

                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <MapCenterUpdater
                                selectedCrime={selectedCrime}
                            />

                            {filteredCrimes.map((crime, index) => {

                                const latitude =
                                    Number(crime.latitude);

                                const longitude =
                                    Number(crime.longitude);

                                return (
                                    <Marker
                                        key={
                                            crime.id ||
                                            `crime-${index}`
                                        }
                                        position={[
                                            latitude,
                                            longitude
                                        ]}
                                        icon={defaultIcon}
                                        eventHandlers={{
                                            click: () =>
                                                setSelectedCrime(
                                                    crime
                                                )
                                        }}
                                    >
                                        <Popup>

                                            <div className="crime-popup">

                                                <h3>
                                                    {crime.crime_type ||
                                                        "Crime Report"}
                                                </h3>

                                                <p>
                                                    <strong>
                                                        Location:
                                                    </strong>{" "}
                                                    {crime.location ||
                                                        "Not available"}
                                                </p>

                                                <p>
                                                    <strong>
                                                        Date:
                                                    </strong>{" "}
                                                    {crime.crime_date
                                                        ? String(
                                                              crime.crime_date
                                                          ).split("T")[0]
                                                        : "Not available"}
                                                </p>

                                                {crime.description && (
                                                    <p>
                                                        <strong>
                                                            Details:
                                                        </strong>{" "}
                                                        {
                                                            crime.description
                                                        }
                                                    </p>
                                                )}

                                            </div>

                                        </Popup>
                                    </Marker>
                                );
                            })}

                        </MapContainer>
                    )}

                </div>

                <div className="crime-details-panel">

                    <div className="details-header">
                        <h3>Crime Details</h3>
                    </div>

                    {!selectedCrime ? (
                        <div className="no-selection">

                            <div>
                                📍
                            </div>

                            <h4>
                                Select a marker
                            </h4>

                            <p>
                                Click any crime marker on the map to
                                view its available information.
                            </p>

                        </div>
                    ) : (
                        <div className="selected-crime">

                            <div className="crime-type-badge">
                                {selectedCrime.crime_type ||
                                    "Crime"}
                            </div>

                            <h2>
                                {selectedCrime.location ||
                                    "Nagpur"}
                            </h2>

                            <div className="detail-item">

                                <span>
                                    📅 Date
                                </span>

                                <strong>
                                    {selectedCrime.crime_date
                                        ? String(
                                              selectedCrime.crime_date
                                          ).split("T")[0]
                                        : "Not available"}
                                </strong>

                            </div>

                            <div className="detail-item">

                                <span>
                                    📍 Latitude
                                </span>

                                <strong>
                                    {selectedCrime.latitude ||
                                        "—"}
                                </strong>

                            </div>

                            <div className="detail-item">

                                <span>
                                    📍 Longitude
                                </span>

                                <strong>
                                    {selectedCrime.longitude ||
                                        "—"}
                                </strong>

                            </div>

                            {selectedCrime.description && (
                                <div className="description-box">

                                    <span>
                                        Description
                                    </span>

                                    <p>
                                        {
                                            selectedCrime.description
                                        }
                                    </p>

                                </div>
                            )}

                            <button
                                className="close-details"
                                onClick={() =>
                                    setSelectedCrime(null)
                                }
                            >
                                Clear Selection
                            </button>

                        </div>
                    )}

                </div>

            </div>

            <div className="map-disclaimer">

                <strong>
                    ℹ️ Map information
                </strong>

                <p>
                    This map displays available historical crime
                    records within the Nagpur geographic area. The
                    information is intended for public awareness and
                    analysis and should not be interpreted as a
                    prediction of individual criminal activity.
                </p>

            </div>

        </div>
    );
}

export default NagpurMap;