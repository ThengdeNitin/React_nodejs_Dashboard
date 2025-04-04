const express = require('express');
const { getUser,getUserId,getUserById,createUser,addProductsToChallan,editProductsInChallan,deleteUser } = require('../controllers/Controller');

//router object 
const router = express.Router();

//routes

//get all user list
router.get('/getall',getUser);

//Get User by id
router.get('/getproduct/:id',getUserId);

//Get user By ID
router.get('/get/:dc_id/:product_id', getUserById);

//Create user
router.post('/create', createUser);

//Update product 
router.put('/createproduct/:id', addProductsToChallan);

//Edit product 
router.put('/editproduct/:dc_id/:product_id', editProductsInChallan);

//Delete user 
router.delete('/delete/:id', deleteUser);

module.exports = router