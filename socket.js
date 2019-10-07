let charPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
function genRoomCode(length)
{
    let res = ""
    for (let i = 0; i < length; i++)
    {
        res += charPool[Math.floor(Math.random() * charPool.length)]
    }
    return res
}

let rooms = {}

module.exports = function (io)
{
    io.on("connection", function (socket)
    {
        let member = null
        
        function handleLeave()
        {
            if (member == null)
                return
        
            rooms[member.room] = rooms[member.room].filter(n => n != member.name)
            if (rooms[member.room].length == 0)
                delete rooms[member.room]
    
            socket.leave(`room ${member.room}`)
            io.to(`room ${member.room}`).emit("someone left", { name: member.name })
            member = null
        }
    
        socket.on("leave", handleLeave)
        socket.on("disconnect", handleLeave)
    
        socket.on("create", function(data)
        {
            let sanitizedName = data.name.trim()
            if (sanitizedName.length == 0 || sanitizedName.length > 50)
            {
                socket.emit("join failed", { message: "Username too short or too long (1-50)" })
                return
            }
    
            let code = genRoomCode(4)
            while (rooms[code] !== undefined)
                code = genRoomCode(4)
    
            rooms[code] = [ sanitizedName ]
            member = { room: code, name: sanitizedName }
    
            socket.join(`room ${code}`)
            socket.emit("join confirmed", { room: code, name: sanitizedName, members: [ sanitizedName ] })
        })
    
        socket.on("join", function (data)
        {
            if (rooms[data.room] == undefined)
            {
                socket.emit("join failed", { message: "Room not found" })
                return
            }
    
            let sanitizedName = data.name.trim()
            if (sanitizedName.length == 0 || sanitizedName.length > 50)
            {
                socket.emit("join failed", { message: "Username too short or too long (1-50)" })
                return
            }
    
            rooms[data.room].push(sanitizedName)
            member = { room: data.room, name: sanitizedName }
    
            let socketRoomName = `room ${data.room}`
            io.to(socketRoomName).emit("someone joined", { name: sanitizedName })
    
            socket.join(socketRoomName)
            socket.emit("join confirmed", { room: data.room, name: sanitizedName, members: rooms[data.room] })
        })

        socket.on("load video", function (link)
        {
            if (link.indexOf("watch?v=") > -1)
            {
                io.to(`room ${member.room}`).emit("video change", link.split("watch?v=")[1])
            }
            else
            {
                io.to(`room ${member.room}`).emit("video change", link)
            }
        })

        socket.on("toggle play", function (targetState)
        {
            io.to(`room ${member.room}`).emit("toggle play", targetState)
        })
    })
}