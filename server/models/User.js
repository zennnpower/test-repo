const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String},
    email: {type: String},
    password: {type: String},
    isAdmin: {type: Boolean, default: false},
    questions_attempted: {type: Array, default: []},
    questions_completed: {type: Array, default: []}
})

module.exports = mongoose.model("User", UserSchema);