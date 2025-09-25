import { useState, useEffect } from "react";

function VehicleList() {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/vehicle_entries", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch entries: ${res.status}`);
      }

      const data = await res.json();
      setEntries(data);
      setError("");
    } catch (err) {
      console.error("Error fetching entries:", err);
      setError("Unable to load vehicle entries.");
    }
  };

  const deleteEntry = async (id) => {
    const role = localStorage.getItem("role");
    if (role !== "admin") return alert("Only admin can delete!");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/vehicle_entries/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete entry");
      }

      fetchEntries();
    } catch (err) {
      console.error(err);
      alert("Error deleting entry");
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div className="container">
      <h2>Vehicle Entries</h2>
      {error && <p className="error">{error}</p>}
      {entries.length === 0 ? (
        <p>No entries found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Plate</th>
              <th>Owner</th>
              <th>Phone</th>
              <th>Entry</th>
              <th>Exit</th>
              {localStorage.getItem("role") === "admin" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.number_plate}</td>
                <td>{entry.owner_name}</td>
                <td>{entry.phone_number}</td>
                <td>{new Date(entry.entry_time).toLocaleString()}</td>
                <td>
                  {entry.exit_time
                    ? new Date(entry.exit_time).toLocaleString()
                    : "N/A"}
                </td>
                {localStorage.getItem("role") === "admin" && (
                  <td>
                    <button onClick={() => deleteEntry(entry.id)}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default VehicleList;
