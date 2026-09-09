import { useEffect, useMemo, useState } from "react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from "recharts";

import "./AreaExplorer.css";


function AreaExplorer({ token }) {

    const [crimes, setCrimes] = useState([]);

    const [selectedArea, setSelectedArea] = useState("");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* =====================================================
       FETCH CRIME DATA
    ===================================================== */

    useEffect(() => {

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

                    throw new Error(
                        "Failed to fetch crime data"
                    );

                }


                const data = await response.json();


                const records = Array.isArray(data)
                    ? data
                    : data.crimes || data.data || [];


                /* ONLY NAGPUR */

                const nagpurRecords = records.filter(
                    (crime) => {

                        const latitude =
                            Number(crime.latitude);

                        const longitude =
                            Number(crime.longitude);


                        return (

                            Number.isFinite(latitude) &&

                            Number.isFinite(longitude) &&

                            latitude >= 20.95 &&

                            latitude <= 21.35 &&

                            longitude >= 78.85 &&

                            longitude <= 79.35

                        );

                    }
                );


                setCrimes(nagpurRecords);


                const availableAreas = [
                    ...new Set(

                        nagpurRecords
                            .map(
                                (crime) =>
                                    crime.location
                            )
                            .filter(Boolean)

                    )
                ].sort();


                if (availableAreas.length > 0) {

                    setSelectedArea(
                        availableAreas[0]
                    );

                }

            } catch (err) {

                console.error(
                    "Area Explorer Error:",
                    err
                );

                setError(
                    "Unable to load area data."
                );

            } finally {

                setLoading(false);

            }

        };


        fetchCrimes();

    }, [token]);


    /* =====================================================
       AVAILABLE AREAS
    ===================================================== */

    const areas = useMemo(() => {

        return [

            ...new Set(

                crimes
                    .map(
                        (crime) =>
                            crime.location
                    )
                    .filter(Boolean)

            )

        ].sort();

    }, [crimes]);


    /* =====================================================
       SELECTED AREA RECORDS
    ===================================================== */

    const areaCrimes = useMemo(() => {

        if (!selectedArea) {

            return [];

        }


        return crimes.filter(

            (crime) =>
                crime.location === selectedArea

        );

    }, [crimes, selectedArea]);


    /* =====================================================
       CRIME TYPE DATA
    ===================================================== */

    const crimeTypeData = useMemo(() => {

        const counts = {};


        areaCrimes.forEach((crime) => {

            const type =
                crime.crime_type || "Unknown";


            counts[type] =
                (counts[type] || 0) + 1;

        });


        return Object.entries(counts)

            .map(
                ([name, value]) => ({
                    name,
                    value
                })
            )

            .sort(
                (a, b) =>
                    b.value - a.value
            );

    }, [areaCrimes]);


    /* =====================================================
       DAILY TREND
    ===================================================== */

    const dailyTrend = useMemo(() => {

        const counts = {};


        areaCrimes.forEach((crime) => {

            if (!crime.crime_date) {

                return;

            }


            const date =
                String(
                    crime.crime_date
                ).slice(0, 10);


            counts[date] =
                (counts[date] || 0) + 1;

        });


        return Object.entries(counts)

            .sort(
                ([a], [b]) =>
                    a.localeCompare(b)
            )

            .map(
                ([date, count]) => ({
                    date,
                    count
                })
            );

    }, [areaCrimes]);


    /* =====================================================
       AREA COORDINATES
    ===================================================== */

    const coordinates = useMemo(() => {

        const validRecords =
            areaCrimes.filter(

                (crime) =>

                    Number.isFinite(
                        Number(
                            crime.latitude
                        )
                    ) &&

                    Number.isFinite(
                        Number(
                            crime.longitude
                        )
                    )

            );


        if (
            validRecords.length === 0
        ) {

            return null;

        }


        const latitude =

            validRecords.reduce(

                (sum, crime) =>

                    sum +
                    Number(
                        crime.latitude
                    ),

                0

            ) / validRecords.length;


        const longitude =

            validRecords.reduce(

                (sum, crime) =>

                    sum +
                    Number(
                        crime.longitude
                    ),

                0

            ) / validRecords.length;


        return {

            latitude,

            longitude

        };

    }, [areaCrimes]);


    /* =====================================================
       BASIC STATISTICS
    ===================================================== */

    const mostCommonCrime =

        crimeTypeData.length > 0

            ? crimeTypeData[0].name

            : "No data";


    const activeDays =

        new Set(

            areaCrimes

                .filter(
                    (crime) =>
                        crime.crime_date
                )

                .map(
                    (crime) =>
                        String(
                            crime.crime_date
                        ).slice(0, 10)
                )

        ).size;


    const averagePerDay =

        activeDays > 0

            ? areaCrimes.length /
              activeDays

            : 0;


    const nagpurActiveDays =

        new Set(

            crimes

                .filter(
                    (crime) =>
                        crime.crime_date
                )

                .map(
                    (crime) =>
                        String(
                            crime.crime_date
                        ).slice(0, 10)
                )

        ).size;


    const nagpurAverage =

        nagpurActiveDays > 0

            ? crimes.length /
              nagpurActiveDays

            : 0;


    /* =====================================================
       HISTORICAL ACTIVITY LEVEL
    ===================================================== */

    let activityLevel = "LOW";


    if (
        nagpurAverage > 0 &&
        averagePerDay >
            nagpurAverage * 1.5
    ) {

        activityLevel = "HIGH";

    } else if (
        nagpurAverage > 0 &&
        averagePerDay >
            nagpurAverage
    ) {

        activityLevel = "MEDIUM";

    }


    const activityClass =
        activityLevel.toLowerCase();


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="area-loading">

                Loading Nagpur area data...

            </div>

        );

    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (

            <div className="area-error">

                {error}

            </div>

        );

    }


    /* =====================================================
       NO DATA
    ===================================================== */

    if (areas.length === 0) {

        return (

            <div className="area-empty">

                No Nagpur area data is currently available.

            </div>

        );

    }


    /* =====================================================
       MAIN UI
    ===================================================== */

    return (

        <div className="area-explorer">


            {/* =================================================
               AREA SELECTOR
            ================================================= */}

            <div className="area-selector-card">


                <div>

                    <h2>
                        Explore a Nagpur Area
                    </h2>

                    <p>
                        Select an area to analyze
                        its historical crime activity.
                    </p>

                </div>


                <select
                    value={selectedArea}
                    onChange={(event) =>
                        setSelectedArea(
                            event.target.value
                        )
                    }
                >

                    {areas.map((area) => (

                        <option
                            key={area}
                            value={area}
                        >
                            {area}
                        </option>

                    ))}

                </select>

            </div>


            {/* =================================================
               STATISTICS
            ================================================= */}

            <div className="area-stat-grid">


                <div className="area-stat-card">

                    <span>
                        Total Crimes
                    </span>

                    <strong>
                        {areaCrimes.length}
                    </strong>

                    <small>
                        Recorded incidents
                    </small>

                </div>


                <div className="area-stat-card">

                    <span>
                        Active Days
                    </span>

                    <strong>
                        {activeDays}
                    </strong>

                    <small>
                        Days with records
                    </small>

                </div>


                <div className="area-stat-card">

                    <span>
                        Common Crime
                    </span>

                    <strong className="crime-name">
                        {mostCommonCrime}
                    </strong>

                    <small>
                        Most frequently recorded
                    </small>

                </div>


                <div className="area-stat-card">

                    <span>
                        Historical Activity
                    </span>

                    <strong
                        className={`activity-badge ${activityClass}`}
                    >
                        {activityLevel}
                    </strong>

                    <small>
                        Relative to available Nagpur data
                    </small>

                </div>

            </div>


            {/* =================================================
               LOCATION INFORMATION
            ================================================= */}

            <div className="area-location-card">


                <div>

                    <h3>
                        {selectedArea}
                    </h3>

                    <p>
                        Selected Nagpur area
                    </p>

                </div>


                {coordinates ? (

                    <div className="coordinates">


                        <div>

                            <span>
                                Latitude
                            </span>

                            <strong>
                                {
                                    coordinates.latitude.toFixed(
                                        5
                                    )
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Longitude
                            </span>

                            <strong>
                                {
                                    coordinates.longitude.toFixed(
                                        5
                                    )
                                }
                            </strong>

                        </div>


                    </div>

                ) : (

                    <p>
                        No coordinate information available.
                    </p>

                )}

            </div>


            {/* =================================================
               CHARTS
            ================================================= */}

            <div className="area-chart-grid">


                {/* CRIME DISTRIBUTION */}

                <div className="area-chart-card">


                    <div className="chart-header">

                        <h3>
                            Crime Distribution
                        </h3>

                        <p>
                            Crime types recorded in{" "}
                            {selectedArea}
                        </p>

                    </div>


                    {crimeTypeData.length > 0 ? (

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >

                            <PieChart>

                                <Pie
                                    data={crimeTypeData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={105}
                                    label
                                >

                                    {crimeTypeData.map(
                                        (_, index) => (

                                            <Cell
                                                key={`cell-${index}`}
                                            />

                                        )
                                    )}

                                </Pie>


                                <Tooltip />

                            </PieChart>

                        </ResponsiveContainer>

                    ) : (

                        <div className="no-chart-data">

                            No crime type data available.

                        </div>

                    )}

                </div>


                {/* DAILY TREND */}

                <div className="area-chart-card">


                    <div className="chart-header">

                        <h3>
                            Daily Crime Activity
                        </h3>

                        <p>
                            Historical activity for{" "}
                            {selectedArea}
                        </p>

                    </div>


                    {dailyTrend.length > 0 ? (

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >

                            <LineChart
                                data={dailyTrend}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />


                                <XAxis
                                    dataKey="date"
                                    angle={-35}
                                    textAnchor="end"
                                    height={70}
                                />


                                <YAxis
                                    allowDecimals={false}
                                />


                                <Tooltip />


                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    ) : (

                        <div className="no-chart-data">

                            No daily trend data available.

                        </div>

                    )}

                </div>

            </div>


            {/* =================================================
               BAR CHART
            ================================================= */}

            <div className="area-chart-card full-width">


                <div className="chart-header">

                    <h3>
                        Crime Type Comparison
                    </h3>

                    <p>
                        Number of incidents by crime type
                    </p>

                </div>


                {crimeTypeData.length > 0 ? (

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <BarChart
                            data={crimeTypeData}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />


                            <XAxis
                                dataKey="name"
                                angle={-30}
                                textAnchor="end"
                                height={80}
                            />


                            <YAxis
                                allowDecimals={false}
                            />


                            <Tooltip />


                            <Bar
                                dataKey="value"
                                radius={[
                                    6,
                                    6,
                                    0,
                                    0
                                ]}
                            />

                        </BarChart>

                    </ResponsiveContainer>

                ) : (

                    <div className="no-chart-data">

                        No comparison data available.

                    </div>

                )}

            </div>


            {/* =================================================
               AREA INSIGHT
            ================================================= */}

            <div className="area-insight">


                <div className="insight-icon">
                    📍
                </div>


                <div>

                    <h3>
                        Area Insight
                    </h3>


                    <p>

                        <strong>
                            {selectedArea}
                        </strong>{" "}

                        has{" "}

                        <strong>
                            {areaCrimes.length}
                        </strong>{" "}

                        recorded crime incidents across{" "}

                        <strong>
                            {activeDays}
                        </strong>{" "}

                        active days in the available
                        historical dataset.

                    </p>


                    <p>

                        The most frequently recorded
                        crime type is{" "}

                        <strong>
                            {mostCommonCrime}
                        </strong>.

                    </p>


                    <small>

                        This analysis describes historical
                        records only. It does not predict
                        individual behavior or guarantee
                        future incidents.

                    </small>

                </div>

            </div>


        </div>

    );
}


export default AreaExplorer;