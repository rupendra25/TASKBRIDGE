const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {

    addMember,

    getMembers

} = require("../controllers/memberController");


router.post(

    "/",

    verifyToken,

    addMember

);


router.get(

    "/:projectId",

    verifyToken,

    getMembers

);


module.exports = router;
