mainLoop = ->
  window.requestAnimationFrame ->
    mainLoop()

  drawBackground()
  player.x += 1
  player.draw()


drawBackground = ->
  color = 128
  ctx.fillStyle = "rgb(#{color},#{color},#{color})"
  ctx.fillRect(0,0,canvas.width,canvas.height)

start = ->
  mainLoop()

module.exports = start