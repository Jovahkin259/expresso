const express = require('express')
const app = express()
const sqlite3 = require('sqlite3')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const errorHandler = require('errorhandler')
const PORT = process.env.PORT || 4000
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')
const apiRouter = require('./api/api')

app.use(bodyParser.json())
app.use(morgan('dev'))
app.use('/api', apiRouter)

app.listen(PORT, () => console.log('Server is listening on PORT: ' + PORT))

app.use(errorHandler())
module.exports = app
