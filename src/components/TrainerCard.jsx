function TrainerCard({ name, specialization, available }) {
    const availabilityMap = {
        true: "Available",
        false: "Fully Booked"
    };

    // Extract initials for the modern avatar
    const initials = name
        ? name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
        : "TR";

    return (
        <div className={`trainer-card ${available ? "card-available" : "card-booked"}`}>
            <div className="trainer-card-top">
                <div className="trainer-avatar">
                    <span>{initials}</span>
                </div>
                <span className={`status-pill ${available ? "available" : "fully-booked"}`}>
                    <span className="status-dot"></span>
                    {availabilityMap[available]}
                </span>
            </div>

            <div className="trainer-info">
                <h3>{name}</h3>
                <div className="specialization-tag">
                    <span className="spec-icon">🎯</span>
                    <span>{specialization}</span>
                </div>
            </div>

            <div className="trainer-card-footer">
                <span className="trainer-type">Certified Pro Coach</span>
            </div>
        </div>
    );
}

export default TrainerCard;