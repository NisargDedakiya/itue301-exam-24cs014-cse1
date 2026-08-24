import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MyBookingsPage() {
    const { member, token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionMsg, setActionMsg] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function fetchMyBookings() {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch("http://localhost:5000/api/v1/bookings/my", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch bookings (${response.status})`);
                }

                const json = await response.json();
                if (isMounted) {
                    setBookings(json.data || []);
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Fetch bookings error:", err);
                    setError(err.message || "Failed to load bookings");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        if (token) {
            fetchMyBookings();
        } else {
            setLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [token]);

    async function handleCancelBooking(bookingId) {
        setActionMsg("");
        try {
            const response = await fetch(`http://localhost:5000/api/v1/bookings/${bookingId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: "cancelled" })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to cancel booking");
            }

            setBookings((prev) =>
                prev.map((b) => (b._id === bookingId ? { ...b, status: "cancelled" } : b))
            );
            setActionMsg("Booking cancelled successfully.");
        } catch (err) {
            setActionMsg(`Error: ${err.message}`);
        }
    }

    const membershipColors = {
        basic: "membership-basic",
        premium: "membership-premium",
        platinum: "membership-platinum"
    };

    return (
        <div className="page-container">
            {/* Member Profile Overview Banner */}
            <div className="member-banner">
                <div className="member-avatar-large">
                    <span>
                        {member?.name
                            ? member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()
                            : "FZ"}
                    </span>
                </div>

                <div className="member-details">
                    <div className="member-name-row">
                        <h1>{member?.name || "FitZone Member"}</h1>
                        <span
                            className={`membership-tag ${
                                membershipColors[member?.membershipType] || "membership-basic"
                            }`}
                        >
                            ★ {member?.membershipType?.toUpperCase() || "BASIC"} MEMBER
                        </span>
                    </div>
                    <p className="member-email">✉ {member?.email || "member@fitzone.com"}</p>
                </div>

                <div className="member-quick-stats">
                    <div className="quick-stat">
                        <span className="stat-value">{bookings.length}</span>
                        <span className="stat-label">Total Reserved</span>
                    </div>
                    <div className="quick-stat">
                        <span className="stat-value">
                            {bookings.filter((b) => b.status === "booked").length}
                        </span>
                        <span className="stat-label">Active Upcoming</span>
                    </div>
                </div>
            </div>

            {/* Notification Banner */}
            {actionMsg && <div className="banner-info">ℹ️ {actionMsg}</div>}

            {/* Loading & Error States */}
            {loading && (
                <div className="state-card loading-card">
                    <div className="spinner"></div>
                    <p>Loading your gym schedule...</p>
                </div>
            )}

            {error && !loading && (
                <div className="state-card error-card">
                    <span className="state-icon">⚠️</span>
                    <div>
                        <strong>Unable to load bookings</strong>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* Bookings Content */}
            {!loading && !error && (
                <div className="bookings-section">
                    <div className="section-title-row">
                        <h2>Your Reserved Sessions</h2>
                        <Link to="/classes" className="btn-secondary-link">
                            + Book Another Class
                        </Link>
                    </div>

                    {bookings.length === 0 ? (
                        <div className="empty-state-card">
                            <span className="empty-icon">🧘</span>
                            <h3>No active gym class reservations</h3>
                            <p>
                                You haven't booked any classes yet. Browse our master trainers and reserve your next workout session today!
                            </p>
                            <Link to="/classes" className="btn-primary">
                                Explore Classes Now →
                            </Link>
                        </div>
                    ) : (
                        <div className="bookings-modern-grid">
                            {bookings.map((booking) => {
                                const trainerName = booking.trainerId?.name || "FitZone Coach";
                                const trainerSpec =
                                    booking.trainerId?.specialization || "General Fitness";
                                const formattedDate = booking.date
                                    ? new Date(booking.date).toLocaleDateString("en-US", {
                                          weekday: "short",
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric"
                                      })
                                    : "Scheduled Date";

                                return (
                                    <div
                                        key={booking._id}
                                        className={`modern-booking-card card-status-${booking.status}`}
                                    >
                                        <div className="booking-card-top">
                                            <div className="class-icon-wrapper">🏋️</div>
                                            <span className={`status-pill status-${booking.status}`}>
                                                {booking.status.toUpperCase()}
                                            </span>
                                        </div>

                                        <h3 className="booking-class-name">{booking.className}</h3>

                                        <div className="booking-meta-list">
                                            <div className="meta-item">
                                                <span className="meta-icon">👤</span>
                                                <div>
                                                    <span className="meta-label">Coach</span>
                                                    <span className="meta-text">
                                                        {trainerName} ({trainerSpec})
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="meta-item">
                                                <span className="meta-icon">📅</span>
                                                <div>
                                                    <span className="meta-label">Date</span>
                                                    <span className="meta-text">{formattedDate}</span>
                                                </div>
                                            </div>

                                            <div className="meta-item">
                                                <span className="meta-icon">⏰</span>
                                                <div>
                                                    <span className="meta-label">Time Slot</span>
                                                    <span className="meta-text">{booking.timeSlot}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {booking.status === "booked" && (
                                            <div className="booking-card-actions">
                                                <button
                                                    className="btn-cancel-modern"
                                                    onClick={() => handleCancelBooking(booking._id)}
                                                >
                                                    ✕ Cancel Reservation
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MyBookingsPage;