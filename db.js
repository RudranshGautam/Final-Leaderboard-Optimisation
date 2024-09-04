const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'rudransh@1', // replace with your MySQL password
  database: 'ww'
});

module.exports = pool.promise();