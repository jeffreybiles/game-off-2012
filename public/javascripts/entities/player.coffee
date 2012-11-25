player = new Object()

player.x = canvas.width/2
player.y = canvas.height/2
player.height = 50
player.width = 50

player.color = 'black'
player.direction = 0

player.type = 'player'

player.draw = ->
  ctx.fillStyle = 'black'
  ctx.fillRect(@x,@y,@width,@height)
  if @slashing > 0
    ctx.fillStyle = 'red'
    ctx.fillRect(@slashx, @slashy, @width, @height)
    @slashing -= 1

player.update = ->
  if @kup then @y -= 1; @direction = Math.PI/2
  if @kdown then @y += 1; @direction = Math.PI*3/2
  if @kleft then @x -= 1; @direction = Math.PI
  if @kright then @x += 1; @direction = 0

player.hit = (collider) ->
  log(@x, @y)

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

