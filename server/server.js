import bodyParser from 'body-parser'
import express from 'express'
import path from 'path'
const app = express()
var con = require('./connected')
var cors = require('cors')
var forwarded = require('forwarded-for')
const fileUpload = require('express-fileupload')
app.set('trust proxy', 1) // trust first proxy
app.use(cors())
app.use(fileUpload())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// const router = express.Router()

const staticFiles = express.static(path.join(__dirname, '../../client/build'))
app.use(staticFiles)

function connectionCheck() {
  return new Promise((resolve, reject) => {
    con.getConnection(function (err, connection) {
      if (err) {
        if (connection) connection.release()
        reject(err)
      } else {
        resolve('success')
      }
    })
  })
}

function connectionRelease() {
  con.on('release', function (connection) {
    console.log('Connection %d released', connection.threadId)
  })
}



app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', function (req, res) {
  res.json({ Error: true, Message: 'Not allowed' })
})

app.get('/events', function (req, res) {
  var sql = 'SELECT * FROM events'
  con.query(sql, function (err, rows) {
    if (err) {
      res.json({ Error: true, Message: 'Error Execute Sql', err })
    } else {
      // res.json({ "Error": false, "Message": "Success", "Visitors": rows });
      res.json(rows)
    }
  })
})



// any routes not picked up by the server api will be handled by the react router
app.use('/*', staticFiles)

app.set('port', process.env.PORT || 3001)
app.listen(app.get('port'), () => {
  console.log(`Listening on ${app.get('port')}`)
})
