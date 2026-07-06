const db =
require("../config/db");

const getLogs =
(req,res)=>{

const sql=`

SELECT

activity_logs.id,

activity_logs.action,

activity_logs.created_at,

users.name

FROM activity_logs

JOIN users

ON users.id=
activity_logs.user_id

ORDER BY

activity_logs.created_at DESC

`;

db.query(

sql,

(err,result)=>{

if(err){

return res
.status(500)
.json(err);

}

res
.status(200)
.json(result);

}

);

};

module.exports={

getLogs

};
