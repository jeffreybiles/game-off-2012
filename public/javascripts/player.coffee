
player = new Object()

player.x = global.canvas_width/2
player.y = global.canvas_height/2
player.height = 50
player.width = 50

player.color = 'black'

player.draw = ->
  log("draw draw draw")
  log("I'm drawing: #{@color}")
  ctx.fillColor = @color
  console.log(@x, @y, @width, @height)
  ctx.fillRect(@x,@y,@width,@height)

console.log('hello there')

module.exports = player

