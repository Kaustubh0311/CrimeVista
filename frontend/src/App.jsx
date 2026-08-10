import { useEffect, useState } from "react";


function App() {

    const [crimes, setCrimes] = useState([]);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        fetch("http://127.0.0.1:8000/crimes/")

            .then(response => response.json())

            .then(data => {

                setCrimes(data.data);

                setLoading(false);

            })

            .catch(error => {

                console.error(
                    "Error loading crime data:",
                    error
                );

                setLoading(false);

            });

    }, []);


    return (

        <div>

            <h1>CrimeVista</h1>

            <h2>Crime Records</h2>


            {loading ? (

                <p>
                    Loading crime data...
                </p>

            ) : (

                <div>

                    <p>
                        Records displayed:
                        {" "}
                        {crimes.length}
                    </p>


                    <table border="1">

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>Crime Type</th>

                                <th>Date</th>

                                <th>Location</th>

                                <th>City</th>

                            </tr>

                        </thead>


                        <tbody>

                            {crimes.map(
                                crime => (

                                <tr key={crime.id}>

                                    <td>
                                        {crime.id}
                                    </td>

                                    <td>
                                        {crime.crime_type}
                                    </td>

                                    <td>
                                        {crime.crime_date}
                                    </td>

                                    <td>
                                        {crime.location}
                                    </td>

                                    <td>
                                        {crime.city}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );
}


export default App;