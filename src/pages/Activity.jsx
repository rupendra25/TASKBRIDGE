import { useEffect, useState } from "react";
import API from "../services/api";
import MainLayout from "../layouts/MainLayout";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const res = await API.get("/activity");
      setActivities(res.data);
    } catch (err) {
      console.log(err);
      // Fallback dummy data if API endpoint doesn't exist yet
      if (err.response?.status === 404) {
        setActivities([
          { id: 1, action: "Created Project", details: "Website Redesign", date: new Date().toISOString() },
          { id: 2, action: "Assigned Task", details: "Update homepage styling", date: new Date(Date.now() - 3600000).toISOString() },
          { id: 3, action: "Added Member", details: "John Doe joined", date: new Date(Date.now() - 7200000).toISOString() },
          { id: 4, action: "Completed Task", details: "Setup database", date: new Date(Date.now() - 86400000).toISOString() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <MainLayout>
      <div className="page-header">
        <h1>Activity Timeline</h1>
      </div>

      {loading ? (
        <p>Loading activities...</p>
      ) : (
        <div className="activity-timeline">
          {activities.length === 0 ? (
            <p>No activity found.</p>
          ) : (
            <div className="timeline-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activities.map((item) => (
                <div key={item.id} className="timeline-item" style={{ 
                  background: 'var(--card-bg)', 
                  padding: '16px', 
                  borderRadius: 'var(--radius)', 
                  boxShadow: 'var(--shadow-sm)',
                  borderLeft: '4px solid var(--primary)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--text-main)' }}>{item.action}</strong>
                    <small style={{ color: 'var(--text-muted)' }}>{formatDate(item.date || item.createdAt)}</small>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{item.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
}

export default Activity;
