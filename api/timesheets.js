const express = require('express')
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')
const timesheetRouter = express.Router({ mergeParams: true })

timesheetRouter.param('timesheetId', (req, res, next, timesheetId) => {
  db.get(`SELECT * FROM Timesheet WHERE id = ${timesheetId};`, (error, timesheet) => {
    if (error) {
      next(error)
    } else if (timesheet) {
      req.timesheet = timesheet
      next()
    } else {
      res.sendStatus(404)
    }
  })
})

// Get all timesheets for a given employee
timesheetRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId;'
  const values = { $employeeId: req.params.employeeId }
  db.all(sql, values, (error, timesheets) => {
    if (error) {
      next(error)
    } else if (timesheets) {
      res.status(200).json({ timesheets: timesheets })
    } else {
      res.sendStatus(404)
    }
  })
})

module.exports = timesheetRouter
