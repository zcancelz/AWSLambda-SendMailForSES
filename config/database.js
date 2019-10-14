const mysql = require('mysql2/promise');
// const mysql = require('mysql');
const dbconfig = require('./db-config.json');

exports.init = function(){
    return mysql.createPool(dbconfig);
}
