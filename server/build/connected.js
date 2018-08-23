'use strict';

/**
 * Created by pc on 8/29/2017.
 */
var mysql = require('mysql');
// var con = mysql.createConnection({
//   // host: 'localhost',
//   // user: 'root',
//   // password: 'root',
//   // port: '8889',
//   // database: 'tourism'
//   //   host: 'https://cloudsql/medicalrevu:medirevu-test-clone',

//   host: '173.194.252.228',
//   user: 'testdemo',
//   password: 'medse33ion',
//   database: 'clinicapp',
// })

var con = mysql.createPool({
  connectionLimit: 100,
  host: '173.194.252.228',
  user: 'testdemo',
  password: 'medse33ion',
  database: 'clinicapp'
});

module.exports = con;