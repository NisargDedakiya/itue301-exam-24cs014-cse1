import { useState } from "react";
import TrainerCard from "../components/TrainerCard";

function ClassesPage() {
    const trainers = [
        {
            name: "Rahul Patel",
            specialization: "Strength Training",
            available: true
        },
        {
            name: "Priya Shah",
            specialization: "Yoga",
            available: false
        },
        {
            name: "Amit Shah",
            specialization: "Cardio Training",
            available: true
        }
    ];

    const [selectedTrainer, setSelectedTrainer] = useState("");
    const [className, setClassName] = useState("");
    const [date, setDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("");

    function handleSubmit(event) {
        event.preventDefault();

        alert(
            `Booking created!\nTrainer: ${selectedTrainer}\nClass: ${className}\nDate: ${date}\nTime: ${timeSlot}`
        );
    }

    return (
        <div className="page">
            <h1>FitZone Classes</h1>

            <h2>Our Trainers</h2>

            <div className="trainer-list">
                {trainers.map((trainer) => (
                    <TrainerCard
                        key={trainer.name}
                        name={trainer.name}
                        specialization={trainer.specialization}
                        available={trainer.available}
                    />
                ))}
            </div>

            <hr />

            <h2>Book a Class</h2>

            <form onSubmit={handleSubmit}>

                <div className="form-group">
                    <label>Trainer</label>

                    <select
                        value={selectedTrainer}
                        onChange={(event) =>
                            setSelectedTrainer(event.target.value)
                        }
                        required
                    >
                        <option value="">
                            Select a trainer
                        </option>

                        {trainers
                            .filter((trainer) => trainer.available)
                            .map((trainer) => (
                                <option
                                    key={trainer.name}
                                    value={trainer.name}
                                >
                                    {trainer.name}
                                </option>
                            ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Class Name</label>

                    <input
                        type="text"
                        value={className}
                        onChange={(event) =>
                            setClassName(event.target.value)
                        }
                        placeholder="Example: Strength Training"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Date</label>

                    <input
                        type="date"
                        value={date}
                        onChange={(event) =>
                            setDate(event.target.value)
                        }
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Time Slot</label>

                    <select
                        value={timeSlot}
                        onChange={(event) =>
                            setTimeSlot(event.target.value)
                        }
                        required
                    >
                        <option value="">
                            Select time slot
                        </option>

                        <option value="07:00 AM - 08:00 AM">
                            07:00 AM - 08:00 AM
                        </option>

                        <option value="09:00 AM - 10:00 AM">
                            09:00 AM - 10:00 AM
                        </option>

                        <option value="05:00 PM - 06:00 PM">
                            05:00 PM - 06:00 PM
                        </option>

                        <option value="07:00 PM - 08:00 PM">
                            07:00 PM - 08:00 PM
                        </option>
                    </select>
                </div>

                <button type="submit">
                    Book Class
                </button>

            </form>

            {(selectedTrainer || timeSlot) && (
                <div className="booking-preview">

                    <h3>Selected Booking</h3>

                    <p>
                        <strong>Trainer:</strong>{" "}
                        {selectedTrainer || "Not selected"}
                    </p>

                    <p>
                        <strong>Time Slot:</strong>{" "}
                        {timeSlot || "Not selected"}
                    </p>

                </div>
            )}
        </div>
    );
}

export default ClassesPage;