import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navigation() {
    const { member, token, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <nav className="navigation">
            <div className="nav-brand">
                <Link to={token ? "/classes" : "/"}>
                    <span className="brand-logo">⚡ FitZone</span>
                </Link>
            </div>

            <div className="nav-links">
                {/* Show Login link only if the user is NOT logged in */}
                {!token && <Link to="/">Login</Link>}

                <Link to="/classes">Classes</Link>
                <Link to="/my-bookings">My Bookings</Link>
                <Link to="/admin">Admin</Link>
            </div>

            {token && (
                <div className="nav-user">
                    <span className="user-welcome">
                        Hi, {member?.name || "Member"}
                    </span>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}

export default Navigation;