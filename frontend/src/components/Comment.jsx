import { useEffect, useState } from "react";
import "./Comment.css";
import { baseUrl } from "../../config";

function Comment({ comment, onDelete, loggedUser }) {
    const [user, setUser] = useState({});

    useEffect(() => {
        fetch(baseUrl + `users/` + comment.user_id)
            .then((res) => res.json())
            .then((data) => setUser(data))
            .catch((err) => console.error("Error fetching user:", err));
    }, []);

    const handleDelete = async () => {
        try {
            const response = await fetch(
                baseUrl + `comments/${comment.id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                },
            );
            if (!response.ok) throw new Error("Failed to delete comment");

            onDelete(comment.id);
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    return (
        <>
            <div className="comment-container">
                <div className="username">
                    {user.nickname}
                    {loggedUser && loggedUser.id === user.id &&
                        (
                            <button
                                className="delete-button"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        )}
                </div>
                <div className="comment-content">{comment.content}</div>
            </div>
        </>
    );
}

export default Comment;
