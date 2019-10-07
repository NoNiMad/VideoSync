const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const port = 3000

require('./socket.js')(io)

app.use(express.static('public'))

http.listen(port, () => console.log(`VideoSync listening on port ${port}!`))
