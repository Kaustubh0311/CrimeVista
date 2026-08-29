import { useState } from "react";

import "./CrimeUpload.css";


function CrimeUpload({ token }) {

    const [file, setFile] = useState(null);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");

    const [uploading, setUploading] = useState(false);


    const handleFileChange = (event) => {

        setFile(
            event.target.files[0]
        );

        setMessage("");

        setError("");

    };


    const handleUpload = async () => {

        if (!file) {

            setError(
                "Please select a CSV file"
            );

            return;

        }


        if (
            !file.name
                .toLowerCase()
                .endsWith(".csv")
        ) {

            setError(
                "Only CSV files are allowed"
            );

            return;

        }


        setUploading(true);

        setError("");

        setMessage("");


        const formData = new FormData();

        formData.append(
            "file",
            file
        );


        try {

            const response = await fetch(

                "http://127.0.0.1:8000/admin/crimes/upload",

                {

                    method: "POST",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    },

                    body: formData

                }

            );


            const data =
                await response.json();


            if (!response.ok) {

                setError(
                    data.detail ||
                    "Upload failed"
                );

                setUploading(false);

                return;

            }


            const result =
                data.result;


            setMessage(
                `Upload completed. ` +
                `Inserted: ${result.inserted}, ` +
                `Skipped: ${result.skipped}, ` +
                `Failed: ${result.failed}`
            );


            setFile(null);


        } catch (error) {

            setError(
                "Unable to connect to server"
            );

        }


        setUploading(false);

    };


    return (

        <div className="crime-upload">


            <div className="upload-header">

                <div>

                    <span>
                        ADMIN CONTROL
                    </span>

                    <h2>
                        Crime Data Upload
                    </h2>

                    <p>
                        Import verified crime
                        records into CrimeVista.
                    </p>

                </div>

            </div>


            <div className="upload-card">


                <div className="upload-icon">

                    ↑

                </div>


                <h3>

                    Upload Crime Dataset

                </h3>


                <p>

                    Select a CSV file containing
                    crime records.

                </p>


                <label
                    className="file-selector"
                >

                    <input
                        type="file"
                        accept=".csv"
                        onChange={
                            handleFileChange
                        }
                    />

                    <span>

                        {file
                            ? file.name
                            : "Choose CSV File"
                        }

                    </span>

                </label>


                <button
                    className="upload-button"
                    onClick={handleUpload}
                    disabled={uploading}
                >

                    {uploading
                        ? "UPLOADING..."
                        : "UPLOAD DATA"
                    }

                </button>


                {message && (

                    <div className="upload-success">

                        ✓ {message}

                    </div>

                )}


                {error && (

                    <div className="upload-error">

                        ! {error}

                    </div>

                )}


            </div>


            <div className="format-info">

                <h4>
                    Required CSV Columns
                </h4>

                <div className="columns">

                    <span>crime_type</span>

                    <span>location</span>

                    <span>latitude</span>

                    <span>longitude</span>

                    <span>crime_date</span>

                    <span>description</span>

                </div>

            </div>


        </div>

    );

}


export default CrimeUpload;