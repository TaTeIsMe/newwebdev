import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Login.css";
import { baseUrl } from "../../config";
import { Link } from "react-router-dom";

function Login({ setUser }) {
    const navigate = useNavigate();
    const [validationErrors, setValidationErrors] = useState({});
    const [generalError, setGeneralError] = useState("");

    const [formData, setFormData] = useState({
        login: "",
        password: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setGeneralError(null);

        const data = new FormData();
        data.append("login", formData.login);
        data.append("password", formData.password);

        fetch(baseUrl + "users/login", {
            method: "POST",
            body: data,
            credentials: "include",
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json();
                    if (errData.properties) {
                        setValidationErrors(errData.properties);
                    }
                    if (errData.status) setGeneralError(errData.status);
                    return Promise.reject(errData.status);
                }

                return res.json();
            })
            .then(() =>
                fetch(baseUrl + `users/me`, {
                    credentials: "include",
                })
                    .then((res) => res.json())
                    .then((data) => setUser(data.user))
                    .catch((err) => console.error("Error fetching user:", err))
            )
            .then(() => navigate("/"))
            .catch((err) => console.error("Error logging in:", err));
    };

    return (
        <>
            <div className="login-container">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h3>Log in</h3>
                    {generalError && (
                        <p className="error-message">{generalError}</p>
                    )}
                    <label>
                        <input
                            type="text"
                            value={formData.login}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    login: e.target.value,
                                });
                                setValidationErrors({
                                    ...validationErrors,
                                    login: null,
                                });
                            }}
                            placeholder="login"
                        />
                    </label>
                    {validationErrors.login && (
                        <p className="error-message">
                            {validationErrors.login.errors[0]}
                        </p>
                    )}
                    <label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                });
                                setValidationErrors({
                                    ...validationErrors,
                                    password: null,
                                });
                            }}
                            placeholder="password"
                        />
                    </label>
                    {validationErrors.password && (
                        <p className="error-message">
                            {validationErrors.password.errors[0]}
                        </p>
                    )}

                    <button type="submit">Submit</button>
                </form>
                <Link to="/register" className="register-link">
                    Register
                </Link>
            </div>
        </>
    );
}

export default Login;
