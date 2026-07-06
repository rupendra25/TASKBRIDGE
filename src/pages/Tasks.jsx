import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../services/api";
import MainLayout from "../layouts/MainLayout";

function Tasks() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "Medium",
    deadline: "",
    status: "Pending"
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data);
      if (res.data.length > 0) {
        setProjectId(res.data[0].id);
        fetchTasks(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    }
  };

  const fetchTasks = async (pId = projectId) => {
    if (!pId) return;
    try {
      setLoading(true);
      const res = await API.get(`/tasks/${pId}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (e) => {
    const newId = e.target.value;
    setProjectId(newId);
    fetchTasks(newId);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await API.delete(`/tasks/${id}`);
        toast.success("Task deleted successfully");
        fetchTasks();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete task");
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/tasks/${id}`, { status: newStatus });
      toast.success("Task status updated");
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        assigned_to: task.assigned_to || "",
        priority: task.priority || "Medium",
        deadline: task.deadline ? task.deadline.substring(0, 10) : "",
        status: task.status || "Pending"
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: "",
        description: "",
        assigned_to: "",
        priority: "Medium",
        deadline: "",
        status: "Pending"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await API.put(`/tasks/${editingTask.id}`, formData);
        toast.success("Task updated successfully");
      } else {
        await API.post("/tasks", { ...formData, project_id: projectId });
        toast.success("Task created successfully");
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error(editingTask ? "Failed to update task" : "Failed to create task");
    }
  };

  const filteredTasks = tasks.filter((t) => 
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="page-header">
        <h1>Tasks</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} disabled={!projectId}>
          <FaPlus /> New Task
        </button>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontWeight: 500 }}>Select Project:</label>
          <select className="input-field" style={{ width: "250px" }} value={projectId} onChange={handleProjectChange}>
            {projects.length === 0 && <option value="">No projects available</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.project_name}</option>
            ))}
          </select>
        </div>

        <div style={{ position: "relative", width: "300px" }}>
          <FaSearch style={{ position: "absolute", left: "10px", top: "12px", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: "35px" }}
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Assigned User</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Deadline</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{task.title}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{task.description}</div>
                    </td>
                    <td>{task.assigned_to || "Unassigned"}</td>
                    <td>
                      <span className={`badge badge-${task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'info'}`}>
                        {task.priority || "Medium"}
                      </span>
                    </td>
                    <td>
                      <select 
                        className="input-field" 
                        style={{ padding: "4px 8px", width: "auto", fontSize: "12px" }}
                        value={task.status || "Pending"}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td>{task.deadline ? new Date(task.deadline).toLocaleDateString() : "N/A"}</td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-outline" style={{ padding: "6px", marginRight: "8px" }} onClick={() => handleOpenModal(task)} title="Edit">
                        <FaEdit style={{ color: "var(--primary)" }} />
                      </button>
                      <button className="btn btn-outline" style={{ padding: "6px" }} onClick={() => handleDelete(task.id)} title="Delete">
                        <FaTrash style={{ color: "var(--danger)" }} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No tasks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingTask ? "Edit Task" : "Create New Task"}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Assigned User ID</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    className="input-field"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTask ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Tasks;
