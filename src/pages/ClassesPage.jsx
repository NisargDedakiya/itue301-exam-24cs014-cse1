import { useState, useEffect } from "react";
import TrainerCard from "../components/TrainerCard";
import { useAuth } from "../context/AuthContext";

function ClassesPage() {
    const { token } = useAuth();

    // Three mandatory states for Task 4
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Client-side search filter state for Task 4
    const [searchSpecialization, setSearchSpecialization] = useState("");

    // Form state variables managed with useState for Task 2
    const [selectedTrainerId, setSelectedTrainerId] = useState("");
    const [selectedTrainerName, setSelectedTrainerName] = useState("");
    const [className, setClassName] = useState("");
    const [date, setDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [bookingStatusMsg, setBookingStatusMsg] = useState("");
    const [bookingSubmitting, setBookingSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Task 4: Fetch trainers via GET /api/v1/trainers on mount
    useEffect(() => {
        let isMounted = true;

        async function fetchTrainers() {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch("http://localhost:5000/api/v1/trainers");
                if (!response.ok) {
                    throw new Error(`Failed to fetch trainers (Status: ${response.status})`);
                }
                const json = await response.json();
                if (isMounted) {
                    setTrainers(json.data || json);
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Trainer fetch error:", err);
                    setError(err.message || "Failed to load trainers");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchTrainers();

        return () => {
            isMounted = false;
        };
    }, []);

    // Task 4: Client-side search input filtering the already-fetched trainers array by specialization
    const filteredTrainers = trainers.filter((trainer) => {
        if (!searchSpecialization.trim()) return true;
        return trainer.specialization
            ?.toLowerCase()
            .includes(searchSpecialization.toLowerCase().trim());
    });

    // Handler when trainer selection changes
    function handleTrainerSelect(e) {
        const trainerId = e.target.value;
        setSelectedTrainerId(trainerId);
        if (formErrors.trainer) {
            setFormErrors((prev) => ({ ...prev, trainer: null }));
        }

        const foundTrainer = trainers.find((t) => (t._id || t.id) === trainerId || t.name === trainerId);
        if (foundTrainer) {
            setSelectedTrainerName(foundTrainer.name);
        } else {
            setSelectedTrainerName(trainerId);
        }
    }

    // Input Validation Function for Booking Form
    function validateBookingForm() {
        const errors = {};

        if (!selectedTrainerId) {
            errors.trainer = "Please select an available trainer";
        }

        if (!className || className.trim().length < 2) {
            errors.className = "Class name is required and must contain at least 2 characters";
        }

        if (!date) {
            errors.date = "Please select a date for the class";
        } else {
            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                errors.date = "Booking date cannot be in the past. Please select today or a future date.";
            }
        }

        if (!timeSlot) {
            errors.timeSlot = "Please choose a class time slot";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }

    // Booking form submission
    async function handleSubmit(event) {
        event.preventDefault();
        setBookingStatusMsg("");

        if (!validateBookingForm()) {
            return;
        }

        setBookingSubmitting(true);

        try {
            const foundTrainer = trainers.find(
                (t) => (t._id || t.id) === selectedTrainerId || t.name === selectedTrainerName
            );
            const actualTrainerId = foundTrainer?._id || selectedTrainerId;

            const response = await fetch("http://localhost:5000/api/v1/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    trainerId: actualTrainerId,
                    className: className.trim(),
                    date,
                    timeSlot
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorDetail = data.errors ? data.errors.join(", ") : data.message;
                throw new Error(errorDetail || "Failed to create booking");
            }

            setBookingStatusMsg(`Success! Class "${className}" booked with ${selectedTrainerName} on ${date} at ${timeSlot}.`);
            // Reset form fields
            setClassName("");
            setDate("");
            setTimeSlot("");
            setSelectedTrainerId("");
            setSelectedTrainerName("");
            setFormErrors({});
        } catch (err) {
            setBookingStatusMsg(`Booking notice: ${err.message}`);
        } finally {
            setBookingSubmitting(false);
        }
    }

    const minDateString = new Date().toISOString().split("T")[0];

    const quickFilters = ["All", "Strength", "Yoga", "Cardio", "Pilates", "CrossFit"];

    return (
        <div className="page-container">
            {/* Header Hero */}
            <div className="section-hero">
                <div className="hero-badge">⚡ Live Scheduling Studio</div>
                <h1>Explore Classes & Master Trainers</h1>
                <p className="hero-subtitle">
                    Select a certified coach, choose an optimal workout slot, and secure your session.
                </p>
            </div>

            {/* Quick Filter & Search Bar */}
            <div className="filter-panel">
                <div className="search-input-group">
                    <span className="search-icon">🔍</span>
                    <input
                        id="search-input"
                        type="text"
                        value={searchSpecialization}
                        onChange={(e) => setSearchSpecialization(e.target.value)}
                        placeholder="Search trainers by specialty (e.g. Yoga, Strength, Cardio)..."
                    />
                    {searchSpecialization && (
                        <button
                            className="search-clear-btn"
                            onClick={() => setSearchSpecialization("")}
                            title="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="quick-filter-chips">
                    {quickFilters.map((qf) => (
                        <button
                            key={qf}
                            className={`chip-btn ${
                                (qf === "All" && !searchSpecialization) ||
                                (qf !== "All" && searchSpecialization.toLowerCase() === qf.toLowerCase())
                                    ? "chip-active"
                                    : ""
                            }`}
                            onClick={() => setSearchSpecialization(qf === "All" ? "" : qf)}
                        >
                            {qf}
                        </button>
                    ))}
                </div>
            </div>

            {/* Trainer Roster Section */}
            <div className="roster-header">
                <h2>Certified Coaches ({filteredTrainers.length})</h2>
                <span className="roster-badge">
                    {filteredTrainers.filter((t) => t.available).length} Available Now
                </span>
            </div>

            {/* Loading Indicator */}
            {loading && (
                <div className="state-card loading-card">
                    <div className="spinner"></div>
                    <p>Loading trainer availability from FitZone API...</p>
                </div>
            )}

            {/* Error Indicator */}
            {error && !loading && (
                <div className="state-card error-card">
                    <span className="state-icon">⚠️</span>
                    <div>
                        <strong>Connection Notice</strong>
                        <p>{error}</p>
                        <span className="subtext">Ensure backend is running at http://localhost:5000</span>
                    </div>
                </div>
            )}

            {/* Trainer Grid */}
            {!loading && !error && (
                <div className="trainer-list">
                    {filteredTrainers.length > 0 ? (
                        filteredTrainers.map((trainer) => (
                            <TrainerCard
                                key={trainer._id || trainer.name}
                                name={trainer.name}
                                specialization={trainer.specialization}
                                available={trainer.available}
                            />
                        ))
                    ) : (
                        <div className="no-data-card">
                            <span className="no-data-icon">🧐</span>
                            <h3>No trainers match "{searchSpecialization}"</h3>
                            <p>Try clearing your filter to view all certified trainers.</p>
                            <button
                                className="btn-secondary"
                                onClick={() => setSearchSpecialization("")}
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Class Booking Section */}
            <div className="booking-section-wrapper">
                <div className="booking-form-card">
                    <div className="form-card-header">
                        <span className="form-badge">📅 Reservation Form</span>
                        <h2>Book a Workout Class</h2>
                        <p>Fill in the class details to schedule your slot</p>
                    </div>

                    {bookingStatusMsg && (
                        <div
                            className={
                                bookingStatusMsg.startsWith("Success")
                                    ? "banner-success"
                                    : "banner-warning"
                            }
                        >
                            {bookingStatusMsg.startsWith("Success") ? "🎉 " : "⚠️ "}
                            {bookingStatusMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="trainer-select">Select Trainer</label>
                            <select
                                id="trainer-select"
                                value={selectedTrainerId}
                                onChange={handleTrainerSelect}
                                className={formErrors.trainer ? "input-error" : ""}
                            >
                                <option value="">-- Choose an available coach --</option>
                                {trainers
                                    .filter((trainer) => trainer.available)
                                    .map((trainer) => (
                                        <option
                                            key={trainer._id || trainer.name}
                                            value={trainer._id || trainer.name}
                                        >
                                            {trainer.name} — {trainer.specialization}
                                        </option>
                                    ))}
                            </select>
                            {formErrors.trainer && (
                                <span className="field-error-text">{formErrors.trainer}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="classname-input">Class Program Name</label>
                            <input
                                id="classname-input"
                                type="text"
                                value={className}
                                onChange={(event) => {
                                    setClassName(event.target.value);
                                    if (formErrors.className) setFormErrors({ ...formErrors, className: null });
                                }}
                                className={formErrors.className ? "input-error" : ""}
                                placeholder="e.g. Power Lifting, Vinyasa Flow, HIIT Cardio"
                            />
                            {formErrors.className && (
                                <span className="field-error-text">{formErrors.className}</span>
                            )}
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label htmlFor="date-input">Session Date</label>
                                <input
                                    id="date-input"
                                    type="date"
                                    min={minDateString}
                                    value={date}
                                    onChange={(event) => {
                                        setDate(event.target.value);
                                        if (formErrors.date) setFormErrors({ ...formErrors, date: null });
                                    }}
                                    className={formErrors.date ? "input-error" : ""}
                                />
                                {formErrors.date && (
                                    <span className="field-error-text">{formErrors.date}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="timeslot-select">Time Slot</label>
                                <select
                                    id="timeslot-select"
                                    value={timeSlot}
                                    onChange={(event) => {
                                        setTimeSlot(event.target.value);
                                        if (formErrors.timeSlot) setFormErrors({ ...formErrors, timeSlot: null });
                                    }}
                                    className={formErrors.timeSlot ? "input-error" : ""}
                                >
                                    <option value="">-- Choose Time --</option>
                                    <option value="06:00 AM - 07:00 AM">06:00 AM - 07:00 AM</option>
                                    <option value="07:00 AM - 08:00 AM">07:00 AM - 08:00 AM</option>
                                    <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                                    <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                                    <option value="07:00 PM - 08:00 PM">07:00 PM - 08:00 PM</option>
                                </select>
                                {formErrors.timeSlot && (
                                    <span className="field-error-text">{formErrors.timeSlot}</span>
                                )}
                            </div>
                        </div>

                        <button type="submit" className="btn-primary-large" disabled={bookingSubmitting}>
                            {bookingSubmitting ? "Confirming Reservation..." : "Confirm Booking Now ✨"}
                        </button>
                    </form>
                </div>

                {/* Live Preview Card */}
                <div className="preview-side">
                    <div className="live-preview-card">
                        <div className="preview-card-header">
                            <span className="live-indicator">LIVE</span>
                            <h3>Selected Booking Summary</h3>
                        </div>

                        <div className="preview-body">
                            <div className="preview-row">
                                <span className="preview-label">Coach</span>
                                <span className="preview-value highlight-value">
                                    {selectedTrainerName || "Not selected yet"}
                                </span>
                            </div>
                            <div className="preview-row">
                                <span className="preview-label">Program</span>
                                <span className="preview-value">
                                    {className || "Not entered yet"}
                                </span>
                            </div>
                            <div className="preview-row">
                                <span className="preview-label">Date</span>
                                <span className="preview-value">
                                    {date ? new Date(date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : "Not selected"}
                                </span>
                            </div>
                            <div className="preview-row">
                                <span className="preview-label">Time Slot</span>
                                <span className="preview-value highlight-value">
                                    {timeSlot || "Not selected"}
                                </span>
                            </div>
                        </div>

                        <div className="preview-footer">
                            <span className="preview-badge">Instant Sync with Gym Roster</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClassesPage;