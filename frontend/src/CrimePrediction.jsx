import {
    useEffect,
    useState
} from "react";

import "./CrimePrediction.css";


function CrimePrediction({ token }) {


    const [locations, setLocations] =
        useState([]);


    const [selectedLocation, setSelectedLocation] =
        useState("");


    const [prediction, setPrediction] =
        useState(null);


    const [loading, setLoading] =
        useState(false);


    const [error, setError] =
        useState("");


    /*
     * =====================================
     * LOAD LOCATIONS
     * =====================================
     */

    useEffect(() => {

        fetch(
            "http://127.0.0.1:8000/crimes/locations",
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
                    "Unable to load locations"
                );

            }

            return response.json();

        })

        .then(data => {

            setLocations(
                data.locations
            );

        })

        .catch(error => {

            console.error(error);

            setError(
                "Could not load crime locations."
            );

        });

    }, [token]);


    /*
     * =====================================
     * RUN PREDICTION
     * =====================================
     */

    const handlePrediction = async () => {

        if (!selectedLocation) {

            setError(
                "Please select a location."
            );

            return;

        }


        setLoading(true);

        setError("");

        setPrediction(null);


        try {

            const response = await fetch(

                `http://127.0.0.1:8000/predictions/next-day?location=${encodeURIComponent(
                    selectedLocation
                )}`,

                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );


            const data =
                await response.json();


            if (!response.ok) {

                setError(
                    data.detail ||
                    "Prediction failed."
                );

                setLoading(false);

                return;

            }


            setPrediction(
                data
            );


        } catch (error) {

            console.error(error);

            setError(
                "Unable to connect to prediction service."
            );

        }


        setLoading(false);

    };


    return (

        <div className="prediction-section">


            <div className="prediction-header">

                <div>

                    <span>
                        MACHINE LEARNING
                    </span>

                    <h2>
                        Nagpur Crime Risk Forecast
                    </h2>

                    <p>
                        Area-level forecast based on
                        historical crime activity.
                    </p>

                </div>

            </div>


            <div className="prediction-control">


                <label>

                    SELECT AREA

                </label>


                <select

                    value={
                        selectedLocation
                    }

                    onChange={
                        event =>
                            setSelectedLocation(
                                event.target.value
                            )
                    }

                >

                    <option value="">

                        Select Nagpur area

                    </option>


                    {

                        locations.map(
                            location => (

                                <option
                                    key={location}
                                    value={location}
                                >

                                    {location}

                                </option>

                            )
                        )

                    }

                </select>


                <button
                    onClick={
                        handlePrediction
                    }
                    disabled={
                        loading
                    }
                >

                    {
                        loading
                            ? "ANALYZING..."
                            : "GENERATE FORECAST"
                    }

                </button>


            </div>


            {
                error && (

                    <div className="prediction-error">

                        {error}

                    </div>

                )
            }


            {
                prediction && (

                    <div className="prediction-results">


                        <div className="prediction-card">

                            <span>
                                AREA
                            </span>

                            <strong>

                                {
                                    prediction
                                        .location
                                }

                            </strong>

                        </div>


                        <div className="prediction-card">

                            <span>
                                FORECAST DATE
                            </span>

                            <strong>

                                {
                                    prediction
                                        .prediction_date
                                }

                            </strong>

                        </div>


                        <div className="prediction-card">

                            <span>
                                EXPECTED ACTIVITY
                            </span>

                            <strong>

                                {
                                    prediction
                                        .predicted_crime_count
                                }

                            </strong>

                        </div>


                        <div className="prediction-card">

                            <span>
                                30-DAY AVG
                            </span>

                            <strong>

                                {
                                    prediction
                                        .recent_30_day_average
                                }

                            </strong>

                        </div>


                        <div
                            className={
                                `prediction-card risk-card ${
                                    prediction
                                        .risk_level
                                        .toLowerCase()
                                }`
                            }
                        >

                            <span>
                                RISK LEVEL
                            </span>

                            <strong>

                                {
                                    prediction
                                        .risk_level
                                }

                            </strong>

                        </div>


                    </div>

                )
            }


            <div className="prediction-note">

                Forecasts represent aggregate
                area-level patterns derived from
                historical records. They should be
                treated as decision-support
                indicators rather than certainty
                about future incidents.

            </div>


        </div>

    );

}


export default CrimePrediction;