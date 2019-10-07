function $(selector)
{
    let res = document.querySelectorAll(selector)
    switch (res.length)
    {
        case 0:
            return null
        case 1:
            return res[0]
        default:
            return res
    }
}

function setCurrentPanel (panelName)
{
    let newPanel = document.querySelector(`div.panel[data-name="${panelName}"]`)
    if (newPanel == null)
        return

    for (let el of document.getElementsByClassName("panel"))
    {
        el.style.display = "none"
    }
    newPanel.style.display = "block"
    currentPanel = newPanel
}

function updateVideoPanelSize()
{
    $("#video-container").style.height = ($("#video-container").clientWidth * 9 / 16) + "px"
}

updateVideoPanelSize()
window.addEventListener("resize", () => { updateVideoPanelSize() })