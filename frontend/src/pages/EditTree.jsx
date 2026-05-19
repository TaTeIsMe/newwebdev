import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditTree.css";
import TextareaAutosize from "react-textarea-autosize";
import { baseUrl } from "../../config";

function EditTree() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });

    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [validationErrors, setValidationErrors] = useState({});
    const [generalError, setGeneralError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetch(`${baseUrl}trees/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch tree");
                return res.json();
            })
            .then(data => {
                setFormData({
                    name: data.name || "",
                    description: data.description || ""
                });
                if (data.picture_path) {
                    setPreviewUrl(tree.picture_path);
                }
            })
            .catch(err => {
                setGeneralError("Error loading tree data");
                console.error(err);
            });
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        setValidationErrors({
            ...validationErrors,
            [name]: null,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));

        setValidationErrors({
            ...validationErrors,
            image: null,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setGeneralError("");
        setSuccessMessage("");
        setValidationErrors({});

        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("description", formData.description);
        if (imageFile) payload.append("image", imageFile);

        const res = await fetch(`${baseUrl}trees/${id}`, {
            method: "PUT",
            body: payload,
            credentials: "include"
        });

        const body = await res.json();

        if (!res.ok) {
            if (body.properties) setValidationErrors(body.properties);
            if (body.error) setGeneralError(body.status);
            return;
        }

        setSuccessMessage("Tree updated successfully!");
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this tree?")) return;

        const res = await fetch(`${baseUrl}trees/${id}`, {
            method: "DELETE",
            credentials: "include"
        });

        if (!res.ok) {
            alert("Failed to delete the tree");
            return;
        }

        navigate("/");
    };

    return (
        <div className="tree-page-container">
            <div className="tree-container">
                <div className="tree-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {formData.name}
                    <button
                        type="button"
                        className="delete-button"
                        onClick={handleDelete}
                        title="Delete Tree"
                    >
                        🗑
                    </button>
                </div>

                {generalError && (
                    <p className="error-message">{generalError}</p>
                )}

                {successMessage && (
                    <p className="success-message">{successMessage}</p>
                )}

                <form onSubmit={handleSubmit} className="tree-form">

                    <label>Tree Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Oak"
                    />
                    {validationErrors.name && (
                        <p className="error-message">
                            {validationErrors.name.errors[0]}
                        </p>
                    )}

                    <label>Description:</label>
                    <TextareaAutosize
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Description..."
                    />
                    {validationErrors.description && (
                        <p className="error-message">
                            {validationErrors.description.errors[0]}
                        </p>
                    )}

                    <label>Upload Image:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {validationErrors.image && (
                        <p className="error-message">
                            {validationErrors.image.errors[0]}
                        </p>
                    )}

                    <button type="submit" className="submit-btn">
                        Save Changes
                    </button>
                </form>

                {previewUrl && (
                    <img
                        className="tree-img preview"
                        src={previewUrl}
                        alt="Preview"
                    />
                )}
            </div>
        </div>
    );
}

export default EditTree;
