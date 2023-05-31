const mongoose = require('mongoose')

const URL_CONECTION = 'mongodb+srv://alexparco19:HXwHvwzcK5MYjDI1@cluster0.ir2fz6p.mongodb.net/nsaa?retryWrites=true&w=majority'

mongoose.connect(URL_CONECTION)

mongoose.connection.on('connected', () => {
  console.log("Mongoose connected")
})
mongoose.connection.on('disconnected', () => {
  console.log("Mongoose Disconnected")
})
mongoose.connection.on('error', () => {
  console.log("Mongoose Error")
})

module.exports = mongoose
