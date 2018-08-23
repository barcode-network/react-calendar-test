'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var con = require('./connected');
var cors = require('cors');
var forwarded = require('forwarded-for');
app.set('trust proxy', 1); // trust first proxy
app.use(cors());

app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: false }));

// const router = express.Router()

var staticFiles = _express2.default.static(_path2.default.join(__dirname, '../../client/build'));
app.use(staticFiles);

function connectionCheck() {
  return new _promise2.default(function (resolve, reject) {
    con.getConnection(function (err, connection) {
      if (err) {
        if (connection) connection.release();
        reject(err);
      } else {
        resolve('success');
      }
    });
  });
}

function connectionRelease() {
  con.on('release', function (connection) {
    console.log('Connection %d released', connection.threadId);
  });
}

var CryptoJS = require('crypto-js');

var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');

// const fs = require('fs')
// const filebuffer = fs.readFileSync('db/usda-nnd.sqlite3')

// const db = new sqlite.Database(filebuffer)
// var pg = require('pg')

// var connectionString =
//   'postgres://*USERNAME*:*PASSWORD*@*HOST*:*PORT*/*DATABASE*'

// pg.connect(connectionString, function(err, client, done) {

//   client.query('SELECT * FROM your_table', function(err, result) {
//     done()
//     if (err) return console.error(err)
//     console.log(result.rows)
//   })
// })

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
var auth = {
  auth: {
    api_key: 'key-d3ff66e5968f8ef79bc95bd5d2c6e3fb',
    domain: 'carepoint.co'
  }
};

var nodemailerMailgun = nodemailer.createTransport(mg(auth));

