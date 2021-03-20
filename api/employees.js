const express = require('express')
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')
const employeeRouter = express.Router()

// Validate a new employee
const validateEmployee = (req, res, next) => {
  const employee = req.body.employee

  if (!employee.name || !employee.position || !employee.wage) {
    return res.sendStatus(400)
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

// Create a new employee
employeeRouter.post('/', validateEmployee, (req, res, next) => {
  const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) ' +
              'VALUES ($name, $position, $wage, $employed)'
  const values = {
    $name: req.body.employee.name,
    $position: req.body.employee.position,
    $wage: req.body.employee.wage,
    $employed: req.body.employee.is_current_employee === 0 ? 0 : 1
  }

  db.run(sql, values, function (error) {
    if (error) {
      next(error)
    } else {
      db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`,
        function (error, employee) {
          if (error) {
            next(error)
          } else if (employee) {
            res.status(201).json({ employee: employee })
          } else {
            res.sendStatus(400)
          }
        })
    }
  })
})

// Update an existing employee
employeeRouter.put('/:employeeId', validateEmployee, (req, res, next) => {
  const sql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $employed WHERE id = $employeeId;'
  const values = {
    $name: req.body.employee.name,
    $position: req.body.employee.position,
    $wage: req.body.employee.wage,
    $employed: req.body.employee.is_current_employee === 0 ? 0 : 1,
    $employeeId: req.params.employeeId
  }

  db.run(sql, values, (error) => {
    if (error) {
      next(error)
    } else {
      db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (error, employee) => {
        if (error) {
          next(error)
        } else if (employee) {
          res.status(200).json({ employee: employee })
        } else {
          res.sendStatus(400)
        }
      })
    }
  })
})
module.exports = employeeRouter
