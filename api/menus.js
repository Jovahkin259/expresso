const express = require('express')
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')
const menusRouter = express.Router()
const menuItemsRouter = require('./menuItems')

// Validate a new menu
const validateMenu = (req, res, next) => {
  if (!req.body.menu.title) {
    res.sendStatus(400)
  } else {
    next()
  }
}
// Return all menus
menusRouter.get('/', (req, res, next) => {
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
menusRouter.post('/', validateMenu, (req, res, next) => {
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
menusRouter.param('menuId', (req, res, next, menuId) => {
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

// Get a menu by ID
menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({ menu: req.menu })
})

// Update a menu by ID
menusRouter.put('/:menuId', validateMenu, (req, res, next) => {
  const sql = 'UPDATE Menu SET title = $title WHERE id = $id;'
  const values = {
    $title: req.body.menu.title,
    $id: req.params.menuId
  }

  db.run(sql, values, function (error) {
    if (error) {
      next(error)
    } else {
      db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (error, menu) => {
        if (error) {
          next(error)
        } else {
          res.status(200).json({ menu: menu })
        }
      })
    }
  })
})

// Check for related menu items
menusRouter.delete('/:menuId', (req, res, next) => {
  const menuItemSql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId;'
  const menuItemValues = { $menuId: req.params.menuId }
  db.get(menuItemSql, menuItemValues, (error, menuItem) => {
    if (error) {
      next(error)
    } else if (menuItem) {
      res.sendStatus(400)
    } else {
      const menuSql = 'DELETE FROM Menu WHERE Menu.id = $menuId;'
      const menuValues = { $menuId: req.params.menuId }
      db.run(menuSql, menuValues, error => {
        if (error) {
          next(error)
        } else {
          res.sendStatus(204)
        }
      })
    }
  })
})

menusRouter.use('/:menuId/menu-items', menuItemsRouter)
module.exports = menusRouter
