import { FaChartBar, FaTasks, FaCheckCircle, FaHourglassHalf, FaUsers } from "react-icons/fa";

function DashboardCard({ title, count }) {
  const getIcon = () => {
    switch(title) {
      case "Projects": return <div className="stat-icon primary"><FaChartBar /></div>;
      case "Tasks": return <div className="stat-icon info"><FaTasks /></div>;
      case "Completed": return <div className="stat-icon success"><FaCheckCircle /></div>;
      case "Pending": return <div className="stat-icon warning"><FaHourglassHalf /></div>;
      case "Users": return <div className="stat-icon danger"><FaUsers /></div>;
      default: return <div className="stat-icon primary"><FaChartBar /></div>;
    }
  };

  return (
    <div className="stat-card">
      {getIcon()}
      <div className="stat-info">
        <h3>{title}</h3>
        <p>{count !== undefined ? count : 0}</p>
      </div>
    </div>
  );
}

export default DashboardCard;
