const mysql = require('mysql2/promise')

const mysqlPool = mysql.createPool({
  host : 'localhost',
  user : 'root',
  password : 'Nitin@14368',
  database: 'nodejs_db',
})

module.exports = mysqlPool;