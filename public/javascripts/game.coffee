game = new Object()

game.player = require('./entities/player')
game.enemies = []
game.latestEnemy = null

game.leftEdge = 0
game.rightEdge = canvas.width
game.topEdge = 0
game.bottomEdge = canvas.height

module.exports = game