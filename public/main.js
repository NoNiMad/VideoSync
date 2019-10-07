let currentPanel = null
let socket = io()
let player = null

socket.on("join confirmed", function (data)
{
    setCurrentPanel("app")
    $("#joinedRoom").innerText = `${data.room}`

    let ul = $("#members")
    while (ul.firstChild)
    {
        ul.removeChild(ul.firstChild);
    }

    for (let member of data.members)
    {
        let li = document.createElement("li")
        li.innerText = member
        ul.append(li)
    }
})

socket.on("someone joined", function (data)
{
    let li = document.createElement("li")
    li.innerText = data.name
    $("#members").append(li)
})

socket.on("someone left", function (data)
{
    let ul = $("#members")
    for (let el of ul.children)
    {
        if (el.innerText === data.name)
        {
            ul.removeChild(el)
            return
        }
    }
})

socket.on("video change", function (id)
{
    player.loadVideoById(id)
    player.pauseVideo()
})

socket.on("toggle play", function (targetState)
{
    if (targetState == YT.PlayerState.PLAYING && player.getPlayerState() != YT.PlayerState.PLAYING)
    {
        player.playVideo()
    }
    else if (targetState == YT.PlayerState.PAUSED && player.getPlayerState() != YT.PlayerState.PAUSED)
    {
        player.pauseVideo()
    }
})

function onCreateRoom()
{
    socket.emit("create",
    {
        name: $("#name").value
    })
}

function onJoinRoom()
{
    socket.emit("join",
    {
        room: $("#roomCode").value,
        name: $("#name").value
    })
}

$("#createRoom").addEventListener("click", onCreateRoom)
$("#joinRoom").addEventListener("click", onJoinRoom)

$("#load").addEventListener("click", async function()
{
    socket.emit('load video', $("#videoLink").value)
})

$("#leave").addEventListener("click", function()
{
    socket.emit("leave")
    setCurrentPanel("connect")
})

setCurrentPanel("connect")

function onYouTubeIframeAPIReady()
{
    player = new YT.Player('video-container',
    {
        width: "100%",
        height: ($("#video-container").contentWidth * 9 / 16) + "px",
        videoId: "",
        events:
        {
            onStateChange: (event) =>
            {
                if (event.data == YT.PlayerState.PLAYING || event.data == YT.PlayerState.PAUSED)
                {
                    socket.emit("toggle play", event.data)
                }
            }
        }
    })
}