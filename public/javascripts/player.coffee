
player = new Object()

player.x = canvas.width/2
player.y = canvas.height/2
player.height = 50
player.width = 50

player.color = 'black'

player.draw = ->
  ctx.fillStyle = 'black'
  log(@x, @y, @width, @height)
  ctx.fillRect(@x,@y,@width,@height)

module.exports = player

