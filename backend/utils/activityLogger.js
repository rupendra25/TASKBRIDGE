const db = require("../config/db");

const logActivity = (
    userId,
    action
) => {

    db.query(

        `
        INSERT INTO activity_logs
        (user_id, action)

        VALUES (?, ?)
        `,

        [
            userId,
            action
        ]

    );

};

module.exports = logActivity;
