const express = require('express')
const app = express()
const sqlite3 = require('sqlite3')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const errorHandler = require('error-handler')
const PORT = process.env.PORT || 4000
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

app.use(bodyParser.json())
app.use(morgan('dev'))

app.listen(PORT, () => console.log('Server is listening on PORT: ' + PORT))

app.use(errorHandler())
module.exports = app
