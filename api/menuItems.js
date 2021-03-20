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

// Create a new menu item
menuItemsRouter.post('/', validateMenuItem, (req, res, next) => {
  const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) ' +
                'VALUES ($name, $description, $inventory, $price, $menuId) '
  const values = {
    $name: req.body.menuItem.name,
    $description: req.body.menuItem.description ? req.body.menuItem.description : '',
    $inventory: req.body.menuItem.inventory,
    $price: req.body.menuItem.price,
    $menuId: req.params.menuId
  }
  db.run(sql, values, function (error) {
    if (error) {
      next(error)
    } else {
      db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (error, menuItem) => {
        if (error) {
          next(error)
        } else {
          res.status(201).json({ menuItem: menuItem })
        }
      })
    }
  })
})

// Check menuItemId parameter
menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sql = 'SELECT * FROM MenuItem WHERE id = $menuItemId;'
  const values = { $menuItemId: menuItemId }

  db.get(sql, values, (error, menuItem) => {
    if (error) {
      next(error)
    } else if (!menuItem) {
      res.sendStatus(404)
    } else {
      req.menuItem = menuItem
      next()
    }
  })
})

module.exports = menuItemsRouter
