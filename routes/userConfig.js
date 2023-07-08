
const express=require('express')
const { handleUserSavingToDb, check } = require('../controllers/userController')



const userConfig=express.Router()


userConfig.post('/adduser',handleUserSavingToDb)
userConfig.get('/check',check)


module.exports={
    userConfig
}

