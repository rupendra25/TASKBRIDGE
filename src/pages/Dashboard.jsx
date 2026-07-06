import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import API from "../services/api";
import DashboardCard from "../components/DashboardCard";
import MainLayout from "../layouts/MainLayout";
import "../styles/dashboard.css";

function Dashboard() {
  const [data, setData] = useState({});
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    
    // Connect to Socket.IO
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl);
    
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });
    
    socket.on("taskCreated", (task) => {
      toast.info(`New task created: ${task.title || 'Unknown Task'}`);
      fetchDashboard(); // Refresh data
    });

    socket.on("taskUpdated", (task) => {
      toast.info(`Task updated: ${task.title || 'Unknown Task'}`);
      fetchDashboard();
    });

    socket.on("memberAdded", (member) => {
      toast.success(`New member added`);
      fetchDashboard();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await API.get("/dashboard");
      setData(res.data);
      // Ensure we extract recentTasks if returned by backend, else mock for display purposes
      setRecentTasks(res.data.recentTasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="page-header">
        <h1>Dashboard Overview</h1>
      </div>

      <div className="dashboard-cards">
        <DashboardCard title="Projects" count={data.totalProjects} />
        <DashboardCard title="Tasks" count={data.totalTasks} />
        <DashboardCard title="Completed" count={data.completedTasks} />
        <DashboardCard title="Pending" count={data.pendingTasks} />
        <DashboardCard title="Users" count={data.totalUsers} />
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <div className="section-header">Recent Tasks</div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks && recentTasks.length > 0 ? (
                  recentTasks.map((task, idx) => (
                    <tr key={idx}>
                      <td>{task.title}</td>
                      <td>
                        <span className={`badge badge-${task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'info' : 'warning'}`}>
                          {task.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'info'}`}>
                          {task.priority || 'Medium'}
                        </span>
                      </td>
                      <td>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>No recent tasks available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">Activity Feed</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.map((act, idx) => (
                <div key={idx} style={{ padding: "10px", borderBottom: "1px solid var(--border-color)" }}>
                  <p style={{ fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>{act.action}</p>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{new Date(act.createdAt).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No recent activity to display.</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
