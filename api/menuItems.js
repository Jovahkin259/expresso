const express = require('express')
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')
const menuItemsRouter = express.Router({ mergeParams: true })

// Validate a new menu items
const validateMenuItem = (req, res, next) => {
  const menuItem = req.body.menuItem
  if (!menuItem.name || !menuItem.inventory || !menuItem.price || !req.params.menuId) {
    res.sendStatus(400)
  } else {
    next()
  }
}
// GET all saved menu items
menuItemsRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM MenuItem WHERE menu_id = $menuId;'
  const values = { $menuId: req.params.menuId }
  db.all(sql, values, (error, menuItems) => {
    if (error) {
      next(error)
    } else if (menuItems) {
      res.status(200).json({ menuItems: menuItems })
    } else {
      res.sendStatus(404)
    }
  })
})
module.exports = menuItemsRouter
