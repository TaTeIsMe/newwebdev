import "./Header.css";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../config";

function Header({user, setUser}) {
  const navigate = useNavigate();

  return (
    <header className="header">
      <h1 className="logo" onClick={() => navigate("/")}>Tree App</h1>
      <nav className="nav">
        <button className="nav-btn" onClick={() => navigate("/")}>Trees</button>
        {user && user.role === 0 &&
          (
            <button className="nav-btn" onClick={() => navigate("/addtree")}>
              Add Tree
            </button>
          )}
        {user &&
          (
            <button className="nav-btn" onClick={() => navigate("/Account")}>
              Account
            </button>
          )}
        {user &&
          (
            <button
              className="nav-btn"
              onClick={async () => {
                try {
                  const response = await fetch(
                    baseUrl + "users/logout",
                    {
                      method: "POST",
                      credentials: "include",
                    },
                  );

                  if (!response.ok) {
                    throw new Error("Logout failed");
                  }

                  setUser(null);

                  navigate("/");
                } catch (error) {
                  console.error("Logout error:", error);
                  alert("Logout failed. Please try again.");
                }
              }}
            >
              Log out
            </button>
          )}
        {!user &&
          (
            <button className="nav-btn" onClick={() => navigate("/Login")}>
              Log in
            </button>
          )}
      </nav>
    </header>
  );
}

export default Header;
