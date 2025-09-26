import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const GuardDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {
      const res = await fetch("/api/vehicle_entries", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch: ${res.status} - ${text}`);
      }

      const data = await res.json();

      // Filter vehicles that are currently inside (no exit_time)
      const insideVehicles = data.filter((v) => !v.exit_time);
      setVehicles(insideVehicles);
      setError("");
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Unable to load vehicle entries. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const checkoutVehicle = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/vehicle_entries/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ check_out_time: new Date().toISOString() }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to checkout: ${res.status} - ${text}`);
      }

      // Remove the vehicle from the list after checkout
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to checkout vehicle. Try again.");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Vehicles Inside</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {vehicles.length === 0 && !error ? (
        <p>No vehicles inside currently.</p>
      ) : (
        vehicles.map((v) => (
          <div key={v.id} className="vehicle-card">
            <p>Plate: {v.number_plate}</p>
            <p>Owner: {v.owner_name}</p>
            <p>Phone: {v.phone_number}</p>
            <p>Office: {v.office.name}</p>
            <p>Entry: {new Date(v.entry_time).toLocaleString()}</p>
            <button className="checkout-btn" onClick={() => checkoutVehicle(v.id)}>
              Checkout
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default GuardDashboard;
