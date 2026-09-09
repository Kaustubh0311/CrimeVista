import { useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";

import "./CrimeTrends.css";

function CrimeTrends({ token }) {
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

    /* ================= DAILY TREND ================= */

    const dailyTrend = useMemo(() => {
        const groups = {};

        filteredCrimes.forEach((crime) => {
            if (!crime.crime_date) return;

            const date =
                String(crime.crime_date).split("T")[0];

            if (!groups[date]) {
                groups[date] = 0;
            }

            groups[date]++;
        });

        return Object.entries(groups)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({
                date,
                crimes: count
            }));
    }, [filteredCrimes]);

    /* ================= MONTHLY TREND ================= */

    const monthlyTrend = useMemo(() => {
        const groups = {};

        filteredCrimes.forEach((crime) => {
            if (!crime.crime_date) return;

            const date =
                String(crime.crime_date).split("T")[0];

            const month = date.substring(0, 7);

            if (!groups[month]) {
                groups[month] = 0;
            }

            groups[month]++;
        });

        return Object.entries(groups)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, count]) => ({
                month,
                crimes: count
            }));
    }, [filteredCrimes]);

    /* ================= CRIME TYPE ================= */

    const crimeTypeData = useMemo(() => {
        const groups = {};

        filteredCrimes.forEach((crime) => {
            const type =
                crime.crime_type || "Unknown";

            if (!groups[type]) {
                groups[type] = 0;
            }

            groups[type]++;
        });

        return Object.entries(groups)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => ({
                type,
                crimes: count
            }));
    }, [filteredCrimes]);

    /* ================= AREA DATA ================= */

    const areaData = useMemo(() => {
        const groups = {};

        filteredCrimes.forEach((crime) => {
            const area =
                crime.location || "Unknown";

            if (!groups[area]) {
                groups[area] = 0;
            }

            groups[area]++;
        });

        return Object.entries(groups)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([area, count]) => ({
                area,
                crimes: count
            }));
    }, [filteredCrimes]);

    /* ================= PIE DATA ================= */

    const pieData = crimeTypeData.slice(0, 7);

    /* ================= SUMMARY ================= */

    const totalCrimes = filteredCrimes.length;

    const activeDays = dailyTrend.length;

    const highestDay =
        dailyTrend.length > 0
            ? dailyTrend.reduce((max, item) =>
                  item.crimes > max.crimes
                      ? item
                      : max
              )
            : null;

    const mostCommonCrime =
        crimeTypeData.length > 0
            ? crimeTypeData[0]
            : null;

    const resetFilters = () => {
        setCrimeType("ALL");
        setStartDate("");
        setEndDate("");
    };

    return (
        <div className="crime-trends-page">

            {/* ================= FILTERS ================= */}

            <div className="trend-filter-bar">

                <div className="trend-filter">

                    <label>
                        Crime Type
                    </label>

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

                <div className="trend-filter">

                    <label>
                        From Date
                    </label>

                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) =>
                            setStartDate(e.target.value)
                        }
                    />

                </div>

                <div className="trend-filter">

                    <label>
                        To Date
                    </label>

                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) =>
                            setEndDate(e.target.value)
                        }
                    />

                </div>

                <button
                    className="trend-reset"
                    onClick={resetFilters}
                >
                    ↻ Reset
                </button>

            </div>

            {/* ================= ERROR ================= */}

            {error && (
                <div className="trend-error">
                    ⚠️ {error}
                </div>
            )}

            {/* ================= SUMMARY ================= */}

            <div className="trend-stat-grid">

                <div className="trend-stat-card">

                    <div className="trend-stat-icon">
                        🚨
                    </div>

                    <div>
                        <span>
                            Total Crimes
                        </span>

                        <strong>
                            {totalCrimes}
                        </strong>
                    </div>

                </div>

                <div className="trend-stat-card">

                    <div className="trend-stat-icon">
                        📅
                    </div>

                    <div>
                        <span>
                            Active Days
                        </span>

                        <strong>
                            {activeDays}
                        </strong>
                    </div>

                </div>

                <div className="trend-stat-card">

                    <div className="trend-stat-icon">
                        📈
                    </div>

                    <div>
                        <span>
                            Highest Activity
                        </span>

                        <strong>
                            {highestDay
                                ? highestDay.crimes
                                : "—"}
                        </strong>
                    </div>

                </div>

                <div className="trend-stat-card">

                    <div className="trend-stat-icon">
                        🏆
                    </div>

                    <div>
                        <span>
                            Most Common
                        </span>

                        <strong className="common-crime">
                            {mostCommonCrime
                                ? mostCommonCrime.type
                                : "—"}
                        </strong>
                    </div>

                </div>

            </div>

            {loading ? (

                <div className="trend-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Analyzing Nagpur crime trends...
                    </p>

                </div>

            ) : (

                <>

                    {/* ================= DAILY CHART ================= */}

                    <div className="chart-card full-chart">

                        <div className="chart-header">

                            <div>
                                <h2>
                                    Daily Crime Activity
                                </h2>

                                <p>
                                    Reported crime records by date
                                </p>
                            </div>

                        </div>

                        <div className="chart-container">

                            {dailyTrend.length === 0 ? (

                                <div className="no-chart-data">
                                    No data available for the
                                    selected filters.
                                </div>

                            ) : (

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <LineChart
                                        data={dailyTrend}
                                        margin={{
                                            top: 10,
                                            right: 20,
                                            left: 0,
                                            bottom: 5
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="date"
                                            tick={{
                                                fontSize: 9
                                            }}
                                        />

                                        <YAxis
                                            allowDecimals={false}
                                            tick={{
                                                fontSize: 9
                                            }}
                                        />

                                        <Tooltip />

                                        <Line
                                            type="monotone"
                                            dataKey="crimes"
                                            name="Crimes"
                                            strokeWidth={3}
                                            dot={{
                                                r: 3
                                            }}
                                        />

                                    </LineChart>
                                </ResponsiveContainer>

                            )}

                        </div>

                    </div>

                    {/* ================= TWO COLUMN ================= */}

                    <div className="chart-grid">

                        {/* MONTHLY */}

                        <div className="chart-card">

                            <div className="chart-header">

                                <div>
                                    <h2>
                                        Monthly Trend
                                    </h2>

                                    <p>
                                        Crime activity by month
                                    </p>
                                </div>

                            </div>

                            <div className="chart-container">

                                {monthlyTrend.length === 0 ? (

                                    <div className="no-chart-data">
                                        No monthly data available.
                                    </div>

                                ) : (

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={monthlyTrend}
                                        >

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                            />

                                            <XAxis
                                                dataKey="month"
                                                tick={{
                                                    fontSize: 9
                                                }}
                                            />

                                            <YAxis
                                                allowDecimals={false}
                                                tick={{
                                                    fontSize: 9
                                                }}
                                            />

                                            <Tooltip />

                                            <Bar
                                                dataKey="crimes"
                                                name="Crimes"
                                            />

                                        </BarChart>

                                    </ResponsiveContainer>

                                )}

                            </div>

                        </div>

                        {/* CRIME TYPE PIE */}

                        <div className="chart-card">

                            <div className="chart-header">

                                <div>
                                    <h2>
                                        Crime Distribution
                                    </h2>

                                    <p>
                                        Distribution by crime type
                                    </p>
                                </div>

                            </div>

                            <div className="chart-container">

                                {pieData.length === 0 ? (

                                    <div className="no-chart-data">
                                        No crime type data available.
                                    </div>

                                ) : (

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <PieChart>

                                            <Pie
                                                data={pieData}
                                                dataKey="crimes"
                                                nameKey="type"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={105}
                                                label
                                            >

                                                {pieData.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                        />
                                                    )
                                                )}

                                            </Pie>

                                            <Tooltip />

                                            <Legend
                                                wrapperStyle={{
                                                    fontSize: "9px"
                                                }}
                                            />

                                        </PieChart>

                                    </ResponsiveContainer>

                                )}

                            </div>

                        </div>

                    </div>

                    {/* ================= AREA COMPARISON ================= */}

                    <div className="chart-card full-chart">

                        <div className="chart-header">

                            <div>
                                <h2>
                                    Top Areas by Crime Activity
                                </h2>

                                <p>
                                    Areas with the highest number of
                                    reported records
                                </p>
                            </div>

                        </div>

                        <div className="chart-container">

                            {areaData.length === 0 ? (

                                <div className="no-chart-data">
                                    No area data available.
                                </div>

                            ) : (

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <BarChart
                                        data={areaData}
                                        layout="vertical"
                                        margin={{
                                            left: 25,
                                            right: 20
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={false}
                                            tick={{
                                                fontSize: 9
                                            }}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="area"
                                            width={100}
                                            tick={{
                                                fontSize: 9
                                            }}
                                        />

                                        <Tooltip />

                                        <Bar
                                            dataKey="crimes"
                                            name="Crimes"
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </div>

                    {/* ================= INSIGHT ================= */}

                    <div className="trend-insight">

                        <div className="insight-icon">
                            💡
                        </div>

                        <div>

                            <strong>
                                Crime Trend Insight
                            </strong>

                            <p>
                                These charts summarize historical
                                crime records available in the
                                CrimeVista database. Higher activity
                                indicates a greater number of
                                historical reports and does not
                                necessarily mean that future crime
                                will occur in the same way.
                            </p>

                        </div>

                    </div>

                </>

            )}

        </div>
    );
}

export default CrimeTrends;