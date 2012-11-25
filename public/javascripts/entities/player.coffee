entity = require('./entity')
player = object(entity)

player.x = canvas.width/2
player.y = canvas.height/2

player.type = 'player'

player.draw = ->
  ctx.fillStyle = 'black'
  ctx.fillRect(@x,@y,@width,@height)
  if @slashing > 0
    ctx.fillStyle = 'red'
    ctx.fillRect(@slashx, @slashy, @width, @height)
    @slashing -= 1

player.control = ->
  if @kup then @dy -= @acceleration; @direction = Math.PI/2
  if @kdown then @dy += @acceleration; @direction = Math.PI*3/2
  if @kleft then @dx -= @acceleration; @direction = Math.PI
  if @kright then @dx += @acceleration; @direction = 0

player.hit = (collider) ->
  @knockback(collider)
  log(@x, @y)

player.knockback = (collider) ->
  @dx += (@x - collider.x)/5
  @dy += (@y - collider.y)/5

player.checkCollisions = (colliders) ->
  for collider in colliders
    if @x + @width > collider.x > @x - collider.width
      if @y + @height > collider.y > @y - collider.height
        @hit(collider)
        collider.hit(@)

player.slash = ->
  @slashx = @x + Math.cos(@direction)*@width
  @slashy = @y - Math.sin(@direction)*@height
  #all this crap about numbers is only until we get animation
  @slashing = 10

module.exports = player

