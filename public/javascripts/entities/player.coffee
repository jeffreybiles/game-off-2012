entity = require('./entity')
player = object(entity)

player.x = canvas.width/2
player.y = canvas.height/2
player.hp = 100
player.type = 'player'

player.draw = ->
  ctx.fillStyle = 'black'
  ctx.fillRect(@x,@y,@width,@height)
  if @sword && @sword.timer > 0
    ctx.fillStyle = 'red'
    ctx.fillRect(@sword.x, @sword.y, @sword.width, @sword.height)
    @sword.timer -= 1

player.control = ->
  if @kup then @dy -= @acceleration; @direction = Math.PI/2
  if @kdown then @dy += @acceleration; @direction = Math.PI*3/2
  if @kleft then @dx -= @acceleration; @direction = Math.PI
  if @kright then @dx += @acceleration; @direction = 0

player.hit = (collider) ->
  @knockback(collider)
  log(@x, @y)

player.slash = ->
  sword = object(swordPrototype)
  sword.place(@x, @y, @width, @height, @direction)
  sword.checkCollisions(game.enemies)
  @sword = sword


module.exports = player

