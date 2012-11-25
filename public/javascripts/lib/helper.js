(function(){
  object = function(o){
    function F(){}
    F.prototype = o
    return new F()
  }

  log = function(){
    console.log(arguments)
  }

  enemyFactory = function(num) {
    var n, newEnemy, _i, _results;
    _results = [];
    for (n = _i = 1; 1 <= num ? _i <= num : _i >= num; n = 1 <= num ? ++_i : --_i) {
      newEnemy = object(enemyPrototype);
      newEnemy.randomizePosition();
      _results.push(game.enemies.push(newEnemy));
    }
    return _results;
  };
})()