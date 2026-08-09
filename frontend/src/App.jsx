import { useEffect, useState } from "react";


function App() {

  const [status, setStatus] = useState(null);


  useEffect(() => {

    fetch("http://127.0.0.1:8000/health")
      .then(response => response.json())
      .then(data => {
        setStatus(data);
      })
      .catch(error => {
        console.error("Backend connection error:", error);
      });

  }, []);


  return (
    <div>

      <h1>CrimeVista</h1>

      <p>
        AI-Powered Geospatial Crime Prediction Platform
      </p>

      <hr />

      <h2>System Status</h2>

      <p>
        Frontend: Running
      </p>

      {status ? (
        <div>
          <p>
            Backend: {status.backend}
          </p>

          <p>
            Database: {status.database}
          </p>
        </div>
      ) : (
        <p>
          Connecting to backend...
        </p>
      )}

    </div>
  );
}


export default App;