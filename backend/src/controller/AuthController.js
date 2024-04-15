const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../model/user");

dotenv.config();

// create an array is store refresh token

let refreshTokens = [];

// ------ > but should use redis to store refresh token (research it) <---------------

const authController = {
    registerUser: async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            // create new user

            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword
            });

            // save user to db
            const user = await newUser.save();
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // generate access token
    generateAccessToken: (user) => {
        return jwt.sign({
            id: user._id,
            admin: user.admin
        }, process.env.JWT_ACCESS_KEY, { expiresIn: "60s" });
    },

    // generate refresh token
    generateRefreshToken: (user) => {
        return jwt.sign({
            id: user._id,
            admin: user.admin
        }, process.env.JWT_REFRESH_KEY, { expiresIn: "100d" });
    },

    // login
    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ username: req.body.username });
            if (!user)
                res.status(400).json("Wrong username!");

            const validatedPassword = await bcrypt.compare(req.body.password, user.password);

            if (!validatedPassword)
                res.status(400).json("Wrong password!");

            if (user && validatedPassword) {
                const accessToken = authController.generateAccessToken(user);
                const refreshToken = authController.generateRefreshToken(user);

                refreshTokens.push(refreshToken);

                // store refresh token in cookies
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false, // only send over https , when deploy then set it to true
                    path: "/",
                    sameSite: "strict"
                })

                // Although the password has been hashed , but it's still dangerous
                // so all information except the password will be visible
                const { password, ...others } = user._doc;

                res.status(200).json({...others, accessToken});
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // refresh token
    refreshToken: async (req, res) => {
        // take refresh token from user
        const refreshToken = req.cookie.refreshToken;

        if (!refreshToken)
            return res.status(401).json("You're not authenticated!");
        if (!refreshTokens.includes(refreshToken))
            return res.status(403).json("Refresh token is not valid!");

        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (error, user) => {
            if (error)
                console.log(error);

    /**
     * Remove the used refresh token from the list of valid tokens by using the filter function, 
     * we create a new array that only contains the tokens that are not equal to the used token
     * This ensures that a refresh token can only be used once and helps prevent replay attacks
     */
            refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

            // create new access , refresh token
            const newAccessToken = authController.generateAccessToken(user);
            const newRefreshToken = authController.generateRefreshToken(user);

            refreshTokens.push(newRefreshToken);

            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: false, // only send over https , when deploy then set it to true
                path: "/",
                sameSite: "strict"
            });

            res.status(200).json({ accessToken: newAccessToken });
        })
    },

    // log out
    logoutUser: async (req, res) => {
        // when logout , cookie that include refresh token will be deleted
        res.clearCookie("refreshToken");

        // remove the used refresh token from the list of valid tokens
        refreshTokens = refreshTokens.filter((token) => token !== req.cookies.refreshToken); 
        res.status(200).json("Logged out successfully!");
    }
}

module.exports = authController;

// Summary of access token and refresh token
/**
 * 1. Access token
 *    Used to authenticate user when accessing protected resources on the server
 *    This token usually has a short life time (ex 10 minutes) and included in every request 
 *    from the client to the server. Access tokens allow users to access resources for which they are authorized.
 * 2. Refresh token
 *    Used to get a new access token after the current access token expires
 *    It usually last longer than access tokens and is used to create new access tokens
 *    without the user having to log in again.
 *    It's usually more secure than an access token because it has a long lifespan 
 *    and is only used to retrieve new access tokens.
 */

// 3 ways to store token

/**
 * 1. Local storage (no use)
 * 2. HTTP ONLY COOKIES 
 * 3. REDUX STORE -> access token
 *      http only coolie -> refresh token
 */


// store token in cookies (http only cookie)

// sau khi tao token ,roi gan no vao cookie
// va moi lan verify/ xac thuc ban than thi chi can gui token do trong cookie va gui no di thoi
