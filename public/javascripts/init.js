(function(){
  canvas = document.getElementById("mainCanvas")
  ctx = canvas.getContext("2d")

  playerPrototype = require('./entities/player')
  enemyPrototype = require('./entities/enemy')
  swordPrototype = require('./entities/sword')

  game = require('./game')

  Mousetrap.bind('space', function(){game.player.slash()})
  Mousetrap.hold('up', playerPrototype, 'kup')
  Mousetrap.hold('down', playerPrototype, 'kdown')
  Mousetrap.hold('left', playerPrototype, 'kleft')
  Mousetrap.hold('right', playerPrototype, 'kright')
  Mousetrap.hold('x', playerPrototype, 'pulling')

  game.start()
})()