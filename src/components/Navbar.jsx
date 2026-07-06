import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaBell, FaSignOutAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import API from "../services/api";

function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userInitials, setUserInitials] = useState("U");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.name) {
          setUserInitials(user.name.charAt(0).toUpperCase());
        }
      } catch (e) {
        console.error("Error parsing user from localStorage");
      }
    }

    fetchNotifications();

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl);

    const addNotification = (message) => {
      const newNotif = {
        id: Date.now(),
        action: message,
        created_at: new Date().toISOString(),
        name: "System",
        unread: true
      };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on("taskCompleted", (data) => addNotification(`Task "${data.taskTitle}" completed by ${data.completedBy}`));
    socket.on("taskAssigned", (data) => addNotification(data.message));
    socket.on("memberAdded", (data) => addNotification(`New member added`));
    socket.on("taskCreated", (data) => addNotification(`Task created: ${data.title || "Unknown"}`));
    socket.on("taskUpdated", (data) => addNotification(`Task updated`));

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      socket.disconnect();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/activity");
      const fetched = res.data.slice(0, 10).map(n => ({...n, unread: false}));
      setNotifications(fetched);
      setUnreadCount(0); 
    } catch (err) {
      console.error(err);
      setNotifications([]);
    }
  };

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Mark all as read when opening
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({...n, unread: false})));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.info("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="navbar">
      <div className="navbar-brand" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <FaBars className="nav-icon" onClick={toggleSidebar} style={{ display: "none" }} />
        <img src="/logo.png" alt="TaskBridge Logo" style={{ height: "24px", width: "24px", borderRadius: "4px" }} />
        <span style={{ display: "inline-block" }}>Project Dashboard</span>
      </div>
      <div className="navbar-actions">
        
        <div style={{ position: "relative", display: "flex", alignItems: "center" }} ref={dropdownRef}>
          <div onClick={handleBellClick} style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <FaBell className="nav-icon" />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                background: "red",
                color: "white",
                borderRadius: "50%",
                padding: "2px 6px",
                fontSize: "10px",
                fontWeight: "bold"
              }}>
                {unreadCount}
              </span>
            )}
          </div>

          {showNotifications && (
            <div style={{
              position: "absolute",
              top: "40px",
              right: "-10px",
              width: "320px",
              maxHeight: "300px",
              overflowY: "auto",
              background: "white",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              zIndex: 1000,
              padding: "10px 0",
              textAlign: "left"
            }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-color)", fontWeight: "bold" }}>
                Notifications
              </div>
              {notifications.length > 0 ? (
                notifications.map((notif, index) => (
                  <div key={notif.id || index} style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border-color)",
                    backgroundColor: notif.unread ? "#EFF6FF" : "transparent"
                  }}>
                    <p style={{ margin: 0, fontSize: "14px", color: "var(--text-main)", lineHeight: "1.4" }}>
                      <strong>{notif.name}</strong> {notif.action}
                    </p>
                    <small style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px", display: "block" }}>
                      {new Date(notif.created_at).toLocaleString()}
                    </small>
                  </div>
                ))
              ) : (
                <div style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)" }}>
                  No Notifications
                </div>
              )}
            </div>
          )}
        </div>

        <div className="user-avatar">{userInitials}</div>
        <button className="btn btn-outline" onClick={logout} style={{ padding: "6px 12px" }}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