app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.sendFile(_path2.default.join(__dirname, '../../client/build/index.html'), function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

// const COLUMNS = [
//   'carbohydrate_g',
//   'protein_g',
//   'fa_sat_g',
//   'fa_mono_g',
//   'fa_poly_g',
//   'kcal',
//   'description'
// ]

// app.get('/api/food', (req, res) => {
//   const param = req.query.q

//   if (!param) {
//     res.json({
//       error: 'Missing required parameter `q`'
//     })
//     return
//   }

//   // WARNING: Not for production use! The following statement
//   // is not protected against SQL injections.
//   const r = db.exec(
//     `
//     select ${COLUMNS.join(', ')} from entries
//     where description like '%${param}%'
//     limit 100
//   `
//   )

//   if (r[0]) {
//     res.json(
//       r[0].values.map(entry => {
//         const e = {}
//         COLUMNS.forEach((c, idx) => {
//           // combine fat columns
//           if (c.match(/^fa_/)) {
//             e.fat_g = e.fat_g || 0.0
//             e.fat_g = (
//               parseFloat(e.fat_g, 10) + parseFloat(entry[idx], 10)
//             ).toFixed(2)
//           } else {
//             e[c] = entry[idx]
//           }
//         })
//         return e
//       })
//     )
//   } else {
//     res.json([])
//   }
// })

app.post('/send_email', function (req, res) {
  //TODO: Accept params for birthdays or for sending event notifications

  var email_subject = req.body.title;
  var email_content = req.body.message;
  // var recipients = ["shannon@medirevu.com", "shannonjamalclarke@gmail.com"];
  var recipients = req.body.recipients;

  for (var i = 0; i < recipients.length; i++) {
    console.log(recipients[i]);
    nodemailerMailgun.sendMail({
      from: 'loyalvisitorsclub@visitbarbados.org',
      to: recipients[i], // An array if you have multiple recipients.
      // cc: 'second@domain.com',
      // bcc: 'secretagent@company.gov',
      subject: email_subject,
      'h:Reply-To': 'loyalvisitorsclub@visitbarbados.org',
      //You can use "html:" to send HTML email content. It's magic!
      html: email_content
      //You can use "text:" to send plain-text content. It's oldschool!
      // text: "Mailgun rocks, pow pow!"
    }, function (err, info) {
      if (err) {
        console.log('Error: ' + err, recipients[i]);
      } else {
        console.log('Response: ' + info);
      }
    });
  }
});

app.post('/auth/login', function (req, res) {
  var sql = 'SELECT * FROM users2 WHERE user_email = ? AND user_password = md5(?)';
  var body = [req.body.user_email, req.body.user_password];
  // console.log(req.body);
  con.query(sql, body, function (err, row) {
    //var num = row.affectedRows;
    if (err) {
      res.json({ Error: true, Message: err });
    } else if (row.length < 1) {
      res.json({ Error: true, Message: 'Could not login', err: err });
    } else {
      //if(num == 1) {
      // res.json({ "Error": false, "Message": "Success", "user": row });
      res.json(row[0]);
      // }else{
      //res.json({"Error": false, "Message": "Not Found"});
      //}
    }
  });
});

app.post('/auth/register', function (req, res) {
  var sql = 'INSERT INTO users2 (user_name, user_password, user_email) VALUES (?, md5(?), ?)';
  var body = [req.body.user_name, req.body.user_password, req.body.user_email];
  con.query(sql, body, function (err) {
    if (err) {
      res.json({ Error: true, Message: 'SQL Error', err: err });
    } else {
      res.json({ Error: false, Message: 'Success' + sql });
    }
  });
});

//TODO: forgotpassword send email
app.post('/auth/forgotpassword', function (req, res) {
  //TODO: Accept params for birthdays or for sending event notifications

  var emailParam = CryptoJS.AES.encrypt(req.body.email, 'secret-key-123');

  // var hostname = req.headers.x - forwarded - host
  // var hostname = forwarded(req, req.headers)
  // console.log(hostname)
  // res.json(req.body.domain)
  // return

  nodemailerMailgun.sendMail({
    from: 'loyalvisitorsclub@visitbarbados.org',
    to: req.body.email, // An array if you have multiple recipients.
    // cc: 'second@domain.com',
    // bcc: 'secretagent@company.gov',
    subject: 'BTPA - Password Reset Confirmation',
    'h:Reply-To': 'loyalvisitorsclub@visitbarbados.org',
    //You can use "html:" to send HTML email content. It's magic!
    // html:
    //   'Hi, did you request a new password? If so, please <a href=http://' +
    //   hostname.ip +
    //   ':' +
    //   hostname.port +
    //   '/#/changepassword/' +
    //   emailParam +
    //   '>click on this link</a> and follow the instructions',
    html: 'Hi, did you request a new password? If so, please <a href="https://ancient-chamber-67610.herokuapp.com//#/changepassword/' + emailParam + '">click on this link</a> and follow the instructions',
    //You can use "text:" to send plain-text content. It's oldschool!
    text: 'If you did not request to change your password, please inform us about this immediately!'
  }, function (err, info) {
    if (err) {
      // console.log('Error: ' + err)
      res.json({ Error: true, Message: 'Error: ' + err });
    } else {
      // console.log('Response: ' + info)
      res.json({ Error: false, Message: 'Response: ' + info });
    }
  });
});

//TODO: update password

app.post('/auth/changepassword', function (req, res) {
  var emailParam = req.body.user_email;

  // var bytes = CryptoJS.AES.decrypt(emailParam.toString(), "secret-key-123");
  // var plainEmail = bytes.toString(CryptoJS.enc.Utf8);

  var sql = 'UPDATE users2 SET user_password = md5(?) WHERE user_email = "' + emailParam + '"';
  var body = [req.body.user_password];
  con.query(sql, body, function (err) {
    if (err) {
      res.json({ Error: true, Message: 'Error execute sql' });
    } else {
      res.json({ Error: false, Message: 'Success ' + sql });
    }
  });
});

//TODO: send invite

app.post('/auth/sendinvite', function (req, res) {
  //TODO: Accept params for birthdays or for sending event notifications

  var hostname = forwarded(req, req.headers);
  // console.log(hostname, req.headers)
  // res.json(req.headers)
  // return

  var emailParam = CryptoJS.AES.encrypt(req.body.email, 'secret-key-123');

  nodemailerMailgun.sendMail({
    from: 'loyalvisitorsclub@visitbarbados.org',
    to: req.body.email, // An array if you have multiple recipients.
    // cc: 'second@domain.com',
    // bcc: 'secretagent@company.gov',
    subject: 'BTPA - Welcome to the Portal Admin',
    'h:Reply-To': 'loyalvisitorsclub@visitbarbados.org',

    //You can use "html:" to send HTML email content. It's magic!
    html: 'Hi, are you ready to get started? If so, please <a href="https://ancient-chamber-67610.herokuapp.com//#/changepassword/' + emailParam + '">Click on this link</a> and follow the instructions',
    //You can use "text:" to send plain-text content. It's oldschool!
    text: 'If you did not request this invite please inform us about this immediately!'
  }, function (err, info) {
    if (err) {
      // console.log('Error: ' + err)
      res.json({ Error: true, Message: 'Error: ' + err });
    } else {
      // console.log('Response: ' + info)
      res.json({ Error: false, Message: 'Response: ' + info });
    }
  });
});

//TODO: accept invite

app.post('/auth/acceptinvite', function (req, res) {
  // var emailParam = req.body.user_email;

  // var bytes = CryptoJS.AES.decrypt(emailParam.toString(), "secret-key-123");
  // var plainEmail = bytes.toString(CryptoJS.enc.Utf8);

  // var sql =
  //   'UPDATE users SET user_password = md5(?) WHERE user_email = "' +
  //   emailParam +
  //   '"';
  // var body = [req.body.user_password];
  // con.query(sql, body, function(err) {
  //   if (err) {
  //     res.json({ Error: true, Message: "Error execute sql" });
  //   } else {
  //     res.json({ Error: false, Message: "Success " + sql });
  //   }
  // });

  var sql = 'INSERT INTO users2 (user_name, user_password, user_email) VALUES (?, md5(?), ?)';
  var body = [req.body.user_name, req.body.user_password, req.body.user_email];
  con.query(sql, body, function (err) {
    if (err) {
      res.json({ Error: true, Message: 'SQL Error', err: err });
    } else {
      res.json({ Error: false, Message: 'Success' });
    }
  });
});

app.get('/visitors', function (req, res) {
  var sql = 'SELECT * FROM visitors';
  con.query(sql, function (err, rows) {
    if (err) {
      res.json({ Error: true, Message: 'Error Execute Sql', err: err });
    } else {
      // res.json({ "Error": false, "Message": "Success", "Visitors": rows });
      res.json(rows);
    }
  });
});

app.get('/visitors/get/:id', function (req, res) {
  var sql = 'SELECT * FROM visitors WHERE id = ?';
  var id_movie = [req.params.id];
  con.query(sql, id_movie, function (err, row) {
    //var num = row.affectedRows;
    if (err) {
      res.json({ Error: true, Message: 'Error Execute Sql' });
    } else {
      //if(num == 1) {
      res.json({ Error: false, Message: 'Success', visitor: row });
      // }else{
      //res.json({"Error": false, "Message": "Not Found"});
      //}
    }
  });
});

app.post('/visitors/insert', function (req, res) {
  var sql = 'INSERT INTO visitors (first_name, last_name, telephone, birthday, address, country, First_visit, email) VALUES (?, ?, ?, ?, ?,?,?,?)';
  //   console.log("params", req.body);
  var body = [req.body.first_name, req.body.last_name, req.body.telephone, req.body.birthday, req.body.address, req.body.country, req.body.First_visit, req.body.email];
  con.query(sql, body, function (err) {
    if (err) {
      res.json({ Error: true, Message: 'SQL Error', err: err });
    } else {
      res.json({ Error: false, Message: 'Success' });
    }
  });
});

app.put('/visitors/update', function (req, res) {
  var sql = 'UPDATE visitors SET first_name = ?, last_name = ?, telephone=?,birthday=?,email=?,address=?,country=?,First_visit=?,Likes=?,Dislikes=?,Memorable_moments=?,notes=? WHERE id = "' + req.body.id + '"';
  var body = [req.body.first_name, req.body.last_name, req.body.telephone, req.body.birthday, req.body.email, req.body.address, req.body.country, req.body.First_visit, req.body.Likes, req.body.Dislikes, req.body.Memorable_moments, req.body.notes];
  con.query(sql, body, function (err) {
    if (err) {
      res.json({ Error: true, Message: 'Error execute sql' });
    } else {
      res.json({ Error: false, Message: 'Success' });
    }
  });
});

app.put('visitors/delete', function (req, res) {
  var sql = 'DELETE FROM visitors WHERE id = ?';
  var id_movie = [req.params.id];
  con.query(sql, id_movie, function (err) {
    if (err) {
      res.json({ Error: true, Message: 'Error execute sql' });
    } else {
      res.json({ Error: false, Message: 'Success' });
    }
  });
});

//Trips API

app.get('/trips', function (req, res) {
  var sql = 'SELECT *,visitors.id as visitor_id, trips.id as trip_id FROM trips JOIN visitors ON trips.visitor_id = visitors.id WHERE is_removed = 0';
  con.query(sql, function (err, rows) {
    if (err) {
      res.json({ Error: true, Message: 'Error Execute Sql', err: err });
    } else {
      // res.json({ "Error": false, "Message": "Success", "Visitors": rows });
      res.json(rows);
    }
  });
});

app.post('/trips/get', function (req, res) {
  var sql = "SELECT trips.*, visitors.first_name, visitors.last_name FROM trips JOIN visitors ON trips.visitor_id = visitors.id WHERE is_removed = 0 AND visitor_id = '" + req.body.visitor_id + "'";
  var body = [req.params.visitor_id];
  con.query(sql, body, function (err, row) {
    //var num = row.affectedRows;
    if (err) {
      res.json({ Error: true, Message: 'Error Execute Sql' });
    } else {
      //if(num == 1) {
      res.json({ Error: false, Message: 'Success', trip: row });
      // }else{
      //res.json({"Error": false, "Message": "Not Found"});
      //}
    }
  });
});

app.post('/trips/insert', function (req, res) {
  var sql = 'INSERT INTO trips (visitor_id, flight_num,accomodation, total_persons, is_complete, notes,arrival_date, departure_date) VALUES (?, ?, ?, ?, ?,?,?,?)';
  //   console.log("params", req.body);
  var body = [req.body.visitor_id, req.body.flight_num, req.body.accomodation, req.body.total_persons, req.body.is_complete, req.body.notes, req.body.arrival_date, req.body.departure_date];
  con.query(sql, body, function (err) {
    if (err) {
      res.json({ Error: true, Message: 'SQL Error', err: err });
    } else {
      res.json({ Error: false, Message: 'Success' });
    }
  });
});

app.put('/trips/update', function (req, res) {
  var sql = 'UPDATE trips SET visitor_id = ?, flight_num = ?, accomodation=?,total_persons=?,is_complete=?,notes=?,arrival_date=?,departure_date=? WHERE id = "' + req.body.trip_id + '"';
  var body = [req.body.visitor_id, req.body.flight_num, req.body.accomodation, req.body.total_persons, req.body.is_complete, req.body.notes, req.body.arrival_date, req.body.departure_date];
  con.query(sql, body, function (err) {
    if (err) {
      res.json({ Error: true, Message: 'Error execute sql', err: err });
    } else {
      res.json({ Error: false, Message: 'Success' });
    }
  });
});

app.post('/trips/delete', function (req, res) {
  // var sql = 'DELETE FROM trips WHERE id = ?'
  var sql = 'UPDATE trips SET is_removed = 1 WHERE id="' + req.body.id + '"';
  var body = [req.body.id];
  con.query(sql, body, function (err) {
    if (err) {
      res.json({ Error: true, Message: 'Error execute sql' });
    } else {
      res.json({ Error: false, Message: 'Success' });
    }
  });
});

// any routes not picked up by the server api will be handled by the react router
app.use('/*', staticFiles);

app.set('port', process.env.PORT || 3001);
app.listen(app.get('port'), function () {
  console.log('Listening on ' + app.get('port'));
});