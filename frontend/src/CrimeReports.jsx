import { useEffect, useMemo, useState } from "react";

import "./CrimeReports.css";


function CrimeReports({ token }) {

    const [crimes, setCrimes] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [crimeType, setCrimeType] = useState("all");

    const [startDate, setStartDate] = useState("");

    const [endDate, setEndDate] = useState("");


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

            } catch (err) {

                console.error(
                    "Crime Reports Error:",
                    err
                );

                setError(
                    "Unable to load crime reports."
                );

            } finally {

                setLoading(false);

            }

        };


        fetchCrimes();

    }, [token]);


    /* =====================================================
       CRIME TYPES
    ===================================================== */

    const crimeTypes = useMemo(() => {

        return [

            ...new Set(

                crimes

                    .map(
                        (crime) =>
                            crime.crime_type
                    )

                    .filter(Boolean)

            )

        ].sort();

    }, [crimes]);


    /* =====================================================
       FILTERED DATA
    ===================================================== */

    const filteredCrimes = useMemo(() => {

        return crimes.filter((crime) => {

            const typeMatch =
                crimeType === "all" ||
                crime.crime_type === crimeType;


            const date = crime.crime_date
                ? String(
                    crime.crime_date
                ).slice(0, 10)
                : "";


            const startMatch =
                !startDate ||
                (date && date >= startDate);


            const endMatch =
                !endDate ||
                (date && date <= endDate);


            return (
                typeMatch &&
                startMatch &&
                endMatch
            );

        });

    }, [
        crimes,
        crimeType,
        startDate,
        endDate
    ]);


    /* =====================================================
       SUMMARY STATISTICS
    ===================================================== */

    const totalCrimes =
        filteredCrimes.length;


    const areasCovered =
        new Set(

            filteredCrimes

                .map(
                    (crime) =>
                        crime.location
                )

                .filter(Boolean)

        ).size;


    const activeDays =
        new Set(

            filteredCrimes

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


    /* =====================================================
       CRIME TYPE SUMMARY
    ===================================================== */

    const crimeTypeSummary = useMemo(() => {

        const counts = {};


        filteredCrimes.forEach((crime) => {

            const type =
                crime.crime_type || "Unknown";


            counts[type] =
                (counts[type] || 0) + 1;

        });


        return Object.entries(counts)

            .map(
                ([name, count]) => ({
                    name,
                    count
                })
            )

            .sort(
                (a, b) =>
                    b.count - a.count
            );

    }, [filteredCrimes]);


    /* =====================================================
       AREA SUMMARY
    ===================================================== */

    const areaSummary = useMemo(() => {

        const counts = {};


        filteredCrimes.forEach((crime) => {

            const area =
                crime.location || "Unknown";


            counts[area] =
                (counts[area] || 0) + 1;

        });


        return Object.entries(counts)

            .map(
                ([name, count]) => ({
                    name,
                    count
                })
            )

            .sort(
                (a, b) =>
                    b.count - a.count
            );

    }, [filteredCrimes]);


    /* =====================================================
       MOST COMMON CRIME
    ===================================================== */

    const mostCommonCrime =

        crimeTypeSummary.length > 0

            ? crimeTypeSummary[0].name

            : "No data";


    /* =====================================================
       HIGHEST ACTIVITY AREA
    ===================================================== */

    const highestActivityArea =

        areaSummary.length > 0

            ? areaSummary[0].name

            : "No data";


    /* =====================================================
       RESET
    ===================================================== */

    const resetFilters = () => {

        setCrimeType("all");

        setStartDate("");

        setEndDate("");

    };


    /* =====================================================
       PRINT REPORT
    ===================================================== */

    const printReport = () => {

        window.print();

    };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="reports-loading">

                Loading crime report...

            </div>

        );

    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (

            <div className="reports-error">

                {error}

            </div>

        );

    }


    /* =====================================================
       MAIN UI
    ===================================================== */

    return (

        <div className="crime-reports">


            {/* =================================================
               FILTERS
            ================================================= */}

            <div className="reports-filter-card">


                <div className="report-filter-title">

                    <h2>
                        Report Filters
                    </h2>

                    <p>
                        Select the information you want
                        to include in the report.
                    </p>

                </div>


                <div className="report-filters">


                    <div className="report-filter">

                        <label>
                            Crime Type
                        </label>

                        <select
                            value={crimeType}
                            onChange={(event) =>
                                setCrimeType(
                                    event.target.value
                                )
                            }
                        >

                            <option value="all">
                                All Crime Types
                            </option>


                            {crimeTypes.map(
                                (type) => (

                                    <option
                                        key={type}
                                        value={type}
                                    >
                                        {type}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    <div className="report-filter">

                        <label>
                            From Date
                        </label>

                        <input
                            type="date"
                            value={startDate}
                            onChange={(event) =>
                                setStartDate(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    <div className="report-filter">

                        <label>
                            To Date
                        </label>

                        <input
                            type="date"
                            value={endDate}
                            onChange={(event) =>
                                setEndDate(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    <button
                        className="report-reset"
                        onClick={resetFilters}
                    >
                        Reset
                    </button>

                </div>

            </div>


            {/* =================================================
               REPORT HEADER
            ================================================= */}

            <div
                className="report-document"
                id="crime-report-document"
            >


                <div className="report-header">


                    <div>

                        <div className="report-logo">
                            CV
                        </div>

                    </div>


                    <div className="report-title">

                        <h1>
                            CrimeVista
                        </h1>

                        <h2>
                            Nagpur Crime Activity Report
                        </h2>

                        <p>
                            Public Safety & Historical Crime Analysis
                        </p>

                    </div>


                    <div className="report-location">
                        📍 Nagpur
                    </div>

                </div>


                {/* REPORT META */}

                <div className="report-meta">

                    <div>

                        <span>
                            Report Scope
                        </span>

                        <strong>
                            Nagpur
                        </strong>

                    </div>


                    <div>

                        <span>
                            Crime Type
                        </span>

                        <strong>
                            {crimeType === "all"
                                ? "All"
                                : crimeType}
                        </strong>

                    </div>


                    <div>

                        <span>
                            From
                        </span>

                        <strong>
                            {startDate || "All Dates"}
                        </strong>

                    </div>


                    <div>

                        <span>
                            To
                        </span>

                        <strong>
                            {endDate || "All Dates"}
                        </strong>

                    </div>

                </div>


                {/* =================================================
                   SUMMARY
                ================================================= */}

                <div className="report-section">

                    <div className="report-section-title">

                        <h2>
                            Executive Summary
                        </h2>

                        <p>
                            Overview of the filtered
                            historical crime records.
                        </p>

                    </div>


                    <div className="report-summary-grid">


                        <div className="report-summary-card">

                            <span>
                                Total Incidents
                            </span>

                            <strong>
                                {totalCrimes}
                            </strong>

                        </div>


                        <div className="report-summary-card">

                            <span>
                                Areas Covered
                            </span>

                            <strong>
                                {areasCovered}
                            </strong>

                        </div>


                        <div className="report-summary-card">

                            <span>
                                Active Days
                            </span>

                            <strong>
                                {activeDays}
                            </strong>

                        </div>


                        <div className="report-summary-card">

                            <span>
                                Crime Types
                            </span>

                            <strong>
                                {crimeTypeSummary.length}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                   KEY FINDINGS
                ================================================= */}

                <div className="report-section">


                    <div className="report-section-title">

                        <h2>
                            Key Findings
                        </h2>

                    </div>


                    <div className="findings-grid">


                        <div className="finding-card">

                            <span>
                                Most Common Crime
                            </span>

                            <strong>
                                {mostCommonCrime}
                            </strong>

                        </div>


                        <div className="finding-card">

                            <span>
                                Highest Activity Area
                            </span>

                            <strong>
                                {highestActivityArea}
                            </strong>

                        </div>


                        <div className="finding-card">

                            <span>
                                Records Analyzed
                            </span>

                            <strong>
                                {filteredCrimes.length}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                   CRIME TYPE TABLE
                ================================================= */}

                <div className="report-section">


                    <div className="report-section-title">

                        <h2>
                            Crime Type Summary
                        </h2>

                    </div>


                    {crimeTypeSummary.length > 0 ? (

                        <div className="report-table-wrapper">

                            <table className="report-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Rank
                                        </th>

                                        <th>
                                            Crime Type
                                        </th>

                                        <th>
                                            Incidents
                                        </th>

                                        <th>
                                            Percentage
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {crimeTypeSummary.map(
                                        (item, index) => {

                                            const percentage =
                                                totalCrimes > 0
                                                    ? (
                                                        item.count /
                                                        totalCrimes
                                                    ) * 100
                                                    : 0;


                                            return (

                                                <tr
                                                    key={item.name}
                                                >

                                                    <td>
                                                        {index + 1}
                                                    </td>

                                                    <td>
                                                        {item.name}
                                                    </td>

                                                    <td>
                                                        {item.count}
                                                    </td>

                                                    <td>
                                                        {percentage.toFixed(1)}%
                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <div className="no-report-data">

                            No crime type data available.

                        </div>

                    )}

                </div>


                {/* =================================================
                   AREA TABLE
                ================================================= */}

                <div className="report-section">


                    <div className="report-section-title">

                        <h2>
                            Area-wise Summary
                        </h2>

                    </div>


                    {areaSummary.length > 0 ? (

                        <div className="report-table-wrapper">

                            <table className="report-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Rank
                                        </th>

                                        <th>
                                            Area
                                        </th>

                                        <th>
                                            Incidents
                                        </th>

                                        <th>
                                            Percentage
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {areaSummary.map(
                                        (item, index) => {

                                            const percentage =
                                                totalCrimes > 0
                                                    ? (
                                                        item.count /
                                                        totalCrimes
                                                    ) * 100
                                                    : 0;


                                            return (

                                                <tr
                                                    key={item.name}
                                                >

                                                    <td>
                                                        {index + 1}
                                                    </td>

                                                    <td>
                                                        {item.name}
                                                    </td>

                                                    <td>
                                                        {item.count}
                                                    </td>

                                                    <td>
                                                        {percentage.toFixed(1)}%
                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <div className="no-report-data">

                            No area data available.

                        </div>

                    )}

                </div>


                {/* =================================================
                   DATA TABLE
                ================================================= */}

                <div className="report-section">


                    <div className="report-section-title">

                        <h2>
                            Reported Records
                        </h2>

                        <p>
                            Filtered records used for this report.
                        </p>

                    </div>


                    {filteredCrimes.length > 0 ? (

                        <div className="report-table-wrapper">

                            <table className="report-table detailed-table">

                                <thead>

                                    <tr>

                                        <th>
                                            #
                                        </th>

                                        <th>
                                            Crime Type
                                        </th>

                                        <th>
                                            Area
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredCrimes.map(
                                        (crime, index) => (

                                            <tr
                                                key={
                                                    crime.id ||
                                                    `${crime.location}-${index}`
                                                }
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>
                                                    {
                                                        crime.crime_type ||
                                                        "Unknown"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        crime.location ||
                                                        "Unknown"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        crime.crime_date
                                                            ? String(
                                                                crime.crime_date
                                                            ).slice(0, 10)
                                                            : "Unknown"
                                                    }
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <div className="no-report-data">

                            No records match the selected filters.

                        </div>

                    )}

                </div>


                {/* =================================================
                   DISCLAIMER
                ================================================= */}

                <div className="report-disclaimer">

                    <strong>
                        Important Notice
                    </strong>

                    <p>
                        This report summarizes historical and
                        aggregated crime records available in the
                        CrimeVista dataset. It is intended for
                        public awareness and analytical purposes.
                        Historical activity does not guarantee
                        future incidents and should not be used to
                        make decisions about individuals.
                    </p>

                </div>


                {/* REPORT FOOTER */}

                <div className="report-footer">

                    <span>
                        CrimeVista — Nagpur Public Safety Portal
                    </span>

                    <span>
                        Generated from available historical records
                    </span>

                </div>


            </div>


            {/* =================================================
               ACTION BUTTON
            ================================================= */}

            <div className="report-actions">

                <button
                    className="generate-report-button"
                    onClick={printReport}
                >
                    🖨️ Generate / Save PDF
                </button>

            </div>


        </div>

    );
}


export default CrimeReports;