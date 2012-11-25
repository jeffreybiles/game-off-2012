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
  ctx.fillStyle = 'red'
  ctx.fillRect(10, 10, player.hp + 10, 10)
  ctx.fillRect(canvas.width - 150, 10, latestEnemy[0].hp, 10) if latestEnemy[0]

enemyFactory = (num) ->
  for n in [1..num]
    newEnemy = object(enemyPrototype)
    newEnemy.randomizePosition()
    enemies.push(newEnemy)

start = ->
  enemyFactory(4)
  latestEnemy[0] = enemies[0]
  mainLoop()

module.exports = start