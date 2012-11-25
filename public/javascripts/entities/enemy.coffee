enemy = object(player)
enemy.type = 'enemy'

enemy.hit = (hitter) ->
  @hurt(hitter)
  @knockback(hitter)

enemy.hurt = (hitter) ->
  hitter.hp -= 10
  log(hitter.hp)
enemy.randomizePosition = ->
  @x = Math.random()*canvas.width
  @y = Math.random()*canvas.height

module.exports = enemy