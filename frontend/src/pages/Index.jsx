import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"; // Import this
import { baseUrl } from "../../config";
import TreeCard from "../components/TreeCard";
import './Index.css';

function Index() {
    const [trees, setTrees] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    
    const page = parseInt(searchParams.get("page") || "1", 10);
    const count = 20;

    useEffect(() => {
        fetch(baseUrl + `trees?page=${page}&count=${count}`)
            .then(res => res.json())
            .then(data => setTrees(data))
            .catch(err => console.error("Error fetching trees:", err));
    }, [page, count]);

    const nextPage = () => setSearchParams({ page: page + 1 });
    const prevPage = () => setSearchParams({ page: Math.max(1, page - 1) });

    return (
        <>
            <div className="pagination-container">
                <button onClick={prevPage} disabled={page === 1}>{"<"}</button>
                <span className="pagination-page">{page}</span>
                <button onClick={nextPage} disabled={trees.length < count}>{">"}</button>
            </div>

            <div className="tree-grid">
                {trees.map((tree) => (
                    <TreeCard tree={tree} key={tree.id} />
                ))}
            </div>
        </>
    );
}

export default Index;