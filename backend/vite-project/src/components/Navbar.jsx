import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");      // "admin" or "guard"
  const username = localStorage.getItem("username"); // grab username

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("username"); // clear username too
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h1>Gate-X Security</h1>
      <ul>
        
        {role && <li><Link to="/">Dashboard</Link></li>}

        
        {role === "guard" && <li><Link to="/entry">Add Vehicle</Link></li>}
        {role === "admin" && (
          <>
            <li><Link to="/vehicles">Vehicle Entries</Link></li>
            
            <li><Link to="/users">Users</Link></li>
          </>
        )}

        
        {!role && (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
          </>
        )}

        
        {role && (
          <>
            <li className="greeting">Hello {role.charAt(0).toUpperCase() + role.slice(1)} {username}</li>
            <li>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
