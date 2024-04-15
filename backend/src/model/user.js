const mongoose = require('mongoose');

const userSchema = new mongoose.Schema ({
    username: {
        type: String,
        require: true,
        unique: true,
        minLength: 6,
        maxLength: 20
    },
    email: {
        type: String,
        require: true,
        minLength: 10,
        maxLength: 50,
        unique: true
    },
    password: {
        type: String,
        require: true,
        minLength: 8
    },
    admin: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
)

let User = mongoose.model('User', userSchema)
module.exports = User;