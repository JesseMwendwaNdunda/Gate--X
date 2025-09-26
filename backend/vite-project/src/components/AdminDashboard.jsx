import { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [vehicles, setVehicles] = useState([]), [offices, setOffices] = useState([]),
    [editingEntry, setEditingEntry] = useState(null), [editData, setEditData] = useState({}),
    [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch("/api/vehicle_entries", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch vehicles");
        setVehicles(await res.json()); setError("");
      } catch (err) { console.error(err); setError("Unable to load vehicle entries."); }
    };
    const fetchOffices = async () => {
      try { const res = await fetch("/api/offices", { headers: { Authorization: `Bearer ${token}` } }); if (!res.ok) throw new Error(); setOffices(await res.json()); } catch (err) { console.error(err); }
    };
    fetchVehicles(); fetchOffices();
  }, []);

  const startEdit = (v) => { setEditingEntry(v); setEditData({ number_plate: v.number_plate, owner_name: v.owner_name, phone_number: v.phone_number, id_number: v.id_number, office_id: v.office?.id || "" }); };
  const handleEditChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });
  const submitEdit = async () => {
    try {
      const res = await fetch(`/api/vehicle_entries/${editingEntry.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...editData, office_id: parseInt(editData.office_id) }) });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json(); setVehicles(v => v.map(x => x.id === updated.id ? updated : x)); setEditingEntry(null);
    } catch (err) { console.error(err); alert("Error updating vehicle"); }
  };
  const deleteEntry = async (id) => { try { const res = await fetch(`/api/vehicle_entries/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); if (!res.ok) throw new Error(); setVehicles(v => v.filter(x => x.id !== id)); } catch (err) { console.error(err); alert("Error deleting vehicle"); } };

  return (
    <div className="admin-dashboard" style={{ background: "#1e1b2d", color: "#fff", minHeight: "100vh", padding: "20px" }}>
      <h2>Admin Dashboard - Vehicle Entries</h2>
      {error && <p>{error}</p>}
      {vehicles.length === 0 && !error ? <p>No vehicles registered yet.</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th>Plate</th><th>Owner</th><th>Phone</th><th>Entry</th><th>Exit</th><th>Office</th><th>Guard</th><th>Actions</th></tr></thead>
          <tbody>
            {vehicles.map(v => <tr key={v.id} style={{ borderBottom: "1px solid #444" }}>
              <td>{v.number_plate}</td><td>{v.owner_name}</td><td>{v.phone_number}</td>
              <td>{new Date(v.entry_time).toLocaleString()}</td>
              <td>{v.check_out_time ? new Date(v.check_out_time).toLocaleString() : "N/A"}</td>
              <td>{v.office?.name || "N/A"}</td><td>{v.added_by?.username || "N/A"}</td>
              <td><button onClick={() => startEdit(v)} style={{ marginRight: "5px" }}>Edit</button>
                  <button onClick={() => deleteEntry(v.id)}>Delete</button></td>
            </tr>)}
          </tbody>
        </table>
      )}
      {editingEntry && (
        <div style={{ background: "#2a1e4d", padding: "20px", marginTop: "20px" }}>
          <h3>Edit Vehicle Entry</h3>
          <label>Plate:<input name="number_plate" value={editData.number_plate} onChange={handleEditChange} /></label>
          <label>Owner:<input name="owner_name" value={editData.owner_name} onChange={handleEditChange} /></label>
          <label>Phone:<input name="phone_number" value={editData.phone_number} onChange={handleEditChange} /></label>
          <label>ID:<input name="id_number" value={editData.id_number} onChange={handleEditChange} /></label>
          <label>Office:<select name="office_id" value={editData.office_id} onChange={handleEditChange}>
            <option value="">Select Office</option>
            {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select></label>
          <div style={{ marginTop: "10px" }}><button onClick={submitEdit} style={{ marginRight: "10px" }}>Save</button><button onClick={() => setEditingEntry(null)}>Cancel</button></div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
