import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../services/api";
import MainLayout from "../layouts/MainLayout";

function Members() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "team_member"
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
        fetchMembers(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    }
  };

  const fetchMembers = async (pId = projectId) => {
    if (!pId) return;
    try {
      setLoading(true);
      const res = await API.get(`/members/${pId}`);
      setMembers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (e) => {
    const newId = e.target.value;
    setProjectId(newId);
    fetchMembers(newId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/members", { ...formData, project_id: projectId });
      toast.success("Member added successfully");
      setIsModalOpen(false);
      setFormData({ email: "", role: "team_member" });
      fetchMembers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add member");
    }
  };

  return (
    <MainLayout>
      <div className="page-header">
        <h1>Project Members</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} disabled={!projectId}>
          <FaPlus /> Add Member
        </button>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
        <label style={{ fontWeight: 500 }}>Select Project:</label>
        <select className="input-field" style={{ width: "300px" }} value={projectId} onChange={handleProjectChange}>
          {projects.length === 0 && <option value="">No projects available</option>}
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.project_name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading members...</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {members.length > 0 ? (
                members.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="user-avatar" style={{ width: "32px", height: "32px", fontSize: "14px" }}>
                          {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <span style={{ fontWeight: 500 }}>{member.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td>{member.email}</td>
                    <td>
                      <span className={`badge badge-${member.role === 'project_owner' ? 'primary' : 'info'}`}>
                        {member.role === 'team_member' ? "Member" : (member.role === 'project_owner' ? "Admin" : "Viewer")}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>No members found for this project.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Member</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>User Email</label>
                <input
                  type="email"
                  className="input-field"
                  required
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  className="input-field"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="team_member">Member</option>
                  <option value="project_owner">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Members;
