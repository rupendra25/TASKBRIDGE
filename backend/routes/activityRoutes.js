const express =
require("express");

const router=
express.Router();

const verifyToken=
require("../middleware/authMiddleware");

const {

getLogs

}=require(

"../controllers/activityController"

);

router.get(

"/",

verifyToken,

getLogs

);

module.exports=
router;
