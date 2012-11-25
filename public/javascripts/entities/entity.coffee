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

entity.knockback = (collider) ->
  @dx += (@x - collider.x)*@bounciness
  @dy += (@y - collider.y)*@bounciness


module.exports = entity