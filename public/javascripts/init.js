(function(){
  canvas = document.getElementById("mainCanvas")
  ctx = canvas.getContext("2d")

  player = require('./player')

  start = require('./game')
  start()
})()