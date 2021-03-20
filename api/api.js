const express = require('express')
const apiRouter = express.Router()
const employeeRouter = require('./employees')
const menuRouter = require('./menu')

apiRouter.use('/employees', employeeRouter)
apiRouter.use('/menu', menuRouter)
module.exports = apiRouter
