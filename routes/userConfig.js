
const express=require('express')


const userConfig=express.Router()


const userConfigRoute=userConfig.post('/adduser',handleUserSavingToDb)

