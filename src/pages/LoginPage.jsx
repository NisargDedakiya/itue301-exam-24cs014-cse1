import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleSubmit(event) {
        event.preventDefault();

        const member = {
            name: "Test Member",
            email: email
        };

        const token = "demo-token";

        const role = "member";

        login(member, token, role);

        navigate("/classes");
    }

    return (
        <div className="page">
            <h1>FitZone Gym</h1>

            <h2>Member Login</h2>

            <form onSubmit={handleSubmit}>

                <p>Email</p>

                <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                    placeholder="Enter your email"
                    required
                />

                <p>Password</p>

                <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    required
                />

                <br />
                <br />

                <button type="submit">
                    Login
                </button>

            </form>
        </div>
    );
}

export default LoginPage;