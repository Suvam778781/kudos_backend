
const express=require('express')
const { handleUserSavingToDb, check } = require('../controllers/userController')



const userConfig=express.Router()


userConfig.post('/adduser',handleUserSavingToDb)



module.exports={
    userConfig
}

