const db = require("../config/db");
const logActivity = require("../utils/activityLogger");


// =====================
// ADD MEMBER
// =====================

const addMember = (req, res) => {
    const { project_id, email, role } = req.body;

    console.log("Add Member Payload:", req.body);

    if (!project_id || !email || !role) {
        return res.status(400).json({ message: "Project ID, Email, and Role are required" });
    }

    // 1. Check if project exists
    db.query("SELECT * FROM projects WHERE id = ?", [project_id], (err, projRes) => {
        if (err) return res.status(500).json(err);
        if (projRes.length === 0) return res.status(404).json({ message: "Project not found" });

        const project = projRes[0];
        console.log("Project:", project);

        // Verify ownership
        if (project.created_by !== req.user.id) {
            return res.status(403).json({ message: "Only Project Owner can add members" });
        }

        // 2. Find user by email
        db.query("SELECT * FROM users WHERE email = ?", [email], (err, userRes) => {
            if (err) return res.status(500).json(err);
            if (userRes.length === 0) return res.status(404).json({ message: "User not found" });

            const user = userRes[0];
            console.log("User:", user);

            // 3. Check if user is already a member
            db.query("SELECT * FROM project_members WHERE project_id = ? AND user_id = ?", [project_id, user.id], (err, memRes) => {
                if (err) return res.status(500).json(err);
                if (memRes.length > 0) return res.status(400).json({ message: "User is already a member" });

                const dbRole = role; // "project_owner", "team_member", "viewer"
                console.log("Role to insert:", dbRole);

                // 4. Insert member
                db.query("INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)", [project_id, user.id, dbRole], (err, insertRes) => {
                    if (err) {
                        console.error("Database insert error:", err);
                        return res.status(500).json({ message: err.message || "Failed to add member to database" });
                    }

                    logActivity(req.user.id, `Added ${user.name} to project ${project.project_name}`);
                    res.status(201).json({ message: "Member added successfully" });
                });
            });
        });
    });
};



// =====================
// GET MEMBERS
// =====================

const getMembers = (req, res) => {

    const { projectId } = req.params;

    const sql = `

        SELECT

            users.id,

            users.name,

            users.email,

            project_members.role

        FROM project_members

        JOIN users

        ON users.id = project_members.user_id

        WHERE project_members.project_id = ?

    `;

    db.query(

        sql,

        [projectId],

        (err, result) => {

            if (err) {

                return res.status(500).json(err);

            }

            res.status(200).json(result);

        }

    );

};



// =====================
// EXPORTS
// =====================

module.exports = {

    addMember,

    getMembers

};
 