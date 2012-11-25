mainLoop = ->
  window.requestAnimationFrame ->
    mainLoop()

  drawBackground()
  game.player.checkCollisions(game.enemies)
  game.player.update()
  game.player.control()
  game.player.draw()
  for enemy in game.enemies
    enemy.draw()
    enemy.update()

drawBackground = ->
  color = 128
  ctx.fillStyle = "rgb(#{color},#{color},#{color})"
  ctx.fillRect(0,0,canvas.width,canvas.height)
  ctx.fillStyle = 'red'
  ctx.fillRect(10, 10, game.player.hp + 10, 10)
  ctx.fillRect(canvas.width - 150, 10, game.latestEnemy.hp, 10) if game.latestEnemy

enemyFactory = (num) ->
  for n in [1..num]
    newEnemy = object(enemyPrototype)
    newEnemy.randomizePosition()
    game.enemies.push(newEnemy)

start = ->
  enemyFactory(4)
  game.latestEnemy = game.enemies[0]
  mainLoop()

module.exports = start