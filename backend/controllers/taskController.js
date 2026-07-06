const db = require("../config/db");
const sendMail = require("../utils/sendMail");
const logActivity = require("../utils/activityLogger");

// CREATE TASK
const createTask = (req, res) => {

    const {
        project_id,
        title,
        description,
        assigned_to,
        priority,
        deadline
    } = req.body;

    if (!project_id || !title) {
        return res.status(400).json({
            message: "Project ID and Title are required"
        });
    }

    const sql = `
        INSERT INTO tasks
        (
            project_id,
            title,
            description,
            assigned_to,
            priority,
            deadline
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(

        sql,

        [
            project_id,
            title,
            description,
            assigned_to,
            priority || "Medium",
            deadline
        ],

        async (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            // Send Email Notification

            if (assigned_to) {

                db.query(

                    "SELECT email FROM users WHERE id = ?",

                    [assigned_to],

                    async (err, userResult) => {

                        if (
                            !err &&
                            userResult.length > 0
                        ) {

                            const email =
                                userResult[0].email;

                            await sendMail(

                                email,

                                "New Task Assigned",

                                `You have been assigned a new task.

Task : ${title}

Priority : ${priority || "Medium"}

Deadline : ${deadline || "Not specified"}

Please login to TaskBridge to check details.`

                            );

                        }

                    }

                );

            }
            logActivity(
                req.user.id,
                `Created task ${title}`
            );
            const io = req.app.get("io");
            io.emit(
                "taskAssigned",
                {
                    message: `New task assigned: ${title}`
                }
            );

            res.status(201).json({

                message:
                    "Task Created Successfully"

            });

        }

    );

};

// GET TASKS
const getTasks = (req, res) => {

    const { projectId } = req.params;

    const sql = `

        SELECT

            tasks.*,

            users.name AS assigned_user

        FROM tasks

        LEFT JOIN users

        ON tasks.assigned_to = users.id

        WHERE project_id = ?

        ORDER BY created_at DESC

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

// UPDATE TASK STATUS
const updateTaskStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Fetch the task first to check old status and get project info
    db.query("SELECT * FROM tasks WHERE id = ?", [id], (err, taskResult) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        if (taskResult.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        const task = taskResult[0];
        const oldStatus = task.status;

        // Update the task status
        const sql = `UPDATE tasks SET status = ? WHERE id = ?`;
        db.query(sql, [status, id], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            // Check if status changed to Completed
            if (oldStatus !== "Completed" && status === "Completed") {
                const ownerSql = `
                    SELECT 
                        u_owner.email, 
                        u_owner.name AS ownerName, 
                        p.project_name, 
                        u_completer.name AS memberName 
                    FROM projects p 
                    JOIN users u_owner ON p.created_by = u_owner.id 
                    JOIN users u_completer ON u_completer.id = ? 
                    WHERE p.id = ?
                `;

                db.query(ownerSql, [req.user.id, task.project_id], async (err, ownerResult) => {
                    if (!err && ownerResult.length > 0) {
                        const { email, ownerName, project_name, memberName } = ownerResult[0];

                        // Send Email inside Try/Catch
                        try {
                            const htmlTemplate = `
                                <p>Hello ${ownerName},</p>
                                <p>Task: <b>${task.title}</b> has been marked as Completed.</p>
                                <p>Completed By: <b>${memberName}</b></p>
                                <p>Project: <b>${project_name}</b></p>
                                <br/>
                                <p>Regards,<br/>TaskBridge Team</p>
                            `;
                            await sendMail(email, "Task Completed Notification", htmlTemplate);
                        } catch (mailErr) {
                            console.log("Failed to send email", mailErr);
                        }

                        // Activity Log
                        logActivity(req.user.id, `${memberName} completed task ${task.title}`);

                        // Socket.IO Notification
                        const io = req.app.get("io");
                        if (io) {
                            io.emit("taskCompleted", {
                                taskId: task.id,
                                taskTitle: task.title,
                                projectId: task.project_id,
                                completedBy: memberName
                            });
                        }
                    }
                });
            } else if (status === "Completed") {
                logActivity(req.user.id, `Completed task ${id}`);
            }

            res.status(200).json({ message: "Task Updated Successfully" });
        });
    });
};

// DELETE TASK
const deleteTask = (req, res) => {

    const { id } = req.params;

    db.query(

        "DELETE FROM tasks WHERE id = ?",

        [id],

        (err, result) => {

            if (err) {

                return res.status(500).json(err);

            }

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    message: "Task not found"

                });

            }

            res.status(200).json({

                message:
                    "Task Deleted Successfully"

            });

        }

    );

};


module.exports = {

    createTask,

    getTasks,

    updateTaskStatus,

    deleteTask

};
