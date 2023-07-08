
const express=require('express')
const { handleUserSavingToDb } = require('../controllers/userController')


const userConfig=express.Router()


const userConfigRoute=userConfig.post('/adduser',handleUserSavingToDb)

