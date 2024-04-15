const router = require("express").Router();
const userController = require("../controller/UserController");
const middlewareController = require("../controller/middlewareController");

//get all user

// use middleware to verify token for authentication 
router.get("/", middlewareController.verifyToken, userController.getAllUser);

// delete user
router.delete("/:id", middlewareController.verifyTokenAndAdminAuth, userController.deleteUser);

module.exports = router;