const express = require('express')
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')
const menuRouter = express.Router()

// Validate a new menu
const validateMenu = (req, res, next) => {
  if (!req.body.menu.title) {
    res.sendStatus(400)
  } else {
    next()
  }
}
// Return all menus
menuRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (error, menus) => {
    if (error) {
      next(error)
    } else if (menus) {
      res.status(200).json({ menus: menus })
    } else {
      res.sendStatus(404)
    }
  })
})

// Create a new menu
menuRouter.post('/', validateMenu, (req, res, next) => {
  const sql = 'INSERT INTO Menu (title) ' +
                'VALUES ($title);'
  const values = { $title: req.body.menu.title }

  db.run(sql, values, function (error) {
    if (error) {
      next(error)
    } else {
      db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (error, menu) => {
        if (error) {
          next(error)
        } else {
          res.status(201).json({ menu: menu })
        }
      })
    }
  })
})

// Check menu ID parameters
menuRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE id = $menuId;'
  const values = { $menuId: menuId }
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error)
    } else if (!menu) {
      return res.sendStatus(404)
    } else {
      req.menu = menu
      next()
    }
  })
})
module.exports = menuRouter
