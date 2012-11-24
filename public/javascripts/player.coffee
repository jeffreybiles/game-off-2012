
player = new Object()

player.x = global.canvas_width/2
player.y = global.canvas_height/2
player.height = 50
player.width = 50

player.color = 'black'

player.draw = ->
  ctx.fillStyle = 'black'
  console.log(@x, @y, @width, @height)
  ctx.fillRect(@x,@y,@width,@height)

module.exports = player

