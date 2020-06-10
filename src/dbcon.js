var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit :   10,
    host            :   'classmysql.engr.oregonstate.edu',
    user            :   'cs290_haynesca',
    password        :   '4303',
    database        :   'cs290_haynesca'
});

module.exports.pool = pool;
