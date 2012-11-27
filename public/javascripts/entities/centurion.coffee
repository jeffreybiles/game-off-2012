enemy = require('./enemy')
centurion = object(enemy)

centurion.lightness = 0.1
centurion.caution = 2.5
centurion.randomness = 0
centurion.seeking = 0.5
centurion.hp = 100
centurion.color = '333'
centurion.damage = 20
centurion.bounciness = 0.3

module.exports = centurion