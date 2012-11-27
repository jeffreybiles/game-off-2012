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

require.define("/lib/underscore.js",function(require,module,exports,__dirname,__filename,process,global){//     Underscore.js 1.4.2
//     http://underscorejs.org
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.
(function(){var e=this,t=e._,n={},r=Array.prototype,i=Object.prototype,s=Function.prototype,o=r.push,u=r.slice,a=r.concat,f=r.unshift,l=i.toString,c=i.hasOwnProperty,h=r.forEach,p=r.map,d=r.reduce,v=r.reduceRight,m=r.filter,g=r.every,y=r.some,b=r.indexOf,w=r.lastIndexOf,E=Array.isArray,S=Object.keys,x=s.bind,T=function(e){if(e instanceof T)return e;if(!(this instanceof T))return new T(e);this._wrapped=e};typeof exports!="undefined"?(typeof module!="undefined"&&module.exports&&(exports=module.exports=T),exports._=T):e._=T,T.VERSION="1.4.2";var N=T.each=T.forEach=function(e,t,r){if(e==null)return;if(h&&e.forEach===h)e.forEach(t,r);else if(e.length===+e.length){for(var i=0,s=e.length;i<s;i++)if(t.call(r,e[i],i,e)===n)return}else for(var o in e)if(T.has(e,o)&&t.call(r,e[o],o,e)===n)return};T.map=T.collect=function(e,t,n){var r=[];return e==null?r:p&&e.map===p?e.map(t,n):(N(e,function(e,i,s){r[r.length]=t.call(n,e,i,s)}),r)},T.reduce=T.foldl=T.inject=function(e,t,n,r){var i=arguments.length>2;e==null&&(e=[]);if(d&&e.reduce===d)return r&&(t=T.bind(t,r)),i?e.reduce(t,n):e.reduce(t);N(e,function(e,s,o){i?n=t.call(r,n,e,s,o):(n=e,i=!0)});if(!i)throw new TypeError("Reduce of empty array with no initial value");return n},T.reduceRight=T.foldr=function(e,t,n,r){var i=arguments.length>2;e==null&&(e=[]);if(v&&e.reduceRight===v)return r&&(t=T.bind(t,r)),arguments.length>2?e.reduceRight(t,n):e.reduceRight(t);var s=e.length;if(s!==+s){var o=T.keys(e);s=o.length}N(e,function(u,a,f){a=o?o[--s]:--s,i?n=t.call(r,n,e[a],a,f):(n=e[a],i=!0)});if(!i)throw new TypeError("Reduce of empty array with no initial value");return n},T.find=T.detect=function(e,t,n){var r;return C(e,function(e,i,s){if(t.call(n,e,i,s))return r=e,!0}),r},T.filter=T.select=function(e,t,n){var r=[];return e==null?r:m&&e.filter===m?e.filter(t,n):(N(e,function(e,i,s){t.call(n,e,i,s)&&(r[r.length]=e)}),r)},T.reject=function(e,t,n){var r=[];return e==null?r:(N(e,function(e,i,s){t.call(n,e,i,s)||(r[r.length]=e)}),r)},T.every=T.all=function(e,t,r){t||(t=T.identity);var i=!0;return e==null?i:g&&e.every===g?e.every(t,r):(N(e,function(e,s,o){if(!(i=i&&t.call(r,e,s,o)))return n}),!!i)};var C=T.some=T.any=function(e,t,r){t||(t=T.identity);var i=!1;return e==null?i:y&&e.some===y?e.some(t,r):(N(e,function(e,s,o){if(i||(i=t.call(r,e,s,o)))return n}),!!i)};T.contains=T.include=function(e,t){var n=!1;return e==null?n:b&&e.indexOf===b?e.indexOf(t)!=-1:(n=C(e,function(e){return e===t}),n)},T.invoke=function(e,t){var n=u.call(arguments,2);return T.map(e,function(e){return(T.isFunction(t)?t:e[t]).apply(e,n)})},T.pluck=function(e,t){return T.map(e,function(e){return e[t]})},T.where=function(e,t){return T.isEmpty(t)?[]:T.filter(e,function(e){for(var n in t)if(t[n]!==e[n])return!1;return!0})},T.max=function(e,t,n){if(!t&&T.isArray(e)&&e[0]===+e[0]&&e.length<65535)return Math.max.apply(Math,e);if(!t&&T.isEmpty(e))return-Infinity;var r={computed:-Infinity};return N(e,function(e,i,s){var o=t?t.call(n,e,i,s):e;o>=r.computed&&(r={value:e,computed:o})}),r.value},T.min=function(e,t,n){if(!t&&T.isArray(e)&&e[0]===+e[0]&&e.length<65535)return Math.min.apply(Math,e);if(!t&&T.isEmpty(e))return Infinity;var r={computed:Infinity};return N(e,function(e,i,s){var o=t?t.call(n,e,i,s):e;o<r.computed&&(r={value:e,computed:o})}),r.value},T.shuffle=function(e){var t,n=0,r=[];return N(e,function(e){t=T.random(n++),r[n-1]=r[t],r[t]=e}),r};var k=function(e){return T.isFunction(e)?e:function(t){return t[e]}};T.sortBy=function(e,t,n){var r=k(t);return T.pluck(T.map(e,function(e,t,i){return{value:e,index:t,criteria:r.call(n,e,t,i)}}).sort(function(e,t){var n=e.criteria,r=t.criteria;if(n!==r){if(n>r||n===void 0)return 1;if(n<r||r===void 0)return-1}return e.index<t.index?-1:1}),"value")};var L=function(e,t,n,r){var i={},s=k(t);return N(e,function(t,o){var u=s.call(n,t,o,e);r(i,u,t)}),i};T.groupBy=function(e,t,n){return L(e,t,n,function(e,t,n){(T.has(e,t)?e[t]:e[t]=[]).push(n)})},T.countBy=function(e,t,n){return L(e,t,n,function(e,t,n){T.has(e,t)||(e[t]=0),e[t]++})},T.sortedIndex=function(e,t,n,r){n=n==null?T.identity:k(n);var i=n.call(r,t),s=0,o=e.length;while(s<o){var u=s+o>>>1;n.call(r,e[u])<i?s=u+1:o=u}return s},T.toArray=function(e){return e?e.length===+e.length?u.call(e):T.values(e):[]},T.size=function(e){return e.length===+e.length?e.length:T.keys(e).length},T.first=T.head=T.take=function(e,t,n){return t!=null&&!n?u.call(e,0,t):e[0]},T.initial=function(e,t,n){return u.call(e,0,e.length-(t==null||n?1:t))},T.last=function(e,t,n){return t!=null&&!n?u.call(e,Math.max(e.length-t,0)):e[e.length-1]},T.rest=T.tail=T.drop=function(e,t,n){return u.call(e,t==null||n?1:t)},T.compact=function(e){return T.filter(e,function(e){return!!e})};var A=function(e,t,n){return N(e,function(e){T.isArray(e)?t?o.apply(n,e):A(e,t,n):n.push(e)}),n};T.flatten=function(e,t){return A(e,t,[])},T.without=function(e){return T.difference(e,u.call(arguments,1))},T.uniq=T.unique=function(e,t,n,r){var i=n?T.map(e,n,r):e,s=[],o=[];return N(i,function(n,r){if(t?!r||o[o.length-1]!==n:!T.contains(o,n))o.push(n),s.push(e[r])}),s},T.union=function(){return T.uniq(a.apply(r,arguments))},T.intersection=function(e){var t=u.call(arguments,1);return T.filter(T.uniq(e),function(e){return T.every(t,function(t){return T.indexOf(t,e)>=0})})},T.difference=function(e){var t=a.apply(r,u.call(arguments,1));return T.filter(e,function(e){return!T.contains(t,e)})},T.zip=function(){var e=u.call(arguments),t=T.max(T.pluck(e,"length")),n=new Array(t);for(var r=0;r<t;r++)n[r]=T.pluck(e,""+r);return n},T.object=function(e,t){var n={};for(var r=0,i=e.length;r<i;r++)t?n[e[r]]=t[r]:n[e[r][0]]=e[r][1];return n},T.indexOf=function(e,t,n){if(e==null)return-1;var r=0,i=e.length;if(n){if(typeof n!="number")return r=T.sortedIndex(e,t),e[r]===t?r:-1;r=n<0?Math.max(0,i+n):n}if(b&&e.indexOf===b)return e.indexOf(t,n);for(;r<i;r++)if(e[r]===t)return r;return-1},T.lastIndexOf=function(e,t,n){if(e==null)return-1;var r=n!=null;if(w&&e.lastIndexOf===w)return r?e.lastIndexOf(t,n):e.lastIndexOf(t);var i=r?n:e.length;while(i--)if(e[i]===t)return i;return-1},T.range=function(e,t,n){arguments.length<=1&&(t=e||0,e=0),n=arguments[2]||1;var r=Math.max(Math.ceil((t-e)/n),0),i=0,s=new Array(r);while(i<r)s[i++]=e,e+=n;return s};var O=function(){};T.bind=function(t,n){var r,i;if(t.bind===x&&x)return x.apply(t,u.call(arguments,1));if(!T.isFunction(t))throw new TypeError;return i=u.call(arguments,2),r=function(){if(this instanceof r){O.prototype=t.prototype;var e=new O,s=t.apply(e,i.concat(u.call(arguments)));return Object(s)===s?s:e}return t.apply(n,i.concat(u.call(arguments)))}},T.bindAll=function(e){var t=u.call(arguments,1);return t.length==0&&(t=T.functions(e)),N(t,function(t){e[t]=T.bind(e[t],e)}),e},T.memoize=function(e,t){var n={};return t||(t=T.identity),function(){var r=t.apply(this,arguments);return T.has(n,r)?n[r]:n[r]=e.apply(this,arguments)}},T.delay=function(e,t){var n=u.call(arguments,2);return setTimeout(function(){return e.apply(null,n)},t)},T.defer=function(e){return T.delay.apply(T,[e,1].concat(u.call(arguments,1)))},T.throttle=function(e,t){var n,r,i,s,o,u,a=T.debounce(function(){o=s=!1},t);return function(){n=this,r=arguments;var f=function(){i=null,o&&(u=e.apply(n,r)),a()};return i||(i=setTimeout(f,t)),s?o=!0:(s=!0,u=e.apply(n,r)),a(),u}},T.debounce=function(e,t,n){var r,i;return function(){var s=this,o=arguments,u=function(){r=null,n||(i=e.apply(s,o))},a=n&&!r;return clearTimeout(r),r=setTimeout(u,t),a&&(i=e.apply(s,o)),i}},T.once=function(e){var t=!1,n;return function(){return t?n:(t=!0,n=e.apply(this,arguments),e=null,n)}},T.wrap=function(e,t){return function(){var n=[e];return o.apply(n,arguments),t.apply(this,n)}},T.compose=function(){var e=arguments;return function(){var t=arguments;for(var n=e.length-1;n>=0;n--)t=[e[n].apply(this,t)];return t[0]}},T.after=function(e,t){return e<=0?t():function(){if(--e<1)return t.apply(this,arguments)}},T.keys=S||function(e){if(e!==Object(e))throw new TypeError("Invalid object");var t=[];for(var n in e)T.has(e,n)&&(t[t.length]=n);return t},T.values=function(e){var t=[];for(var n in e)T.has(e,n)&&t.push(e[n]);return t},T.pairs=function(e){var t=[];for(var n in e)T.has(e,n)&&t.push([n,e[n]]);return t},T.invert=function(e){var t={};for(var n in e)T.has(e,n)&&(t[e[n]]=n);return t},T.functions=T.methods=function(e){var t=[];for(var n in e)T.isFunction(e[n])&&t.push(n);return t.sort()},T.extend=function(e){return N(u.call(arguments,1),function(t){for(var n in t)e[n]=t[n]}),e},T.pick=function(e){var t={},n=a.apply(r,u.call(arguments,1));return N(n,function(n){n in e&&(t[n]=e[n])}),t},T.omit=function(e){var t={},n=a.apply(r,u.call(arguments,1));for(var i in e)T.contains(n,i)||(t[i]=e[i]);return t},T.defaults=function(e){return N(u.call(arguments,1),function(t){for(var n in t)e[n]==null&&(e[n]=t[n])}),e},T.clone=function(e){return T.isObject(e)?T.isArray(e)?e.slice():T.extend({},e):e},T.tap=function(e,t){return t(e),e};var M=function(e,t,n,r){if(e===t)return e!==0||1/e==1/t;if(e==null||t==null)return e===t;e instanceof T&&(e=e._wrapped),t instanceof T&&(t=t._wrapped);var i=l.call(e);if(i!=l.call(t))return!1;switch(i){case"[object String]":return e==String(t);case"[object Number]":return e!=+e?t!=+t:e==0?1/e==1/t:e==+t;case"[object Date]":case"[object Boolean]":return+e==+t;case"[object RegExp]":return e.source==t.source&&e.global==t.global&&e.multiline==t.multiline&&e.ignoreCase==t.ignoreCase}if(typeof e!="object"||typeof t!="object")return!1;var s=n.length;while(s--)if(n[s]==e)return r[s]==t;n.push(e),r.push(t);var o=0,u=!0;if(i=="[object Array]"){o=e.length,u=o==t.length;if(u)while(o--)if(!(u=M(e[o],t[o],n,r)))break}else{var a=e.constructor,f=t.constructor;if(a!==f&&!(T.isFunction(a)&&a instanceof a&&T.isFunction(f)&&f instanceof f))return!1;for(var c in e)if(T.has(e,c)){o++;if(!(u=T.has(t,c)&&M(e[c],t[c],n,r)))break}if(u){for(c in t)if(T.has(t,c)&&!(o--))break;u=!o}}return n.pop(),r.pop(),u};T.isEqual=function(e,t){return M(e,t,[],[])},T.isEmpty=function(e){if(e==null)return!0;if(T.isArray(e)||T.isString(e))return e.length===0;for(var t in e)if(T.has(e,t))return!1;return!0},T.isElement=function(e){return!!e&&e.nodeType===1},T.isArray=E||function(e){return l.call(e)=="[object Array]"},T.isObject=function(e){return e===Object(e)},N(["Arguments","Function","String","Number","Date","RegExp"],function(e){T["is"+e]=function(t){return l.call(t)=="[object "+e+"]"}}),T.isArguments(arguments)||(T.isArguments=function(e){return!!e&&!!T.has(e,"callee")}),typeof /./!="function"&&(T.isFunction=function(e){return typeof e=="function"}),T.isFinite=function(e){return T.isNumber(e)&&isFinite(e)},T.isNaN=function(e){return T.isNumber(e)&&e!=+e},T.isBoolean=function(e){return e===!0||e===!1||l.call(e)=="[object Boolean]"},T.isNull=function(e){return e===null},T.isUndefined=function(e){return e===void 0},T.has=function(e,t){return c.call(e,t)},T.noConflict=function(){return e._=t,this},T.identity=function(e){return e},T.times=function(e,t,n){for(var r=0;r<e;r++)t.call(n,r)},T.random=function(e,t){return t==null&&(t=e,e=0),e+(0|Math.random()*(t-e+1))};var _={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","/":"&#x2F;"}};_.unescape=T.invert(_.escape);var D={escape:new RegExp("["+T.keys(_.escape).join("")+"]","g"),unescape:new RegExp("("+T.keys(_.unescape).join("|")+")","g")};T.each(["escape","unescape"],function(e){T[e]=function(t){return t==null?"":(""+t).replace(D[e],function(t){return _[e][t]})}}),T.result=function(e,t){if(e==null)return null;var n=e[t];return T.isFunction(n)?n.call(e):n},T.mixin=function(e){N(T.functions(e),function(t){var n=T[t]=e[t];T.prototype[t]=function(){var e=[this._wrapped];return o.apply(e,arguments),F.call(this,n.apply(T,e))}})};var P=0;T.uniqueId=function(e){var t=P++;return e?e+t:t},T.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var H=/(.)^/,B={"'":"'","\\":"\\","\r":"r","\n":"n","  ":"t","\u2028":"u2028","\u2029":"u2029"},j=/\\|'|\r|\n|\t|\u2028|\u2029/g;T.template=function(e,t,n){n=T.defaults({},n,T.templateSettings);var r=new RegExp([(n.escape||H).source,(n.interpolate||H).source,(n.evaluate||H).source].join("|")+"|$","g"),i=0,s="__p+='";e.replace(r,function(t,n,r,o,u){s+=e.slice(i,u).replace(j,function(e){return"\\"+B[e]}),s+=n?"'+\n((__t=("+n+"))==null?'':_.escape(__t))+\n'":r?"'+\n((__t=("+r+"))==null?'':__t)+\n'":o?"';\n"+o+"\n__p+='":"",i=u+t.length}),s+="';\n",n.variable||(s="with(obj||{}){\n"+s+"}\n"),s="var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n"+s+"return __p;\n";try{var o=new Function(n.variable||"obj","_",s)}catch(u){throw u.source=s,u}if(t)return o(t,T);var a=function(e){return o.call(this,e,T)};return a.source="function("+(n.variable||"obj")+"){\n"+s+"}",a},T.chain=function(e){return T(e).chain()};var F=function(e){return this._chain?T(e).chain():e};T.mixin(T),N(["pop","push","reverse","shift","sort","splice","unshift"],function(e){var t=r[e];T.prototype[e]=function(){var n=this._wrapped;return t.apply(n,arguments),(e=="shift"||e=="splice")&&n.length===0&&delete n[0],F.call(this,n)}}),N(["concat","join","slice"],function(e){var t=r[e];T.prototype[e]=function(){return F.call(this,t.apply(this._wrapped,arguments))}}),T.extend(T.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}).call(this);
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

require.define("/levels/level.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var level, terrainTypes;

  level = new Object();

  terrainTypes = {
    1: {
      color: '#68432a',
      bounciness: 0,
      damage: 0
    },
    2: {
      color: '#126822',
      bounciness: 0,
      damage: 0
    },
    3: {
      color: '#FF0',
      bounciness: 2,
      damage: 10
    },
    4: {
      color: '#555',
      bounciness: 0.2,
      damage: 0
    },
    5: {
      color: '#F00',
      bounciness: 0,
      damage: 1
    }
  };

  level.columnWidth = 50;

  level.rowHeight = 50;

  level.draw = function(offset) {
    var column, row, _i, _results;
    if (offset == null) {
      offset = 0;
    }
    _results = [];
    for (row = _i = 0; _i < 12; row = ++_i) {
      _results.push((function() {
        var _j, _results1;
        _results1 = [];
        for (column = _j = 0; _j < 16; column = ++_j) {
          _results1.push(this.drawSquare(row, column, offset));
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  level.drawSquare = function(row, column, offset) {
    var square;
    square = this.grid[row][column];
    ctx.fillStyle = terrainTypes[square].color;
    return ctx.fillRect(column * this.columnWidth + offset, row * this.rowHeight, this.columnWidth, this.rowHeight);
  };

  level.mapGrid = function() {
    var column, includedSquares, includedTerrain, newRow, row, _i, _j, _results,
      _this = this;
    this.newGrid = [];
    _results = [];
    for (row = _i = 0; _i < 11; row = ++_i) {
      newRow = [];
      for (column = _j = 0; _j < 15; column = ++_j) {
        includedSquares = this.listAdjacent(row, column);
        includedTerrain = _.map(includedSquares, function(coordinates) {
          var terrainNumber;
          terrainNumber = _this.grid[coordinates[0]][coordinates[1]];
          return terrainTypes[terrainNumber];
        });
        newRow.push({
          bounciness: _.reduce(includedTerrain, (function(memo, terrain) {
            return memo + terrain.bounciness;
          }), 0),
          damage: _.reduce(includedTerrain, (function(memo, terrain) {
            return memo + terrain.damage;
          }), 0)
        });
      }
      _results.push(this.newGrid.push(newRow));
    }
    return _results;
  };

  level.listAdjacent = function(row, column) {
    return [[row, column], [row + 1, column], [row, column + 1], [row + 1, column + 1]];
  };

  level.interactWith = function(entity) {
    var column, row, squaresOccupied, terrain, _i, _len, _ref, _results;
    column = Math.floor(entity.x / this.columnWidth);
    row = Math.floor(entity.y / this.rowHeight);
    terrain = this.newGrid[row][column];
    entity.hp -= terrain.damage;
    if (terrain.bounciness) {
      squaresOccupied = this.listAdjacent(row, column);
      _results = [];
      for (_i = 0, _len = squaresOccupied.length; _i < _len; _i++) {
        _ref = squaresOccupied[_i], row = _ref[0], column = _ref[1];
        terrain = terrainTypes[this.grid[row][column]];
        _results.push(entity.knockback({
          x: column * this.rowHeight,
          y: row * this.columnWidth
        }, terrain.bounciness));
      }
      return _results;
    }
  };

  module.exports = level;

}).call(this);

});

require.define("/levels/2.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var level, lvl2;

  level = require('./level');

  lvl2 = object(level);

  lvl2.grid = [[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2], [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2], [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], [2, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], [2, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], [2, 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], [2, 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2], [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2]];

  lvl2.numEnemies = 3;

  lvl2.mapGrid();

  module.exports = lvl2;

}).call(this);

});

require.define("/levels/1.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var level, lvl1;

  level = require('./level');

  lvl1 = object(level);

  lvl1.grid = [[1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 3, 3, 2], [1, 2, 1, 2, 2, 2, 1, 1, 2, 2, 1, 2, 2, 3, 3, 1], [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1], [2, 4, 4, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2], [2, 4, 4, 2, 1, 2, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2], [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 2, 1, 2], [2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 2], [1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2, 1, 2, 2, 2], [1, 5, 5, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2], [2, 5, 5, 1, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2], [2, 2, 2, 2, 1, 1, 2, 2, 1, 2, 1, 2, 1, 3, 3, 2], [1, 2, 2, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 3, 3, 2]];

  lvl1.numEnemies = 1;

  lvl1.mapGrid();

  module.exports = lvl1;

}).call(this);

});

require.define("/entry.js",function(require,module,exports,__dirname,__filename,process,global){window.onload = function(){
  require('./lib/animationFrame')
  require('./lib/helper')
  require('./lib/mousetrap')
  require('./lib/extratrap')
  require('./lib/underscore')
  require('./init')
}
});
require("/entry.js");
})();
