import { Link } from "react-router-dom";

function Navigation() {
    return (
        <nav className="navigation">
            <Link to="/">Login</Link>

            <Link to="/classes">Classes</Link>

            <Link to="/my-bookings">My Bookings</Link>

            <Link to="/admin">Admin</Link>
        </nav>
    );
}

export default Navigation;