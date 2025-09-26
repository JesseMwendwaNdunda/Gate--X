import { useState, useEffect } from "react";

function VehicleList() {
  const [entries, setEntries] = useState([]), [error, setError] = useState(""), [editingEntry, setEditingEntry] = useState(null), [editData, setEditData] = useState({});
  const role = localStorage.getItem("role"), token = localStorage.getItem("token");

  const fetchEntries = async () => {
    try {
      const res = await fetch("https://gate-x-3.onrender.com/api/vehicle_entries", { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
      if (res.status === 401) return setError("Session expired. Please log in again.");
      if (!res.ok) throw new Error(`Failed to fetch entries: ${res.status}`);
      setEntries(await res.json()); setError("");
    } catch (err) { console.error("Error fetching entries:", err); setError("Unable to load vehicle entries."); }
  };

  const deleteEntry = async (id) => { if (role !== "admin") return alert("Only admin can delete!"); try { const res = await fetch(`https://gate-x-3.onrender.com/api/vehicle_entries/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); if (!res.ok) throw new Error("Failed to delete entry"); setEntries(prev => prev.filter(e => e.id !== id)); } catch (err) { console.error(err); alert("Error deleting entry"); } };

  const startEdit = (entry) => { setEditingEntry(entry); setEditData({ number_plate: entry.number_plate, owner_name: entry.owner_name, phone_number: entry.phone_number, id_number: entry.id_number, office_id: entry.office_id }); };
  const handleEditChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });
  const submitEdit = async () => { if (role !== "admin") return alert("Only admin can edit!"); try { const res = await fetch(`https://gate-x-3.onrender.com/api/vehicle_entries/${editingEntry.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...editData, office_id: parseInt(editData.office_id) }) }); if (!res.ok) throw new Error("Failed to update entry"); const updated = await res.json(); setEntries(prev => prev.map(e => e.id === updated.id ? updated : e)); setEditingEntry(null); } catch (err) { console.error(err); alert("Error updating entry"); } };

  useEffect(() => { fetchEntries(); }, []);

  return (
    <div className="container">
      <h2>Vehicle Entries</h2>
      {error && <p className="error">{error}</p>}
      {entries.length === 0 ? <p>No entries found.</p> : (
        <table className="entries-table"><thead><tr><th>Plate</th><th>Owner</th><th>Phone</th><th>Entry</th><th>Exit</th>{role==="admin"&&<th>Actions</th>}</tr></thead>
        <tbody>{entries.map(e=><tr key={e.id}><td>{e.number_plate}</td><td>{e.owner_name}</td><td>{e.phone_number}</td><td>{new Date(e.entry_time).toLocaleString()}</td><td>{e.check_out_time?new Date(e.check_out_time).toLocaleString():"N/A"}</td>{role==="admin"&&<td><button onClick={()=>startEdit(e)}>Edit</button><button onClick={()=>deleteEntry(e.id)}>Delete</button></td>}</tr>)}</tbody></table>
      )}
      {editingEntry && (
        <div className="edit-modal">
          <h3>Edit Vehicle Entry</h3>
          <label>Plate:<input name="number_plate" value={editData.number_plate} onChange={handleEditChange}/></label>
          <label>Owner:<input name="owner_name" value={editData.owner_name} onChange={handleEditChange}/></label>
          <label>Phone:<input name="phone_number" value={editData.phone_number} onChange={handleEditChange}/></label>
          <label>ID Number:<input name="id_number" value={editData.id_number} onChange={handleEditChange}/></label>
          <label>Office ID:<input name="office_id" type="number" value={editData.office_id} onChange={handleEditChange}/></label>
          <div className="modal-buttons"><button onClick={submitEdit}>Save</button><button onClick={()=>setEditingEntry(null)}>Cancel</button></div>
        </div>
      )}
    </div>
  );
}

export default VehicleList;
