function TrainerCard({ name, specialization, available }) {
    return (
        <div className="trainer-card">
            <h3>{name}</h3>

            <p>
                <strong>Specialization:</strong>{" "}
                {specialization}
            </p>

            <p className={available ? "available" : "fully-booked"}>
                {available ? "Available" : "Fully Booked"}
            </p>
        </div>
    );
}

export default TrainerCard;