entity = new Object()
entity.x = 0
entity.y = 0
entity.dx = 0
entity.dy = 0
entity.acceleration = 0.3
entity.deceleration = 0.9
entity.height = 50
entity.width = 50
entity.bounciness = 0.2

entity.color = 'black'
entity.direction = 0

entity.update = ->
  @x += @dx
  @y += @dy
  @dx *= @deceleration
  @dy *= @deceleration
  @stayInBounds()

entity.stayInBounds = ->
  totalBounce = 10*@bounciness
  if @x < game.leftEdge then @dx += totalBounce
  if @x + @width > game.rightEdge then @dx -= totalBounce
  if @y < game.topEdge then @dy += totalBounce
  if @y + @height > game.bottomEdge then @dy -= totalBounce

entity.knockback = (collider, extraBouncy = 1) ->
  if extraBouncy > 0
    console.log(@x, collider.x, @y, collider.y, @bounciness, extraBouncy)
  @dx += (@x - collider.x)*@bounciness*extraBouncy
  @dy += (@y - collider.y)*@bounciness*extraBouncy

entity.checkCollisions = (colliders) ->
  for collider in colliders
    if @x + @width > collider.x > @x - collider.width
      if @y + @height > collider.y > @y - collider.height
        @hit(collider)
        collider.hit(@)

module.exports = entity