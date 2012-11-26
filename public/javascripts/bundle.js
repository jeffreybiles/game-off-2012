(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return window.setImmediate;
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/lib/animationFrame.js",function(require,module,exports,__dirname,__filename,process,global){(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
});

require.define("/lib/helper.js",function(require,module,exports,__dirname,__filename,process,global){(function(){
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
});

require.define("/lib/mousetrap.js",function(require,module,exports,__dirname,__filename,process,global){/* mousetrap v1.2.1 craig.is/killing/mice */
(function(){function q(a,c,b){a.addEventListener?a.addEventListener(c,b,!1):a.attachEvent("on"+c,b)}function x(a){return"keypress"==a.type?String.fromCharCode(a.which):h[a.which]?h[a.which]:y[a.which]?y[a.which]:String.fromCharCode(a.which).toLowerCase()}function r(a){var a=a||{},c=!1,b;for(b in l)a[b]?c=!0:l[b]=0;c||(n=!1)}function z(a,c,b,d,F){var g,e,f=[],j=b.type;if(!k[a])return[];"keyup"==j&&s(a)&&(c=[a]);for(g=0;g<k[a].length;++g)if(e=k[a][g],!(e.seq&&l[e.seq]!=e.level)&&j==e.action&&("keypress"==
j&&!b.metaKey&&!b.ctrlKey||c.sort().join(",")===e.modifiers.sort().join(",")))d&&e.combo==F&&k[a].splice(g,1),f.push(e);return f}function t(a,c,b){if(!u.stopCallback(c,c.target||c.srcElement,b)&&!1===a(c,b))c.preventDefault&&c.preventDefault(),c.stopPropagation&&c.stopPropagation(),c.returnValue=!1,c.cancelBubble=!0}function v(a){"number"!==typeof a.which&&(a.which=a.keyCode);var c=x(a);if(c)if("keyup"==a.type&&w==c)w=!1;else{var b=[];a.shiftKey&&b.push("shift");a.altKey&&b.push("alt");a.ctrlKey&&
b.push("ctrl");a.metaKey&&b.push("meta");var b=z(c,b,a),d,f={},g=!1;for(d=0;d<b.length;++d)b[d].seq?(g=!0,f[b[d].seq]=1,t(b[d].callback,a,b[d].combo)):!g&&!n&&t(b[d].callback,a,b[d].combo);a.type==n&&!s(c)&&r(f)}}function s(a){return"shift"==a||"ctrl"==a||"alt"==a||"meta"==a}function A(a,c,b){if(!b){if(!p){p={};for(var d in h)95<d&&112>d||h.hasOwnProperty(d)&&(p[h[d]]=d)}b=p[a]?"keydown":"keypress"}"keypress"==b&&c.length&&(b="keydown");return b}function B(a,c,b,d,f){var a=a.replace(/\s+/g," "),g=
a.split(" "),e,h,j=[];if(1<g.length){var i=a,m=b;l[i]=0;m||(m=A(g[0],[]));a=function(){n=m;++l[i];clearTimeout(C);C=setTimeout(r,1E3)};b=function(a){t(c,a,i);"keyup"!==m&&(w=x(a));setTimeout(r,10)};for(d=0;d<g.length;++d)B(g[d],d<g.length-1?a:b,m,i,d)}else{h="+"===a?["+"]:a.split("+");for(g=0;g<h.length;++g)e=h[g],D[e]&&(e=D[e]),b&&("keypress"!=b&&E[e])&&(e=E[e],j.push("shift")),s(e)&&j.push(e);b=A(e,j,b);k[e]||(k[e]=[]);z(e,j,{type:b},!d,a);k[e][d?"unshift":"push"]({callback:c,modifiers:j,action:b,
seq:d,level:f,combo:a})}}for(var h={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",18:"alt",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"ins",46:"del",91:"meta",93:"meta",224:"meta"},y={106:"*",107:"+",109:"-",110:".",111:"/",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},E={"~":"`","!":"1","@":"2","#":"3",$:"4","%":"5","^":"6","&":"7","*":"8","(":"9",")":"0",_:"-","+":"=",
":":";",'"':"'","<":",",">":".","?":"/","|":"\\"},D={option:"alt",command:"meta","return":"enter",escape:"esc"},p,k={},i={},l={},C,w=!1,n=!1,f=1;20>f;++f)h[111+f]="f"+f;for(f=0;9>=f;++f)h[f+96]=f;q(document,"keypress",v);q(document,"keydown",v);q(document,"keyup",v);var u={bind:function(a,c,b){for(var d=a instanceof Array?a:[a],f=0;f<d.length;++f)B(d[f],c,b);i[a+":"+b]=c;return this},unbind:function(a,c){i[a+":"+c]&&(delete i[a+":"+c],this.bind(a,function(){},c));return this},trigger:function(a,c){i[a+
":"+c]();return this},reset:function(){k={};i={};return this},stopCallback:function(a,c){return-1<(" "+c.className+" ").indexOf(" mousetrap ")?!1:"INPUT"==c.tagName||"SELECT"==c.tagName||"TEXTAREA"==c.tagName||c.contentEditable&&"true"==c.contentEditable}};window.Mousetrap=u;"function"===typeof define&&define.amd&&define(u)})();
});

require.define("/lib/extratrap.js",function(require,module,exports,__dirname,__filename,process,global){(function(){
  Mousetrap.hold = function(key, obj, prop){
    Mousetrap.bind(key, function(){obj[prop] = true})
    Mousetrap.bind(key, function(){obj[prop] = false}, 'keyup')
  }
})();
});

require.define("/init.js",function(require,module,exports,__dirname,__filename,process,global){(function(){
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

  game.start()
})()
});

require.define("/entities/player.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var entity, player;

  entity = require('./entity');

  player = object(entity);

  player.x = canvas.width / 2;

  player.y = canvas.height / 2;

  player.hp = 50;

  player.type = 'player';

  player.draw = function() {
    ctx.fillStyle = 'black';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    if (this.sword && this.sword.timer > 0) {
      ctx.fillStyle = 'red';
      ctx.fillRect(this.sword.x, this.sword.y, this.sword.width, this.sword.height);
      return this.sword.timer -= 1;
    }
  };

  player.control = function() {
    if (this.kup) {
      this.dy -= this.acceleration;
      this.direction = Math.PI / 2;
    }
    if (this.kdown) {
      this.dy += this.acceleration;
      this.direction = Math.PI * 3 / 2;
    }
    if (this.kleft) {
      this.dx -= this.acceleration;
      this.direction = Math.PI;
    }
    if (this.kright) {
      this.dx += this.acceleration;
      return this.direction = 0;
    }
  };

  player.hit = function(collider) {
    this.knockback(collider);
    return log(this.x, this.y);
  };

  player.slash = function() {
    var sword;
    sword = object(swordPrototype);
    sword.place(this.x, this.y, this.width, this.height, this.direction);
    sword.checkCollisions(game.enemies);
    return this.sword = sword;
  };

  module.exports = player;

}).call(this);

});

require.define("/entities/entity.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var entity;

  entity = new Object();

  entity.x = 0;

  entity.y = 0;

  entity.dx = 0;

  entity.dy = 0;

  entity.acceleration = 0.3;

  entity.deceleration = 0.9;

  entity.height = 50;

  entity.width = 50;

  entity.bounciness = 0.2;

  entity.color = 'black';

  entity.direction = 0;

  entity.update = function() {
    this.x += this.dx;
    this.y += this.dy;
    this.dx *= this.deceleration;
    this.dy *= this.deceleration;
    return this.stayInBounds();
  };

  entity.stayInBounds = function() {
    var totalBounce;
    totalBounce = 10 * this.bounciness;
    if (this.x < game.leftEdge) {
      this.dx += totalBounce;
    }
    if (this.x + this.width > game.rightEdge) {
      this.dx -= totalBounce;
    }
    if (this.y < game.topEdge) {
      this.dy += totalBounce;
    }
    if (this.y + this.height > game.bottomEdge) {
      return this.dy -= totalBounce;
    }
  };

  entity.knockback = function(collider, extraBouncy) {
    if (extraBouncy == null) {
      extraBouncy = 1;
    }
    if (extraBouncy > 0) {
      console.log(this.x, collider.x, this.y, collider.y, this.bounciness, extraBouncy);
    }
    this.dx += (this.x - collider.x) * this.bounciness * extraBouncy;
    return this.dy += (this.y - collider.y) * this.bounciness * extraBouncy;
  };

  entity.checkCollisions = function(colliders) {
    var collider, _i, _len, _ref, _ref1, _results;
    _results = [];
    for (_i = 0, _len = colliders.length; _i < _len; _i++) {
      collider = colliders[_i];
      if ((this.x + this.width > (_ref = collider.x) && _ref > this.x - collider.width)) {
        if ((this.y + this.height > (_ref1 = collider.y) && _ref1 > this.y - collider.height)) {
          this.hit(collider);
          _results.push(collider.hit(this));
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  module.exports = entity;

}).call(this);

});

require.define("/entities/enemy.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var enemy;

  enemy = object(require('./player'));

  enemy.type = 'enemy';

  enemy.hit = function(hitter) {
    this.hurt(hitter);
    return this.knockback(hitter);
  };

  enemy.hurt = function(hitter) {
    return hitter.hp -= 10;
  };

  enemy.randomizePosition = function() {
    this.x = Math.random() * canvas.width;
    return this.y = Math.random() * canvas.height;
  };

  module.exports = enemy;

}).call(this);

});

require.define("/entities/sword.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var entity, sword;

  entity = require('./entity');

  sword = object(entity);

  sword.place = function(x, y, width, height, direction) {
    sword.x = x + Math.cos(direction) * width;
    sword.y = y - Math.sin(direction) * height;
    sword.width = width;
    return sword.height = height;
  };

  sword.timer = 10;

  sword.hit = function(hit) {
    hit.hp -= 20;
    return game.latestEnemy = hit.hp >= 0 ? hit : null;
  };

  module.exports = sword;

}).call(this);

});

require.define("/levels/terrain/grass.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var grass, terrain;

  terrain = require('./terrain');

  grass = object(terrain);

  grass.color = '#68432a';

  module.exports = grass;

}).call(this);

});

require.define("/levels/terrain/lava.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var lava, terrain;

  terrain = require('./terrain');

  lava = object(terrain);

  lava.color = '#F00';

  lava.damage = 1;

  module.exports = lava;

}).call(this);

});

require.define("/levels/terrain/dirt.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var dirt, terrain;

  terrain = require('./terrain');

  dirt = object(terrain);

  dirt.color = '#456';

  module.exports = dirt;

}).call(this);

});

require.define("/levels/terrain/wall.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var terrain, wall;

  terrain = require('./terrain');

  wall = object(terrain);

  wall.color = '#225';

  wall.bounciness = 0.2;

  module.exports = wall;

}).call(this);

});

require.define("/levels/terrain/thorns.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var terrain, thorns;

  terrain = require('./terrain');

  thorns = object(terrain);

  thorns.color = '#FF0';

  thorns.bounciness = 2;

  thorns.damage = 10;

  module.exports = thorns;

}).call(this);

});

require.define("/levels/terrain/terrain.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var terrain;

  terrain = new Object();

  terrain.width = 50;

  terrain.height = 50;

  terrain.color = '#342564';

  terrain.bounciness = 0;

  terrain.damage = 0;

  terrain.row = 0;

  terrain.column = 0;

  terrain.draw = function(offset) {
    if (offset == null) {
      offset = 0;
    }
    ctx.fillStyle = this.color;
    return ctx.fillRect(this.column * this.width + offset, this.row * this.height, this.width, this.height);
  };

  module.exports = terrain;

}).call(this);

});

require.define("/levels/2.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var level, lvl2;

  level = require('./level');

  lvl2 = object(level);

  lvl2.grid = ['1111111111111111', '1111111111111111', '3333333331111111', '1111111131111111', '1111111131111111', '1111111131111111', '2221111131222222', '1121111131211111', '1121111131211111', '1121111131211111', '1122222222211111', '1111111111111111'];

  lvl2.numEnemies = 3;

  lvl2.createTerrain();

  module.exports = lvl2;

}).call(this);

});

require.define("/levels/1.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var level, lvl1;

  level = require('./level');

  lvl1 = object(level);

  lvl1.grid = ['1111111111111111', '1111111111111111', '1111111111111111', '2222222221111111', '1111111121111111', '1111111121111111', '1111111121112222', '1111111122222111', '1111111111111111', '1111111111111111', '1111111111111111', '1111111111111111'];

  lvl1.numEnemies = 1;

  lvl1.createTerrain();

  module.exports = lvl1;

}).call(this);

});

require.define("/levels/level.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var dirt, grass, lava, level, thorns, wall;

  level = new Object();

  grass = require('./terrain/grass');

  lava = require('./terrain/lava');

  dirt = require('./terrain/dirt');

  wall = require('./terrain/wall');

  thorns = require('./terrain/thorns');

  level.createTerrain = function() {
    var i, j, newSquare, row, _i, _j, _ref, _ref1, _results;
    this.terrain = [];
    _results = [];
    for (i = _i = 0, _ref = this.grid.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      row = [];
      for (j = _j = 0, _ref1 = this.grid[0].length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
        newSquare = (function() {
          switch (this.grid[i][j]) {
            case '1':
              return object(grass);
            case '2':
              return object(dirt);
            case '3':
              return object(wall);
            case '4':
              return object(thorns);
            case '5':
              return object(lava);
          }
        }).call(this);
        newSquare.row = i;
        newSquare.column = j;
        row.push(newSquare);
      }
      _results.push(this.terrain.push(row));
    }
    return _results;
  };

  level.draw = function(offset) {
    var column, row, _i, _ref, _results;
    if (offset == null) {
      offset = 0;
    }
    _results = [];
    for (row = _i = 0, _ref = this.terrain.length; 0 <= _ref ? _i < _ref : _i > _ref; row = 0 <= _ref ? ++_i : --_i) {
      _results.push((function() {
        var _j, _ref1, _results1;
        _results1 = [];
        for (column = _j = 0, _ref1 = this.terrain[0].length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; column = 0 <= _ref1 ? ++_j : --_j) {
          _results1.push(this.terrain[row][column].draw(offset));
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  level.columnWidth = 50;

  level.rowHeight = 50;

  level.interactWith = function(entity) {
    var column, row, square, squaresOccupied, _i, _len, _ref, _results;
    column = Math.floor(entity.x / this.columnWidth);
    row = Math.floor(entity.y / this.rowHeight);
    squaresOccupied = [[row, column], [row + 1, column], [row, column + 1], [row + 1, column + 1]];
    _results = [];
    for (_i = 0, _len = squaresOccupied.length; _i < _len; _i++) {
      _ref = squaresOccupied[_i], row = _ref[0], column = _ref[1];
      square = this.terrain[row][column];
      entity.knockback({
        x: column * this.rowHeight,
        y: row * this.columnWidth
      }, square.bounciness);
      _results.push(entity.hp -= square.damage);
    }
    return _results;
  };

  module.exports = level;

}).call(this);

});

require.define("/game.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var game, lvl1, lvl2;

  game = new Object();

  game.enemies = [];

  game.latestEnemy = null;

  game.leftEdge = 0;

  game.rightEdge = canvas.width;

  game.topEdge = 0;

  game.bottomEdge = canvas.height;

  game.currentLevel = 1;

  lvl1 = require('./levels/1');

  lvl2 = require('./levels/2');

  game.level = eval("lvl" + game.currentLevel);

  game.mainLoop = function() {
    var enemy, oldLevel, _i, _len, _ref, _results,
      _this = this;
    if (this.player.hp <= 0) {
      this.start();
    } else if (this.enemies.length === 0 && this.player.x > 700) {
      this.currentLevel += 1;
      oldLevel = this.level;
      this.loadLevel();
      this.slideLevel(oldLevel, this.level);
    } else {
      window.requestAnimationFrame(function() {
        return _this.mainLoop();
      });
    }
    this.level.draw(0);
    this.drawHUD();
    this.player.checkCollisions(this.enemies);
    this.player.update();
    this.player.control();
    this.player.draw();
    this.level.interactWith(this.player);
    this.cleanDeadEnemies();
    _ref = this.enemies;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      enemy = _ref[_i];
      enemy.draw();
      enemy.update();
      _results.push(this.level.interactWith(enemy));
    }
    return _results;
  };

  game.cleanDeadEnemies = function() {
    var enemy;
    return this.enemies = (function() {
      var _i, _len, _ref, _results;
      _ref = this.enemies;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        enemy = _ref[_i];
        if (enemy.hp > 0) {
          _results.push(enemy);
        }
      }
      return _results;
    }).call(this);
  };

  game.slideLevel = function(oldLevel, newLevel, i) {
    var _this = this;
    if (i == null) {
      i = 0;
    }
    if (i <= -800) {
      this.player.x = 50;
      return this.mainLoop();
    } else {
      log(oldLevel, newLevel, i);
      oldLevel.draw(i);
      newLevel.draw(800 + i);
      return setTimeout(function() {
        return _this.slideLevel(oldLevel, newLevel, i - 5);
      }, 0.5);
    }
  };

  game.drawHUD = function() {
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 10, game.player.hp + 10, 10);
    if (this.latestEnemy) {
      ctx.fillRect(canvas.width - 150, 10, this.latestEnemy.hp, 10);
    }
    if (this.enemies.length === 0) {
      this.drawArrow(400);
      return this.drawArrow(200);
    }
  };

  game.drawArrow = function(y) {
    var height, width, x;
    x = 700;
    width = 50;
    height = 50;
    ctx.fillStlye = 'black';
    ctx.fillRect(x - width, y - height / 2, width, height);
    ctx.beginPath();
    ctx.moveTo(x, y - height);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    return ctx.fill();
  };

  game.loadLevel = function() {
    this.level = eval("lvl" + this.currentLevel);
    this.enemies = [];
    enemyFactory(this.level.numEnemies);
    return this.latestEnemy = this.enemies[0];
  };

  game.start = function() {
    this.player = object(playerPrototype);
    this.loadLevel();
    return this.mainLoop();
  };

  module.exports = game;

}).call(this);

});

require.define("/entry.js",function(require,module,exports,__dirname,__filename,process,global){window.onload = function(){
  require('./lib/animationFrame')
  require('./lib/helper')
  require('./lib/mousetrap')
  require('./lib/extratrap')
  require('./init')
}
});
require("/entry.js");
})();
