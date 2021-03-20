const express = require('express')
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')
const employeeRouter = express.Router()

// Get all employees
employeeRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Employee WHERE is_current_employee = 1;'
  db.all(sql, (error, employees) => {
    if (error) {
      next(error)
    } else if (employees) {
      res.status(200).json({ employees: employees })
    } else {
      res.sendStatus(404)
    }
  })
})
module.exports = employeeRouter
