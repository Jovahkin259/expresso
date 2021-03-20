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

module.exports = menuRouter
