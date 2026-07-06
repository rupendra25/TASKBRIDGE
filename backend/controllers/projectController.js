const db = require("../config/db");
const logActivity = require("../utils/activityLogger");

const createProject = (req, res) => {

    const { project_name, description } = req.body;

    if (!project_name) {
        return res.status(400).json({
            message: "Project name is required"
        });
    }
    // User ID comes from JWT middleware
    const created_by = req.user.id;
    const sql = `
        INSERT INTO projects (project_name, description, created_by)
        VALUES (?, ?, ?)
    `;
    db.query(
        sql,
        [project_name, description, created_by],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(201).json({
                message: "Project Created Successfully"
            });
            logActivity(
                req.user.id,
                `Created project ${project_name}`
            );

        }
    );

};

const getAllProjects = (req, res) => {

    const sql = `
        SELECT
            projects.id,
            projects.project_name,
            projects.description,
            projects.created_at,
            users.name AS created_by
        FROM projects
        JOIN users
        ON projects.created_by = users.id
        ORDER BY projects.created_at DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json(result);

    });

};

const getProjectById = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT *
        FROM projects
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.status(200).json(result[0]);

    });

};

const updateProject = (req, res) => {

    const { id } = req.params;
    const { project_name, description } = req.body;

    const sql = `
        UPDATE projects
        SET project_name = ?, description = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [project_name, description, id],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(200).json({
                message: "Project Updated Successfully"
            });

        }
    );

};

const deleteProject = (req, res) => {
    const { id } = req.params;

    // Delete tasks associated with the project
    db.query("DELETE FROM tasks WHERE project_id = ?", [id], (err1) => {
        if (err1) {
            console.log(err1);
            return res.status(500).json({ message: err1.message });
        }

        // Delete project members associated with the project
        db.query("DELETE FROM project_members WHERE project_id = ?", [id], (err2) => {
            if (err2) {
                console.log(err2);
                return res.status(500).json({ message: err2.message });
            }

            // Delete activity logs associated with the project
            db.query("DELETE FROM activity_logs WHERE project_id = ?", [id], (err3) => {
                if (err3) {
                    console.log(err3);
                    return res.status(500).json({ message: err3.message });
                }

                // Finally delete the project itself
                db.query("DELETE FROM projects WHERE id = ?", [id], (err4, result) => {
                    if (err4) {
                        console.log(err4);
                        return res.status(500).json({ message: err4.message });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({ message: "Project not found" });
                    }

                    res.status(200).json({
                        message: "Project Deleted Successfully"
                    });
                });
            });
        });
    });
};

module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject
};
