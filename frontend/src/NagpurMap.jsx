import {
    useEffect,
    useState
} from "react";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import "./NagpurMap.css";


/*
 * =========================================
 * NAGPUR CENTER COORDINATES
 * =========================================
 */

const NAGPUR_CENTER = [
    21.1458,
    79.0882
];


/*
 * =========================================
 * RED CRIME MARKER
 * =========================================
 */

const crimeIcon = new L.DivIcon({

    className: "crime-marker",

    html: `
        <div class="crime-marker-dot"></div>
    `,

    iconSize: [18, 18],

    iconAnchor: [9, 9],

    popupAnchor: [0, -10]

});


/*
 * =========================================
 * NAGPUR MAP COMPONENT
 * =========================================
 */

function NagpurMap({ token }) {


    /*
     * =========================================
     * STATE VARIABLES
     * =========================================
     */

    const [crimes, setCrimes] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    /*
     * =========================================
     * GET NAGPUR CRIME DATA
     * =========================================
     */

    useEffect(() => {

        fetch(
            "http://127.0.0.1:8000/crimes/nagpur",
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
                    "Failed to load Nagpur crimes"
                );

            }

            return response.json();

        })

        .then(data => {

            console.log(
                "Nagpur crime data:",
                data
            );

            setCrimes(data);

            setLoading(false);

        })

        .catch(error => {

            console.error(
                "Nagpur map error:",
                error
            );

            setError(
                "Unable to load Nagpur crime data"
            );

            setLoading(false);

        });

    }, [token]);


    /*
     * =========================================
     * LOADING STATE
     * =========================================
     */

    if (loading) {

        return (

            <div className="map-message">

                Loading Nagpur crime map...

            </div>

        );

    }


    /*
     * =========================================
     * ERROR STATE
     * =========================================
     */

    if (error) {

        return (

            <div className="map-message">

                {error}

            </div>

        );

    }


    /*
     * =========================================
     * DISPLAY MAP
     * =========================================
     */

    return (

        <div className="nagpur-map-wrapper">


            {/* =====================================
                MAP HEADER
               ===================================== */}

            <div className="map-heading">

                <div>

                    <span>
                        GEOSPATIAL INTELLIGENCE
                    </span>


                    <h2>
                        Nagpur Crime Map
                    </h2>

                </div>


                <div className="crime-count">

                    {crimes.length}

                    <small>
                        CRIMES
                    </small>

                </div>

            </div>


            {/* =====================================
                LEAFLET MAP
               ===================================== */}

            <MapContainer

                center={NAGPUR_CENTER}

                zoom={12}

                scrollWheelZoom={true}

                className="nagpur-map"

            >


                {/* =================================
                    OPEN STREET MAP
                   ================================= */}

                <TileLayer

                    attribution='&copy; OpenStreetMap contributors'

                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                />


                {/* =================================
                    CRIME MARKERS
                   ================================= */}

                {

                    crimes.map(

                        crime => (

                            <Marker

                                key={crime.id}

                                position={[
                                    Number(
                                        crime.latitude
                                    ),

                                    Number(
                                        crime.longitude
                                    )
                                ]}

                                icon={crimeIcon}

                            >


                                {/* =====================
                                    CRIME POPUP
                                   ===================== */}

                                <Popup>

                                    <div className="crime-popup">


                                        <h3>

                                            {
                                                crime.crime_type
                                            }

                                        </h3>


                                        <p>

                                            <strong>
                                                Location:
                                            </strong>

                                            <br />

                                            {
                                                crime.location
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Date:
                                            </strong>

                                            <br />

                                            {

                                                crime.crime_date

                                                    ? new Date(
                                                        crime.crime_date
                                                    ).toLocaleDateString()

                                                    : "Not available"

                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Coordinates:
                                            </strong>

                                            <br />

                                            {
                                                crime.latitude
                                            }

                                            {", "}

                                            {
                                                crime.longitude
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Description:
                                            </strong>

                                            <br />

                                            {

                                                crime.description
                                                    || "No description available"

                                            }

                                        </p>


                                    </div>

                                </Popup>


                            </Marker>

                        )

                    )

                }


            </MapContainer>


        </div>

    );

}


export default NagpurMap;