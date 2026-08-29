import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    MapContainer,
    TileLayer,
    useMap
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import "leaflet.heat";

import "./NagpurHeatmap.css";


/*
 * ==========================================
 * NAGPUR CENTER
 * ==========================================
 */

const NAGPUR_CENTER = [
    21.1458,
    79.0882
];


/*
 * ==========================================
 * HEATMAP LAYER
 * ==========================================
 */

function HeatmapLayer({ crimes }) {

    const map = useMap();

    const heatLayerRef =
        useRef(null);


    useEffect(() => {

        /*
         * Remove old heatmap
         */

        if (heatLayerRef.current) {

            map.removeLayer(
                heatLayerRef.current
            );

        }


        /*
         * Convert crime data into
         * Leaflet heatmap format
         *
         * [latitude, longitude, intensity]
         */

        const points = crimes

            .filter(
                crime =>
                    crime.latitude !== null &&
                    crime.longitude !== null
            )

            .map(
                crime => [

                    Number(
                        crime.latitude
                    ),

                    Number(
                        crime.longitude
                    ),

                    1

                ]
            );


        /*
         * Create heatmap
         */

        if (points.length > 0) {

            heatLayerRef.current =
                L.heatLayer(
                    points,
                    {
                        radius: 30,

                        blur: 25,

                        maxZoom: 15,

                        max: 1.0,

                        minOpacity: 0.35
                    }
                );


            heatLayerRef.current
                .addTo(map);

        }


        /*
         * Cleanup
         */

        return () => {

            if (
                heatLayerRef.current
            ) {

                map.removeLayer(
                    heatLayerRef.current
                );

            }

        };

    }, [crimes, map]);


    return null;

}


/*
 * ==========================================
 * MAIN HEATMAP COMPONENT
 * ==========================================
 */

function NagpurHeatmap({ token }) {


    const [crimes, setCrimes] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /*
     * ==========================================
     * LOAD NAGPUR CRIMES
     * ==========================================
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
                    "Failed to load Nagpur crime data"
                );

            }

            return response.json();

        })

        .then(data => {

            setCrimes(data);

            setLoading(false);

        })

        .catch(error => {

            console.error(error);

            setError(
                "Unable to load Nagpur heatmap"
            );

            setLoading(false);

        });

    }, [token]);


    /*
     * ==========================================
     * LOADING
     * ==========================================
     */

    if (loading) {

        return (

            <div className="heatmap-message">

                Loading Nagpur heatmap...

            </div>

        );

    }


    /*
     * ==========================================
     * ERROR
     * ==========================================
     */

    if (error) {

        return (

            <div className="heatmap-message">

                {error}

            </div>

        );

    }


    return (

        <div className="heatmap-container">


            {/* =================================
                HEADER
               ================================= */}

            <div className="heatmap-header">

                <div>

                    <span>
                        SPATIAL CRIME INTELLIGENCE
                    </span>

                    <h2>
                        Nagpur Crime Hotspots
                    </h2>

                    <p>
                        Crime density visualization
                        based on recorded locations.
                    </p>

                </div>


                <div className="heatmap-total">

                    <strong>
                        {crimes.length}
                    </strong>

                    <small>
                        CRIME RECORDS
                    </small>

                </div>

            </div>


            {/* =================================
                MAP
               ================================= */}

            <MapContainer

                center={NAGPUR_CENTER}

                zoom={12}

                scrollWheelZoom={true}

                className="nagpur-heatmap"

            >

                <TileLayer

                    attribution='&copy; OpenStreetMap contributors'

                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                />


                <HeatmapLayer
                    crimes={crimes}
                />


            </MapContainer>


            {/* =================================
                LEGEND
               ================================= */}

            <div className="heatmap-legend">

                <span>
                    LOW
                </span>

                <div className="legend-gradient">
                </div>

                <span>
                    HIGH
                </span>

            </div>


        </div>

    );

}


export default NagpurHeatmap;