// LOAD .env INTO process.env
require("dotenv").config()
const {PORT, DB_NAME, DB_PASSWORD, DB_HOST, DB_PORT} = process.env;

// SET UP EXPRESS AND CORS
const express = require("express")
const cors = require("cors")
const app = express()
const mongoose = require("mongoose")

app.use(express.json())
app.use(cors())

// CONNECT TO LOCAL DATABASE
mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`)
mongoose.connection.once("open", () => console.log("CONNECTED TO MONGODB"))

// CONNECT TO ONLINE DATABASE
// CREATE A NEW DATABASE BTW

// ROUTING
app.use("/auth", require("./routes/auth"))
app.use("/posts", require("./routes/posts"))
app.use("/comments", require("./routes/comments"))
app.use("/questions", require("./routes/questions"))

// LISTEN IN ON PORT
app.listen(process.env.PORT, () => {
  console.log(`CODEBLOCK LISTENING TO "http://localhost:${process.env.PORT}"`)
})