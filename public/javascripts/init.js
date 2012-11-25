(function(){
  canvas = document.getElementById("mainCanvas")
  ctx = canvas.getContext("2d")

  player = require('./player')

  Mousetrap.hold('up', player, 'kup')
  Mousetrap.hold('down', player, 'kdown')
  Mousetrap.hold('left', player, 'kleft')
  Mousetrap.hold('right', player, 'kright')

  start = require('./game')
  start()
})()