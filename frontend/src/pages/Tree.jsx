import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Comment from "../components/Comment";
import "./Tree.css";
import { baseUrl } from "../../config";

function Tree({ user }) {
    const navigate = useNavigate();
    const { id } = useParams();
    

    const [tree, setTree] = useState(null);
    const [comments, setComments] = useState([]);
    const [formData, setFormData] = useState({ comment: "" });
    const [error, setError] = useState(null);

    // Fetch comments safely
    useEffect(() => {
        fetch(baseUrl + `trees/` + id + `/comments?page=1&count=20`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch comments");
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setComments(data);
                } else {
                    setComments([]); // Fallback to empty array if server returns unexpected format
                }
            })
            .catch((err) => console.error("Error fetching comments:", err));
    }, [id]);

    // Fetch single tree safely
    useEffect(() => {
        fetch(baseUrl + `trees/` + id)
            .then((res) => {
                if (!res.ok) throw new Error("Tree not found or server error");
                return res.json();
            })
            .then((data) => setTree(data))
            .catch((err) => {
                console.error("Error fetching tree:", err);
                setError(err.message);
            });
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("content", formData.comment);

        fetch(baseUrl + "trees/" + id + "/comments", {
            method: "POST",
            body: data,
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) throw new Error("Could not post comment");
                return res.json();
            })
            .then((data) => {
                console.log("Comment Submitted:", data);
                setFormData({ comment: "" });
                
                // Re-fetch comments cleanly
                return fetch(baseUrl + `trees/${id}/comments?page=1&count=20`);
            })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setComments(data);
            })
            .catch((err) => console.error("Error posting comment:", err));
    };

    const handleDeleteComment = (deletedId) => {
        setComments((prev) => prev.filter((comment) => comment.id !== deletedId));
    };

    if (error) return <div className="error-message">Error: {error}</div>;
    if (!tree) return <div className="loading-message">Loading tree data...</div>;

    return (
        <div className="tree-page-container">
            <div className="tree-container">
                <div className="tree-title">
                    {tree.name}{" "}
                    {user && user.role === 0 && (
                        <button className="delete-button" onClick={() => navigate(`/trees/${tree.id}/edit`)}>
                            edit
                        </button>
                    )}
                </div>
                <img
                    className="tree-img"
                    src={tree.picture_path} 
                    alt={tree.name}
                />
                <div className="tree-desc">{tree.description}</div>
            </div>
            
            <div className="form-container">
                <h3>Leave a Comment</h3>
                <form className="comment-form" onSubmit={handleSubmit}>
                    <TextareaAutosize
                        placeholder="Write your comment..."
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        required
                    />
                    <button type="submit">Submit</button>
                </form>
            </div>
            
            <div className="comments-container">
                {comments.map((comment) => (
                    <Comment comment={comment} key={comment.id} onDelete={handleDeleteComment} loggedUser={user} />
                ))}
            </div>
        </div>
    );
}

export default Tree;