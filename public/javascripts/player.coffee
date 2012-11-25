player = new Object()

player.x = canvas.width/2
player.y = canvas.height/2
player.height = 50
player.width = 50

player.color = 'black'
player.direction = 0

player.draw = ->
  ctx.fillStyle = 'black'
  ctx.fillRect(@x,@y,@width,@height)
  #do something here about drawing the slash?

player.update = ->
  if @kup then @y -= 1; @direction = Math.PI/2
  if @kdown then @y += 1; @direction = Math.PI*3/2
  if @kleft then @x -= 1; @direction = Math.PI
  if @kright then @x += 1; @direction = 0

player.slash = ->
  x = @x + Math.cos(@direction)*@width
  y = @y - Math.sin(@direction)*@height
  ctx.fillStyle = 'red'
  ctx.fillRect(x, y, @width, @height)

module.exports = player

