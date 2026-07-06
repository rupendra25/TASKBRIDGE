import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../services/api";
import MainLayout from "../layouts/MainLayout";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ project_name: "", description: "" });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await API.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await API.delete(`/projects/${id}`);
        toast.success("Project deleted successfully");
        fetchProjects();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to delete project");
      }
    }
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({ project_name: project.project_name, description: project.description });
    } else {
      setEditingProject(null);
      setFormData({ project_name: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await API.put(`/projects/${editingProject.id}`, formData);
        toast.success("Project updated successfully");
      } else {
        await API.post("/projects", formData);
        toast.success("Project created successfully");
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
      toast.error(editingProject ? "Failed to update project" : "Failed to create project");
    }
  };

  const filteredProjects = projects.filter((p) => 
    p.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="page-header">
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FaPlus /> New Project
        </button>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <div style={{ position: "relative", width: "300px" }}>
          <FaSearch style={{ position: "absolute", left: "10px", top: "12px", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: "35px" }}
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading projects...</p>
      ) : (
        <div className="cards-grid">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div key={project.id} className="stat-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", margin: 0 }}>{project.project_name}</h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn btn-outline" style={{ padding: "6px" }} onClick={() => handleOpenModal(project)} title="Edit">
                      <FaEdit style={{ color: "var(--primary)" }} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: "6px" }} onClick={() => handleDelete(project.id)} title="Delete">
                      <FaTrash style={{ color: "var(--danger)" }} />
                    </button>
                  </div>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "8px 0", flex: 1 }}>{project.description || "No description provided."}</p>
                
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "4px" }}>
                  <small style={{ color: "var(--text-muted)" }}>Members: {project.members_count || 0}</small>
                  <small style={{ color: "var(--text-muted)" }}>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</small>
                </div>
              </div>
            ))
          ) : (
            <p>No projects found.</p>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProject ? "Edit Project" : "Create New Project"}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={formData.project_name}
                  onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="input-field"
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingProject ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Projects;
