import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Login.css";
import { baseUrl } from "../../config";

function Register() {
    const navigate = useNavigate();
    const [validationErrors, setValidationErrors] = useState({});
    const [generalError, setGeneralError] = useState("");

    const [formData, setFormData] = useState({
        nickname: "",
        login: "",
        password: "",
        confirmPassword: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setGeneralError(null);

        const data = new FormData();
        data.append("login", formData.login);
        data.append("nickname", formData.nickname);
        data.append("password", formData.password);
        data.append("confirmPassword", formData.confirmPassword);

        fetch(baseUrl + "users/register", {
            method: "POST",
            body: data,
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json();
                    if (errData.properties) {
                        setValidationErrors(errData.properties);
                    }
                    if (errData.error) setGeneralError(errData.error);
                }

                return res.json();
            }).then(() => navigate("/Login"))
            .catch((err) => console.error("Error logging in:", err));
    };

    return (
        <>
            <div className="login-container">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h3>Register</h3>
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
                            type="text"
                            value={formData.nickname}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    nickname: e.target.value,
                                });
                                setValidationErrors({
                                    ...validationErrors,
                                    nickname: null,
                                });
                            }}
                            placeholder="nickname"
                        />
                    </label>
                    {validationErrors.nickname && (
                        <p className="error-message">
                            {validationErrors.nickname.errors[0]}
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

                    <label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    confirmPassword: e.target.value,
                                });
                                setValidationErrors({
                                    ...validationErrors,
                                    confirmPassword: null,
                                });
                            }}
                            placeholder="confirm password"
                        />
                    </label>
                    {validationErrors.confirmPassword && (
                        <p className="error-message">
                            {validationErrors.confirmPassword.errors[0]}
                        </p>
                    )}

                    <button type="submit">Submit</button>
                </form>
            </div>
        </>
    );
}

export default Register;
