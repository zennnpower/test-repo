const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const { body, check, validationResult } = require("express-validator")

require("dotenv").config()

// REGISTER
router.post("/register",
    body("username", "Username must be at least 5 characters long!").isLength({min: 5}),
    check('username')
        .custom(value => !/\s/.test(value))
        .withMessage("Username must not contain spacing!"),
    body("email", "Please provide a valid email address!").isEmail(),
    body("password", "Password must be at least 8 characters long!").isLength({min: 8}),
    check("password").exists(),
    check(
        "confirm_password",
        "Passwords do not match!"
    )
    .exists()
    .custom((value, {req}) => value === req.body.password),
    (req, res) => {
        const errors = validationResult(req)

        console.log(errors)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        let {username, password, email} = req.body

        User.findOne({"email": email}, (err, user) => {
            if (user) {
                return res.status(400).json({msg: "An account with the same email exists!", err: "Email error!"});
            } else {
                User.findOne({"username": username}, (err, user) => {
                    if (user) {
                        return res.status(400).json({msg: "An account with the same username exists!", err: "Username error!"});
                    } else {
                        let user = new User();
                        user.username = username;
                        user.email = email;
            
                        // HASH THE PASSWORD
                        let salt = bcrypt.genSaltSync(10);
                        let hash = bcrypt.hashSync(password, salt);
                        user.password = hash;
                        user.save();
                        return res.json({msg: "Registration successful", user})
                    }
                })
            }
        })
    }
)

// LOGIN
router.post("/login", (req, res) => {
    const {email, password} = req.body

    User.findOne({email}, (err, user) => {
        if (!user) return res.status(400).json({msg: "User does not exist!"})
        if (err) return res.status(400).json({err})

        let isMatch = bcrypt.compareSync(password, user.password)

        if (!isMatch) return res.status(400).json({msg: "Invalid credentials!"})

        let payload = {
            id: user.id,
            email: user.email,
            username: user.username,
            isAdmin: user.isAdmin
        }

        jwt.sign(
            payload,
            process.env.SECRET_KEY,
            {expiresIn: "1h"},
            (err, token) => {
                if (err) return res.status(400).json({
                    msg: "Invalid credentials!"
                })
                return res.json({
                    msg: "Login successful!",
                    token
                })
            }
        )
    })
})

module.exports = router