(function(){
  canvas = document.getElementById("mainCanvas")
  ctx = canvas.getContext("2d")
  console.log("I've defined context")
  console.log("it's: " + ctx)

  object = function(o){
    function F(){}
    F.prototype = o;
    return new F();
  }

  log = function(message){
    console.log(message);
  }

  global.canvas_width = 800
  global.canvas_height = 600

  player = require('./player')
  player.draw()
})()