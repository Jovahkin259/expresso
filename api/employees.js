const express = require('express')
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')
const employeeRouter = express.Router()

// Validate a new employee
const validateEmployee = (req, res, next) => {
  const employee = req.body.employee

  if (!employee.name || !employee.position || !employee.wage) {
    return res.sendStatus(404)
  } else {
    next()
  }
}

// Check employee id parameters
employeeRouter.param('employeeId', (req, res, next, employeeId) => {
  db.get(`SELECT * FROM Employee WHERE id = ${employeeId}`, (error, employee) => {
    if (error) {
      next(error)
    } else if (employee) {
      req.employee = employee
      next()
    } else {
      res.sendStatus(404)
    }
  })
})
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

// Get an employee by ID
employeeRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({ employee: req.employee })
})

module.exports = employeeRouter
