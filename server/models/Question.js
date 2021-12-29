const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let moment = require('moment');

const QuestionSchema = new Schema({
    title: {type: String},
    description: {type: String},
    starter_code_py: {type: String, default: ""},
    starter_code_js: {type: String, default: ""},
    test_cases: {type: Array},
    users_attempted: {type: Array, default: []},
    users_completed: {type: Array, default: []},
    date: {
        type: String,
        default: moment().format('DD-MM-YYYY, h:mm a')
    }
})

module.exports = mongoose.model("Question", QuestionSchema);