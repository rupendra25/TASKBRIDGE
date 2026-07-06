const db = require("../config/db");

const getDashboard = (req, res) => {

    const statsSql = `
        SELECT
            (SELECT COUNT(*) FROM projects) AS totalProjects,
            (SELECT COUNT(*) FROM tasks) AS totalTasks,
            (SELECT COUNT(*) FROM tasks WHERE status='Completed') AS completedTasks,
            (SELECT COUNT(*) FROM tasks WHERE status!='Completed') AS pendingTasks,
            (SELECT COUNT(*) FROM users) AS totalUsers
    `;

    const recentTasksSql = `
        SELECT title, status, priority, deadline 
        FROM tasks 
        ORDER BY created_at DESC 
        LIMIT 5
    `;

    const recentActivitiesSql = `
        SELECT action, created_at AS createdAt 
        FROM activity_logs 
        ORDER BY created_at DESC 
        LIMIT 5
    `;

    db.query(statsSql, (err, statsResult) => {
        if (err) return res.status(500).json(err);

        db.query(recentTasksSql, (err2, tasksResult) => {
            if (err2) return res.status(500).json(err2);

            db.query(recentActivitiesSql, (err3, activitiesResult) => {
                if (err3) return res.status(500).json(err3);

                const responseData = {
                    ...statsResult[0],
                    recentTasks: tasksResult,
                    recentActivities: activitiesResult
                };

                res.status(200).json(responseData);
            });
        });
    });

};

module.exports = {
    getDashboard
};
