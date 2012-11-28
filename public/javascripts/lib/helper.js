(function(){
  object = function(o){
    function F(){}
    F.prototype = o
    return new F()
  }

  log = function(){
    console.log(arguments)
  }

  floorWithin = function(num, min, max) {
  if (min == null) {
    min = Number.NEGATIVE_INFINITY;
  }
  if (max == null) {
    max = Number.POSITIVEINFINITY;
  }
  if (num < min) {
    num = min;
  }
  if (num > max) {
    num = max;
  }
  return Math.floor(num);
};
})()