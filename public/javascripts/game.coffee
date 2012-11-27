game = new Object()

game.enemies = []
game.latestEnemy = null

game.leftEdge = 0
game.rightEdge = canvas.width
game.topEdge = 0
game.bottomEdge = canvas.height
game.currentLevel = 1

lvl1 = require('./levels/1')
lvl2 = require('./levels/2')
lvl3 = require('./levels/3')
lvl4 = require('./levels/4')
game.level = eval("lvl#{game.currentLevel}")

game.mainLoop = ->
  if @player.hp <= 0
    @start()
  else if @enemies.length == 0 && @player.x > 700
    @currentLevel += 1
    oldLevel = @level
    @loadLevel()
    @slideLevel(oldLevel, @level)
  else
    window.requestAnimationFrame =>
      @mainLoop()

  @level.draw(0)
  @drawHUD()
  @player.checkCollisions(@enemies)
  @player.update()
  @player.control()
  @player.draw()
  @level.interactWith(@player)

  @cleanDeadEnemies()

  for enemy in @enemies
    enemy.draw()
    enemy.update()
    enemy.move(@level, @player)
    @level.interactWith(enemy)

game.cleanDeadEnemies = ->
  @enemies = (enemy for enemy in @enemies when enemy.hp > 0)

game.slideLevel = (oldLevel, newLevel, i = 0) ->
  if i <= -800
    @player.x = 50
    @mainLoop()
  else
    log(oldLevel, newLevel, i)
    oldLevel.draw(i)
    newLevel.draw(800 + i)
    setTimeout =>
      @slideLevel(oldLevel, newLevel, i - 5)
    , 0.5

#unsure if this belongs in game... but where else would it go?
game.drawHUD = ->
  ctx.fillStyle = 'red'
  ctx.fillRect(10, 10, game.player.hp + 10, 10)
  ctx.fillRect(canvas.width - 150, 10, @latestEnemy.hp, 10) if @latestEnemy
  if @enemies.length == 0
    @drawArrow(400)
    @drawArrow(200)

#same with this... where does it go?
game.drawArrow = (y) ->
  x = 700
  width = 50
  height = 50
  ctx.fillStlye = 'black'
  ctx.fillRect(x - width, y - height/2, width, height)
  ctx.beginPath()
  ctx.moveTo(x, y - height)
  ctx.lineTo(x + width, y)
  ctx.lineTo(x, y + height)
  ctx.closePath()
  ctx.fill()

game.loadLevel = ->
  @level = eval("lvl#{@currentLevel}")
  @enemies = []
  @createEnemies()
  @latestEnemy = @enemies[0]

game.createEnemies = ->
  enemyPrototype = require('../entities/enemy')
  for enemy in @level.enemies
    thisEnemy = object(enemyPrototype)
    thisEnemy.x = enemy.x
    thisEnemy.y = enemy.y
    @enemies.push(thisEnemy)

game.start = ->
  @player = object(playerPrototype)
  @loadLevel()
  @mainLoop()

module.exports = game