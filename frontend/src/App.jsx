import "./App.css";
import EditTree from "./pages/EditTree";
import Index from "./pages/Index";
import Tree from "./pages/Tree";
import AddTree from "./pages/AddTree";
import Account from "./pages/Account";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Route, Routes, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import { baseUrl } from "../config";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(baseUrl + "users/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {if (data.loggedIn) setUser(data.user)})
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

  return (
    <main className="main-content">
      <Header user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/trees/:id/edit" element={<EditTree />} />
        <Route path="/trees/:id" element={<Tree user={user} />} />
        <Route path="/addtree" element={<AddTree />} />
        <Route path="/account" element={<Account />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </main>
  );
}

export default App;
