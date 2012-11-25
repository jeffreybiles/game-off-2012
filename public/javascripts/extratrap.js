(function(){
  Mousetrap.hold = function(key, obj, prop){
    Mousetrap.bind(key, function(){obj[prop] = true})
    Mousetrap.bind(key, function(){obj[prop] = false}, 'keyup')
  }
})();