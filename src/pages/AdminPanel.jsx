import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function AdminPanel() {
    const { token } = useAuth();
    const [allBookings, setAllBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        let isMounted = true;

        async function fetchAllBookings() {
            setLoading(true);
            try {
                const response = await fetch("http://localhost:5000/api/v1/bookings", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Admin fetch status: ${response.status}`);
                }

                const json = await response.json();
                if (isMounted) {
                    setAllBookings(json.data || []);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || "Failed to load admin bookings");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        if (token) {
            fetchAllBookings();
        } else {
            setLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [token]);

    const filteredList = allBookings.filter((b) => {
        if (filterStatus === "all") return true;
        return b.status === filterStatus;
    });

    const totalCount = allBookings.length;
    const activeCount = allBookings.filter((b) => b.status === "booked").length;
    const attendedCount = allBookings.filter((b) => b.status === "attended").length;
    const cancelledCount = allBookings.filter((b) => b.status === "cancelled").length;

    return (
        <div className="page-container">
            {/* Header */}
            <div className="section-hero">
                <div className="hero-badge">⚡ Admin Portal & Master Schedule</div>
                <h1>Gym Class Operations Dashboard</h1>
                <p className="hero-subtitle">
                    Real-time monitoring of member reservations, trainer schedules, and attendance metrics.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="admin-stat-cards">
                <div className="stat-card stat-total">
                    <div className="stat-icon-circle">📊</div>
                    <div className="stat-content">
                        <span className="stat-number">{totalCount}</span>
                        <span className="stat-label">Total Reservations</span>
                    </div>
                </div>

                <div className="stat-card stat-active">
                    <div className="stat-icon-circle">✅</div>
                    <div className="stat-content">
                        <span className="stat-number">{activeCount}</span>
                        <span className="stat-label">Active Booked</span>
                    </div>
                </div>

                <div className="stat-card stat-attended">
                    <div className="stat-icon-circle">🎯</div>
                    <div className="stat-content">
                        <span className="stat-number">{attendedCount}</span>
                        <span className="stat-label">Attended</span>
                    </div>
                </div>

                <div className="stat-card stat-cancelled">
                    <div className="stat-icon-circle">⛔</div>
                    <div className="stat-content">
                        <span className="stat-number">{cancelledCount}</span>
                        <span className="stat-label">Cancelled</span>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="admin-table-card">
                <div className="table-card-header">
                    <h2>Master Class Roster</h2>

                    {/* Filter Tabs */}
                    <div className="table-filter-tabs">
                        <button
                            className={`tab-btn ${filterStatus === "all" ? "tab-active" : ""}`}
                            onClick={() => setFilterStatus("all")}
                        >
                            All ({totalCount})
                        </button>
                        <button
                            className={`tab-btn ${filterStatus === "booked" ? "tab-active" : ""}`}
                            onClick={() => setFilterStatus("booked")}
                        >
                            Booked ({activeCount})
                        </button>
                        <button
                            className={`tab-btn ${filterStatus === "attended" ? "tab-active" : ""}`}
                            onClick={() => setFilterStatus("attended")}
                        >
                            Attended ({attendedCount})
                        </button>
                        <button
                            className={`tab-btn ${filterStatus === "cancelled" ? "tab-active" : ""}`}
                            onClick={() => setFilterStatus("cancelled")}
                        >
                            Cancelled ({cancelledCount})
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="state-card loading-card">
                        <div className="spinner"></div>
                        <p>Loading master roster from database...</p>
                    </div>
                )}

                {error && (
                    <div className="state-card error-card">
                        <span className="state-icon">⚠️</span>
                        <p>{error} (Requires valid authentication token)</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className="table-responsive">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Program Name</th>
                                    <th>Member Name</th>
                                    <th>Email</th>
                                    <th>Trainer</th>
                                    <th>Date</th>
                                    <th>Time Slot</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredList.length > 0 ? (
                                    filteredList.map((b) => (
                                        <tr key={b._id}>
                                            <td>
                                                <strong className="class-highlight">
                                                    {b.className}
                                                </strong>
                                            </td>
                                            <td>{b.memberId?.name || "Member"}</td>
                                            <td className="text-muted">
                                                {b.memberId?.email || "-"}
                                            </td>
                                            <td>{b.trainerId?.name || "Assigned Trainer"}</td>
                                            <td>
                                                {b.date
                                                    ? new Date(b.date).toLocaleDateString(
                                                          "en-US",
                                                          {
                                                              month: "short",
                                                              day: "numeric",
                                                              year: "numeric"
                                                          }
                                                      )
                                                    : "-"}
                                            </td>
                                            <td>
                                                <span className="timeslot-chip">{b.timeSlot}</span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`status-pill status-${b.status}`}
                                                >
                                                    {b.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            style={{
                                                textAlign: "center",
                                                padding: "36px",
                                                color: "#64748b"
                                            }}
                                        >
                                            No class reservations match the selected filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPanel;