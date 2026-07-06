import { Link, useLocation } from "react-router-dom";
import { FaProjectDiagram, FaTasks, FaUsers, FaChartLine } from "react-icons/fa";

function Sidebar({ isOpen }) {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <FaChartLine /> },
    { name: "Projects", path: "/projects", icon: <FaProjectDiagram /> },
    { name: "Tasks", path: "/tasks", icon: <FaTasks /> },
    { name: "Members", path: "/members", icon: <FaUsers /> },
    { name: "Activity", path: "/activity", icon: <FaChartLine /> }
  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <img src="/logo.png" alt="TaskBridge Logo" style={{ height: "32px", width: "32px", borderRadius: "6px" }} />
        <span>TaskBridge</span>
      </div>
      <div className="sidebar-links">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
