(function(){
  canvas = document.getElementById("mainCanvas")
  ctx = canvas.getContext("2d")

  playerPrototype = require('./entities/player')
  enemyPrototype = require('./entities/enemy')
  swordPrototype = require('./entities/sword')
  game = require('./game')

  Mousetrap.bind('space', function(){game.player.slash()})
  Mousetrap.hold('up', game.player, 'kup')
  Mousetrap.hold('down', game.player, 'kdown')
  Mousetrap.hold('left', game.player, 'kleft')
  Mousetrap.hold('right', game.player, 'kright')

  start = require('./start')
  start()
})()