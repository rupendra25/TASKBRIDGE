const transporter = require("../config/mail");

const sendMail = async (to, subject, text) => {

    try {

        await transporter.sendMail({

            from: process.env.EMAIL_USER,

            to,
            subject,
            text

        });

        console.log("Email Sent Successfully");

    }

    catch (err) {

        console.log("Mail Error:", err.message);

    }

};

module.exports = sendMail;