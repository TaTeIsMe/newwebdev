import './TreeCard.css'
import { useNavigate } from 'react-router-dom';

function TreeCard({ tree }) {
    const navigate = useNavigate();

    return (
        <div className="tree-card" onClick={() => navigate('/trees/' + tree.id)}>
            <div className="tree-image">
                <img src={tree.picture_path} alt={tree.name} />
            </div>
            <div className="tree-info">
                <h3>{tree.name}</h3>
            </div>
        </div>
    );
}

export default TreeCard;