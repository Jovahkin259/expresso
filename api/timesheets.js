const express = require('express')
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')
const timesheetRouter = express.Router({ mergeParams: true })

// Search for a timesheet with the given id
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

// Validate a new timesheet with the given id
const validateTimesheet = (req, res, next) => {
  const timesheet = req.body.timesheet
  if (!timesheet.hours || !timesheet.rate || !timesheet.date || !req.params.employeeId) {
    return res.sendStatus(400)
  } else {
    next()
  }
}
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

// Create a new timesheet
timesheetRouter.post('/', validateTimesheet, (req, res, next) => {
  const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) ' +
                'VALUES ($hours, $rate, $date, $employeeId)'
  const values = {
    $hours: req.body.timesheet.hours,
    $rate: req.body.timesheet.rate,
    $date: req.body.timesheet.date,
    $employeeId: req.params.employeeId
  }
  db.run(sql, values, function (error) {
    if (error) {
      next(error)
    } else {
      db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (error, timesheet) => {
        if (error) {
          next(error)
        } else {
          res.status(201).json({ timesheet: timesheet })
        }
      })
    }
  })
})

// Update a timesheet
timesheetRouter.put('/:timesheetId', validateTimesheet, (req, res, next) => {
  const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = $id;'
  const values = {
    $hours: req.body.timesheet.hours,
    $rate: req.body.timesheet.rate,
    $date: req.body.timesheet.date,
    $employeeId: req.params.employeeId,
    $id: req.params.timesheetId
  }

  db.run(sql, values, function (error) {
    if (error) {
      next(error)
    } else {
      db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`, (error, timesheet) => {
        if (error) {
          next(error)
        } else {
          res.status(200).json({ timesheet: timesheet })
        }
      })
    }
  })
})

// Delete a timesheet
timesheetRouter.delete('/:timesheetId', (req, res, next) => {
  const sql = `DELETE FROM Timesheet WHERE id = ${req.params.timesheetId};`
  db.run(sql, error => {
    if (error) {
      next(error)
    } else {
      res.sendStatus(204)
    }
  })
})
module.exports = timesheetRouter
