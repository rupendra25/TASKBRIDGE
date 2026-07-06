import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/layout.css";

function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="layout">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="main-content">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="page-content page-container">
          {children}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
