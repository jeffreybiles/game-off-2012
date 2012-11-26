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
game.level = eval("lvl#{game.currentLevel}")

game.mainLoop = ->
  if @player.hp <= 0
    @start()
  else if @enemies.length == 0 && @player.x > 700
    @currentLevel += 1
    oldLevel = @level
    @loadLevel()
    @mainLoop() #TODO: this will be replaced with
    #a changeLevel function that will take the old level
    #and slide it to the left so that the player is now on the left side of the srcreen
  else
    window.requestAnimationFrame =>
      @mainLoop()

  @drawBackground()
  @player.checkCollisions(@enemies)
  @player.update()
  @player.control()
  @player.draw()
  @level.interactWith(@player)

  @cleanDeadEnemies()

  for enemy in @enemies
    enemy.draw()
    enemy.update()
    @level.interactWith(enemy)

game.cleanDeadEnemies = ->
  @enemies = (enemy for enemy in @enemies when enemy.hp > 0)

#unsure if this belongs in game... but where else would it go?
game.drawBackground = ->
  @level.draw()
  ctx.fillStyle = 'red'
  ctx.fillRect(10, 10, game.player.hp + 10, 10)
  ctx.fillRect(canvas.width - 150, 10, @latestEnemy.hp, 10) if @latestEnemy
  # if @enemies.length == 0
    #TODO:  draw an arrow here

game.loadLevel = ->
  @level = eval("lvl#{@currentLevel}")
  @enemies = []
  enemyFactory(@level.numEnemies)
  @latestEnemy = @enemies[0]

game.start = ->
  @player = object(playerPrototype)
  @loadLevel()
  @mainLoop()

module.exports = game