(function(){
  object = function(o){
    function F(){}
    F.prototype = o
    return new F()
  }

  log = function(){
    console.log(arguments)
  }
})()