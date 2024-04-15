const path = require("path");
const morgan = require("morgan");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRoute = require("./route/auth");
const userRoute = require("./route/user");

dotenv.config();

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('Connected!'));

const port = 3000;
const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

// route
app.use("/auth", authRoute);
app.use("/user", userRoute);

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
  
// authentication : register and login

// json web token: used to authenticate users 
 