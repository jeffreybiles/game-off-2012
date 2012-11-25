game = new Object()

game.enemies = []
game.latestEnemy = null

game.leftEdge = 0
game.rightEdge = canvas.width
game.topEdge = 0
game.bottomEdge = canvas.height
game.currentLevel = 1
level = null

game.mainLoop = ->
  if @player.hp <= 0
    @start()
  else
    window.requestAnimationFrame =>
      @mainLoop()

  @drawBackground()
  @player.checkCollisions(@enemies)
  @player.update()
  @player.control()
  @player.draw()

  @cleanDeadEnemies()

  for enemy in @enemies
    enemy.draw()
    enemy.update()

game.cleanDeadEnemies = ->
  @enemies = (enemy for enemy in @enemies when enemy.hp > 0)

#unsure if this belongs in game... but where else would it go?
game.drawBackground = ->
  # color = 128
  # ctx.fillStyle = "rgb(#{color},#{color},#{color})"
  # ctx.fillRect(0,0,canvas.width,canvas.height)
  level.draw()
  ctx.fillStyle = 'red'
  ctx.fillRect(10, 10, game.player.hp + 10, 10)
  ctx.fillRect(canvas.width - 150, 10, @latestEnemy.hp, 10) if @latestEnemy

game.start = ->
  @player = object(playerPrototype)
  level = require("./levels/#{@currentLevel}")
  game.enemies = []
  enemyFactory(4)
  @latestEnemy = @enemies[0]
  @mainLoop()

module.exports = game