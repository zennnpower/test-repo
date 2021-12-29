const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let moment = require('moment');

const CommentSchema = new Schema({
    post: {type: String},
    description: {type: String},
    author: {type: String},
    date: {
        type: String,
        default: moment().format('DD-MM-YYYY, h:mm a')
    },
    deleted: {type: Boolean, default: false}
})

module.exports = mongoose.model("Comment", CommentSchema);