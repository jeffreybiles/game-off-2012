player = new Object()

player.x = canvas.width/2
player.y = canvas.height/2
player.height = 50
player.width = 50

player.color = 'black'

player.draw = ->
  ctx.fillStyle = 'black'
  ctx.fillRect(@x,@y,@width,@height)

player.update = ->
  if @kup then @y -= 1
  if @kdown then @y += 1
  if @kleft then @x -= 1
  if @kright then @x += 1

module.exports = player

