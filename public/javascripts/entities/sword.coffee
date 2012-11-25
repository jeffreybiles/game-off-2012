entity = require('./entity')
sword = object(entity)

sword.place = (x, y, width, height, direction) ->
  sword.x = x + Math.cos(direction)*width
  sword.y = y - Math.sin(direction)*height
  sword.width = width
  sword.height = height

sword.timer = 10 #all this crap about numbers is only until we get animation

sword.hit = (hit) ->
  hit.hp -= 20
  log(hit.hp)
  latestEnemy[0] = hit
  log(latestEnemy)
module.exports = sword