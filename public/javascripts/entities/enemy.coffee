enemy = object(require('./player'))
enemy.type = 'enemy'
enemy.seeking = 0.3
enemy.randomness = 1

enemy.hit = (hitter) ->
  @hurt(hitter)
  @knockback(hitter)

enemy.hurt = (hitter) ->
  hitter.hp -= 10

enemy.randomizePosition = ->
  @x = Math.random()*canvas.width
  @y = Math.random()*canvas.height

enemy.move = (level, player) ->
  if Math.random() > 0.9 then @changeDirection(level, player)
  @x += @dx
  @y += @dy

enemy.changeDirection = (level, player) ->
  row = Math.floor(@y/50)
  column = Math.floor(@x/50)
  leftOpen = level.squareOpen(row, column - 1) and level.squareOpen(row + 1, column - 1)
  rightOpen = level.squareOpen(row, column + 2) and level.squareOpen(row + 1, column + 2)
  topOpen = level.squareOpen(row - 1, column) and level.squareOpen(row - 1, column + 1)
  bottomOpen = level.squareOpen(row + 2, column) and level.squareOpen(row + 2, column + 1)

  xDistance = player.x - @x
  yDistance = player.x - @y


  if xDistance > 0 and rightOpen
    @dx += @seeking
  if xDistance < 0 and leftOpen
    @dx -= @seeking
  if yDistance > 0 and bottomOpen
    @dy += @seeking
  if yDistance < 0 and topOpen
    @dy -= @seeking

  if bottomOpen and Math.random() < 0.4
    @dy += @randomness
  if topOpen and Math.random() < 0.4
    @dy -= @randomness
  if leftOpen and Math.random() < 0.4
    @dx -= @randomness
  if rightOpen and Math.random() < 0.4
    @dx += @randomness

  @dx += (player.x - @x)/800
  @dy += (player.y - @y)/600

module.exports = enemy