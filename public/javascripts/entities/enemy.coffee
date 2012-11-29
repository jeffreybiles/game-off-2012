enemy = object(require('./player'))
enemy.type = 'enemy'
enemy.seeking = 0.3
enemy.randomness = 1
enemy.caution = 1
enemy.lightness = 2
enemy.damage = 10
enemy.x = 700
enemy.y = 275
enemy.hp = 50

enemy.color = '#980'

enemy.hit = (hitter) ->
  @hurt(hitter)
  @knockback(hitter)

enemy.hurt = (hitter) ->
  hitter.hp -= @damage

enemy.randomizePosition = ->
  @x = Math.random()*canvas.width
  @y = Math.random()*canvas.height

enemy.move = (level, player) ->
  @changeDirection(level, player)
  @x += @dx
  @y += @dy

enemy.changeDirection = (level, player) ->

  xDistance = player.x - @x
  yDistance = player.y - @y

  if player.pulling
    @x += @lightness if xDistance > 0
    @x -= @lightness if xDistance < 0
    @y += @lightness if yDistance > 0
    @y -= @lightness if yDistance < 0

  if Math.random() > 0.9
    row = floorWithin(@y/50, 0, game.level.numRows() - 2)
    column = floorWithin(@x/50, 0, game.level.numColumns() - 2)
    leftOpen = level.squareOpen(row, column - 1) and level.squareOpen(row + 1, column - 1)
    rightOpen = level.squareOpen(row, column + 2) and level.squareOpen(row + 1, column + 2)
    topOpen = level.squareOpen(row - 1, column) and level.squareOpen(row - 1, column + 1)
    bottomOpen = level.squareOpen(row + 2, column) and level.squareOpen(row + 2, column + 1)

    @dx += @seeking if xDistance > 0 and rightOpen
    @dx -= @seeking if xDistance < 0 and leftOpen
    @dy += @seeking if yDistance > 0 and bottomOpen
    @dy -= @seeking if yDistance < 0 and topOpen

    if bottomOpen and Math.random() < 0.4
      @dy += @randomness
    if topOpen and Math.random() < 0.4
      @dy -= @randomness
    if leftOpen and Math.random() < 0.4
      @dx -= @randomness
    if rightOpen and Math.random() < 0.4
      @dx += @randomness

    if !bottomOpen then @dy -= @caution
    if !topOpen then @dy += @caution
    if !leftOpen then @dx += @caution
    if !rightOpen then @dx -= @caution


module.exports = enemy