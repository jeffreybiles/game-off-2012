entity = require('./entity')
player = object(entity)

player.x = 50
player.y = canvas.height/2
player.hp = 50
player.type = 'player'
player.slashing = false

player.draw = ->
  ctx.fillStyle = @color
  ctx.fillRect(@x,@y,@width,@height)
  if @slashing
    ctx.fillStyle = 'red'
    ctx.fillRect(@sword.x, @sword.y, @sword.width, @sword.height)

player.control = ->
  if @kup then @dy -= @acceleration; @direction = Math.PI/2
  if @kdown then @dy += @acceleration; @direction = Math.PI*3/2
  if @kleft then @dx -= @acceleration; @direction = Math.PI
  if @kright then @dx += @acceleration; @direction = 0

player.hit = (collider) ->
  @knockback(collider)
  log(@x, @y)

player.slash = ->
  if !@slashing
    sword = object(swordPrototype)
    sword.place(@x, @y, @width, @height, @direction)
    sword.checkCollisions(game.enemies)
    @sword = sword
    @slashing = true
    setTimeout( (=> @slashing = false), 250)


module.exports = player

