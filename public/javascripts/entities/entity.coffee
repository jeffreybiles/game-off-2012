entity = new Object()
entity.x = 0
entity.y = 0
entity.dx = 0
entity.dy = 0
entity.acceleration = 0.2
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
  if @x < game.leftEdge then @dx += 10*@bounciness
  if @x + @width > game.rightEdge then @dx -= 10*@bounciness
  if @y < game.topEdge then @dy += 10*@bounciness
  if @y + @height > game.bottomEdge then @dy -= 10*@bounciness

entity.knockback = (collider) ->
  @dx += (@x - collider.x)*@bounciness
  @dy += (@y - collider.y)*@bounciness

entity.checkCollisions = (colliders) ->
  for collider in colliders
    if @x + @width > collider.x > @x - collider.width
      if @y + @height > collider.y > @y - collider.height
        @hit(collider)
        collider.hit(@)

module.exports = entity