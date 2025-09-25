import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h1>Gate-X Security</h1>
      <ul>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/entries">Vehicle Entries</Link></li>
        <li><Link to="/offices">Offices</Link></li>
        <li><Link to="/users">Users</Link></li>
        <li><Link to="/logout">Logout</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
