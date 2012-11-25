enemy = object(player)
enemy.type = 'enemy'

# enemy.hit = (hitter) ->
  #damage enemy
  #damage player

enemy.randomizePosition = ->
  @x = Math.random()*canvas.width
  @y = Math.random()*canvas.height

module.exports = enemy