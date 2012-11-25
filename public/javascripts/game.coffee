mainLoop = ->
  window.requestAnimationFrame ->
    mainLoop()

  drawBackground()
  player.checkCollisions(enemies)
  player.update()
  player.control()
  player.draw()
  for enemy in enemies
    enemy.draw()
    enemy.update()

drawBackground = ->
  color = 128
  ctx.fillStyle = "rgb(#{color},#{color},#{color})"
  ctx.fillRect(0,0,canvas.width,canvas.height)

enemyFactory = (num) ->
  for n in [1..num]
    newEnemy = object(enemyPrototype)
    newEnemy.randomizePosition()
    enemies.push(newEnemy)

start = ->
  enemyFactory(1)
  mainLoop()

module.exports = start