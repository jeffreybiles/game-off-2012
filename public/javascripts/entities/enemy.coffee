enemy = object(player)
enemy.randomizePosition = ->
  @x = Math.random()*canvas.width
  @y = Math.random()*canvas.height

module.exports = enemy