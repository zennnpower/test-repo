const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let moment = require('moment');

const PostSchema = new Schema({
    title: {type: String},
    description: {type: String},
    author: {type: String},
    date: {
        type: String,
        default: moment().format('DD-MM-YYYY, h:mm a')
    },
    comments: {type: Array, default: []}
})

module.exports = mongoose.model("Post", PostSchema);