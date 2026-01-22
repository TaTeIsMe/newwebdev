import Comment from "../components/Comment";
import { useEffect, useState } from "react";
import "./Account.css";
import { baseUrl } from "../../config";

function Account() {
    const [comments, setComments] = useState([]);
    const [user, setUser] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [generalError, setGeneralError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [formData, setFormData] = useState({
        login: "",
        nickname: "",
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        fetch(baseUrl + `users/me`, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                setUser(data.user);
                setFormData({
                    login: data.user.login,
                    nickname: data.user.nickname,
                    password: "",
                    confirmPassword: "",
                });
            })
            .catch((err) => console.error("Error fetching user:", err));
    }, []);

    useEffect(() => {
        if (!user.id) return;
        fetch(
            baseUrl + `users/` + user.id +
                `/comments?page=1&count=20`,
        )
            .then((res) => res.json())
            .then((data) => setComments(data))
            .catch((err) => console.error("Error fetching comments:", err));
    }, [user.id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setGeneralError(null);
        setSuccessMessage(null);
        setValidationErrors({});

        const data = new FormData();
        data.append("login", formData.login);
        data.append("nickname", formData.nickname);
        if (formData.password !== "") {
            data.append("password", formData.password);
        }
        if (formData.confirmPassword !== "") {
            data.append("confirmPassword", formData.confirmPassword);
        }

        fetch(baseUrl + "users/" + user.id, {
            method: "PUT",
            body: data,
            credentials: "include",
        })
            .then(async (res) => {
                const body = await res.json();

                if (!res.ok) {
                    if (body.properties) setValidationErrors(body.properties);
                    if (body.status) setGeneralError(body.status);
                    return Promise.reject(body.status);
                }

                setSuccessMessage("Account updated successfully!");
            })
            .catch((err) => console.error("Error updating account:", err));
    };
    const handleDeleteComment = (deletedId) => {
        setComments((prev) =>
            prev.filter((comment) => comment.id !== deletedId)
        );
    };

    return (
        <>
            <div className="user-update-container">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h3>Edit Account</h3>

                    {generalError && (
                        <p className="error-message">{generalError}</p>
                    )}
                    {successMessage && (
                        <p className="success-message">{successMessage}</p>
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
                            placeholder="new password (optional)"
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

                    <button type="submit">Save Changes</button>
                </form>
            </div>
            <div className="account-comments-container">
                {comments.map((comment) => (
                    <Comment
                        comment={comment}
                        key={comment.id}
                        onDelete={handleDeleteComment}
                        loggedUser={user}
                    />
                ))}
            </div>
        </>
    );
}

export default Account;
