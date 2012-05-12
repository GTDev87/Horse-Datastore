var horseDatastore = (function(global, undefined){
  var DEBUG         = false,
      pkgmap        = {},
      global        = {},
      lib           = undefined,
      nativeRequire = typeof require != 'undefined' && require,
      ties, locals;
  lib = (function(exports){
  
  exports.path = (function(exports){ 
    // Copyright Joyent, Inc. and other Node contributors.
// Minimized fork of NodeJS' path module, based on its an early version.
exports.join = function () {
  return exports.normalize(Array.prototype.join.call(arguments, "/"));
};
exports.normalizeArray = function (parts, keepBlanks) {
  var directories = [], prev;
  for (var i = 0, l = parts.length - 1; i <= l; i++) {
    var directory = parts[i];
    // if it's blank, but it's not the first thing, and not the last thing, skip it.
    if (directory === "" && i !== 0 && i !== l && !keepBlanks) continue;
    // if it's a dot, and there was some previous dir already, then skip it.
    if (directory === "." && prev !== undefined) continue;
    if (
      directory === ".."
      && directories.length
      && prev !== ".."
      && prev !== "."
      && prev !== undefined
      && (prev !== "" || keepBlanks)
    ) {
      directories.pop();
      prev = directories.slice(-1)[0]
    } else {
      if (prev === ".") directories.pop();
      directories.push(directory);
      prev = directory;
    }
  }
  return directories;
};
exports.normalize = function (path, keepBlanks) {
  return exports.normalizeArray(path.split("/"), keepBlanks).join("/");
};
exports.dirname = function (path) {
  return path && path.substr(0, path.lastIndexOf("/")) || ".";
};
    return exports;
  })({});
    global.process = exports.process = (function(exports){
    /**
 * This is module's purpose is to partly emulate NodeJS' process object on web browsers. It's not an alternative 
 * and/or implementation of the "process" object.
 */
function Buffer(size){
  if (!(this instanceof Buffer)) return new Buffer(size);
  this.content = '';
};
Buffer.prototype.isBuffer = function isBuffer(){
  return true;
};
Buffer.prototype.write = function write(string){
  this.content += string;
};
global.Buffer = exports.Buffer = Buffer;
function Stream(writable, readable){
  if (!(this instanceof Stream)) return new Stream(writable, readable);
  Buffer.call(this);
  this.emulation = true;
  this.readable = readable;
  this.writable = writable;
  this.type = 'file';
};
Stream.prototype = Buffer(0,0);
exports.Stream = Stream;
function notImplemented(){
  throw new Error('Not Implemented.');
}
exports.binding = (function(){
  
  var table = {
    'buffer':{ 'Buffer':Buffer, 'SlowBuffer':Buffer }
  };
  return function binding(bname){
    if(!table.hasOwnProperty(bname)){
      throw new Error('No such module.');
    }
    return table[bname];
  };
})();
exports.argv = ['onejs'];
exports.env = {};
exports.nextTick = function nextTick(fn){
  return setTimeout(fn, 0);
};
exports.stderr = Stream(true, false);
exports.stdin = Stream(false, true);
exports.stdout = Stream(true, false);
exports.version = '';
exports.versions = {};
/**
 * void definitions
 */
exports.pid = 
exports.uptime = 0;
exports.arch = 
exports.execPath = 
exports.installPrefix = 
exports.platform =
exports.title = '';
exports.chdir = 
exports.cwd = 
exports.exit = 
exports.getgid = 
exports.setgid =
exports.getuid =
exports.setuid =
exports.memoryUsage =
exports.on = 
exports.umask = notImplemented;
    return exports;
  })({});
  return exports;
})({});
  function findPkg(workingPkg, uri){
    var pkg = undefined,
        parent = workingPkg;
    
    var i, len;
    do {
      i = parent.dependencies.length;
      while(i-->0){
        parent.dependencies[i].name == uri && ( pkg = parent.dependencies[i] );
      }
      parent = parent.parent;
    } while(!pkg && parent);
    return pkg;
  }
  function findModule(workingModule, uri){
    var module = undefined,
        moduleId = lib.path.join(lib.path.dirname(workingModule.id), uri).replace(/\.js$/, ''),
        moduleIndexId = lib.path.join(moduleId, 'index'),
        pkg = workingModule.pkg;
    var i = pkg.modules.length,
        id;
    while(i-->0){
      id = pkg.modules[i].id;
      if(id==moduleId || id == moduleIndexId){
        module = pkg.modules[i];
        break;
      }
    }
    return module;
  }
  function genRequire(callingModule){
    return function require(uri){
      var module,
          pkg;
      if(/^\./.test(uri)){
        module = findModule(callingModule, uri);
      } else if ( ties && ties.hasOwnProperty( uri ) ) {
        return ties[ uri ];
      } else {
        pkg = findPkg(callingModule.pkg, uri);
        if(!pkg && nativeRequire){
          try {
            pkg = nativeRequire(uri);
          } catch (nativeRequireError) {}
          if(pkg) return pkg;
        }
        if(!pkg){
          throw new Error('Cannot find module "'+uri+'" @[module: '+callingModule.id+' package: '+callingModule.pkg.name+']');
        }
        module = pkg.main;
      }
      if(!module){
        throw new Error('Cannot find module "'+uri+'" @[module: '+callingModule.id+' package: '+callingModule.pkg.name+']');
      }
      module.parent = callingModule;
      return module.call();
    };
  }
  function module(parentId, wrapper){
    var parent = pkgmap[parentId],
        mod = wrapper(parent),
        cached = false;
    mod.exports = {};
    mod.require = genRequire(mod);
    mod.call = function(){
            if(cached) {
        return mod.exports;
      }
      cached = true;
      global.require = mod.require;
      mod.wrapper(mod, mod.exports, global, global.Buffer, global.process, global.require);
      return mod.exports;
    };
    if(parent.mainModuleId == mod.id){ 
      parent.main = mod;
      !parent.parent && ( locals.main = mod.call );
    }
    parent.modules.push(mod);
  }
  function pkg(parentId, wrapper){
    
    var parent = pkgmap[parentId],
        ctx = wrapper(parent);
    pkgmap[ctx.id] = ctx;
    !parent && ( pkgmap['main'] = ctx );
    parent && parent.dependencies.push(ctx);
  }
  function mainRequire(uri){
    return pkgmap.main.main.require(uri);
  }
  
  function stderr(){
    return lib.process.stderr.content;
  }
  
  function stdin(){
    return lib.process.stdin.content;
  }
  function stdout(){
    return lib.process.stdout.content;
  }
  return (locals = {
    'lib'        : lib,
    'findPkg'    : findPkg,
    'findModule' : findModule,
    'name'       : 'horseDatastore',
    'map'        : pkgmap,
    'module'     : module,
    'pkg'        : pkg,
    'stderr'     : stderr,
    'stdin'      : stdin,
    'stdout'     : stdout,
    'require'    : mainRequire
});
})(this);
horseDatastore.pkg(undefined, function(parent){
  return {
    'id':1,
    'name':'Horse-Datastore',
    'main':undefined,
    'mainModuleId':'main',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(1, function(onejsModParent){
  return {
    'id':'main',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      require("coffee-script")
require("./lib/app")
    }
  };
});
horseDatastore.pkg(1, function(parent){
  return {
    'id':2,
    'name':'connect',
    'main':undefined,
    'mainModuleId':'index',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/index',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/**
 * Connect is a middleware framework for node,
 * shipping with over 18 bundled middleware and a rich selection of
 * 3rd-party middleware.
 *
 *     var app = connect()
 *       .use(connect.logger('dev'))
 *       .use(connect.static('public'))
 *       .use(function(req, res){
 *         res.end('hello world\n');
 *       })
 *      .listen(3000);
 *     
 * Installation:
 * 
 *     $ npm install connect
 *
 * Middleware:
 *
 *  - [logger](logger.html) request logger with custom format support
 *  - [csrf](csrf.html) Cross-site request forgery protection
 *  - [compress](compress.html) Gzip compression middleware
 *  - [basicAuth](basicAuth.html) basic http authentication
 *  - [bodyParser](bodyParser.html) extensible request body parser
 *  - [json](json.html) application/json parser
 *  - [urlencoded](urlencoded.html) application/x-www-form-urlencoded parser
 *  - [multipart](multipart.html) multipart/form-data parser
 *  - [cookieParser](cookieParser.html) cookie parser
 *  - [session](session.html) session management support with bundled MemoryStore
 *  - [cookieSession](cookieSession.html) cookie-based session support
 *  - [methodOverride](methodOverride.html) faux HTTP method support
 *  - [responseTime](responseTime.html) calculates response-time and exposes via X-Response-Time
 *  - [staticCache](staticCache.html) memory cache layer for the static() middleware
 *  - [static](static.html) streaming static file server supporting `Range` and more
 *  - [directory](directory.html) directory listing middleware
 *  - [vhost](vhost.html) virtual host sub-domain mapping middleware
 *  - [favicon](favicon.html) efficient favicon server (with default icon)
 *  - [limit](limit.html) limit the bytesize of request bodies
 *  - [query](query.html) automatic querystring parser, populating `req.query`
 *  - [errorHandler](errorHandler.html) flexible error handler
 *
 * Internals:
 *
 *  - server [prototype](proto.html)
 *  - connect [utilities](utils.html)
 *  - node monkey [patches](patch.html)
 *
 * Links:
 * 
 *   - list of [3rd-party](https://github.com/senchalabs/connect/wiki) middleware
 *   - GitHub [repository](http://github.com/senchalabs/connect)
 *   - [test documentation](https://github.com/senchalabs/connect/blob/gh-pages/tests.md)
 * 
 */
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/utils',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - utils
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var http = require('http')
  , crypto = require('crypto')
  , crc16 = require('crc').crc16
  , parse = require('url').parse
  , Path = require('path')
  , fs = require('fs');
/**
 * Extract the mime type from the given request's
 * _Content-Type_ header.
 *
 * @param  {IncomingMessage} req
 * @return {String}
 * @api private
 */
exports.mime = function(req) {
  var str = req.headers['content-type'] || '';
  return str.split(';')[0];
};
/**
 * Generate an `Error` from the given status `code`.
 *
 * @param {Number} code
 * @return {Error}
 * @api private
 */
exports.error = function(code){
  var err = new Error(http.STATUS_CODES[code]);
  err.status = code;
  return err;
};
/**
 * Return md5 hash of the given string and optional encoding,
 * defaulting to hex.
 *
 *     utils.md5('wahoo');
 *     // => "e493298061761236c96b02ea6aa8a2ad"
 *
 * @param {String} str
 * @param {String} encoding
 * @return {String}
 * @api public
 */
exports.md5 = function(str, encoding){
  return crypto
    .createHash('md5')
    .update(str)
    .digest(encoding || 'hex');
};
/**
 * Merge object b with object a.
 *
 *     var a = { foo: 'bar' }
 *       , b = { bar: 'baz' };
 *     
 *     utils.merge(a, b);
 *     // => { foo: 'bar', bar: 'baz' }
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api private
 */
exports.merge = function(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};
/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */
exports.escape = function(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
exports.uid = function(len) {
  return crypto.randomBytes(Math.ceil(len * 3 / 4))
    .toString('base64')
    .slice(0, len);
};
/**
 * Sign the given `val` with `secret`.
 *
 * @param {String} val
 * @param {String} secret
 * @return {String}
 * @api private
 */
exports.sign = function(val, secret){
  return val + '.' + crypto
    .createHmac('sha256', secret)
    .update(val)
    .digest('base64')
    .replace(/=+$/, '');
};
/**
 * Unsign and decode the given `val` with `secret`,
 * returning `false` if the signature is invalid.
 *
 * @param {String} val
 * @param {String} secret
 * @return {String|Boolean}
 * @api private
 */
exports.unsign = function(val, secret){
  var str = val.slice(0,val.lastIndexOf('.'));
  return exports.sign(str, secret) == val
    ? str
    : false;
};
/**
 * Parse signed cookies, returning an object
 * containing the decoded key/value pairs,
 * while removing the signed key from `obj`.
 *
 * TODO: tag signed cookies with "s:"
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */
exports.parseSignedCookies = function(obj, secret){
  var ret = {};
  Object.keys(obj).forEach(function(key){
    var val = obj[key]
      , signed = exports.unsign(val, secret);
    if (signed) {
      ret[key] = signed;
      delete obj[key];
    }
  });
  return ret;
};
/**
 * Parse JSON cookies.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */
exports.parseJSONCookies = function(obj){
  var hashes = {};
  Object.keys(obj).forEach(function(key){
    var val = obj[key];
    if (0 == val.indexOf('j:')) {
      try {
        hashes[key] = crc16(val); // only crc json cookies for now
        obj[key] = JSON.parse(val.slice(2));
      } catch (err) {
        // nothing
      }
    }
  });
  return {
    cookies: obj,
    hashes: hashes
  };
};
/**
 * Parse the given cookie string into an object.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */
exports.parseCookie = function(str){
  var obj = {}
    , pairs = str.split(/[;,] */);
  for (var i = 0, len = pairs.length; i < len; ++i) {
    var pair = pairs[i]
      , eqlIndex = pair.indexOf('=')
      , key = pair.substr(0, eqlIndex).trim()
      , val = pair.substr(++eqlIndex, pair.length).trim();
    // quoted values
    if ('"' == val[0]) val = val.slice(1, -1);
    // only assign once
    if (undefined == obj[key]) {
      val = val.replace(/\+/g, ' ');
      try {
        obj[key] = decodeURIComponent(val);
      } catch (err) {
        if (err instanceof URIError) {
          obj[key] = val;
        } else {
          throw err;
        }
      }
    }
  }
  return obj;
};
/**
 * Serialize the given object into a cookie string.
 *
 *      utils.serializeCookie('name', 'tj', { httpOnly: true })
 *      // => "name=tj; httpOnly"
 *
 * @param {String} name
 * @param {String} val
 * @param {Object} obj
 * @return {String}
 * @api private
 */
exports.serializeCookie = function(name, val, obj){
  var pairs = [name + '=' + encodeURIComponent(val)]
    , obj = obj || {};
  if (obj.domain) pairs.push('domain=' + obj.domain);
  if (obj.path) pairs.push('path=' + obj.path);
  if (obj.expires) pairs.push('expires=' + obj.expires.toUTCString());
  if (obj.httpOnly) pairs.push('httpOnly');
  if (obj.secure) pairs.push('secure');
  return pairs.join('; ');
};
/**
 * Pause `data` and `end` events on the given `obj`.
 * Middleware performing async tasks _should_ utilize
 * this utility (or similar), to re-emit data once
 * the async operation has completed, otherwise these
 * events may be lost.
 *
 *      var pause = utils.pause(req);
 *      fs.readFile(path, function(){
 *         next();
 *         pause.resume();
 *      });
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */
exports.pause = function(obj){
  var onData
    , onEnd
    , events = [];
  // buffer data
  obj.on('data', onData = function(data, encoding){
    events.push(['data', data, encoding]);
  });
  // buffer end
  obj.on('end', onEnd = function(data, encoding){
    events.push(['end', data, encoding]);
  });
  return {
    end: function(){
      obj.removeListener('data', onData);
      obj.removeListener('end', onEnd);
    },
    resume: function(){
      this.end();
      for (var i = 0, len = events.length; i < len; ++i) {
        obj.emit.apply(obj, events[i]);
      }
    }
  };
};
/**
 * Check `req` and `res` to see if it has been modified.
 *
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @return {Boolean}
 * @api private
 */
exports.modified = function(req, res, headers) {
  var headers = headers || res._headers || {}
    , modifiedSince = req.headers['if-modified-since']
    , lastModified = headers['last-modified']
    , noneMatch = req.headers['if-none-match']
    , etag = headers['etag'];
  if (noneMatch) noneMatch = noneMatch.split(/ *, */);
  // check If-None-Match
  if (noneMatch && etag && ~noneMatch.indexOf(etag)) {
    return false;
  }
  // check If-Modified-Since
  if (modifiedSince && lastModified) {
    modifiedSince = new Date(modifiedSince);
    lastModified = new Date(lastModified);
    // Ignore invalid dates
    if (!isNaN(modifiedSince.getTime())) {
      if (lastModified <= modifiedSince) return false;
    }
  }
  
  return true;
};
/**
 * Strip `Content-*` headers from `res`.
 *
 * @param {ServerResponse} res
 * @api private
 */
exports.removeContentHeaders = function(res){
  Object.keys(res._headers).forEach(function(field){
    if (0 == field.indexOf('content')) {
      res.removeHeader(field);
    }
  });
};
/**
 * Check if `req` is a conditional GET request.
 *
 * @param {IncomingMessage} req
 * @return {Boolean}
 * @api private
 */
exports.conditionalGET = function(req) {
  return req.headers['if-modified-since']
    || req.headers['if-none-match'];
};
/**
 * Respond with 401 "Unauthorized".
 *
 * @param {ServerResponse} res
 * @param {String} realm
 * @api private
 */
exports.unauthorized = function(res, realm) {
  res.statusCode = 401;
  res.setHeader('WWW-Authenticate', 'Basic realm="' + realm + '"');
  res.end('Unauthorized');
};
/**
 * Respond with 304 "Not Modified".
 *
 * @param {ServerResponse} res
 * @param {Object} headers
 * @api private
 */
exports.notModified = function(res) {
  exports.removeContentHeaders(res);
  res.statusCode = 304;
  res.end();
};
/**
 * Return an ETag in the form of `"<size>-<mtime>"`
 * from the given `stat`.
 *
 * @param {Object} stat
 * @return {String}
 * @api private
 */
exports.etag = function(stat) {
  return '"' + stat.size + '-' + Number(stat.mtime) + '"';
};
/**
 * Parse "Range" header `str` relative to the given file `size`.
 *
 * @param {Number} size
 * @param {String} str
 * @return {Array}
 * @api private
 */
exports.parseRange = function(size, str){
  var valid = true;
  var arr = str.substr(6).split(',').map(function(range){
    var range = range.split('-')
      , start = parseInt(range[0], 10)
      , end = parseInt(range[1], 10);
    // -500
    if (isNaN(start)) {
      start = size - end;
      end = size - 1;
    // 500-
    } else if (isNaN(end)) {
      end = size - 1;
    }
    // Invalid
    if (isNaN(start)
      || isNaN(end)
      || start > end
      || start < 0) valid = false;
    return {
      start: start,
      end: end
    };
  });
  return valid ? arr : null;
};
/**
 * Parse the given Cache-Control `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */
exports.parseCacheControl = function(str){
  var directives = str.split(',')
    , obj = {};
  for(var i = 0, len = directives.length; i < len; i++) {
    var parts = directives[i].split('=')
      , key = parts.shift().trim()
      , val = parseInt(parts.shift(), 10);
    obj[key] = isNaN(val) ? true : val;
  }
  return obj;
};
/**
 * Parse the `req` url with memoization.
 *
 * @param {ServerRequest} req
 * @return {Object}
 * @api public
 */
exports.parseUrl = function(req){
  var parsed = req._parsedUrl;
  if (parsed && parsed.href == req.url) {
    return parsed;
  } else {
    return req._parsedUrl = parse(req.url);
  }
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/cache',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - Cache
 * Copyright(c) 2011 Sencha Inc.
 * MIT Licensed
 */
/**
 * Expose `Cache`.
 */
module.exports = Cache;
/**
 * LRU cache store.
 *
 * @param {Number} limit
 * @api private
 */
function Cache(limit) {
  this.store = {};
  this.keys = [];
  this.limit = limit;
}
/**
 * Touch `key`, promoting the object.
 *
 * @param {String} key
 * @param {Number} i
 * @api private
 */
Cache.prototype.touch = function(key, i){
  this.keys.splice(i,1);
  this.keys.push(key);
};
/**
 * Remove `key`.
 *
 * @param {String} key
 * @api private
 */
Cache.prototype.remove = function(key){
  delete this.store[key];
};
/**
 * Get the object stored for `key`.
 *
 * @param {String} key
 * @return {Array}
 * @api private
 */
Cache.prototype.get = function(key){
  return this.store[key];
};
/**
 * Add a cache `key`.
 *
 * @param {String} key
 * @return {Array}
 * @api private
 */
Cache.prototype.add = function(key){
  // initialize store
  var len = this.keys.push(key);
  // limit reached, invalidate LRU
  if (len > this.limit) this.remove(this.keys.shift());
  var arr = this.store[key] = [];
  arr.createdAt = new Date;
  return arr;
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/patch',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var http = require('http')
  , res = http.ServerResponse.prototype
  , setHeader = res.setHeader
  , _renderHeaders = res._renderHeaders
  , writeHead = res.writeHead;
// apply only once
if (!res._hasConnectPatch) {
  /**
   * Provide a public "header sent" flag
   * until node does.
   *
   * @return {Boolean}
   * @api public
   */
  res.__defineGetter__('headerSent', function(){
    return this._header;
  });
  /**
   * Set header `field` to `val`, special-casing
   * the `Set-Cookie` field for multiple support.
   *
   * @param {String} field
   * @param {String} val
   * @api public
   */
  res.setHeader = function(field, val){
    var key = field.toLowerCase()
      , prev;
    // special-case Set-Cookie
    if (this._headers && 'set-cookie' == key) {
      if (prev = this.getHeader(field)) {
        val = Array.isArray(prev)
          ? prev.concat(val)
          : [prev, val];
      }
    // charset
    } else if ('content-type' == key && this.charset) {
      val += '; charset=' + this.charset;
    }
    return setHeader.call(this, field, val);
  };
  /**
   * Proxy to emit "header" event.
   */
  res._renderHeaders = function(){
    if (!this._emittedHeader) this.emit('header');
    this._emittedHeader = true;
    return _renderHeaders.call(this);
  };
  res.writeHead = function(){
    if (!this._emittedHeader) this.emit('header');
    this._emittedHeader = true;
    return writeHead.apply(this, arguments);
  };
  res._hasConnectPatch = true;
}
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/connect',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var EventEmitter = require('events').EventEmitter
  , proto = require('./proto')
  , utils = require('./utils')
  , path = require('path')
  , basename = path.basename
  , fs = require('fs');
// node patches
require('./patch');
// expose createServer() as the module
exports = module.exports = createServer;
/**
 * Framework version.
 */
exports.version = '2.2.2';
/**
 * Expose the prototype.
 */
exports.proto = proto;
/**
 * Auto-load middleware getters.
 */
exports.middleware = {};
/**
 * Expose utilities.
 */
exports.utils = utils;
/**
 * Create a new connect server.
 *
 * @return {Function}
 * @api public
 */
function createServer() {
  function app(req, res){ app.handle(req, res); }
  utils.merge(app, proto);
  utils.merge(app, EventEmitter.prototype);
  app.route = '/';
  app.stack = [];
  for (var i = 0; i < arguments.length; ++i) {
    app.use(arguments[i]);
  }
  return app;
};
/**
 * Support old `.createServer()` method.
 */
createServer.createServer = createServer;
/**
 * Auto-load bundled middleware with getters.
 */
fs.readdirSync(__dirname + '/middleware').forEach(function(filename){
  if (!/\.js$/.test(filename)) return;
  var name = basename(filename, '.js');
  function load(){ return require('./middleware/' + name); }
  exports.middleware.__defineGetter__(name, load);
  exports.__defineGetter__(name, load);
});
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/proto',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - HTTPServer
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var http = require('http')
  , utils = require('./utils')
  , debug = require('debug')('connect:dispatcher');
// prototype
var app = module.exports = {};
// environment
var env = process.env.NODE_ENV || 'development';
/**
 * Utilize the given middleware `handle` to the given `route`,
 * defaulting to _/_. This "route" is the mount-point for the
 * middleware, when given a value other than _/_ the middleware
 * is only effective when that segment is present in the request's
 * pathname.
 *
 * For example if we were to mount a function at _/admin_, it would
 * be invoked on _/admin_, and _/admin/settings_, however it would
 * not be invoked for _/_, or _/posts_.
 *
 * Examples:
 *
 *      var app = connect();
 *      app.use(connect.favicon());
 *      app.use(connect.logger());
 *      app.use(connect.static(__dirname + '/public'));
 *
 * If we wanted to prefix static files with _/public_, we could
 * "mount" the `static()` middleware:
 *
 *      app.use('/public', connect.static(__dirname + '/public'));
 *
 * This api is chainable, so the following is valid:
 *
 *      connect
 *        .use(connect.favicon())
 *        .use(connect.logger())
 *        .use(connect.static(__dirname + '/public'))
 *        .listen(3000);
 *
 * @param {String|Function|Server} route, callback or server
 * @param {Function|Server} callback or server
 * @return {Server} for chaining
 * @api public
 */
app.use = function(route, fn){
  // default route to '/'
  if ('string' != typeof route) {
    fn = route;
    route = '/';
  }
  // wrap sub-apps
  if ('function' == typeof fn.handle) {
    var server = fn;
    fn.route = route;
    fn = function(req, res, next){
      server.handle(req, res, next);
    };
  }
  // wrap vanilla http.Servers
  if (fn instanceof http.Server) {
    fn = fn.listeners('request')[0];
  }
  // strip trailing slash
  if ('/' == route[route.length - 1]) {
    route = route.slice(0, -1);
  }
  // add the middleware
  debug('use %s %s', route || '/', fn.name || 'anonymous');
  this.stack.push({ route: route, handle: fn });
  return this;
};
/**
 * Handle server requests, punting them down
 * the middleware stack.
 *
 * @api private
 */
app.handle = function(req, res, out) {
  var stack = this.stack
    , fqdn = ~req.url.indexOf('://')
    , removed = ''
    , slashAdded = false
    , index = 0;
  function next(err) {
    var layer, path, status, c;
    if (slashAdded) {
      req.url = req.url.substr(1);
      slashAdded = false;
    }
    req.url = removed + req.url;
    req.originalUrl = req.originalUrl || req.url;
    removed = '';
    // next callback
    layer = stack[index++];
    // all done
    if (!layer || res.headerSent) {
      // delegate to parent
      if (out) return out(err);
      // unhandled error
      if (err) {
        // default to 500
        if (res.statusCode < 400) res.statusCode = 500;
        debug('default %s', res.statusCode);
        // respect err.status
        if (err.status) res.statusCode = err.status;
        // production gets a basic error message
        var msg = 'production' == env
          ? http.STATUS_CODES[res.statusCode]
          : err.stack || err.toString();
        // log to stderr in a non-test env
        if ('test' != env) console.error(err.stack || err.toString());
        if (res.headerSent) return req.socket.destroy();
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Length', Buffer.byteLength(msg));
        if ('HEAD' == req.method) return res.end();
        res.end(msg);
      } else {
        debug('default 404');
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        if ('HEAD' == req.method) return res.end();
        res.end('Cannot ' + req.method + ' ' + utils.escape(req.originalUrl));
      }
      return;
    }
    try {
      path = utils.parseUrl(req).pathname;
      if (undefined == path) path = '/';
      // skip this layer if the route doesn't match.
      if (0 != path.indexOf(layer.route)) return next(err);
      c = path[layer.route.length];
      if (c && '/' != c && '.' != c) return next(err);
      // Call the layer handler
      // Trim off the part of the url that matches the route
      removed = layer.route;
      req.url = req.url.substr(removed.length);
      // Ensure leading slash
      if (!fqdn && '/' != req.url[0]) {
        req.url = '/' + req.url;
        slashAdded = true;
      }
      debug('%s', layer.handle.name || 'anonymous');
      var arity = layer.handle.length;
      if (err) {
        if (arity === 4) {
          layer.handle(err, req, res, next);
        } else {
          next(err);
        }
      } else if (arity < 4) {
        layer.handle(req, res, next);
      } else {
        next();
      }
    } catch (e) {
      next(e);
    }
  }
  next();
};
/**
 * Listen for connections.
 *
 * This method takes the same arguments
 * as node's `http.Server#listen()`.  
 *
 * HTTP and HTTPS:
 *
 * If you run your application both as HTTP
 * and HTTPS you may wrap them individually,
 * since your Connect "server" is really just
 * a JavaScript `Function`.
 *
 *      var connect = require('connect')
 *        , http = require('http')
 *        , https = require('https');
 *      
 *      var app = connect();
 *      
 *      http.createServer(app).listen(80);
 *      https.createServer(options, app).listen(443);
 *
 * @return {http.Server}
 * @api public
 */
app.listen = function(){
  var server = http.createServer(this);
  return server.listen.apply(server, arguments);
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/urlencoded',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - urlencoded
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var utils = require('../utils')
  , qs = require('qs');
/**
 * Urlencoded:
 * 
 *  Parse x-ww-form-urlencoded request bodies,
 *  providing the parsed object as `req.body`.
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
exports = module.exports = function(options){
  options = options || {};
  return function urlencoded(req, res, next) {
    if (req._body) return next();
    req.body = req.body || {};
    // check Content-Type
    if ('application/x-www-form-urlencoded' != utils.mime(req)) return next();
    // flag as parsed
    req._body = true;
    // parse
    var buf = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ buf += chunk });
    req.on('end', function(){
      try {
        req.body = buf.length
          ? qs.parse(buf, options)
          : {};
        next();
      } catch (err){
        next(err);
      }
    });
  }
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/responseTime',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - responseTime
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Reponse time:
 *
 * Adds the `X-Response-Time` header displaying the response
 * duration in milliseconds.
 *
 * @return {Function}
 * @api public
 */
module.exports = function responseTime(){
  return function(req, res, next){
    var start = new Date;
    if (res._responseTime) return next();
    res._responseTime = true;
    res.on('header', function(header){
      var duration = new Date - start;
      res.setHeader('X-Response-time', duration + 'ms');
    });
    next();
  };
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/static',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Connect - staticProvider
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var fs = require('fs')
  , path = require('path')
  , join = path.join
  , basename = path.basename
  , normalize = path.normalize
  , utils = require('../utils')
  , Buffer = require('buffer').Buffer
  , parse = require('url').parse
  , mime = require('mime');
/**
 * Static:
 *
 *   Static file server with the given `root` path.
 *
 * Examples:
 *
 *     var oneDay = 86400000;
 *
 *     connect()
 *       .use(connect.static(__dirname + '/public'))
 *
 *     connect()
 *       .use(connect.static(__dirname + '/public', { maxAge: oneDay }))
 *
 * Options:
 *
 *    - `maxAge`   Browser cache maxAge in milliseconds. defaults to 0
 *    - `hidden`   Allow transfer of hidden files. defaults to false
 *    - `redirect`   Redirect to trailing "/" when the pathname is a dir
 *
 * @param {String} root
 * @param {Object} options
 * @return {Function}
 * @api public
 */
exports = module.exports = function static(root, options){
  options = options || {};
  // root required
  if (!root) throw new Error('static() root path required');
  options.root = root;
  return function static(req, res, next) {
    options.path = req.url;
    options.getOnly = true;
    send(req, res, next, options);
  };
};
/**
 * Expose mime module.
 * 
 * If you wish to extend the mime table use this
 * reference to the "mime" module in the npm registry.
 */
exports.mime = mime;
/**
 * decodeURIComponent.
 *
 * Allows V8 to only deoptimize this fn instead of all
 * of send().
 *
 * @param {String} path
 * @api private
 */
function decode(path){
  try {
    return decodeURIComponent(path);
  } catch (err) {
    return err;
  }
}
/**
 * Attempt to tranfer the requested file to `res`.
 *
 * @param {ServerRequest}
 * @param {ServerResponse}
 * @param {Function} next
 * @param {Object} options
 * @api private
 */
var send = exports.send = function(req, res, next, options){
  options = options || {};
  if (!options.path) throw new Error('path required');
  // setup
  var maxAge = options.maxAge || 0
    , ranges = req.headers.range
    , head = 'HEAD' == req.method
    , get = 'GET' == req.method
    , root = options.root ? normalize(options.root) : null
    , redirect = false === options.redirect ? false : true
    , getOnly = options.getOnly
    , fn = options.callback
    , hidden = options.hidden
    , done;
  if (Infinity == maxAge) maxAge = 60 * 60 * 24 * 365 * 1000;
  // replace next() with callback when available
  if (fn) next = fn;
  // ignore non-GET requests
  if (getOnly && !get && !head) return next();
  // parse url
  var url = parse(options.path)
    , path = decode(url.pathname)
    , type;
  if (path instanceof URIError) return next(utils.error(400));
  // null byte(s)
  if (~path.indexOf('\0')) return next(utils.error(400));
  // when root is not given, consider .. malicious
  if (!root && ~path.indexOf('..')) return next(utils.error(403));
  
  // index.html support
  if ('/' == path[path.length - 1]) path += 'index.html';
  
  // join / normalize from optional root dir
  path = normalize(join(root, path));
  // malicious path
  if (root && 0 != path.indexOf(root)) return next(utils.error(403));
  // "hidden" file
  if (!hidden && '.' == basename(path)[0]) return next();
  fs.stat(path, function(err, stat){
    // mime type
    type = mime.lookup(path);
    // ignore ENOENT
    if (err) {
      if (fn) return fn(err);
      return ('ENOENT' == err.code || 'ENAMETOOLONG' == err.code)
        ? next()
        : next(err);
    // redirect directory in case index.html is present
    } else if (stat.isDirectory()) {
      if (!redirect) return next();
      url = parse(req.originalUrl);
      res.statusCode = 301;
      res.setHeader('Location', url.pathname + '/');
      res.end('Redirecting to ' + url.pathname + '/');
      return;
    }
    // header fields
    if (!res.getHeader('Date')) res.setHeader('Date', new Date().toUTCString());
    if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'public, max-age=' + (maxAge / 1000));
    if (!res.getHeader('Last-Modified')) res.setHeader('Last-Modified', stat.mtime.toUTCString());
    if (!res.getHeader('Content-Type')) {
      var charset = mime.charsets.lookup(type);
      res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
    }
    res.setHeader('Accept-Ranges', 'bytes');
    // conditional GET support
    if (utils.conditionalGET(req)) {
      if (!utils.modified(req, res)) {
        req.emit('static');
        return utils.notModified(res);
      }
    }
    var opts = {}
      , len = stat.size;
    // we have a Range request
    if (ranges) {
      ranges = utils.parseRange(len, ranges);
      // valid
      if (ranges) {
        opts.start = ranges[0].start;
        opts.end = ranges[0].end;
        // unsatisfiable range
        if (opts.start > len - 1) {
          res.setHeader('Content-Range', 'bytes */' + stat.size);
          return next(utils.error(416));
        }
        // limit last-byte-pos to current length
        if (opts.end > len - 1) opts.end= len - 1;
        // Content-Range
        len = opts.end - opts.start + 1;
        res.statusCode = 206;
        res.setHeader('Content-Range', 'bytes '
          + opts.start
          + '-'
          + opts.end
          + '/'
          + stat.size);
      }
    }
    res.setHeader('Content-Length', len);
    // transfer
    if (head) return res.end();
    // stream
    var stream = fs.createReadStream(path, opts);
    req.emit('static', stream);
    req.on('close', stream.destroy.bind(stream));
    stream.pipe(res);
    // callback
    if (fn) {
      function callback(err) { done || fn(err); done = true }
      req.on('close', callback);
      req.socket.on('error', callback);
      stream.on('error', callback);
      stream.on('end', callback);
    } else {
      stream.on('error', function(err){
        if (res.headerSent) {
          console.error(err.stack);
          req.destroy();
        } else {
          next(err);
        }
      });
    }
  });
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/query',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Connect - query
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2011 Sencha Inc.
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var qs = require('qs')
  , parse = require('../utils').parseUrl;
/**
 * Query:
 *
 * Automatically parse the query-string when available,
 * populating the `req.query` object.
 *
 * Examples:
 *
 *     connect()
 *       .use(connect.query())
 *       .use(function(req, res){
 *         res.end(JSON.stringify(req.query));
 *       });
 *
 *  The `options` passed are provided to qs.parse function.
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
module.exports = function query(options){
  return function query(req, res, next){
    if (!req.query) {
      req.query = ~req.url.indexOf('?')
        ? qs.parse(parse(req).query, options)
        : {};
    }
    next();
  };
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/errorHandler',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Connect - errorHandler
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var utils = require('../utils')
  , url = require('url')
  , fs = require('fs');
// environment
var env = process.env.NODE_ENV || 'development';
/**
 * Error handler:
 *
 * Development error handler, providing stack traces
 * and error message responses for requests accepting text, html,
 * or json.
 *
 * Text:
 *
 *   By default, and when _text/plain_ is accepted a simple stack trace
 *   or error message will be returned.
 *
 * JSON:
 *
 *   When _application/json_ is accepted, connect will respond with
 *   an object in the form of `{ "error": error }`.
 *
 * HTML:
 *
 *   When accepted connect will output a nice html stack trace.
 *
 * @return {Function}
 * @api public
 */
exports = module.exports = function errorHandler(){
  return function errorHandler(err, req, res, next){
    if (err.status) res.statusCode = err.status;
    if (res.statusCode < 400) res.statusCode = 500;
    if ('test' != env) console.error(err.stack);
    var accept = req.headers.accept || '';
    // html
    if (~accept.indexOf('html')) {
      fs.readFile(__dirname + '/../public/style.css', 'utf8', function(e, style){
        fs.readFile(__dirname + '/../public/error.html', 'utf8', function(e, html){
          var stack = (err.stack || '')
            .split('\n').slice(1)
            .map(function(v){ return '<li>' + v + '</li>'; }).join('');
            html = html
              .replace('{style}', style)
              .replace('{stack}', stack)
              .replace('{title}', exports.title)
              .replace('{statusCode}', res.statusCode)
              .replace(/\{error\}/g, utils.escape(err.toString()));
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(html);
        });
      });
    // json
    } else if (~accept.indexOf('json')) {
      var error = { message: err.message, stack: err.stack };
      for (var prop in err) error[prop] = err[prop];
      var json = JSON.stringify({ error: error });
      res.setHeader('Content-Type', 'application/json');
      res.end(json);
    // plain text
    } else {
      res.writeHead(res.statusCode, { 'Content-Type': 'text/plain' });
      res.end(err.stack);
    }
  };
};
/**
 * Template title, framework authors may override this value.
 */
exports.title = 'Connect';
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/logger',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - logger
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/*!
 * Log buffer.
 */
var buf = [];
/*!
 * Default log buffer duration.
 */
var defaultBufferDuration = 1000;
/**
 * Logger:
 *
 * Log requests with the given `options` or a `format` string.
 *
 * Options:
 *
 *   - `format`  Format string, see below for tokens
 *   - `stream`  Output stream, defaults to _stdout_
 *   - `buffer`  Buffer duration, defaults to 1000ms when _true_
 *   - `immediate`  Write log line on request instead of response (for response times)
 *
 * Tokens:
 *
 *   - `:req[header]` ex: `:req[Accept]`
 *   - `:res[header]` ex: `:res[Content-Length]`
 *   - `:http-version`
 *   - `:response-time`
 *   - `:remote-addr`
 *   - `:date`
 *   - `:method`
 *   - `:url`
 *   - `:referrer`
 *   - `:user-agent`
 *   - `:status`
 *
 * Formats:
 *
 *   Pre-defined formats that ship with connect:
 *
 *    - `default` ':remote-addr - - [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
 *    - `short` ':remote-addr - :method :url HTTP/:http-version :status :res[content-length] - :response-time ms'
 *    - `tiny`  ':method :url :status :res[content-length] - :response-time ms'
 *    - `dev` concise output colored by response status for development use
 *
 * Examples:
 *
 *      connect.logger() // default
 *      connect.logger('short')
 *      connect.logger('tiny')
 *      connect.logger({ immediate: true, format: 'dev' })
 *      connect.logger(':method :url - :referrer')
 *      connect.logger(':req[content-type] -> :res[content-type]')
 *      connect.logger(function(req, res){ return 'some format string' })
 *
 * Defining Tokens:
 *
 *   To define a token, simply invoke `connect.logger.token()` with the
 *   name and a callback function. The value returned is then available
 *   as ":type" in this case.
 *
 *      connect.logger.token('type', function(req, res){ return req.headers['content-type']; })
 *
 * Defining Formats:
 *
 *   All default formats are defined this way, however it's public API as well:
 *
 *       connect.logger.format('name', 'string or function')
 *
 * @param {String|Function|Object} format or options
 * @return {Function}
 * @api public
 */
exports = module.exports = function logger(options) {
  if ('object' == typeof options) {
    options = options || {};
  } else if (options) {
    options = { format: options };
  } else {
    options = {};
  }
  // output on request instead of response
  var immediate = options.immediate;
  // format name
  var fmt = exports[options.format] || options.format || exports.default;
  // compile format
  if ('function' != typeof fmt) fmt = compile(fmt);
  // options
  var stream = options.stream || process.stdout
    , buffer = options.buffer;
  // buffering support
  if (buffer) {
    var realStream = stream
      , interval = 'number' == typeof buffer
        ? buffer
        : defaultBufferDuration;
    // flush interval
    setInterval(function(){
      if (buf.length) {
        realStream.write(buf.join(''), 'ascii');
        buf.length = 0;
      }
    }, interval); 
    // swap the stream
    stream = {
      write: function(str){
        buf.push(str);
      }
    };
  }
  return function logger(req, res, next) {
    req._startTime = new Date;
    // mount safety
    if (req._logging) return next();
    // flag as logging
    req._logging = true;
    // immediate
    if (immediate) {
      var line = fmt(exports, req, res);
      if (null == line) return;
      stream.write(line + '\n', 'ascii');
    // proxy end to output logging
    } else {
      var end = res.end;
      res.end = function(chunk, encoding){
        res.end = end;
        res.end(chunk, encoding);
        var line = fmt(exports, req, res);
        if (null == line) return;
        stream.write(line + '\n', 'ascii');
      };
    }
    next();
  };
};
/**
 * Compile `fmt` into a function.
 *
 * @param {String} fmt
 * @return {Function}
 * @api private
 */
function compile(fmt) {
  fmt = fmt.replace(/"/g, '\\"');
  var js = '  return "' + fmt.replace(/:([-\w]{2,})(?:\[([^\]]+)\])?/g, function(_, name, arg){
    return '"\n    + (tokens["' + name + '"](req, res, "' + arg + '") || "-") + "';
  }) + '";'
  return new Function('tokens, req, res', js);
};
/**
 * Define a token function with the given `name`,
 * and callback `fn(req, res)`.
 *
 * @param {String} name
 * @param {Function} fn
 * @return {Object} exports for chaining
 * @api public
 */
exports.token = function(name, fn) {
  exports[name] = fn;
  return this;
};
/**
 * Define a `fmt` with the given `name`.
 *
 * @param {String} name
 * @param {String|Function} fmt
 * @return {Object} exports for chaining
 * @api public
 */
exports.format = function(name, str){
  exports[name] = str;
  return this;
};
/**
 * Default format.
 */
exports.format('default', ':remote-addr - - [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"');
/**
 * Short format.
 */
exports.format('short', ':remote-addr - :method :url HTTP/:http-version :status :res[content-length] - :response-time ms');
/**
 * Tiny format.
 */
exports.format('tiny', ':method :url :status :res[content-length] - :response-time ms');
/**
 * dev (colored)
 */
exports.format('dev', function(tokens, req, res){
  var status = res.statusCode
    , color = 32;
  if (status >= 500) color = 31
  else if (status >= 400) color = 33
  else if (status >= 300) color = 36;
  return '\033[90m' + req.method
    + ' ' + req.originalUrl + ' '
    + '\033[' + color + 'm' + res.statusCode
    + ' \033[90m'
    + (new Date - req._startTime)
    + 'ms\033[0m';
});
/**
 * request url
 */
exports.token('url', function(req){
  return req.originalUrl;
});
/**
 * request method
 */
exports.token('method', function(req){
  return req.method;
});
/**
 * response time in milliseconds
 */
exports.token('response-time', function(req){
  return new Date - req._startTime;
});
/**
 * UTC date
 */
exports.token('date', function(){
  return new Date().toUTCString();
});
/**
 * response status code
 */
exports.token('status', function(req, res){
  return res.statusCode;
});
/**
 * normalized referrer
 */
exports.token('referrer', function(req){
  return req.headers['referer'] || req.headers['referrer'];
});
/**
 * remote address
 */
exports.token('remote-addr', function(req){
  return req.socket && (req.socket.remoteAddress || (req.socket.socket && req.socket.socket.remoteAddress));
});
/**
 * HTTP version
 */
exports.token('http-version', function(req){
  return req.httpVersionMajor + '.' + req.httpVersionMinor;
});
/**
 * UA string
 */
exports.token('user-agent', function(req){
  return req.headers['user-agent'];
});
/**
 * request header
 */
exports.token('req', function(req, res, field){
  return req.headers[field.toLowerCase()];
});
/**
 * response header
 */
exports.token('res', function(req, res, field){
  return (res._headers || {})[field.toLowerCase()];
});
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/bodyParser',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - bodyParser
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var multipart = require('./multipart')
  , urlencoded = require('./urlencoded')
  , json = require('./json');
/**
 * Body parser:
 * 
 *   Parse request bodies, supports _application/json_,
 *   _application/x-www-form-urlencoded_, and _multipart/form-data_.
 *
 *   This is equivalent to: 
 *
 *     app.use(connect.json());
 *     app.use(connect.urlencoded());
 *     app.use(connect.multipart());
 *
 * Examples:
 *
 *      connect()
 *        .use(connect.bodyParser())
 *        .use(function(req, res) {
 *          res.end('viewing user ' + req.body.user.name);
 *        });
 *
 *      $ curl -d 'user[name]=tj' http://local/
 *      $ curl -d '{"user":{"name":"tj"}}' -H "Content-Type: application/json" http://local/
 *
 *  View [json](json.html), [urlencoded](urlencoded.html), and [multipart](multipart.html) for more info.
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
exports = module.exports = function bodyParser(options){
  var _urlencoded = urlencoded(options)
    , _multipart = multipart(options)
    , _json = json(options);
  return function bodyParser(req, res, next) {
    _json(req, res, function(err){
      if (err) return next(err);
      _urlencoded(req, res, function(err){
        if (err) return next(err);
        _multipart(req, res, next);
      });
    });
  }
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/directory',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - directory
 * Copyright(c) 2011 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
// TODO: icon / style for directories
// TODO: arrow key navigation
// TODO: make icons extensible
/**
 * Module dependencies.
 */
var fs = require('fs')
  , parse = require('url').parse
  , utils = require('../utils')
  , path = require('path')
  , normalize = path.normalize
  , extname = path.extname
  , join = path.join;
/*!
 * Icon cache.
 */
var cache = {};
/**
 * Directory:
 *
 * Serve directory listings with the given `root` path.
 *
 * Options:
 *
 *  - `hidden` display hidden (dot) files. Defaults to false.
 *  - `icons`  display icons. Defaults to false.
 *  - `filter` Apply this filter function to files. Defaults to false.
 *
 * @param {String} root
 * @param {Object} options
 * @return {Function}
 * @api public
 */
exports = module.exports = function directory(root, options){
  options = options || {};
  // root required
  if (!root) throw new Error('directory() root path required');
  var hidden = options.hidden
    , icons = options.icons
    , filter = options.filter
    , root = normalize(root);
  return function directory(req, res, next) {
    var accept = req.headers.accept || 'text/plain'
      , url = parse(req.url)
      , dir = decodeURIComponent(url.pathname)
      , path = normalize(join(root, dir))
      , originalUrl = parse(req.originalUrl)
      , originalDir = decodeURIComponent(originalUrl.pathname)
      , showUp = path != root && path != root + '/';
    // null byte(s), bad request
    if (~path.indexOf('\0')) return next(utils.error(400));
    // malicious path, forbidden
    if (0 != path.indexOf(root)) return next(utils.error(403));
    // check if we have a directory
    fs.stat(path, function(err, stat){
      if (err) return 'ENOENT' == err.code
        ? next()
        : next(err);
      if (!stat.isDirectory()) return next();
      // fetch files
      fs.readdir(path, function(err, files){
        if (err) return next(err);
        if (!hidden) files = removeHidden(files);
        if (filter) files = files.filter(filter);
        files.sort();
        // content-negotiation
        for (var key in exports) {
          if (~accept.indexOf(key) || ~accept.indexOf('*/*')) {
            exports[key](req, res, files, next, originalDir, showUp, icons);
            return;
          }
        }
        // not acceptable
        next(utils.error(406));
      });
    });
  };
};
/**
 * Respond with text/html.
 */
exports.html = function(req, res, files, next, dir, showUp, icons){
  fs.readFile(__dirname + '/../public/directory.html', 'utf8', function(err, str){
    if (err) return next(err);
    fs.readFile(__dirname + '/../public/style.css', 'utf8', function(err, style){
      if (err) return next(err);
      if (showUp) files.unshift('..');
      str = str
        .replace('{style}', style)
        .replace('{files}', html(files, dir, icons))
        .replace('{directory}', dir)
        .replace('{linked-path}', htmlPath(dir));
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Length', str.length);
      res.end(str);
    });
  });
};
/**
 * Respond with application/json.
 */
exports.json = function(req, res, files){
  files = JSON.stringify(files);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', files.length);
  res.end(files);
};
/**
 * Respond with text/plain.
 */
exports.plain = function(req, res, files){
  files = files.join('\n') + '\n';
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', files.length);
  res.end(files);
};
/**
 * Map html `dir`, returning a linked path.
 */
function htmlPath(dir) {
  var curr = [];
  return dir.split('/').map(function(part){
    curr.push(part);
    return '<a href="' + curr.join('/') + '">' + part + '</a>';
  }).join(' / ');
}
/**
 * Map html `files`, returning an html unordered list.
 */
function html(files, dir, useIcons) {
  return '<ul id="files">' + files.map(function(file){
    var icon = ''
      , classes = [];
    if (useIcons && '..' != file) {
      icon = icons[extname(file)] || icons.default;
      icon = '<img src="data:image/png;base64,' + load(icon) + '" />';
      classes.push('icon');
    }
    return '<li><a href="'
      + join(dir, file)
      + '" class="'
      + classes.join(' ') + '"'
      + ' title="' + file + '">'
      + icon + file + '</a></li>';
  }).join('\n') + '</ul>';
}
/**
 * Load and cache the given `icon`.
 *
 * @param {String} icon
 * @return {String}
 * @api private
 */
function load(icon) {
  if (cache[icon]) return cache[icon];
  return cache[icon] = fs.readFileSync(__dirname + '/../public/icons/' + icon, 'base64');
}
/**
 * Filter "hidden" `files`, aka files
 * beginning with a `.`.
 *
 * @param {Array} files
 * @return {Array}
 * @api private
 */
function removeHidden(files) {
  return files.filter(function(file){
    return '.' != file[0];
  });
}
/**
 * Icon map.
 */
var icons = {
    '.js': 'page_white_code_red.png'
  , '.c': 'page_white_c.png'
  , '.h': 'page_white_h.png'
  , '.cc': 'page_white_cplusplus.png'
  , '.php': 'page_white_php.png'
  , '.rb': 'page_white_ruby.png'
  , '.cpp': 'page_white_cplusplus.png'
  , '.swf': 'page_white_flash.png'
  , '.pdf': 'page_white_acrobat.png'
  , 'default': 'page_white.png'
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/basicAuth',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - basicAuth
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var utils = require('../utils')
  , unauthorized = utils.unauthorized;
/**
 * Basic Auth:
 *
 * Enfore basic authentication by providing a `callback(user, pass)`,
 * which must return `true` in order to gain access. Alternatively an async
 * method is provided as well, invoking `callback(user, pass, callback)`. Populates
 * `req.user`. The final alternative is simply passing username / password
 * strings.
 *
 *  Simple username and password
 *
 *     connect(connect.basicAuth('username', 'password'));
 *
 *  Callback verification
 *
 *     connect()
 *       .use(connect.basicAuth(function(user, pass){
 *         return 'tj' == user & 'wahoo' == pass;
 *       }))
 *
 *  Async callback verification, accepting `fn(err, user)`.
 *
 *     connect()
 *       .use(connect.basicAuth(function(user, pass, fn){
 *         User.authenticate({ user: user, pass: pass }, fn);
 *       }))
 *
 * @param {Function|String} callback or username
 * @param {String} realm
 * @api public
 */
module.exports = function basicAuth(callback, realm) {
  var username, password;
  // user / pass strings
  if ('string' == typeof callback) {
    username = callback;
    password = realm;
    if ('string' != typeof password) throw new Error('password argument required');
    realm = arguments[2];
    callback = function(user, pass){
      return user == username && pass == password;
    }
  }
  realm = realm || 'Authorization Required';
  return function(req, res, next) {
    var authorization = req.headers.authorization;
    if (req.user) return next();
    if (!authorization) return unauthorized(res, realm);
    var parts = authorization.split(' ')
      , scheme = parts[0]
      , credentials = new Buffer(parts[1], 'base64').toString().split(':')
      , user = credentials[0]
      , pass = credentials[1];
    if ('Basic' != scheme) return next(utils.error(400));
    // async
    if (callback.length >= 3) {
      var pause = utils.pause(req);
      callback(user, pass, function(err, user){
        if (err || !user)  return unauthorized(res, realm);
        req.user = user;
        next();
        pause.resume();
      });
    // sync
    } else {
      if (callback(user, pass)) {
        req.user = user;
        next();
      } else {
        unauthorized(res, realm);
      }
    }
  }
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/limit',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - limit
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var utils = require('../utils');
/**
 * Limit:
 *
 *   Limit request bodies to the given size in `bytes`.
 *
 *   A string representation of the bytesize may also be passed,
 *   for example "5mb", "200kb", "1gb", etc.
 *
 *     connect()
 *       .use(connect.limit('5.5mb'))
 *       .use(handleImageUpload)
 *
 * @param {Number|String} bytes
 * @return {Function}
 * @api public
 */
module.exports = function limit(bytes){
  if ('string' == typeof bytes) bytes = parse(bytes);
  if ('number' != typeof bytes) throw new Error('limit() bytes required');
  return function limit(req, res, next){
    var received = 0
      , len = req.headers['content-length']
        ? parseInt(req.headers['content-length'], 10)
        : null;
    // self-awareness
    if (req._limit) return next();
    req._limit = true;
    // limit by content-length
    if (len && len > bytes) return next(utils.error(413));
    // limit
    req.on('data', function(chunk){
      received += chunk.length;
      if (received > bytes) req.destroy();
    });
    next();
  };
};
/**
 * Parse byte `size` string.
 *
 * @param {String} size
 * @return {Number}
 * @api private
 */
function parse(size) {
  var parts = size.match(/^(\d+(?:\.\d+)?) *(kb|mb|gb)$/)
    , n = parseFloat(parts[1])
    , type = parts[2];
  var map = {
      kb: 1024
    , mb: 1024 * 1024
    , gb: 1024 * 1024 * 1024
  };
  return map[type] * n;
}
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/csrf',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Connect - csrf
 * Copyright(c) 2011 Sencha Inc.
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var utils = require('../utils')
  , crypto = require('crypto');
/**
 * Anti CSRF:
 *
 * CRSF protection middleware.
 *
 * By default this middleware generates a token named "_csrf"
 * which should be added to requests which mutate
 * state, within a hidden form field, query-string etc. This
 * token is validated against the visitor's `req.session._csrf`
 * property.
 *
 * The default `value` function checks `req.body` generated
 * by the `bodyParser()` middleware, `req.query` generated
 * by `query()`, and the "X-CSRF-Token" header field.
 *
 * This middleware requires session support, thus should be added
 * somewhere _below_ `session()` and `cookieParser()`.
 *
 * Options:
 *
 *    - `value` a function accepting the request, returning the token 
 *
 * @param {Object} options
 * @api public
 */
module.exports = function csrf(options) {
  var options = options || {}
    , value = options.value || defaultValue;
  return function(req, res, next){
    // generate CSRF token
    var token = req.session._csrf || (req.session._csrf = utils.uid(24));
    // ignore these methods
    if ('GET' == req.method || 'HEAD' == req.method || 'OPTIONS' == req.method) return next();
    // determine value
    var val = value(req);
    // check
    if (val != token) return next(utils.error(403));
    
    next();
  }
};
/**
 * Default value function, checking the `req.body`
 * and `req.query` for the CSRF token.
 *
 * @param {IncomingMessage} req
 * @return {String}
 * @api private
 */
function defaultValue(req) {
  return (req.body && req.body._csrf)
    || (req.query && req.query._csrf)
    || (req.headers['x-csrf-token']);
}
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/compress',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - compress
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var zlib = require('zlib');
/**
 * Supported content-encoding methods.
 */
exports.methods = {
    gzip: zlib.createGzip
  , deflate: zlib.createDeflate
};
/**
 * Default filter function.
 */
exports.filter = function(req, res){
  var type = res.getHeader('Content-Type') || '';
  return type.match(/json|text|javascript/);
};
/**
 * Compress:
 *
 * Compress response data with gzip/deflate.
 *
 * Filter:
 *
 *  A `filter` callback function may be passed to
 *  replace the default logic of:
 *
 *     exports.filter = function(req, res){
 *       var type = res.getHeader('Content-Type') || '';
 *       return type.match(/json|text|javascript/);
 *     };
 *
 * Options:
 *
 *  All remaining options are passed to the gzip/deflate
 *  creation functions. Consult node's docs for additional details.
 *
 *   - `chunkSize` (default: 16*1024)
 *   - `windowBits`
 *   - `level`: 0-9 where 0 is no compression, and 9 is slow but best compression
 *   - `memLevel`: 1-9 low is slower but uses less memory, high is fast but uses more
 *   - `strategy`: compression strategy
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
module.exports = function compress(options) {
  var options = options || {}
    , names = Object.keys(exports.methods)
    , filter = options.filter || exports.filter;
  return function(req, res, next){
    var accept = req.headers['accept-encoding']
      , write = res.write
      , end = res.end
      , stream
      , method;
    // vary
    res.setHeader('Vary', 'Accept-Encoding');
    // proxy
    res.write = function(chunk, encoding){
      if (!this.headerSent) this._implicitHeader();
      return stream
        ? stream.write(chunk, encoding)
        : write.call(res, chunk, encoding);
    };
    res.end = function(chunk, encoding){
      if (chunk) this.write(chunk, encoding);
      return stream
        ? stream.end()
        : end.call(res);
    };
    res.on('header', function(){
      // default request filter
      if (!filter(req, res)) return;
      // SHOULD use identity
      if (!accept) return;
      // head
      if ('HEAD' == req.method) return;
      // default to gzip
      if ('*' == accept.trim()) method = 'gzip';
      // compression method
      if (!method) {
        for (var i = 0, len = names.length; i < len; ++i) {
          if (~accept.indexOf(names[i])) {
            method = names[i];
            break;
          }
        }
      }
      // compression method
      if (!method) return;
      // compression stream
      stream = exports.methods[method](options);
      // header fields
      res.setHeader('Content-Encoding', method);
      res.removeHeader('Content-Length');
      // compression
      stream.on('data', function(chunk){
        write.call(res, chunk);
      });
      stream.on('end', function(){
        end.call(res);
      });
      stream.on('drain', function() {
        res.emit('drain');
      });
    });
    next();
  };
}
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/session/cookie',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - session - Cookie
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var utils = require('../../utils');
/**
 * Initialize a new `Cookie` with the given `options`.
 *
 * @param {IncomingMessage} req
 * @param {Object} options
 * @api private
 */
var Cookie = module.exports = function Cookie(req, options) {
  this.path = '/';
  this.maxAge = null;
  this.httpOnly = true;
  if (options) utils.merge(this, options);
  Object.defineProperty(this, 'req', { value: req });
  this.originalMaxAge = undefined == this.originalMaxAge
    ? this.maxAge
    : this.originalMaxAge;
};
/*!
 * Prototype.
 */
Cookie.prototype = {
  /**
   * Set expires `date`.
   *
   * @param {Date} date
   * @api public
   */
  
  set expires(date) {
    this._expires = date;
    this.originalMaxAge = this.maxAge;
  },
  /**
   * Get expires `date`.
   *
   * @return {Date}
   * @api public
   */
  get expires() {
    return this._expires;
  },
  
  /**
   * Set expires via max-age in `ms`.
   *
   * @param {Number} ms
   * @api public
   */
  
  set maxAge(ms) {
    this.expires = 'number' == typeof ms
      ? new Date(Date.now() + ms)
      : ms;
  },
  /**
   * Get expires max-age in `ms`.
   *
   * @return {Number}
   * @api public
   */
  get maxAge() {
    return this.expires instanceof Date
      ? this.expires.valueOf() - Date.now()
      : this.expires;
  },
  /**
   * Return cookie data object.
   *
   * @return {Object}
   * @api private
   */
  get data() {
    return {
        originalMaxAge: this.originalMaxAge
      , expires: this._expires
      , secure: this.secure
      , httpOnly: this.httpOnly
      , domain: this.domain
      , path: this.path
    }
  },
  /**
   * Return a serialized cookie string.
   *
   * @return {String}
   * @api public
   */
  serialize: function(name, val){
    val = utils.sign(val, this.req.secret);
    return utils.serializeCookie(name, val, this.data);
  },
  /**
   * Return JSON representation of this cookie.
   *
   * @return {Object}
   * @api private
   */
  
  toJSON: function(){
    return this.data;
  }
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/session/store',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - session - Store
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var EventEmitter = require('events').EventEmitter
  , Session = require('./session')
  , Cookie = require('./cookie')
  , utils = require('../../utils');
/**
 * Initialize abstract `Store`.
 *
 * @api private
 */
var Store = module.exports = function Store(options){};
/**
 * Inherit from `EventEmitter.prototype`.
 */
Store.prototype.__proto__ = EventEmitter.prototype;
/**
 * Re-generate the given requests's session.
 *
 * @param {IncomingRequest} req
 * @return {Function} fn
 * @api public
 */
Store.prototype.regenerate = function(req, fn){
  var self = this;
  this.destroy(req.sessionID, function(err){
    self.generate(req);
    fn(err);
  });
};
/**
 * Load a `Session` instance via the given `sid`
 * and invoke the callback `fn(err, sess)`.
 *
 * @param {String} sid
 * @param {Function} fn
 * @api public
 */
Store.prototype.load = function(sid, fn){
  var self = this;
  this.get(sid, function(err, sess){
    if (err) return fn(err);
    if (!sess) return fn();
    var req = { sessionID: sid, sessionStore: self };
    sess = self.createSession(req, sess);
    fn(null, sess);
  });
};
/**
 * Create session from JSON `sess` data.
 *
 * @param {IncomingRequest} req
 * @param {Object} sess
 * @return {Session}
 * @api private
 */
Store.prototype.createSession = function(req, sess){
  var expires = sess.cookie.expires
    , orig = sess.cookie.originalMaxAge
    , update = null == update ? true : false;
  sess.cookie = new Cookie(req, sess.cookie);
  if ('string' == typeof expires) sess.cookie.expires = new Date(expires);
  sess.cookie.originalMaxAge = orig;
  req.session = new Session(req, sess);
  return req.session;
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/session/memory',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - session - MemoryStore
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var Store = require('./store')
  , utils = require('../../utils')
  , Session = require('./session');
/**
 * Initialize a new `MemoryStore`.
 *
 * @api public
 */
var MemoryStore = module.exports = function MemoryStore() {
  this.sessions = {};
};
/**
 * Inherit from `Store.prototype`.
 */
MemoryStore.prototype.__proto__ = Store.prototype;
/**
 * Attempt to fetch session by the given `sid`.
 *
 * @param {String} sid
 * @param {Function} fn
 * @api public
 */
MemoryStore.prototype.get = function(sid, fn){
  var self = this;
  process.nextTick(function(){
    var expires
      , sess = self.sessions[sid];
    if (sess) {
      sess = JSON.parse(sess);
      expires = 'string' == typeof sess.cookie.expires
        ? new Date(sess.cookie.expires)
        : sess.cookie.expires;
      if (!expires || new Date < expires) {
        fn(null, sess);
      } else {
        self.destroy(sid, fn);
      }
    } else {
      fn();
    }
  });
};
/**
 * Commit the given `sess` object associated with the given `sid`.
 *
 * @param {String} sid
 * @param {Session} sess
 * @param {Function} fn
 * @api public
 */
MemoryStore.prototype.set = function(sid, sess, fn){
  var self = this;
  process.nextTick(function(){
    self.sessions[sid] = JSON.stringify(sess);
    fn && fn();
  });
};
/**
 * Destroy the session associated with the given `sid`.
 *
 * @param {String} sid
 * @api public
 */
MemoryStore.prototype.destroy = function(sid, fn){
  var self = this;
  process.nextTick(function(){
    delete self.sessions[sid];
    fn && fn();
  });
};
/**
 * Invoke the given callback `fn` with all active sessions.
 *
 * @param {Function} fn
 * @api public
 */
MemoryStore.prototype.all = function(fn){
  var arr = []
    , keys = Object.keys(this.sessions);
  for (var i = 0, len = keys.length; i < len; ++i) {
    arr.push(this.sessions[keys[i]]);
  }
  fn(null, arr);
};
/**
 * Clear all sessions.
 *
 * @param {Function} fn
 * @api public
 */
MemoryStore.prototype.clear = function(fn){
  this.sessions = {};
  fn && fn();
};
/**
 * Fetch number of sessions.
 *
 * @param {Function} fn
 * @api public
 */
MemoryStore.prototype.length = function(fn){
  fn(null, Object.keys(this.sessions).length);
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/session/session',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - session - Session
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var utils = require('../../utils')
  , Cookie = require('./cookie');
/**
 * Create a new `Session` with the given request and `data`.
 *
 * @param {IncomingRequest} req
 * @param {Object} data
 * @api private
 */
var Session = module.exports = function Session(req, data) {
  Object.defineProperty(this, 'req', { value: req });
  Object.defineProperty(this, 'id', { value: req.sessionID });
  if ('object' == typeof data) utils.merge(this, data);
};
/**
 * Update reset `.cookie.maxAge` to prevent
 * the cookie from expiring when the
 * session is still active.
 *
 * @return {Session} for chaining
 * @api public
 */
Session.prototype.touch = function(){
  return this.resetMaxAge();
};
/**
 * Reset `.maxAge` to `.originalMaxAge`.
 *
 * @return {Session} for chaining
 * @api public
 */
Session.prototype.resetMaxAge = function(){
  this.cookie.maxAge = this.cookie.originalMaxAge;
  return this;
};
/**
 * Save the session data with optional callback `fn(err)`.
 *
 * @param {Function} fn
 * @return {Session} for chaining
 * @api public
 */
Session.prototype.save = function(fn){
  this.req.sessionStore.set(this.id, this, fn || function(){});
  return this;
};
/**
 * Re-loads the session data _without_ altering
 * the maxAge properties. Invokes the callback `fn(err)`,
 * after which time if no exception has occurred the
 * `req.session` property will be a new `Session` object,
 * although representing the same session.
 *
 * @param {Function} fn
 * @return {Session} for chaining
 * @api public
 */
Session.prototype.reload = function(fn){
  var req = this.req
    , store = this.req.sessionStore;
  store.get(this.id, function(err, sess){
    if (err) return fn(err);
    if (!sess) return fn(new Error('failed to load session'));
    store.createSession(req, sess);
    fn();
  });
  return this;
};
/**
 * Destroy `this` session.
 *
 * @param {Function} fn
 * @return {Session} for chaining
 * @api public
 */
Session.prototype.destroy = function(fn){
  delete this.req.session;
  this.req.sessionStore.destroy(this.id, fn);
  return this;
};
/**
 * Regenerate this request's session.
 *
 * @param {Function} fn
 * @return {Session} for chaining
 * @api public
 */
Session.prototype.regenerate = function(fn){
  this.req.sessionStore.regenerate(this.req, fn);
  return this;
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/multipart',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - multipart
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var formidable = require('formidable')
  , utils = require('../utils')
  , qs = require('qs');
/**
 * Multipart:
 * 
 * Parse multipart/form-data request bodies,
 * providing the parsed object as `req.body`
 * and `req.files`.
 *
 * Configuration:
 *
 *  The options passed are merged with [formidable](https://github.com/felixge/node-formidable)'s
 *  `IncomingForm` object, allowing you to configure the upload directory,
 *  size limits, etc. For example if you wish to change the upload dir do the following.
 *
 *     app.use(connect.multipart({ uploadDir: path }));
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
exports = module.exports = function(options){
  options = options || {};
  return function multipart(req, res, next) {
    if (req._body) return next();
    req.body = req.body || {};
    req.files = req.files || {};
    // ignore GET
    if ('GET' == req.method || 'HEAD' == req.method) return next();
    // check Content-Type
    if ('multipart/form-data' != utils.mime(req)) return next();
    // flag as parsed
    req._body = true;
    // parse
    var form = new formidable.IncomingForm
      , data = {}
      , files = {}
      , done;
    Object.keys(options).forEach(function(key){
      form[key] = options[key];
    });
    function ondata(name, val, data){
      if (Array.isArray(data[name])) {
        data[name].push(val);
      } else if (data[name]) {
        data[name] = [data[name], val];
      } else {
        data[name] = val;
      }
    }
    form.on('field', function(name, val){
      ondata(name, val, data);
    });
    form.on('file', function(name, val){
      ondata(name, val, files);
    });
    form.on('error', function(err){
      next(err);
      done = true;
    });
    form.on('end', function(){
      if (done) return;
      try {
        req.body = qs.parse(data);
        req.files = qs.parse(files);
        next();
      } catch (err) {
        next(err);
      }
    });
    form.parse(req);
  }
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/staticCache',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - staticCache
 * Copyright(c) 2011 Sencha Inc.
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var http = require('http')
  , utils = require('../utils')
  , Cache = require('../cache')
  , url = require('url')
  , fs = require('fs');
/**
 * Static cache:
 *
 * Enables a memory cache layer on top of
 * the `static()` middleware, serving popular
 * static files.
 *
 * By default a maximum of 128 objects are
 * held in cache, with a max of 256k each,
 * totalling ~32mb.
 *
 * A Least-Recently-Used (LRU) cache algo
 * is implemented through the `Cache` object,
 * simply rotating cache objects as they are
 * hit. This means that increasingly popular
 * objects maintain their positions while
 * others get shoved out of the stack and
 * garbage collected.
 *
 * Benchmarks:
 *
 *     static(): 2700 rps
 *     node-static: 5300 rps
 *     static() + staticCache(): 7500 rps
 *
 * Options:
 *
 *   - `maxObjects`  max cache objects [128]
 *   - `maxLength`  max cache object length 256kb
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
module.exports = function staticCache(options){
  var options = options || {}
    , cache = new Cache(options.maxObjects || 128)
    , maxlen = options.maxLength || 1024 * 256;
  return function staticCache(req, res, next){
    var key = cacheKey(req)
      , ranges = req.headers.range
      , hit = cache.get(key);
    // cache static
    // TODO: change from staticCache() -> cache()
    // and make this work for any request
    req.on('static', function(stream){
      var headers = res._headers
        , cc = utils.parseCacheControl(headers['cache-control'] || '')
        , contentLength = headers['content-length']
        , hit;
      // ignore larger files
      if (!contentLength || contentLength > maxlen) return;
      // don't cache partial files
      if (headers['content-range']) return;
      // dont cache items we shouldn't be
      // TODO: real support for must-revalidate / no-cache
      if ( cc['no-cache']
        || cc['no-store']
        || cc['private']
        || cc['must-revalidate']) return;
      // if already in cache then validate
      if (hit = cache.get(key)){
        if (headers.etag == hit[0].etag) {
          hit[0].date = new Date;
          return;
        } else {
          cache.remove(key);
        }
      }
      // validation notifiactions don't contain a steam
      if (null == stream) return;
      // add the cache object
      var arr = [];
      // store the chunks
      stream.on('data', function(chunk){
        arr.push(chunk);
      });
      // flag it as complete
      stream.on('end', function(){
        var cacheEntry = cache.add(key);
        delete headers['x-cache']; // Clean up (TODO: others)
        cacheEntry.push(200);
        cacheEntry.push(headers);
        cacheEntry.push.apply(cacheEntry, arr);
      });
    });
    if (req.method == 'GET' || req.method == 'HEAD') {
      if (ranges) {
        next();
      } else if (hit && !mustRevalidate(req, hit)) {
        res.setHeader('X-Cache', 'HIT');
        respondFromCache(req, res, hit);
      } else {
        res.setHeader('X-Cache', 'MISS');
        next();
      }
    } else {
      next();
    }
  }
};
/**
 * Respond with the provided cached value.
 * TODO: Assume 200 code, that's iffy.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} cacheEntry
 * @return {String}
 * @api private
 */
function respondFromCache(req, res, cacheEntry) {
  var status = cacheEntry[0]
    , headers = utils.merge({}, cacheEntry[1])
    , content = cacheEntry.slice(2);
  headers.age = (new Date - new Date(headers.date)) / 1000 || 0;
  switch (req.method) {
    case 'HEAD':
      res.writeHead(status, headers);
      res.end();
      break;
    case 'GET':
      if (utils.conditionalGET(req) && !utils.modified(req, res, headers)) {
        header['content-length'] = 0;
        res.writeHead(304, headers);
        res.end();
      } else {
        res.writeHead(status, headers);
        function write() {
          while (content.length) {
            if (false === res.write(content.shift())) {
              res.once('drain', write);
              return;
            }
          }
          res.end();
        }
        write();
      }
      break;
    default:
      // This should never happen.
      res.writeHead(500, '');
      res.end();
  }
}
/**
 * Determine whether or not a cached value must be revalidated.
 *
 * @param {Object} req
 * @param {Object} cacheEntry
 * @return {String}
 * @api private
 */
function mustRevalidate(req, cacheEntry) {
  var cacheHeaders = cacheEntry[1]
    , reqCC = utils.parseCacheControl(req.headers['cache-control'] || '')
    , cacheCC = utils.parseCacheControl(cacheHeaders['cache-control'] || '')
    , cacheAge = (new Date - new Date(cacheHeaders.date)) / 1000 || 0;
  if ( cacheCC['no-cache']
    || cacheCC['must-revalidate']
    || cacheCC['proxy-revalidate']) return true;
  if (reqCC['no-cache']) return true
  if (null != reqCC['max-age']) return reqCC['max-age'] < cacheAge;
  if (null != cacheCC['max-age']) return cacheCC['max-age'] < cacheAge;
  return false;
}
/**
 * The key to use in the cache. For now, this is the URL path and query.
 *
 * 'http://example.com?key=value' -> '/?key=value'
 *
 * @param {Object} req
 * @return {String}
 * @api private
 */
function cacheKey(req) {
  return utils.parseUrl(req).path;
}
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/favicon',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - favicon
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var fs = require('fs')
  , utils = require('../utils');
/*!
 * Favicon cache.
 */
var icon;
/**
 * Favicon:
 *
 * By default serves the connect favicon, or the favicon
 * located by the given `path`.
 *
 * Options:
 *
 *   - `maxAge`  cache-control max-age directive, defaulting to 1 day
 *
 * Examples:
 *
 *   Serve default favicon:
 *
 *     connect()
 *       .use(connect.favicon())
 *
 *   Serve favicon before logging for brevity:
 *
 *     connect()
 *       .use(connect.favicon())
 *       .use(connect.logger('dev'))
 *
 *   Serve custom favicon:
 *
 *     connect()
 *       .use(connect.favicon('public/favicon.ico))
 *
 * @param {String} path
 * @param {Object} options
 * @return {Function}
 * @api public
 */
module.exports = function favicon(path, options){
  var options = options || {}
    , path = path || __dirname + '/../public/favicon.ico'
    , maxAge = options.maxAge || 86400000;
  return function favicon(req, res, next){
    if ('/favicon.ico' == req.url) {
      if (icon) {
        res.writeHead(200, icon.headers);
        res.end(icon.body);
      } else {
        fs.readFile(path, function(err, buf){
          if (err) return next(err);
          icon = {
            headers: {
                'Content-Type': 'image/x-icon'
              , 'Content-Length': buf.length
              , 'ETag': '"' + utils.md5(buf) + '"'
              , 'Cache-Control': 'public, max-age=' + (maxAge / 1000)
            },
            body: buf
          };
          res.writeHead(200, icon.headers);
          res.end(icon.body);
        });
      }
    } else {
      next();
    }
  };
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/session',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - session
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var Session = require('./session/session')
  , debug = require('debug')('connect:session')
  , MemoryStore = require('./session/memory')
  , Cookie = require('./session/cookie')
  , Store = require('./session/store')
  , utils = require('./../utils')
  , parse = utils.parseUrl
  , crc16 = require('crc').crc16
  , crypto = require('crypto');
// environment
var env = process.env.NODE_ENV;
/**
 * Expose the middleware.
 */
exports = module.exports = session;
/**
 * Expose constructors.
 */
exports.Store = Store;
exports.Cookie = Cookie;
exports.Session = Session;
exports.MemoryStore = MemoryStore;
/**
 * Warning message for `MemoryStore` usage in production.
 */
var warning = 'Warning: connection.session() MemoryStore is not\n'
  + 'designed for a production environment, as it will leak\n'
  + 'memory, and will not scale past a single process.';
/**
 * Session:
 * 
 *   Setup session store with the given `options`.
 *
 *   Session data is _not_ saved in the cookie itself, however
 *   cookies are used, so we must use the [cookieParser()](cookieParser.html)
 *   middleware _before_ `session()`.
 *
 * Examples:
 *
 *     connect()
 *       .use(connect.cookieParser('keyboard cat'))
 *       .use(connect.session({ key: 'sid', cookie: { secure: true }}))
 *
 * Options:
 *
 *   - `key` cookie name defaulting to `connect.sid`
 *   - `store` session store instance
 *   - `cookie` session cookie settings, defaulting to `{ path: '/', httpOnly: true, maxAge: null }`
 *   - `proxy` trust the reverse proxy when setting secure cookies (via "x-forwarded-proto")
 *
 * Cookie option:
 *
 *  By default `cookie.maxAge` is `null`, meaning no "expires" parameter is set
 *  so the cookie becomes a browser-session cookie. When the user closes the 
 *  browser the cookie (and session) will be removed.
 *
 * ## req.session
 *
 *  To store or access session data, simply use the request property `req.session`,
 *  which is (generally) serialized as JSON by the store, so nested objects 
 *  are typically fine. For example below is a user-specific view counter:
 *
 *       connect()
 *         .use(connect.favicon())
 *         .use(connect.cookieParser('keyboard cat'))
 *         .use(connect.session({ cookie: { maxAge: 60000 }}))
 *         .use(function(req, res, next){
 *           var sess = req.session;
 *           if (sess.views) {
 *             res.setHeader('Content-Type', 'text/html');
 *             res.write('<p>views: ' + sess.views + '</p>');
 *             res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>');
 *             res.end();
 *             sess.views++;
 *           } else {
 *             sess.views = 1;
 *             res.end('welcome to the session demo. refresh!');
 *           }
 *         }
 *       )).listen(3000);
 *
 * ## Session#regenerate()
 *
 *  To regenerate the session simply invoke the method, once complete
 *  a new SID and `Session` instance will be initialized at `req.session`.
 *
 *      req.session.regenerate(function(err){
 *        // will have a new session here
 *      });
 *
 * ## Session#destroy()
 *
 *  Destroys the session, removing `req.session`, will be re-generated next request.
 *
 *      req.session.destroy(function(err){
 *        // cannot access session here
 *      });
 * 
 * ## Session#reload()
 *
 *  Reloads the session data.
 *
 *      req.session.reload(function(err){
 *        // session updated
 *      });
 *
 * ## Session#save()
 *
 *  Save the session.
 *
 *      req.session.save(function(err){
 *        // session saved
 *      });
 *
 * ## Session#touch()
 *
 *   Updates the `.maxAge` property. Typically this is
 *   not necessary to call, as the session middleware does this for you.
 *
 * ## Session#cookie
 *
 *  Each session has a unique cookie object accompany it. This allows
 *  you to alter the session cookie per visitor. For example we can
 *  set `req.session.cookie.expires` to `false` to enable the cookie
 *  to remain for only the duration of the user-agent.
 *
 * ## Session#maxAge
 *
 *  Alternatively `req.session.cookie.maxAge` will return the time
 *  remaining in milliseconds, which we may also re-assign a new value
 *  to adjust the `.expires` property appropriately. The following
 *  are essentially equivalent
 *
 *     var hour = 3600000;
 *     req.session.cookie.expires = new Date(Date.now() + hour);
 *     req.session.cookie.maxAge = hour;
 *
 * For example when `maxAge` is set to `60000` (one minute), and 30 seconds
 * has elapsed it will return `30000` until the current request has completed,
 * at which time `req.session.touch()` is called to reset `req.session.maxAge`
 * to its original value.
 *
 *     req.session.cookie.maxAge;
 *     // => 30000
 *
 * Session Store Implementation:
 *
 * Every session store _must_ implement the following methods
 *
 *    - `.get(sid, callback)`
 *    - `.set(sid, session, callback)`
 *    - `.destroy(sid, callback)`
 *
 * Recommended methods include, but are not limited to:
 *
 *    - `.length(callback)`
 *    - `.clear(callback)`
 *
 * For an example implementation view the [connect-redis](http://github.com/visionmedia/connect-redis) repo.
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
function session(options){
  var options = options || {}
    , key = options.key || 'connect.sid'
    , store = options.store || new MemoryStore
    , cookie = options.cookie
    , trustProxy = options.proxy;
  // notify user that this store is not
  // meant for a production environment
  if ('production' == env && store instanceof MemoryStore) {
    console.warn(warning);
  }
  // generates the new session
  store.generate = function(req){
    req.sessionID = utils.uid(24);
    req.session = new Session(req);
    req.session.cookie = new Cookie(req, cookie);
  };
  return function session(req, res, next) {
    // self-awareness
    if (req.session) return next();
    // ensure secret is available or bail
    if (!req.secret) throw new Error('connect.cookieParser("secret") required for security when using sessions');
    // parse url
    var url = parse(req)
      , path = url.pathname
      , originalHash;
    // expose store
    req.sessionStore = store;
    // set-cookie
    res.on('header', function(){
      if (!req.session) return;
      var cookie = req.session.cookie
        , proto = (req.headers['x-forwarded-proto'] || '').toLowerCase()
        , tls = req.connection.encrypted || (trustProxy && 'https' == proto)
        , secured = cookie.secure && tls
        , isNew = req.signedCookies[key] != req.sessionID;
      // only send secure cookies via https
      if (cookie.secure && !secured) return debug('not secured');
      // browser-session length cookie
      if (null == cookie.expires) {
        if (!isNew) return debug('already set browser-session cookie');
      // compare hashes
      } else if (originalHash == hash(req.session)) {
        return debug('unmodified session');
      }
      var val = cookie.serialize(key, req.sessionID);
      debug('set-cookie %s', val);
      res.setHeader('Set-Cookie', val);
    });
    // proxy end() to commit the session
    var end = res.end;
    res.end = function(data, encoding){
      res.end = end;
      if (!req.session) return res.end(data, encoding);
      debug('saving');
      req.session.resetMaxAge();
      req.session.save(function(){
        debug('saved');
        res.end(data, encoding);
      });
    };
    // generate the session
    function generate() {
      store.generate(req);
    }
    // get the sessionID from the cookie
    req.sessionID = req.signedCookies[key];
    // generate a session if the browser doesn't send a sessionID
    if (!req.sessionID) {
      debug('no SID sent, generating session');
      generate();
      next();
      return;
    }
    // generate the session object
    var pause = utils.pause(req);
    debug('fetching %s', req.sessionID);
    store.get(req.sessionID, function(err, sess){
      // proxy to resume() events
      var _next = next;
      next = function(err){
        _next(err);
        pause.resume();
      }
      // error handling
      if (err) {
        debug('error');
        if ('ENOENT' == err.code) {
          generate();
          next();
        } else {
          next(err);
        }
      // no session
      } else if (!sess) {
        debug('no session found');
        generate();
        next();
      // populate req.session
      } else {
        debug('session found');
        store.createSession(req, sess);
        originalHash = hash(sess);
        next();
      }
    });
  };
};
/**
 * Hash the given `sess` object omitting changes
 * to `.cookie`.
 *
 * @param {Object} sess
 * @return {String}
 * @api private
 */
function hash(sess) {
  return crc16(JSON.stringify(sess, function(key, val){
    if ('cookie' != key) return val;
  }));
}
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/json',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Connect - json
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var utils = require('../utils');
/**
 * JSON:
 *
 * Parse JSON request bodies, providing the
 * parsed object as `req.body`.
 *
 * Options:
 *
 *   - `strict`  when `false` anything `JSON.parse()` accepts will be parsed
 *   - `reviver`  used as the second "reviver" argument for JSON.parse
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
exports = module.exports = function(options){
  var options = options || {}
    , strict = options.strict === false
      ? false
      : true;
  return function json(req, res, next) {
    if (req._body) return next();
    req.body = req.body || {};
    // check Content-Type
    if ('application/json' != utils.mime(req)) return next();
    // flag as parsed
    req._body = true;
    // parse
    var buf = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ buf += chunk });
    req.on('end', function(){
      if (strict && '{' != buf[0] && '[' != buf[0]) return next(utils.error(400));
      try {
        req.body = JSON.parse(buf, options.reviver);
        next();
      } catch (err){
        err.status = 400;
        next(err);
      }
    });
  }
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/vhost',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - vhost
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Vhost:
 * 
 *   Setup vhost for the given `hostname` and `server`.
 *
 *     connect()
 *       .use(connect.vhost('foo.com', fooApp))
 *       .use(connect.vhost('bar.com', barApp))
 *       .use(connect.vhost('*.com', mainApp))
 *
 *  The `server` may be a Connect server or
 *  a regular Node `http.Server`. 
 *
 * @param {String} hostname
 * @param {Server} server
 * @return {Function}
 * @api public
 */
module.exports = function vhost(hostname, server){
  if (!hostname) throw new Error('vhost hostname required');
  if (!server) throw new Error('vhost server required');
  var regexp = new RegExp('^' + hostname.replace(/[*]/g, '(.*?)') + '$', 'i');
  if (server.onvhost) server.onvhost(hostname);
  return function vhost(req, res, next){
    if (!req.headers.host) return next();
    var host = req.headers.host.split(':')[0];
    if (!regexp.test(host)) return next();
    if ('function' == typeof server) return server(req, res, next);
    server.emit('request', req, res);
  };
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/cookieSession',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - cookieSession
 * Copyright(c) 2011 Sencha Inc.
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var utils = require('./../utils')
  , Cookie = require('./session/cookie')
  , debug = require('debug')('connect:cookieSession')
  , crc16 = require('crc').crc16;
// environment
var env = process.env.NODE_ENV;
/**
 * Cookie Session:
 *
 *   Cookie session middleware.
 *
 *      var app = connect();
 *      app.use(connect.cookieParser('tobo!'));
 *      app.use(connect.cookieSession({ cookie: { maxAge: 60 * 60 * 1000 }}));
 *
 * Options:
 *
 *   - `key` cookie name defaulting to `connect.sess`
 *   - `cookie` session cookie settings, defaulting to `{ path: '/', httpOnly: true, maxAge: null }`
 *   - `proxy` trust the reverse proxy when setting secure cookies (via "x-forwarded-proto")
 *
 * Clearing sessions:
 *
 *  To clear the session simply set its value to `null`,
 *  `cookieSession()` will then respond with a 1970 Set-Cookie.
 *
 *     req.session = null;
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
module.exports = function cookieSession(options){
  // TODO: utilize Session/Cookie to unify API
  var options = options || {}
    , key = options.key || 'connect.sess'
    , cookie = options.cookie
    , trustProxy = options.proxy;
  return function cookieSession(req, res, next) {
    req.session = req.signedCookies[key] || {};
    req.session.cookie = new Cookie(req, cookie);
    res.on('header', function(){
      // removed
      if (!req.session) {
        debug('clear session');
        res.setHeader('Set-Cookie', key + '=; expires=' + new Date(0).toUTCString());
        return;
      }
      var cookie = req.session.cookie;
      delete req.session.cookie;
      // check security
      var proto = (req.headers['x-forwarded-proto'] || '').toLowerCase()
        , tls = req.connection.encrypted || (trustProxy && 'https' == proto)
        , secured = cookie.secure && tls;
      // only send secure cookies via https
      if (cookie.secure && !secured) return debug('not secured');
      // serialize
      debug('serializing %j', req.session);
      var val = 'j:' + JSON.stringify(req.session);
      // compare hashes
      var originalHash = req.cookieHashes && req.cookieHashes[key];
      var hash = crc16(val);
      if (originalHash == hash) return debug('unmodified session');
      // set-cookie
      val = utils.sign(val, req.secret);
      val = utils.serializeCookie(key, val, cookie);
      debug('set-cookie %j', cookie);
      res.setHeader('Set-Cookie', val);
    });
    next();
  };
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/methodOverride',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - methodOverride
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Method Override:
 * 
 * Provides faux HTTP method support.
 * 
 * Pass an optional `key` to use when checking for
 * a method override, othewise defaults to _\_method_.
 * The original method is available via `req.originalMethod`.
 *
 * @param {String} key
 * @return {Function}
 * @api public
 */
module.exports = function methodOverride(key){
  key = key || "_method";
  return function methodOverride(req, res, next) {
    req.originalMethod = req.originalMethod || req.method;
    // req.body
    if (req.body && key in req.body) {
      req.method = req.body[key].toUpperCase();
      delete req.body[key];
    // check X-HTTP-Method-Override
    } else if (req.headers['x-http-method-override']) {
      req.method = req.headers['x-http-method-override'].toUpperCase();
    }
    
    next();
  };
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'lib/middleware/cookieParser',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - cookieParser
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var utils = require('./../utils');
/**
 * Cookie parser:
 *
 * Parse _Cookie_ header and populate `req.cookies`
 * with an object keyed by the cookie names. Optionally
 * you may enabled signed cookie support by passing
 * a `secret` string, which assigns `req.secret` so
 * it may be used by other middleware such as `session()`.
 *
 * Examples:
 *
 *     connect()
 *       .use(connect.cookieParser('keyboard cat'))
 *       .use(function(req, res, next){
 *         res.end(JSON.stringify(req.cookies));
 *       })
 *
 * @param {String} secret
 * @return {Function}
 * @api public
 */
module.exports = function cookieParser(secret){
  return function cookieParser(req, res, next) {
    var cookie = req.headers.cookie;
    if (req.cookies) return next();
    req.secret = secret;
    req.cookies = {};
    req.signedCookies = {};
    
    if (cookie) {
      try {
        req.cookies = utils.parseCookie(cookie);
        if (secret) {
          req.signedCookies = utils.parseSignedCookies(req.cookies, secret);
          var obj = utils.parseJSONCookies(req.signedCookies);
          req.signedCookies = obj.cookies;
          req.cookieHashes = obj.hashes;
        }
        req.cookies = utils.parseJSONCookies(req.cookies).cookies;
      } catch (err) {
        return next(err);
      }
    }
    next();
  };
};
    }
  };
});
horseDatastore.module(2, function(onejsModParent){
  return {
    'id':'index',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
module.exports = process.env.CONNECT_COV
  ? require('./lib-cov/connect')
  : require('./lib/connect');
    }
  };
});
horseDatastore.pkg(2, function(parent){
  return {
    'id':3,
    'name':'qs',
    'main':undefined,
    'mainModuleId':'index',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(3, function(onejsModParent){
  return {
    'id':'lib/querystring',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * querystring
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */
/**
 * Library version.
 */
exports.version = '0.4.2';
/**
 * Object#toString() ref for stringify().
 */
var toString = Object.prototype.toString;
/**
 * Cache non-integer test regexp.
 */
var isint = /^[0-9]+$/;
function promote(parent, key) {
  if (parent[key].length == 0) return parent[key] = {};
  var t = {};
  for (var i in parent[key]) t[i] = parent[key][i];
  parent[key] = t;
  return t;
}
function parse(parts, parent, key, val) {
  var part = parts.shift();
  // end
  if (!part) {
    if (Array.isArray(parent[key])) {
      parent[key].push(val);
    } else if ('object' == typeof parent[key]) {
      parent[key] = val;
    } else if ('undefined' == typeof parent[key]) {
      parent[key] = val;
    } else {
      parent[key] = [parent[key], val];
    }
    // array
  } else {
    var obj = parent[key] = parent[key] || [];
    if (']' == part) {
      if (Array.isArray(obj)) {
        if ('' != val) obj.push(val);
      } else if ('object' == typeof obj) {
        obj[Object.keys(obj).length] = val;
      } else {
        obj = parent[key] = [parent[key], val];
      }
      // prop
    } else if (~part.indexOf(']')) {
      part = part.substr(0, part.length - 1);
      if (!isint.test(part) && Array.isArray(obj)) obj = promote(parent, key);
      parse(parts, obj, part, val);
      // key
    } else {
      if (!isint.test(part) && Array.isArray(obj)) obj = promote(parent, key);
      parse(parts, obj, part, val);
    }
  }
}
/**
 * Merge parent key/val pair.
 */
function merge(parent, key, val){
  if (~key.indexOf(']')) {
    var parts = key.split('[')
      , len = parts.length
      , last = len - 1;
    parse(parts, parent, 'base', val);
    // optimize
  } else {
    if (!isint.test(key) && Array.isArray(parent.base)) {
      var t = {};
      for (var k in parent.base) t[k] = parent.base[k];
      parent.base = t;
    }
    set(parent.base, key, val);
  }
  return parent;
}
/**
 * Parse the given obj.
 */
function parseObject(obj){
  var ret = { base: {} };
  Object.keys(obj).forEach(function(name){
    merge(ret, name, obj[name]);
  });
  return ret.base;
}
/**
 * Parse the given str.
 */
function parseString(str){
  return String(str)
    .split('&')
    .reduce(function(ret, pair){
      try{
        pair = decodeURIComponent(pair.replace(/\+/g, ' '));
      } catch(e) {
        // ignore
      }
      var eql = pair.indexOf('=')
        , brace = lastBraceInKey(pair)
        , key = pair.substr(0, brace || eql)
        , val = pair.substr(brace || eql, pair.length)
        , val = val.substr(val.indexOf('=') + 1, val.length);
      // ?foo
      if ('' == key) key = pair, val = '';
      return merge(ret, key, val);
    }, { base: {} }).base;
}
/**
 * Parse the given query `str` or `obj`, returning an object.
 *
 * @param {String} str | {Object} obj
 * @return {Object}
 * @api public
 */
exports.parse = function(str){
  if (null == str || '' == str) return {};
  return 'object' == typeof str
    ? parseObject(str)
    : parseString(str);
};
/**
 * Turn the given `obj` into a query string
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */
var stringify = exports.stringify = function(obj, prefix) {
  if (Array.isArray(obj)) {
    return stringifyArray(obj, prefix);
  } else if ('[object Object]' == toString.call(obj)) {
    return stringifyObject(obj, prefix);
  } else if ('string' == typeof obj) {
    return stringifyString(obj, prefix);
  } else {
    return prefix + '=' + obj;
  }
};
/**
 * Stringify the given `str`.
 *
 * @param {String} str
 * @param {String} prefix
 * @return {String}
 * @api private
 */
function stringifyString(str, prefix) {
  if (!prefix) throw new TypeError('stringify expects an object');
  return prefix + '=' + encodeURIComponent(str);
}
/**
 * Stringify the given `arr`.
 *
 * @param {Array} arr
 * @param {String} prefix
 * @return {String}
 * @api private
 */
function stringifyArray(arr, prefix) {
  var ret = [];
  if (!prefix) throw new TypeError('stringify expects an object');
  for (var i = 0; i < arr.length; i++) {
    ret.push(stringify(arr[i], prefix + '[]'));
  }
  return ret.join('&');
}
/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @param {String} prefix
 * @return {String}
 * @api private
 */
function stringifyObject(obj, prefix) {
  var ret = []
    , keys = Object.keys(obj)
    , key;
  for (var i = 0, len = keys.length; i < len; ++i) {
    key = keys[i];
    ret.push(stringify(obj[key], prefix
      ? prefix + '[' + encodeURIComponent(key) + ']'
      : encodeURIComponent(key)));
  }
  return ret.join('&');
}
/**
 * Set `obj`'s `key` to `val` respecting
 * the weird and wonderful syntax of a qs,
 * where "foo=bar&foo=baz" becomes an array.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {String} val
 * @api private
 */
function set(obj, key, val) {
  var v = obj[key];
  if (undefined === v) {
    obj[key] = val;
  } else if (Array.isArray(v)) {
    v.push(val);
  } else {
    obj[key] = [v, val];
  }
}
/**
 * Locate last brace in `str` within the key.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */
function lastBraceInKey(str) {
  var len = str.length
    , brace
    , c;
  for (var i = 0; i < len; ++i) {
    c = str[i];
    if (']' == c) brace = false;
    if ('[' == c) brace = true;
    if ('=' == c && !brace) return i;
  }
}
    }
  };
});
horseDatastore.module(3, function(onejsModParent){
  return {
    'id':'index',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
module.exports = require('./lib/querystring');
    }
  };
});
horseDatastore.pkg(2, function(parent){
  return {
    'id':4,
    'name':'mime',
    'main':undefined,
    'mainModuleId':'mime',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(4, function(onejsModParent){
  return {
    'id':'mime',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var path = require('path'),
    fs = require('fs');
var mime = module.exports = {
  /** Map of extension to mime type */
  types: {},
  /** Map of mime type to extension */
  extensions :{},
  /**
   * Define mimetype -> extension mappings.  Each key is a mime-type that maps
   * to an array of extensions associated with the type.  The first extension is
   * used as the default extension for the type.
   *
   * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
   *
   * @param map (Object) type definitions
   */
  define: function(map) {
    for (var type in map) {
      var exts = map[type];
      for (var i = 0; i < exts.length; i++) {
        mime.types[exts[i]] = type;
      }
      // Default extension is the first one we encounter
      if (!mime.extensions[type]) {
        mime.extensions[type] = exts[0];
      }
    }
  },
  /**
   * Load an Apache2-style ".types" file
   *
   * This may be called multiple times (it's expected).  Where files declare
   * overlapping types/extensions, the last file wins.
   *
   * @param file (String) path of file to load.
   */
  load: function(file) {
    // Read file and split into lines
    var map = {},
        content = fs.readFileSync(file, 'ascii'),
        lines = content.split(/[\r\n]+/);
    lines.forEach(function(line, lineno) {
      // Clean up whitespace/comments, and split into fields
      var fields = line.replace(/\s*#.*|^\s*|\s*$/g, '').split(/\s+/);
      map[fields.shift()] = fields;
    });
    mime.define(map);
  },
  /**
   * Lookup a mime type based on extension
   */
  lookup: function(path, fallback) {
    var ext = path.replace(/.*[\.\/]/, '').toLowerCase();
    return mime.types[ext] || fallback || mime.default_type;
  },
  /**
   * Return file extension associated with a mime type
   */
  extension: function(mimeType) {
    return mime.extensions[mimeType];
  },
  /**
   * Lookup a charset based on mime type.
   */
  charsets: {
    lookup: function (mimeType, fallback) {
      // Assume text types are utf8.  Modify mime logic as needed.
      return (/^text\//).test(mimeType) ? 'UTF-8' : fallback;
    }
  }
};
// Load our local copy of
// http://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types
mime.load(path.join(__dirname, 'types/mime.types'));
// Overlay enhancements submitted by the node.js community
mime.load(path.join(__dirname, 'types/node.types'));
// Set the default type
mime.default_type = mime.types.bin;
    }
  };
});
horseDatastore.pkg(2, function(parent){
  return {
    'id':5,
    'name':'formidable',
    'main':undefined,
    'mainModuleId':'index',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(5, function(onejsModParent){
  return {
    'id':'index',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var IncomingForm = require('./incoming_form').IncomingForm;
IncomingForm.IncomingForm = IncomingForm;
module.exports = IncomingForm;
    }
  };
});
horseDatastore.module(5, function(onejsModParent){
  return {
    'id':'file',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      if (global.GENTLY) require = GENTLY.hijack(require);
var util = require('./util'),
    WriteStream = require('fs').WriteStream,
    EventEmitter = require('events').EventEmitter;
function File(properties) {
  EventEmitter.call(this);
  this.size = 0;
  this.path = null;
  this.name = null;
  this.type = null;
  this.lastModifiedDate = null;
  this._writeStream = null;
  for (var key in properties) {
    this[key] = properties[key];
  }
  this._backwardsCompatibility();
}
module.exports = File;
util.inherits(File, EventEmitter);
// @todo Next release: Show error messages when accessing these
File.prototype._backwardsCompatibility = function() {
  var self = this;
  this.__defineGetter__('length', function() {
    return self.size;
  });
  this.__defineGetter__('filename', function() {
    return self.name;
  });
  this.__defineGetter__('mime', function() {
    return self.type;
  });
};
File.prototype.open = function() {
  this._writeStream = new WriteStream(this.path);
};
File.prototype.write = function(buffer, cb) {
  var self = this;
  this._writeStream.write(buffer, function() {
    self.lastModifiedDate = new Date();
    self.size += buffer.length;
    self.emit('progress', self.size);
    cb();
  });
};
File.prototype.end = function(cb) {
  var self = this;
  this._writeStream.end(function() {
    self.emit('end');
    cb();
  });
};
    }
  };
});
horseDatastore.module(5, function(onejsModParent){
  return {
    'id':'multipart_parser',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var Buffer = require('buffer').Buffer,
    s = 0,
    S =
    { PARSER_UNINITIALIZED: s++,
      START: s++,
      START_BOUNDARY: s++,
      HEADER_FIELD_START: s++,
      HEADER_FIELD: s++,
      HEADER_VALUE_START: s++,
      HEADER_VALUE: s++,
      HEADER_VALUE_ALMOST_DONE: s++,
      HEADERS_ALMOST_DONE: s++,
      PART_DATA_START: s++,
      PART_DATA: s++,
      PART_END: s++,
      END: s++,
    },
    f = 1,
    F =
    { PART_BOUNDARY: f,
      LAST_BOUNDARY: f *= 2,
    },
    LF = 10,
    CR = 13,
    SPACE = 32,
    HYPHEN = 45,
    COLON = 58,
    A = 97,
    Z = 122,
    lower = function(c) {
      return c | 0x20;
    };
for (var s in S) {
  exports[s] = S[s];
}
function MultipartParser() {
  this.boundary = null;
  this.boundaryChars = null;
  this.lookbehind = null;
  this.state = S.PARSER_UNINITIALIZED;
  this.index = null;
  this.flags = 0;
};
exports.MultipartParser = MultipartParser;
MultipartParser.stateToString = function(stateNumber) {
  for (var state in S) {
    var number = S[state];
    if (number === stateNumber) return state;
  }
};
MultipartParser.prototype.initWithBoundary = function(str) {
  this.boundary = new Buffer(str.length+4);
  this.boundary.write('\r\n--', 'ascii', 0);
  this.boundary.write(str, 'ascii', 4);
  this.lookbehind = new Buffer(this.boundary.length+8);
  this.state = S.START;
  this.boundaryChars = {};
  for (var i = 0; i < this.boundary.length; i++) {
    this.boundaryChars[this.boundary[i]] = true;
  }
};
MultipartParser.prototype.write = function(buffer) {
  var self = this,
      i = 0,
      len = buffer.length,
      prevIndex = this.index,
      index = this.index,
      state = this.state,
      flags = this.flags,
      lookbehind = this.lookbehind,
      boundary = this.boundary,
      boundaryChars = this.boundaryChars,
      boundaryLength = this.boundary.length,
      boundaryEnd = boundaryLength - 1,
      bufferLength = buffer.length,
      c,
      cl,
      mark = function(name) {
        self[name+'Mark'] = i;
      },
      clear = function(name) {
        delete self[name+'Mark'];
      },
      callback = function(name, buffer, start, end) {
        if (start !== undefined && start === end) {
          return;
        }
        var callbackSymbol = 'on'+name.substr(0, 1).toUpperCase()+name.substr(1);
        if (callbackSymbol in self) {
          self[callbackSymbol](buffer, start, end);
        }
      },
      dataCallback = function(name, clear) {
        var markSymbol = name+'Mark';
        if (!(markSymbol in self)) {
          return;
        }
        if (!clear) {
          callback(name, buffer, self[markSymbol], buffer.length);
          self[markSymbol] = 0;
        } else {
          callback(name, buffer, self[markSymbol], i);
          delete self[markSymbol];
        }
      };
  for (i = 0; i < len; i++) {
    c = buffer[i];
    switch (state) {
      case S.PARSER_UNINITIALIZED:
        return i;
      case S.START:
        index = 0;
        state = S.START_BOUNDARY;
      case S.START_BOUNDARY:
        if (index == boundary.length - 2) {
          if (c != CR) {
            return i;
          }
          index++;
          break;
        } else if (index - 1 == boundary.length - 2) {
          if (c != LF) {
            return i;
          }
          index = 0;
          callback('partBegin');
          state = S.HEADER_FIELD_START;
          break;
        }
        if (c != boundary[index+2]) {
          return i;
        }
        index++;
        break;
      case S.HEADER_FIELD_START:
        state = S.HEADER_FIELD;
        mark('headerField');
        index = 0;
      case S.HEADER_FIELD:
        if (c == CR) {
          clear('headerField');
          state = S.HEADERS_ALMOST_DONE;
          break;
        }
        index++;
        if (c == HYPHEN) {
          break;
        }
        if (c == COLON) {
          if (index == 1) {
            // empty header field
            return i;
          }
          dataCallback('headerField', true);
          state = S.HEADER_VALUE_START;
          break;
        }
        cl = lower(c);
        if (cl < A || cl > Z) {
          return i;
        }
        break;
      case S.HEADER_VALUE_START:
        if (c == SPACE) {
          break;
        }
        mark('headerValue');
        state = S.HEADER_VALUE;
      case S.HEADER_VALUE:
        if (c == CR) {
          dataCallback('headerValue', true);
          callback('headerEnd');
          state = S.HEADER_VALUE_ALMOST_DONE;
        }
        break;
      case S.HEADER_VALUE_ALMOST_DONE:
        if (c != LF) {
          return i;
        }
        state = S.HEADER_FIELD_START;
        break;
      case S.HEADERS_ALMOST_DONE:
        if (c != LF) {
          return i;
        }
        callback('headersEnd');
        state = S.PART_DATA_START;
        break;
      case S.PART_DATA_START:
        state = S.PART_DATA
        mark('partData');
      case S.PART_DATA:
        prevIndex = index;
        if (index == 0) {
          // boyer-moore derrived algorithm to safely skip non-boundary data
          i += boundaryEnd;
          while (i < bufferLength && !(buffer[i] in boundaryChars)) {
            i += boundaryLength;
          }
          i -= boundaryEnd;
          c = buffer[i];
        }
        if (index < boundary.length) {
          if (boundary[index] == c) {
            if (index == 0) {
              dataCallback('partData', true);
            }
            index++;
          } else {
            index = 0;
          }
        } else if (index == boundary.length) {
          index++;
          if (c == CR) {
            // CR = part boundary
            flags |= F.PART_BOUNDARY;
          } else if (c == HYPHEN) {
            // HYPHEN = end boundary
            flags |= F.LAST_BOUNDARY;
          } else {
            index = 0;
          }
        } else if (index - 1 == boundary.length)  {
          if (flags & F.PART_BOUNDARY) {
            index = 0;
            if (c == LF) {
              // unset the PART_BOUNDARY flag
              flags &= ~F.PART_BOUNDARY;
              callback('partEnd');
              callback('partBegin');
              state = S.HEADER_FIELD_START;
              break;
            }
          } else if (flags & F.LAST_BOUNDARY) {
            if (c == HYPHEN) {
              callback('partEnd');
              callback('end');
              state = S.END;
            } else {
              index = 0;
            }
          } else {
            index = 0;
          }
        }
        if (index > 0) {
          // when matching a possible boundary, keep a lookbehind reference
          // in case it turns out to be a false lead
          lookbehind[index-1] = c;
        } else if (prevIndex > 0) {
          // if our boundary turned out to be rubbish, the captured lookbehind
          // belongs to partData
          callback('partData', lookbehind, 0, prevIndex);
          prevIndex = 0;
          mark('partData');
          // reconsider the current character even so it interrupted the sequence
          // it could be the beginning of a new sequence
          i--;
        }
        break;
      case S.END:
        break;
      default:
        return i;
    }
  }
  dataCallback('headerField');
  dataCallback('headerValue');
  dataCallback('partData');
  this.index = index;
  this.state = state;
  this.flags = flags;
  return len;
};
MultipartParser.prototype.end = function() {
  if (this.state != S.END) {
    return new Error('MultipartParser.end(): stream ended unexpectedly: ' + this.explain());
  }
};
MultipartParser.prototype.explain = function() {
  return 'state = ' + MultipartParser.stateToString(this.state);
};
    }
  };
});
horseDatastore.module(5, function(onejsModParent){
  return {
    'id':'querystring_parser',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      if (global.GENTLY) require = GENTLY.hijack(require);
// This is a buffering parser, not quite as nice as the multipart one.
// If I find time I'll rewrite this to be fully streaming as well
var querystring = require('querystring');
function QuerystringParser() {
  this.buffer = '';
};
exports.QuerystringParser = QuerystringParser;
QuerystringParser.prototype.write = function(buffer) {
  this.buffer += buffer.toString('ascii');
  return buffer.length;
};
QuerystringParser.prototype.end = function() {
  var fields = querystring.parse(this.buffer);
  for (var field in fields) {
    this.onField(field, fields[field]);
  }
  this.buffer = '';
  this.onEnd();
};
    }
  };
});
horseDatastore.module(5, function(onejsModParent){
  return {
    'id':'util',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // Backwards compatibility ...
try {
  module.exports = require('util');
} catch (e) {
  module.exports = require('sys');
}
    }
  };
});
horseDatastore.module(5, function(onejsModParent){
  return {
    'id':'incoming_form',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      if (global.GENTLY) require = GENTLY.hijack(require);
var fs = require('fs');
var util = require('./util'),
    path = require('path'),
    File = require('./file'),
    MultipartParser = require('./multipart_parser').MultipartParser,
    QuerystringParser = require('./querystring_parser').QuerystringParser,
    StringDecoder = require('string_decoder').StringDecoder,
    EventEmitter = require('events').EventEmitter;
function IncomingForm() {
  if (!(this instanceof IncomingForm)) return new IncomingForm;
  EventEmitter.call(this);
  this.error = null;
  this.ended = false;
  this.maxFieldsSize = 2 * 1024 * 1024;
  this.keepExtensions = false;
  this.uploadDir = IncomingForm.UPLOAD_DIR;
  this.encoding = 'utf-8';
  this.headers = null;
  this.type = null;
  this.bytesReceived = null;
  this.bytesExpected = null;
  this._parser = null;
  this._flushing = 0;
  this._fieldsSize = 0;
};
util.inherits(IncomingForm, EventEmitter);
exports.IncomingForm = IncomingForm;
IncomingForm.UPLOAD_DIR = (function() {
  var dirs = [process.env.TMP, '/tmp', process.cwd()];
  for (var i = 0; i < dirs.length; i++) {
    var dir = dirs[i];
    var isDirectory = false;
    try {
      isDirectory = fs.statSync(dir).isDirectory();
    } catch (e) {}
    if (isDirectory) return dir;
  }
})();
IncomingForm.prototype.parse = function(req, cb) {
  this.pause = function() {
    try {
      req.pause();
    } catch (err) {
      // the stream was destroyed
      if (!this.ended) {
        // before it was completed, crash & burn
        this._error(err);
      }
      return false;
    }
    return true;
  };
  this.resume = function() {
    try {
      req.resume();
    } catch (err) {
      // the stream was destroyed
      if (!this.ended) {
        // before it was completed, crash & burn
        this._error(err);
      }
      return false;
    }
    return true;
  };
  this.writeHeaders(req.headers);
  var self = this;
  req
    .on('error', function(err) {
      self._error(err);
    })
    .on('aborted', function() {
      self.emit('aborted');
    })
    .on('data', function(buffer) {
      self.write(buffer);
    })
    .on('end', function() {
      if (self.error) {
        return;
      }
      var err = self._parser.end();
      if (err) {
        self._error(err);
      }
    });
  if (cb) {
    var fields = {}, files = {};
    this
      .on('field', function(name, value) {
        fields[name] = value;
      })
      .on('file', function(name, file) {
        files[name] = file;
      })
      .on('error', function(err) {
        cb(err, fields, files);
      })
      .on('end', function() {
        cb(null, fields, files);
      });
  }
  return this;
};
IncomingForm.prototype.writeHeaders = function(headers) {
  this.headers = headers;
  this._parseContentLength();
  this._parseContentType();
};
IncomingForm.prototype.write = function(buffer) {
  if (!this._parser) {
    this._error(new Error('unintialized parser'));
    return;
  }
  this.bytesReceived += buffer.length;
  this.emit('progress', this.bytesReceived, this.bytesExpected);
  var bytesParsed = this._parser.write(buffer);
  if (bytesParsed !== buffer.length) {
    this._error(new Error('parser error, '+bytesParsed+' of '+buffer.length+' bytes parsed'));
  }
  return bytesParsed;
};
IncomingForm.prototype.pause = function() {
  // this does nothing, unless overwritten in IncomingForm.parse
  return false;
};
IncomingForm.prototype.resume = function() {
  // this does nothing, unless overwritten in IncomingForm.parse
  return false;
};
IncomingForm.prototype.onPart = function(part) {
  // this method can be overwritten by the user
  this.handlePart(part);
};
IncomingForm.prototype.handlePart = function(part) {
  var self = this;
  if (part.filename === undefined) {
    var value = ''
      , decoder = new StringDecoder(this.encoding);
    part.on('data', function(buffer) {
      self._fieldsSize += buffer.length;
      if (self._fieldsSize > self.maxFieldsSize) {
        self._error(new Error('maxFieldsSize exceeded, received '+self._fieldsSize+' bytes of field data'));
        return;
      }
      value += decoder.write(buffer);
    });
    part.on('end', function() {
      self.emit('field', part.name, value);
    });
    return;
  }
  this._flushing++;
  var file = new File({
    path: this._uploadPath(part.filename),
    name: part.filename,
    type: part.mime,
  });
  this.emit('fileBegin', part.name, file);
  file.open();
  part.on('data', function(buffer) {
    self.pause();
    file.write(buffer, function() {
      self.resume();
    });
  });
  part.on('end', function() {
    file.end(function() {
      self._flushing--;
      self.emit('file', part.name, file);
      self._maybeEnd();
    });
  });
};
IncomingForm.prototype._parseContentType = function() {
  if (!this.headers['content-type']) {
    this._error(new Error('bad content-type header, no content-type'));
    return;
  }
  if (this.headers['content-type'].match(/urlencoded/i)) {
    this._initUrlencoded();
    return;
  }
  if (this.headers['content-type'].match(/multipart/i)) {
    var m;
    if (m = this.headers['content-type'].match(/boundary=(?:"([^"]+)"|([^;]+))/i)) {
      this._initMultipart(m[1] || m[2]);
    } else {
      this._error(new Error('bad content-type header, no multipart boundary'));
    }
    return;
  }
  this._error(new Error('bad content-type header, unknown content-type: '+this.headers['content-type']));
};
IncomingForm.prototype._error = function(err) {
  if (this.error) {
    return;
  }
  this.error = err;
  this.pause();
  this.emit('error', err);
};
IncomingForm.prototype._parseContentLength = function() {
  if (this.headers['content-length']) {
    this.bytesReceived = 0;
    this.bytesExpected = parseInt(this.headers['content-length'], 10);
    this.emit('progress', this.bytesReceived, this.bytesExpected);
  }
};
IncomingForm.prototype._newParser = function() {
  return new MultipartParser();
};
IncomingForm.prototype._initMultipart = function(boundary) {
  this.type = 'multipart';
  var parser = new MultipartParser(),
      self = this,
      headerField,
      headerValue,
      part;
  parser.initWithBoundary(boundary);
  parser.onPartBegin = function() {
    part = new EventEmitter();
    part.headers = {};
    part.name = null;
    part.filename = null;
    part.mime = null;
    headerField = '';
    headerValue = '';
  };
  parser.onHeaderField = function(b, start, end) {
    headerField += b.toString(self.encoding, start, end);
  };
  parser.onHeaderValue = function(b, start, end) {
    headerValue += b.toString(self.encoding, start, end);
  };
  parser.onHeaderEnd = function() {
    headerField = headerField.toLowerCase();
    part.headers[headerField] = headerValue;
    var m;
    if (headerField == 'content-disposition') {
      if (m = headerValue.match(/name="([^"]+)"/i)) {
        part.name = m[1];
      }
      part.filename = self._fileName(headerValue);
    } else if (headerField == 'content-type') {
      part.mime = headerValue;
    }
    headerField = '';
    headerValue = '';
  };
  parser.onHeadersEnd = function() {
    self.onPart(part);
  };
  parser.onPartData = function(b, start, end) {
    part.emit('data', b.slice(start, end));
  };
  parser.onPartEnd = function() {
    part.emit('end');
  };
  parser.onEnd = function() {
    self.ended = true;
    self._maybeEnd();
  };
  this._parser = parser;
};
IncomingForm.prototype._fileName = function(headerValue) {
  var m = headerValue.match(/filename="(.*?)"($|; )/i)
  if (!m) return;
  var filename = m[1].substr(m[1].lastIndexOf('\\') + 1);
  filename = filename.replace(/%22/g, '"');
  filename = filename.replace(/&#([\d]{4});/g, function(m, code) {
    return String.fromCharCode(code);
  });
  return filename;
};
IncomingForm.prototype._initUrlencoded = function() {
  this.type = 'urlencoded';
  var parser = new QuerystringParser()
    , self = this;
  parser.onField = function(key, val) {
    self.emit('field', key, val);
  };
  parser.onEnd = function() {
    self.ended = true;
    self._maybeEnd();
  };
  this._parser = parser;
};
IncomingForm.prototype._uploadPath = function(filename) {
  var name = '';
  for (var i = 0; i < 32; i++) {
    name += Math.floor(Math.random() * 16).toString(16);
  }
  if (this.keepExtensions) {
    var ext = path.extname(filename);
    ext     = ext.replace(/(\.[a-z0-9]+).*/, '$1')
    name += ext;
  }
  return path.join(this.uploadDir, name);
};
IncomingForm.prototype._maybeEnd = function() {
  if (!this.ended || this._flushing) {
    return;
  }
  this.emit('end');
};
    }
  };
});
horseDatastore.pkg(2, function(parent){
  return {
    'id':6,
    'name':'crc',
    'main':undefined,
    'mainModuleId':'lib/crc',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(6, function(onejsModParent){
  return {
    'id':'lib/crc',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      (function()
{
	// CRC-8 in table form
	// 
	// Copyright (c) 1989 AnDan Software. You may use this program, or
	// code or tables extracted from it, as long as this notice is not
	// removed or changed.
	var CRC8_TAB = new Array(
		// C/C++ language:
		// 
		// unsigned char CRC8_TAB[] = {...};
		0x00,0x1B,0x36,0x2D,0x6C,0x77,0x5A,0x41,0xD8,0xC3,0xEE,0xF5,0xB4,0xAF,0x82,0x99,0xD3,0xC8,0xE5,
		0xFE,0xBF,0xA4,0x89,0x92,0x0B,0x10,0x3D,0x26,0x67,0x7C,0x51,0x4A,0xC5,0xDE,0xF3,0xE8,0xA9,0xB2,
		0x9F,0x84,0x1D,0x06,0x2B,0x30,0x71,0x6A,0x47,0x5C,0x16,0x0D,0x20,0x3B,0x7A,0x61,0x4C,0x57,0xCE,
		0xD5,0xF8,0xE3,0xA2,0xB9,0x94,0x8F,0xE9,0xF2,0xDF,0xC4,0x85,0x9E,0xB3,0xA8,0x31,0x2A,0x07,0x1C,
		0x5D,0x46,0x6B,0x70,0x3A,0x21,0x0C,0x17,0x56,0x4D,0x60,0x7B,0xE2,0xF9,0xD4,0xCF,0x8E,0x95,0xB8,
		0xA3,0x2C,0x37,0x1A,0x01,0x40,0x5B,0x76,0x6D,0xF4,0xEF,0xC2,0xD9,0x98,0x83,0xAE,0xB5,0xFF,0xE4,
		0xC9,0xD2,0x93,0x88,0xA5,0xBE,0x27,0x3C,0x11,0x0A,0x4B,0x50,0x7D,0x66,0xB1,0xAA,0x87,0x9C,0xDD,
		0xC6,0xEB,0xF0,0x69,0x72,0x5F,0x44,0x05,0x1E,0x33,0x28,0x62,0x79,0x54,0x4F,0x0E,0x15,0x38,0x23,
		0xBA,0xA1,0x8C,0x97,0xD6,0xCD,0xE0,0xFB,0x74,0x6F,0x42,0x59,0x18,0x03,0x2E,0x35,0xAC,0xB7,0x9A,
		0x81,0xC0,0xDB,0xF6,0xED,0xA7,0xBC,0x91,0x8A,0xCB,0xD0,0xFD,0xE6,0x7F,0x64,0x49,0x52,0x13,0x08,
		0x25,0x3E,0x58,0x43,0x6E,0x75,0x34,0x2F,0x02,0x19,0x80,0x9B,0xB6,0xAD,0xEC,0xF7,0xDA,0xC1,0x8B,
		0x90,0xBD,0xA6,0xE7,0xFC,0xD1,0xCA,0x53,0x48,0x65,0x7E,0x3F,0x24,0x09,0x12,0x9D,0x86,0xAB,0xB0,
		0xF1,0xEA,0xC7,0xDC,0x45,0x5E,0x73,0x68,0x29,0x32,0x1F,0x04,0x4E,0x55,0x78,0x63,0x22,0x39,0x14,
		0x0F,0x96,0x8D,0xA0,0xBB,0xFA,0xE1,0xCC,0xD7
	);
	function crc8Add(crc,c)
	// 'crc' should be initialized to 0x00.
	{
		return CRC8_TAB[(crc^c)&0xFF];
	};
	// C/C++ language:
	// 
	// inline unsigned char crc8Add(unsigned char crc, unsigned char c)
	// {
	// 	return CRC8_TAB[crc^c];
	// }
	// CRC-16 (as it is in SEA's ARC) in table form
	// 
	// The logic for this method of calculating the CRC 16 bit polynomial
	// is taken from an article by David Schwaderer in the April 1985
	// issue of PC Tech Journal.
	var CRC_ARC_TAB = new Array(
		// C/C++ language:
		// 
		// unsigned short CRC_ARC_TAB[] = {...};
		0x0000,0xC0C1,0xC181,0x0140,0xC301,0x03C0,0x0280,0xC241,0xC601,0x06C0,0x0780,0xC741,0x0500,
		0xC5C1,0xC481,0x0440,0xCC01,0x0CC0,0x0D80,0xCD41,0x0F00,0xCFC1,0xCE81,0x0E40,0x0A00,0xCAC1,
		0xCB81,0x0B40,0xC901,0x09C0,0x0880,0xC841,0xD801,0x18C0,0x1980,0xD941,0x1B00,0xDBC1,0xDA81,
		0x1A40,0x1E00,0xDEC1,0xDF81,0x1F40,0xDD01,0x1DC0,0x1C80,0xDC41,0x1400,0xD4C1,0xD581,0x1540,
		0xD701,0x17C0,0x1680,0xD641,0xD201,0x12C0,0x1380,0xD341,0x1100,0xD1C1,0xD081,0x1040,0xF001,
		0x30C0,0x3180,0xF141,0x3300,0xF3C1,0xF281,0x3240,0x3600,0xF6C1,0xF781,0x3740,0xF501,0x35C0,
		0x3480,0xF441,0x3C00,0xFCC1,0xFD81,0x3D40,0xFF01,0x3FC0,0x3E80,0xFE41,0xFA01,0x3AC0,0x3B80,
		0xFB41,0x3900,0xF9C1,0xF881,0x3840,0x2800,0xE8C1,0xE981,0x2940,0xEB01,0x2BC0,0x2A80,0xEA41,
		0xEE01,0x2EC0,0x2F80,0xEF41,0x2D00,0xEDC1,0xEC81,0x2C40,0xE401,0x24C0,0x2580,0xE541,0x2700,
		0xE7C1,0xE681,0x2640,0x2200,0xE2C1,0xE381,0x2340,0xE101,0x21C0,0x2080,0xE041,0xA001,0x60C0,
		0x6180,0xA141,0x6300,0xA3C1,0xA281,0x6240,0x6600,0xA6C1,0xA781,0x6740,0xA501,0x65C0,0x6480,
		0xA441,0x6C00,0xACC1,0xAD81,0x6D40,0xAF01,0x6FC0,0x6E80,0xAE41,0xAA01,0x6AC0,0x6B80,0xAB41,
		0x6900,0xA9C1,0xA881,0x6840,0x7800,0xB8C1,0xB981,0x7940,0xBB01,0x7BC0,0x7A80,0xBA41,0xBE01,
		0x7EC0,0x7F80,0xBF41,0x7D00,0xBDC1,0xBC81,0x7C40,0xB401,0x74C0,0x7580,0xB541,0x7700,0xB7C1,
		0xB681,0x7640,0x7200,0xB2C1,0xB381,0x7340,0xB101,0x71C0,0x7080,0xB041,0x5000,0x90C1,0x9181,
		0x5140,0x9301,0x53C0,0x5280,0x9241,0x9601,0x56C0,0x5780,0x9741,0x5500,0x95C1,0x9481,0x5440,
		0x9C01,0x5CC0,0x5D80,0x9D41,0x5F00,0x9FC1,0x9E81,0x5E40,0x5A00,0x9AC1,0x9B81,0x5B40,0x9901,
		0x59C0,0x5880,0x9841,0x8801,0x48C0,0x4980,0x8941,0x4B00,0x8BC1,0x8A81,0x4A40,0x4E00,0x8EC1,
		0x8F81,0x4F40,0x8D01,0x4DC0,0x4C80,0x8C41,0x4400,0x84C1,0x8581,0x4540,0x8701,0x47C0,0x4680,
		0x8641,0x8201,0x42C0,0x4380,0x8341,0x4100,0x81C1,0x8081,0x4040
	);
	function crcArcAdd(crc,c)
	// 'crc' should be initialized to 0x0000.
	{
		return CRC_ARC_TAB[(crc^c)&0xFF]^((crc>>8)&0xFF);
	};
	// C/C++ language:
	// 
	// inline unsigned short crcArcAdd(unsigned short crc, unsigned char c)
	// {
	// 	return CRC_ARC_TAB[(unsigned char)crc^c]^(unsigned short)(crc>>8);
	// }
	// CRC-16 (as it is in ZMODEM) in table form
	// 
	// Copyright (c) 1989 AnDan Software. You may use this program, or
	// code or tables extracted from it, as long as this notice is not
	// removed or changed.
	var CRC16_TAB = new Array(
		// C/C++ language:
		// 
		// unsigned short CRC16_TAB[] = {...};
		0x0000,0x1021,0x2042,0x3063,0x4084,0x50A5,0x60C6,0x70E7,0x8108,0x9129,0xA14A,0xB16B,0xC18C,
		0xD1AD,0xE1CE,0xF1EF,0x1231,0x0210,0x3273,0x2252,0x52B5,0x4294,0x72F7,0x62D6,0x9339,0x8318,
		0xB37B,0xA35A,0xD3BD,0xC39C,0xF3FF,0xE3DE,0x2462,0x3443,0x0420,0x1401,0x64E6,0x74C7,0x44A4,
		0x5485,0xA56A,0xB54B,0x8528,0x9509,0xE5EE,0xF5CF,0xC5AC,0xD58D,0x3653,0x2672,0x1611,0x0630,
		0x76D7,0x66F6,0x5695,0x46B4,0xB75B,0xA77A,0x9719,0x8738,0xF7DF,0xE7FE,0xD79D,0xC7BC,0x48C4,
		0x58E5,0x6886,0x78A7,0x0840,0x1861,0x2802,0x3823,0xC9CC,0xD9ED,0xE98E,0xF9AF,0x8948,0x9969,
		0xA90A,0xB92B,0x5AF5,0x4AD4,0x7AB7,0x6A96,0x1A71,0x0A50,0x3A33,0x2A12,0xDBFD,0xCBDC,0xFBBF,
		0xEB9E,0x9B79,0x8B58,0xBB3B,0xAB1A,0x6CA6,0x7C87,0x4CE4,0x5CC5,0x2C22,0x3C03,0x0C60,0x1C41,
		0xEDAE,0xFD8F,0xCDEC,0xDDCD,0xAD2A,0xBD0B,0x8D68,0x9D49,0x7E97,0x6EB6,0x5ED5,0x4EF4,0x3E13,
		0x2E32,0x1E51,0x0E70,0xFF9F,0xEFBE,0xDFDD,0xCFFC,0xBF1B,0xAF3A,0x9F59,0x8F78,0x9188,0x81A9,
		0xB1CA,0xA1EB,0xD10C,0xC12D,0xF14E,0xE16F,0x1080,0x00A1,0x30C2,0x20E3,0x5004,0x4025,0x7046,
		0x6067,0x83B9,0x9398,0xA3FB,0xB3DA,0xC33D,0xD31C,0xE37F,0xF35E,0x02B1,0x1290,0x22F3,0x32D2,
		0x4235,0x5214,0x6277,0x7256,0xB5EA,0xA5CB,0x95A8,0x8589,0xF56E,0xE54F,0xD52C,0xC50D,0x34E2,
		0x24C3,0x14A0,0x0481,0x7466,0x6447,0x5424,0x4405,0xA7DB,0xB7FA,0x8799,0x97B8,0xE75F,0xF77E,
		0xC71D,0xD73C,0x26D3,0x36F2,0x0691,0x16B0,0x6657,0x7676,0x4615,0x5634,0xD94C,0xC96D,0xF90E,
		0xE92F,0x99C8,0x89E9,0xB98A,0xA9AB,0x5844,0x4865,0x7806,0x6827,0x18C0,0x08E1,0x3882,0x28A3,
		0xCB7D,0xDB5C,0xEB3F,0xFB1E,0x8BF9,0x9BD8,0xABBB,0xBB9A,0x4A75,0x5A54,0x6A37,0x7A16,0x0AF1,
		0x1AD0,0x2AB3,0x3A92,0xFD2E,0xED0F,0xDD6C,0xCD4D,0xBDAA,0xAD8B,0x9DE8,0x8DC9,0x7C26,0x6C07,
		0x5C64,0x4C45,0x3CA2,0x2C83,0x1CE0,0x0CC1,0xEF1F,0xFF3E,0xCF5D,0xDF7C,0xAF9B,0xBFBA,0x8FD9,
		0x9FF8,0x6E17,0x7E36,0x4E55,0x5E74,0x2E93,0x3EB2,0x0ED1,0x1EF0
	);
	function crc16Add(crc,c)
	// 'crc' should be initialized to 0x0000.
	{
		return CRC16_TAB[((crc>>8)^c)&0xFF]^((crc<<8)&0xFFFF);
	};
	// C/C++ language:
	// 
	// inline unsigned short crc16Add(unsigned short crc, unsigned char c)
	// {
	// 	return CRC16_TAB[(unsigned char)(crc>>8)^c]^(unsigned short)(crc<<8);
	// }
	// FCS-16 (as it is in PPP) in table form
	// 
	// Described in RFC-1662 by William Allen Simpson, see RFC-1662 for references.
	// 
	// Modified by Anders Danielsson, March 10, 2006.
	var FCS_16_TAB = new Array(
		// C/C++ language:
		// 
		// unsigned short FCS_16_TAB[256] = {...};
		0x0000,0x1189,0x2312,0x329B,0x4624,0x57AD,0x6536,0x74BF,0x8C48,0x9DC1,0xAF5A,0xBED3,0xCA6C,
		0xDBE5,0xE97E,0xF8F7,0x1081,0x0108,0x3393,0x221A,0x56A5,0x472C,0x75B7,0x643E,0x9CC9,0x8D40,
		0xBFDB,0xAE52,0xDAED,0xCB64,0xF9FF,0xE876,0x2102,0x308B,0x0210,0x1399,0x6726,0x76AF,0x4434,
		0x55BD,0xAD4A,0xBCC3,0x8E58,0x9FD1,0xEB6E,0xFAE7,0xC87C,0xD9F5,0x3183,0x200A,0x1291,0x0318,
		0x77A7,0x662E,0x54B5,0x453C,0xBDCB,0xAC42,0x9ED9,0x8F50,0xFBEF,0xEA66,0xD8FD,0xC974,0x4204,
		0x538D,0x6116,0x709F,0x0420,0x15A9,0x2732,0x36BB,0xCE4C,0xDFC5,0xED5E,0xFCD7,0x8868,0x99E1,
		0xAB7A,0xBAF3,0x5285,0x430C,0x7197,0x601E,0x14A1,0x0528,0x37B3,0x263A,0xDECD,0xCF44,0xFDDF,
		0xEC56,0x98E9,0x8960,0xBBFB,0xAA72,0x6306,0x728F,0x4014,0x519D,0x2522,0x34AB,0x0630,0x17B9,
		0xEF4E,0xFEC7,0xCC5C,0xDDD5,0xA96A,0xB8E3,0x8A78,0x9BF1,0x7387,0x620E,0x5095,0x411C,0x35A3,
		0x242A,0x16B1,0x0738,0xFFCF,0xEE46,0xDCDD,0xCD54,0xB9EB,0xA862,0x9AF9,0x8B70,0x8408,0x9581,
		0xA71A,0xB693,0xC22C,0xD3A5,0xE13E,0xF0B7,0x0840,0x19C9,0x2B52,0x3ADB,0x4E64,0x5FED,0x6D76,
		0x7CFF,0x9489,0x8500,0xB79B,0xA612,0xD2AD,0xC324,0xF1BF,0xE036,0x18C1,0x0948,0x3BD3,0x2A5A,
		0x5EE5,0x4F6C,0x7DF7,0x6C7E,0xA50A,0xB483,0x8618,0x9791,0xE32E,0xF2A7,0xC03C,0xD1B5,0x2942,
		0x38CB,0x0A50,0x1BD9,0x6F66,0x7EEF,0x4C74,0x5DFD,0xB58B,0xA402,0x9699,0x8710,0xF3AF,0xE226,
		0xD0BD,0xC134,0x39C3,0x284A,0x1AD1,0x0B58,0x7FE7,0x6E6E,0x5CF5,0x4D7C,0xC60C,0xD785,0xE51E,
		0xF497,0x8028,0x91A1,0xA33A,0xB2B3,0x4A44,0x5BCD,0x6956,0x78DF,0x0C60,0x1DE9,0x2F72,0x3EFB,
		0xD68D,0xC704,0xF59F,0xE416,0x90A9,0x8120,0xB3BB,0xA232,0x5AC5,0x4B4C,0x79D7,0x685E,0x1CE1,
		0x0D68,0x3FF3,0x2E7A,0xE70E,0xF687,0xC41C,0xD595,0xA12A,0xB0A3,0x8238,0x93B1,0x6B46,0x7ACF,
		0x4854,0x59DD,0x2D62,0x3CEB,0x0E70,0x1FF9,0xF78F,0xE606,0xD49D,0xC514,0xB1AB,0xA022,0x92B9,
		0x8330,0x7BC7,0x6A4E,0x58D5,0x495C,0x3DE3,0x2C6A,0x1EF1,0x0F78
	);
	function fcs16Add(fcs,c)
	// 'fcs' should be initialized to 0xFFFF and after the computation it should be
	// complemented (inverted).
	// 
	// If the FCS-16 is calculated over the data and over the complemented FCS-16, the
	// result will always be 0xF0B8 (without the complementation).
	{
		return FCS_16_TAB[(fcs^c)&0xFF]^((fcs>>8)&0xFF);
	};
	// C/C++ language:
	// 
	// inline unsigned short fcs16Add(unsigned short fcs, unsigned char c)
	// {
	// 	return FCS_16_TAB[(unsigned char)fcs^c]^(unsigned short)(fcs>>8);
	// }
	//
	// CRC-32 (as it is in ZMODEM) in table form
	// 
	// Copyright (C) 1986 Gary S. Brown. You may use this program, or
	// code or tables extracted from it, as desired without restriction.
	// 
	// Modified by Anders Danielsson, February 5, 1989 and March 10, 2006.
	// 
	// This is also known as FCS-32 (as it is in PPP), described in
	// RFC-1662 by William Allen Simpson, see RFC-1662 for references.
	// 
	var CRC32_TAB = new Array( /* CRC polynomial 0xEDB88320 */
		// C/C++ language:
		// 
		// unsigned long CRC32_TAB[] = {...};
		0x00000000,0x77073096,0xEE0E612C,0x990951BA,0x076DC419,0x706AF48F,0xE963A535,0x9E6495A3,
		0x0EDB8832,0x79DCB8A4,0xE0D5E91E,0x97D2D988,0x09B64C2B,0x7EB17CBD,0xE7B82D07,0x90BF1D91,
		0x1DB71064,0x6AB020F2,0xF3B97148,0x84BE41DE,0x1ADAD47D,0x6DDDE4EB,0xF4D4B551,0x83D385C7,
		0x136C9856,0x646BA8C0,0xFD62F97A,0x8A65C9EC,0x14015C4F,0x63066CD9,0xFA0F3D63,0x8D080DF5,
		0x3B6E20C8,0x4C69105E,0xD56041E4,0xA2677172,0x3C03E4D1,0x4B04D447,0xD20D85FD,0xA50AB56B,
		0x35B5A8FA,0x42B2986C,0xDBBBC9D6,0xACBCF940,0x32D86CE3,0x45DF5C75,0xDCD60DCF,0xABD13D59,
		0x26D930AC,0x51DE003A,0xC8D75180,0xBFD06116,0x21B4F4B5,0x56B3C423,0xCFBA9599,0xB8BDA50F,
		0x2802B89E,0x5F058808,0xC60CD9B2,0xB10BE924,0x2F6F7C87,0x58684C11,0xC1611DAB,0xB6662D3D,
		0x76DC4190,0x01DB7106,0x98D220BC,0xEFD5102A,0x71B18589,0x06B6B51F,0x9FBFE4A5,0xE8B8D433,
		0x7807C9A2,0x0F00F934,0x9609A88E,0xE10E9818,0x7F6A0DBB,0x086D3D2D,0x91646C97,0xE6635C01,
		0x6B6B51F4,0x1C6C6162,0x856530D8,0xF262004E,0x6C0695ED,0x1B01A57B,0x8208F4C1,0xF50FC457,
		0x65B0D9C6,0x12B7E950,0x8BBEB8EA,0xFCB9887C,0x62DD1DDF,0x15DA2D49,0x8CD37CF3,0xFBD44C65,
		0x4DB26158,0x3AB551CE,0xA3BC0074,0xD4BB30E2,0x4ADFA541,0x3DD895D7,0xA4D1C46D,0xD3D6F4FB,
		0x4369E96A,0x346ED9FC,0xAD678846,0xDA60B8D0,0x44042D73,0x33031DE5,0xAA0A4C5F,0xDD0D7CC9,
		0x5005713C,0x270241AA,0xBE0B1010,0xC90C2086,0x5768B525,0x206F85B3,0xB966D409,0xCE61E49F,
		0x5EDEF90E,0x29D9C998,0xB0D09822,0xC7D7A8B4,0x59B33D17,0x2EB40D81,0xB7BD5C3B,0xC0BA6CAD,
		0xEDB88320,0x9ABFB3B6,0x03B6E20C,0x74B1D29A,0xEAD54739,0x9DD277AF,0x04DB2615,0x73DC1683,
		0xE3630B12,0x94643B84,0x0D6D6A3E,0x7A6A5AA8,0xE40ECF0B,0x9309FF9D,0x0A00AE27,0x7D079EB1,
		0xF00F9344,0x8708A3D2,0x1E01F268,0x6906C2FE,0xF762575D,0x806567CB,0x196C3671,0x6E6B06E7,
		0xFED41B76,0x89D32BE0,0x10DA7A5A,0x67DD4ACC,0xF9B9DF6F,0x8EBEEFF9,0x17B7BE43,0x60B08ED5,
		0xD6D6A3E8,0xA1D1937E,0x38D8C2C4,0x4FDFF252,0xD1BB67F1,0xA6BC5767,0x3FB506DD,0x48B2364B,
		0xD80D2BDA,0xAF0A1B4C,0x36034AF6,0x41047A60,0xDF60EFC3,0xA867DF55,0x316E8EEF,0x4669BE79,
		0xCB61B38C,0xBC66831A,0x256FD2A0,0x5268E236,0xCC0C7795,0xBB0B4703,0x220216B9,0x5505262F,
		0xC5BA3BBE,0xB2BD0B28,0x2BB45A92,0x5CB36A04,0xC2D7FFA7,0xB5D0CF31,0x2CD99E8B,0x5BDEAE1D,
		0x9B64C2B0,0xEC63F226,0x756AA39C,0x026D930A,0x9C0906A9,0xEB0E363F,0x72076785,0x05005713,
		0x95BF4A82,0xE2B87A14,0x7BB12BAE,0x0CB61B38,0x92D28E9B,0xE5D5BE0D,0x7CDCEFB7,0x0BDBDF21,
		0x86D3D2D4,0xF1D4E242,0x68DDB3F8,0x1FDA836E,0x81BE16CD,0xF6B9265B,0x6FB077E1,0x18B74777,
		0x88085AE6,0xFF0F6A70,0x66063BCA,0x11010B5C,0x8F659EFF,0xF862AE69,0x616BFFD3,0x166CCF45,
		0xA00AE278,0xD70DD2EE,0x4E048354,0x3903B3C2,0xA7672661,0xD06016F7,0x4969474D,0x3E6E77DB,
		0xAED16A4A,0xD9D65ADC,0x40DF0B66,0x37D83BF0,0xA9BCAE53,0xDEBB9EC5,0x47B2CF7F,0x30B5FFE9,
		0xBDBDF21C,0xCABAC28A,0x53B39330,0x24B4A3A6,0xBAD03605,0xCDD70693,0x54DE5729,0x23D967BF,
		0xB3667A2E,0xC4614AB8,0x5D681B02,0x2A6F2B94,0xB40BBE37,0xC30C8EA1,0x5A05DF1B,0x2D02EF8D
	);
	function crc32Add(crc,c)
	// 'crc' should be initialized to 0xFFFFFFFF and after the computation it should be
	// complemented (inverted).
	// 
	// CRC-32 is also known as FCS-32.
	// 
	// If the FCS-32 is calculated over the data and over the complemented FCS-32, the
	// result will always be 0xDEBB20E3 (without the complementation).
	{
		return CRC32_TAB[(crc^c)&0xFF]^((crc>>8)&0xFFFFFF);
	};
	//
	// C/C++ language:
	// 
	// inline unsigned long crc32Add(unsigned long crc, unsigned char c)
	// {
	// 	return CRC32_TAB[(unsigned char)crc^c]^(crc>>8);
	// }
	//
	function crc8(str)
	{
		var n,
			len = str.length,
			crc = 0
			;
			
		for(i = 0; i < len; i++)
			crc = crc8Add(crc, str.charCodeAt(i));
		
		return crc;
	};
	function crcArc(str)
	{
		var i,
			len = str.length,
			crc = 0
			;
		
		for(i = 0; i < len; i++)
			crc = crcArcAdd(crc, str.charCodeAt(i));
			
		return crc;
	};
	function crc16(str)
	{
		var i,
			len = str.length,
			crc = 0
			;
			
		for(i = 0; i < len; i++)
			crc = crc16Add(crc, str.charCodeAt(i));
		
		return crc;
	};
	function fcs16(str)
	{
		var i,
			len = str.length,
			fcs = 0xFFFF
			;
			
		for(i = 0; i < len; i++)
			fcs = fcs16Add(fcs,str.charCodeAt(i));
			
		return fcs^0xFFFF;
	};
	function crc32(str)
	{
		var i,
			len = str.length,
			crc = 0xFFFFFFFF
			;
			
		for(i = 0; i < len; i++)
			crc = crc32Add(crc, str.charCodeAt(i));
			
		return crc^0xFFFFFFFF;
	};
	/**
	 * Convert value as 8-bit unsigned integer to 2 digit hexadecimal number.
	 */
	function hex8(val)
	{
		var n = val & 0xFF,
			str = n.toString(16).toUpperCase()
			;
			
		while(str.length < 2)
			str = "0" + str;
			
		return str;
	};
	/**
	 * Convert value as 16-bit unsigned integer to 4 digit hexadecimal number.
	 */
	function hex16(val)
	{
		return hex8(val >> 8) + hex8(val);
	};
	/**
	 * Convert value as 32-bit unsigned integer to 8 digit hexadecimal number.
	 */
	function hex32(val)
	{
		return hex16(val >> 16) + hex16(val);
	};
	var target, property;
	if(typeof(window) == 'undefined')
	{
		target = module;
		property = 'exports';
	}
	else
	{
		target = window;
		property = 'crc';
	}
	target[property] = {
		'crc8'		: crc8,
		'crcArc'	: crcArc,
		'crc16'		: crc16,
		'fcs16'		: fcs16,
		'crc32'		: crc32,
		'hex8'		: hex8,
		'hex16'		: hex16,
		'hex32'		: hex32
	};
})();
    }
  };
});
horseDatastore.module(6, function(onejsModParent){
  return {
    'id':'lib/crc',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      (function()
{
	// CRC-8 in table form
	// 
	// Copyright (c) 1989 AnDan Software. You may use this program, or
	// code or tables extracted from it, as long as this notice is not
	// removed or changed.
	var CRC8_TAB = new Array(
		// C/C++ language:
		// 
		// unsigned char CRC8_TAB[] = {...};
		0x00,0x1B,0x36,0x2D,0x6C,0x77,0x5A,0x41,0xD8,0xC3,0xEE,0xF5,0xB4,0xAF,0x82,0x99,0xD3,0xC8,0xE5,
		0xFE,0xBF,0xA4,0x89,0x92,0x0B,0x10,0x3D,0x26,0x67,0x7C,0x51,0x4A,0xC5,0xDE,0xF3,0xE8,0xA9,0xB2,
		0x9F,0x84,0x1D,0x06,0x2B,0x30,0x71,0x6A,0x47,0x5C,0x16,0x0D,0x20,0x3B,0x7A,0x61,0x4C,0x57,0xCE,
		0xD5,0xF8,0xE3,0xA2,0xB9,0x94,0x8F,0xE9,0xF2,0xDF,0xC4,0x85,0x9E,0xB3,0xA8,0x31,0x2A,0x07,0x1C,
		0x5D,0x46,0x6B,0x70,0x3A,0x21,0x0C,0x17,0x56,0x4D,0x60,0x7B,0xE2,0xF9,0xD4,0xCF,0x8E,0x95,0xB8,
		0xA3,0x2C,0x37,0x1A,0x01,0x40,0x5B,0x76,0x6D,0xF4,0xEF,0xC2,0xD9,0x98,0x83,0xAE,0xB5,0xFF,0xE4,
		0xC9,0xD2,0x93,0x88,0xA5,0xBE,0x27,0x3C,0x11,0x0A,0x4B,0x50,0x7D,0x66,0xB1,0xAA,0x87,0x9C,0xDD,
		0xC6,0xEB,0xF0,0x69,0x72,0x5F,0x44,0x05,0x1E,0x33,0x28,0x62,0x79,0x54,0x4F,0x0E,0x15,0x38,0x23,
		0xBA,0xA1,0x8C,0x97,0xD6,0xCD,0xE0,0xFB,0x74,0x6F,0x42,0x59,0x18,0x03,0x2E,0x35,0xAC,0xB7,0x9A,
		0x81,0xC0,0xDB,0xF6,0xED,0xA7,0xBC,0x91,0x8A,0xCB,0xD0,0xFD,0xE6,0x7F,0x64,0x49,0x52,0x13,0x08,
		0x25,0x3E,0x58,0x43,0x6E,0x75,0x34,0x2F,0x02,0x19,0x80,0x9B,0xB6,0xAD,0xEC,0xF7,0xDA,0xC1,0x8B,
		0x90,0xBD,0xA6,0xE7,0xFC,0xD1,0xCA,0x53,0x48,0x65,0x7E,0x3F,0x24,0x09,0x12,0x9D,0x86,0xAB,0xB0,
		0xF1,0xEA,0xC7,0xDC,0x45,0x5E,0x73,0x68,0x29,0x32,0x1F,0x04,0x4E,0x55,0x78,0x63,0x22,0x39,0x14,
		0x0F,0x96,0x8D,0xA0,0xBB,0xFA,0xE1,0xCC,0xD7
	);
	function crc8Add(crc,c)
	// 'crc' should be initialized to 0x00.
	{
		return CRC8_TAB[(crc^c)&0xFF];
	};
	// C/C++ language:
	// 
	// inline unsigned char crc8Add(unsigned char crc, unsigned char c)
	// {
	// 	return CRC8_TAB[crc^c];
	// }
	// CRC-16 (as it is in SEA's ARC) in table form
	// 
	// The logic for this method of calculating the CRC 16 bit polynomial
	// is taken from an article by David Schwaderer in the April 1985
	// issue of PC Tech Journal.
	var CRC_ARC_TAB = new Array(
		// C/C++ language:
		// 
		// unsigned short CRC_ARC_TAB[] = {...};
		0x0000,0xC0C1,0xC181,0x0140,0xC301,0x03C0,0x0280,0xC241,0xC601,0x06C0,0x0780,0xC741,0x0500,
		0xC5C1,0xC481,0x0440,0xCC01,0x0CC0,0x0D80,0xCD41,0x0F00,0xCFC1,0xCE81,0x0E40,0x0A00,0xCAC1,
		0xCB81,0x0B40,0xC901,0x09C0,0x0880,0xC841,0xD801,0x18C0,0x1980,0xD941,0x1B00,0xDBC1,0xDA81,
		0x1A40,0x1E00,0xDEC1,0xDF81,0x1F40,0xDD01,0x1DC0,0x1C80,0xDC41,0x1400,0xD4C1,0xD581,0x1540,
		0xD701,0x17C0,0x1680,0xD641,0xD201,0x12C0,0x1380,0xD341,0x1100,0xD1C1,0xD081,0x1040,0xF001,
		0x30C0,0x3180,0xF141,0x3300,0xF3C1,0xF281,0x3240,0x3600,0xF6C1,0xF781,0x3740,0xF501,0x35C0,
		0x3480,0xF441,0x3C00,0xFCC1,0xFD81,0x3D40,0xFF01,0x3FC0,0x3E80,0xFE41,0xFA01,0x3AC0,0x3B80,
		0xFB41,0x3900,0xF9C1,0xF881,0x3840,0x2800,0xE8C1,0xE981,0x2940,0xEB01,0x2BC0,0x2A80,0xEA41,
		0xEE01,0x2EC0,0x2F80,0xEF41,0x2D00,0xEDC1,0xEC81,0x2C40,0xE401,0x24C0,0x2580,0xE541,0x2700,
		0xE7C1,0xE681,0x2640,0x2200,0xE2C1,0xE381,0x2340,0xE101,0x21C0,0x2080,0xE041,0xA001,0x60C0,
		0x6180,0xA141,0x6300,0xA3C1,0xA281,0x6240,0x6600,0xA6C1,0xA781,0x6740,0xA501,0x65C0,0x6480,
		0xA441,0x6C00,0xACC1,0xAD81,0x6D40,0xAF01,0x6FC0,0x6E80,0xAE41,0xAA01,0x6AC0,0x6B80,0xAB41,
		0x6900,0xA9C1,0xA881,0x6840,0x7800,0xB8C1,0xB981,0x7940,0xBB01,0x7BC0,0x7A80,0xBA41,0xBE01,
		0x7EC0,0x7F80,0xBF41,0x7D00,0xBDC1,0xBC81,0x7C40,0xB401,0x74C0,0x7580,0xB541,0x7700,0xB7C1,
		0xB681,0x7640,0x7200,0xB2C1,0xB381,0x7340,0xB101,0x71C0,0x7080,0xB041,0x5000,0x90C1,0x9181,
		0x5140,0x9301,0x53C0,0x5280,0x9241,0x9601,0x56C0,0x5780,0x9741,0x5500,0x95C1,0x9481,0x5440,
		0x9C01,0x5CC0,0x5D80,0x9D41,0x5F00,0x9FC1,0x9E81,0x5E40,0x5A00,0x9AC1,0x9B81,0x5B40,0x9901,
		0x59C0,0x5880,0x9841,0x8801,0x48C0,0x4980,0x8941,0x4B00,0x8BC1,0x8A81,0x4A40,0x4E00,0x8EC1,
		0x8F81,0x4F40,0x8D01,0x4DC0,0x4C80,0x8C41,0x4400,0x84C1,0x8581,0x4540,0x8701,0x47C0,0x4680,
		0x8641,0x8201,0x42C0,0x4380,0x8341,0x4100,0x81C1,0x8081,0x4040
	);
	function crcArcAdd(crc,c)
	// 'crc' should be initialized to 0x0000.
	{
		return CRC_ARC_TAB[(crc^c)&0xFF]^((crc>>8)&0xFF);
	};
	// C/C++ language:
	// 
	// inline unsigned short crcArcAdd(unsigned short crc, unsigned char c)
	// {
	// 	return CRC_ARC_TAB[(unsigned char)crc^c]^(unsigned short)(crc>>8);
	// }
	// CRC-16 (as it is in ZMODEM) in table form
	// 
	// Copyright (c) 1989 AnDan Software. You may use this program, or
	// code or tables extracted from it, as long as this notice is not
	// removed or changed.
	var CRC16_TAB = new Array(
		// C/C++ language:
		// 
		// unsigned short CRC16_TAB[] = {...};
		0x0000,0x1021,0x2042,0x3063,0x4084,0x50A5,0x60C6,0x70E7,0x8108,0x9129,0xA14A,0xB16B,0xC18C,
		0xD1AD,0xE1CE,0xF1EF,0x1231,0x0210,0x3273,0x2252,0x52B5,0x4294,0x72F7,0x62D6,0x9339,0x8318,
		0xB37B,0xA35A,0xD3BD,0xC39C,0xF3FF,0xE3DE,0x2462,0x3443,0x0420,0x1401,0x64E6,0x74C7,0x44A4,
		0x5485,0xA56A,0xB54B,0x8528,0x9509,0xE5EE,0xF5CF,0xC5AC,0xD58D,0x3653,0x2672,0x1611,0x0630,
		0x76D7,0x66F6,0x5695,0x46B4,0xB75B,0xA77A,0x9719,0x8738,0xF7DF,0xE7FE,0xD79D,0xC7BC,0x48C4,
		0x58E5,0x6886,0x78A7,0x0840,0x1861,0x2802,0x3823,0xC9CC,0xD9ED,0xE98E,0xF9AF,0x8948,0x9969,
		0xA90A,0xB92B,0x5AF5,0x4AD4,0x7AB7,0x6A96,0x1A71,0x0A50,0x3A33,0x2A12,0xDBFD,0xCBDC,0xFBBF,
		0xEB9E,0x9B79,0x8B58,0xBB3B,0xAB1A,0x6CA6,0x7C87,0x4CE4,0x5CC5,0x2C22,0x3C03,0x0C60,0x1C41,
		0xEDAE,0xFD8F,0xCDEC,0xDDCD,0xAD2A,0xBD0B,0x8D68,0x9D49,0x7E97,0x6EB6,0x5ED5,0x4EF4,0x3E13,
		0x2E32,0x1E51,0x0E70,0xFF9F,0xEFBE,0xDFDD,0xCFFC,0xBF1B,0xAF3A,0x9F59,0x8F78,0x9188,0x81A9,
		0xB1CA,0xA1EB,0xD10C,0xC12D,0xF14E,0xE16F,0x1080,0x00A1,0x30C2,0x20E3,0x5004,0x4025,0x7046,
		0x6067,0x83B9,0x9398,0xA3FB,0xB3DA,0xC33D,0xD31C,0xE37F,0xF35E,0x02B1,0x1290,0x22F3,0x32D2,
		0x4235,0x5214,0x6277,0x7256,0xB5EA,0xA5CB,0x95A8,0x8589,0xF56E,0xE54F,0xD52C,0xC50D,0x34E2,
		0x24C3,0x14A0,0x0481,0x7466,0x6447,0x5424,0x4405,0xA7DB,0xB7FA,0x8799,0x97B8,0xE75F,0xF77E,
		0xC71D,0xD73C,0x26D3,0x36F2,0x0691,0x16B0,0x6657,0x7676,0x4615,0x5634,0xD94C,0xC96D,0xF90E,
		0xE92F,0x99C8,0x89E9,0xB98A,0xA9AB,0x5844,0x4865,0x7806,0x6827,0x18C0,0x08E1,0x3882,0x28A3,
		0xCB7D,0xDB5C,0xEB3F,0xFB1E,0x8BF9,0x9BD8,0xABBB,0xBB9A,0x4A75,0x5A54,0x6A37,0x7A16,0x0AF1,
		0x1AD0,0x2AB3,0x3A92,0xFD2E,0xED0F,0xDD6C,0xCD4D,0xBDAA,0xAD8B,0x9DE8,0x8DC9,0x7C26,0x6C07,
		0x5C64,0x4C45,0x3CA2,0x2C83,0x1CE0,0x0CC1,0xEF1F,0xFF3E,0xCF5D,0xDF7C,0xAF9B,0xBFBA,0x8FD9,
		0x9FF8,0x6E17,0x7E36,0x4E55,0x5E74,0x2E93,0x3EB2,0x0ED1,0x1EF0
	);
	function crc16Add(crc,c)
	// 'crc' should be initialized to 0x0000.
	{
		return CRC16_TAB[((crc>>8)^c)&0xFF]^((crc<<8)&0xFFFF);
	};
	// C/C++ language:
	// 
	// inline unsigned short crc16Add(unsigned short crc, unsigned char c)
	// {
	// 	return CRC16_TAB[(unsigned char)(crc>>8)^c]^(unsigned short)(crc<<8);
	// }
	// FCS-16 (as it is in PPP) in table form
	// 
	// Described in RFC-1662 by William Allen Simpson, see RFC-1662 for references.
	// 
	// Modified by Anders Danielsson, March 10, 2006.
	var FCS_16_TAB = new Array(
		// C/C++ language:
		// 
		// unsigned short FCS_16_TAB[256] = {...};
		0x0000,0x1189,0x2312,0x329B,0x4624,0x57AD,0x6536,0x74BF,0x8C48,0x9DC1,0xAF5A,0xBED3,0xCA6C,
		0xDBE5,0xE97E,0xF8F7,0x1081,0x0108,0x3393,0x221A,0x56A5,0x472C,0x75B7,0x643E,0x9CC9,0x8D40,
		0xBFDB,0xAE52,0xDAED,0xCB64,0xF9FF,0xE876,0x2102,0x308B,0x0210,0x1399,0x6726,0x76AF,0x4434,
		0x55BD,0xAD4A,0xBCC3,0x8E58,0x9FD1,0xEB6E,0xFAE7,0xC87C,0xD9F5,0x3183,0x200A,0x1291,0x0318,
		0x77A7,0x662E,0x54B5,0x453C,0xBDCB,0xAC42,0x9ED9,0x8F50,0xFBEF,0xEA66,0xD8FD,0xC974,0x4204,
		0x538D,0x6116,0x709F,0x0420,0x15A9,0x2732,0x36BB,0xCE4C,0xDFC5,0xED5E,0xFCD7,0x8868,0x99E1,
		0xAB7A,0xBAF3,0x5285,0x430C,0x7197,0x601E,0x14A1,0x0528,0x37B3,0x263A,0xDECD,0xCF44,0xFDDF,
		0xEC56,0x98E9,0x8960,0xBBFB,0xAA72,0x6306,0x728F,0x4014,0x519D,0x2522,0x34AB,0x0630,0x17B9,
		0xEF4E,0xFEC7,0xCC5C,0xDDD5,0xA96A,0xB8E3,0x8A78,0x9BF1,0x7387,0x620E,0x5095,0x411C,0x35A3,
		0x242A,0x16B1,0x0738,0xFFCF,0xEE46,0xDCDD,0xCD54,0xB9EB,0xA862,0x9AF9,0x8B70,0x8408,0x9581,
		0xA71A,0xB693,0xC22C,0xD3A5,0xE13E,0xF0B7,0x0840,0x19C9,0x2B52,0x3ADB,0x4E64,0x5FED,0x6D76,
		0x7CFF,0x9489,0x8500,0xB79B,0xA612,0xD2AD,0xC324,0xF1BF,0xE036,0x18C1,0x0948,0x3BD3,0x2A5A,
		0x5EE5,0x4F6C,0x7DF7,0x6C7E,0xA50A,0xB483,0x8618,0x9791,0xE32E,0xF2A7,0xC03C,0xD1B5,0x2942,
		0x38CB,0x0A50,0x1BD9,0x6F66,0x7EEF,0x4C74,0x5DFD,0xB58B,0xA402,0x9699,0x8710,0xF3AF,0xE226,
		0xD0BD,0xC134,0x39C3,0x284A,0x1AD1,0x0B58,0x7FE7,0x6E6E,0x5CF5,0x4D7C,0xC60C,0xD785,0xE51E,
		0xF497,0x8028,0x91A1,0xA33A,0xB2B3,0x4A44,0x5BCD,0x6956,0x78DF,0x0C60,0x1DE9,0x2F72,0x3EFB,
		0xD68D,0xC704,0xF59F,0xE416,0x90A9,0x8120,0xB3BB,0xA232,0x5AC5,0x4B4C,0x79D7,0x685E,0x1CE1,
		0x0D68,0x3FF3,0x2E7A,0xE70E,0xF687,0xC41C,0xD595,0xA12A,0xB0A3,0x8238,0x93B1,0x6B46,0x7ACF,
		0x4854,0x59DD,0x2D62,0x3CEB,0x0E70,0x1FF9,0xF78F,0xE606,0xD49D,0xC514,0xB1AB,0xA022,0x92B9,
		0x8330,0x7BC7,0x6A4E,0x58D5,0x495C,0x3DE3,0x2C6A,0x1EF1,0x0F78
	);
	function fcs16Add(fcs,c)
	// 'fcs' should be initialized to 0xFFFF and after the computation it should be
	// complemented (inverted).
	// 
	// If the FCS-16 is calculated over the data and over the complemented FCS-16, the
	// result will always be 0xF0B8 (without the complementation).
	{
		return FCS_16_TAB[(fcs^c)&0xFF]^((fcs>>8)&0xFF);
	};
	// C/C++ language:
	// 
	// inline unsigned short fcs16Add(unsigned short fcs, unsigned char c)
	// {
	// 	return FCS_16_TAB[(unsigned char)fcs^c]^(unsigned short)(fcs>>8);
	// }
	//
	// CRC-32 (as it is in ZMODEM) in table form
	// 
	// Copyright (C) 1986 Gary S. Brown. You may use this program, or
	// code or tables extracted from it, as desired without restriction.
	// 
	// Modified by Anders Danielsson, February 5, 1989 and March 10, 2006.
	// 
	// This is also known as FCS-32 (as it is in PPP), described in
	// RFC-1662 by William Allen Simpson, see RFC-1662 for references.
	// 
	var CRC32_TAB = new Array( /* CRC polynomial 0xEDB88320 */
		// C/C++ language:
		// 
		// unsigned long CRC32_TAB[] = {...};
		0x00000000,0x77073096,0xEE0E612C,0x990951BA,0x076DC419,0x706AF48F,0xE963A535,0x9E6495A3,
		0x0EDB8832,0x79DCB8A4,0xE0D5E91E,0x97D2D988,0x09B64C2B,0x7EB17CBD,0xE7B82D07,0x90BF1D91,
		0x1DB71064,0x6AB020F2,0xF3B97148,0x84BE41DE,0x1ADAD47D,0x6DDDE4EB,0xF4D4B551,0x83D385C7,
		0x136C9856,0x646BA8C0,0xFD62F97A,0x8A65C9EC,0x14015C4F,0x63066CD9,0xFA0F3D63,0x8D080DF5,
		0x3B6E20C8,0x4C69105E,0xD56041E4,0xA2677172,0x3C03E4D1,0x4B04D447,0xD20D85FD,0xA50AB56B,
		0x35B5A8FA,0x42B2986C,0xDBBBC9D6,0xACBCF940,0x32D86CE3,0x45DF5C75,0xDCD60DCF,0xABD13D59,
		0x26D930AC,0x51DE003A,0xC8D75180,0xBFD06116,0x21B4F4B5,0x56B3C423,0xCFBA9599,0xB8BDA50F,
		0x2802B89E,0x5F058808,0xC60CD9B2,0xB10BE924,0x2F6F7C87,0x58684C11,0xC1611DAB,0xB6662D3D,
		0x76DC4190,0x01DB7106,0x98D220BC,0xEFD5102A,0x71B18589,0x06B6B51F,0x9FBFE4A5,0xE8B8D433,
		0x7807C9A2,0x0F00F934,0x9609A88E,0xE10E9818,0x7F6A0DBB,0x086D3D2D,0x91646C97,0xE6635C01,
		0x6B6B51F4,0x1C6C6162,0x856530D8,0xF262004E,0x6C0695ED,0x1B01A57B,0x8208F4C1,0xF50FC457,
		0x65B0D9C6,0x12B7E950,0x8BBEB8EA,0xFCB9887C,0x62DD1DDF,0x15DA2D49,0x8CD37CF3,0xFBD44C65,
		0x4DB26158,0x3AB551CE,0xA3BC0074,0xD4BB30E2,0x4ADFA541,0x3DD895D7,0xA4D1C46D,0xD3D6F4FB,
		0x4369E96A,0x346ED9FC,0xAD678846,0xDA60B8D0,0x44042D73,0x33031DE5,0xAA0A4C5F,0xDD0D7CC9,
		0x5005713C,0x270241AA,0xBE0B1010,0xC90C2086,0x5768B525,0x206F85B3,0xB966D409,0xCE61E49F,
		0x5EDEF90E,0x29D9C998,0xB0D09822,0xC7D7A8B4,0x59B33D17,0x2EB40D81,0xB7BD5C3B,0xC0BA6CAD,
		0xEDB88320,0x9ABFB3B6,0x03B6E20C,0x74B1D29A,0xEAD54739,0x9DD277AF,0x04DB2615,0x73DC1683,
		0xE3630B12,0x94643B84,0x0D6D6A3E,0x7A6A5AA8,0xE40ECF0B,0x9309FF9D,0x0A00AE27,0x7D079EB1,
		0xF00F9344,0x8708A3D2,0x1E01F268,0x6906C2FE,0xF762575D,0x806567CB,0x196C3671,0x6E6B06E7,
		0xFED41B76,0x89D32BE0,0x10DA7A5A,0x67DD4ACC,0xF9B9DF6F,0x8EBEEFF9,0x17B7BE43,0x60B08ED5,
		0xD6D6A3E8,0xA1D1937E,0x38D8C2C4,0x4FDFF252,0xD1BB67F1,0xA6BC5767,0x3FB506DD,0x48B2364B,
		0xD80D2BDA,0xAF0A1B4C,0x36034AF6,0x41047A60,0xDF60EFC3,0xA867DF55,0x316E8EEF,0x4669BE79,
		0xCB61B38C,0xBC66831A,0x256FD2A0,0x5268E236,0xCC0C7795,0xBB0B4703,0x220216B9,0x5505262F,
		0xC5BA3BBE,0xB2BD0B28,0x2BB45A92,0x5CB36A04,0xC2D7FFA7,0xB5D0CF31,0x2CD99E8B,0x5BDEAE1D,
		0x9B64C2B0,0xEC63F226,0x756AA39C,0x026D930A,0x9C0906A9,0xEB0E363F,0x72076785,0x05005713,
		0x95BF4A82,0xE2B87A14,0x7BB12BAE,0x0CB61B38,0x92D28E9B,0xE5D5BE0D,0x7CDCEFB7,0x0BDBDF21,
		0x86D3D2D4,0xF1D4E242,0x68DDB3F8,0x1FDA836E,0x81BE16CD,0xF6B9265B,0x6FB077E1,0x18B74777,
		0x88085AE6,0xFF0F6A70,0x66063BCA,0x11010B5C,0x8F659EFF,0xF862AE69,0x616BFFD3,0x166CCF45,
		0xA00AE278,0xD70DD2EE,0x4E048354,0x3903B3C2,0xA7672661,0xD06016F7,0x4969474D,0x3E6E77DB,
		0xAED16A4A,0xD9D65ADC,0x40DF0B66,0x37D83BF0,0xA9BCAE53,0xDEBB9EC5,0x47B2CF7F,0x30B5FFE9,
		0xBDBDF21C,0xCABAC28A,0x53B39330,0x24B4A3A6,0xBAD03605,0xCDD70693,0x54DE5729,0x23D967BF,
		0xB3667A2E,0xC4614AB8,0x5D681B02,0x2A6F2B94,0xB40BBE37,0xC30C8EA1,0x5A05DF1B,0x2D02EF8D
	);
	function crc32Add(crc,c)
	// 'crc' should be initialized to 0xFFFFFFFF and after the computation it should be
	// complemented (inverted).
	// 
	// CRC-32 is also known as FCS-32.
	// 
	// If the FCS-32 is calculated over the data and over the complemented FCS-32, the
	// result will always be 0xDEBB20E3 (without the complementation).
	{
		return CRC32_TAB[(crc^c)&0xFF]^((crc>>8)&0xFFFFFF);
	};
	//
	// C/C++ language:
	// 
	// inline unsigned long crc32Add(unsigned long crc, unsigned char c)
	// {
	// 	return CRC32_TAB[(unsigned char)crc^c]^(crc>>8);
	// }
	//
	function crc8(str)
	{
		var n,
			len = str.length,
			crc = 0
			;
			
		for(i = 0; i < len; i++)
			crc = crc8Add(crc, str.charCodeAt(i));
		
		return crc;
	};
	function crcArc(str)
	{
		var i,
			len = str.length,
			crc = 0
			;
		
		for(i = 0; i < len; i++)
			crc = crcArcAdd(crc, str.charCodeAt(i));
			
		return crc;
	};
	function crc16(str)
	{
		var i,
			len = str.length,
			crc = 0
			;
			
		for(i = 0; i < len; i++)
			crc = crc16Add(crc, str.charCodeAt(i));
		
		return crc;
	};
	function fcs16(str)
	{
		var i,
			len = str.length,
			fcs = 0xFFFF
			;
			
		for(i = 0; i < len; i++)
			fcs = fcs16Add(fcs,str.charCodeAt(i));
			
		return fcs^0xFFFF;
	};
	function crc32(str)
	{
		var i,
			len = str.length,
			crc = 0xFFFFFFFF
			;
			
		for(i = 0; i < len; i++)
			crc = crc32Add(crc, str.charCodeAt(i));
			
		return crc^0xFFFFFFFF;
	};
	/**
	 * Convert value as 8-bit unsigned integer to 2 digit hexadecimal number.
	 */
	function hex8(val)
	{
		var n = val & 0xFF,
			str = n.toString(16).toUpperCase()
			;
			
		while(str.length < 2)
			str = "0" + str;
			
		return str;
	};
	/**
	 * Convert value as 16-bit unsigned integer to 4 digit hexadecimal number.
	 */
	function hex16(val)
	{
		return hex8(val >> 8) + hex8(val);
	};
	/**
	 * Convert value as 32-bit unsigned integer to 8 digit hexadecimal number.
	 */
	function hex32(val)
	{
		return hex16(val >> 16) + hex16(val);
	};
	var target, property;
	if(typeof(window) == 'undefined')
	{
		target = module;
		property = 'exports';
	}
	else
	{
		target = window;
		property = 'crc';
	}
	target[property] = {
		'crc8'		: crc8,
		'crcArc'	: crcArc,
		'crc16'		: crc16,
		'fcs16'		: fcs16,
		'crc32'		: crc32,
		'hex8'		: hex8,
		'hex16'		: hex16,
		'hex32'		: hex32
	};
})();
    }
  };
});
horseDatastore.pkg(2, function(parent){
  return {
    'id':7,
    'name':'debug',
    'main':undefined,
    'mainModuleId':'index',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(7, function(onejsModParent){
  return {
    'id':'lib/debug',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/**
 * Module dependencies.
 */
var tty = require('tty');
/**
 * Expose `debug()` as the module.
 */
module.exports = debug;
/**
 * Enabled debuggers.
 */
var names = []
  , skips = [];
(process.env.DEBUG || '')
  .split(/[\s,]+/)
  .forEach(function(name){
    name = name.replace('*', '.*?');
    if (name[0] === '-') {
      skips.push(new RegExp('^' + name.substr(1) + '$'));
    } else {
      names.push(new RegExp('^' + name + '$'));
    }
  });
/**
 * Colors.
 */
var colors = [6, 2, 3, 4, 5, 1];
/**
 * Previous debug() call.
 */
var prev = {};
/**
 * Previously assigned color.
 */
var prevColor = 0;
/**
 * Is stdout a TTY? Colored output is disabled when `true`.
 */
var isatty = tty.isatty(2);
/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */
function color() {
  return colors[prevColor++ % colors.length];
}
/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */
function humanize(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;
  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
}
/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */
function debug(name) {
  function disabled(){}
  disabled.enabled = false;
  var match = skips.some(function(re){
    return re.test(name);
  });
  if (match) return disabled;
  match = names.some(function(re){
    return re.test(name);
  });
  if (!match) return disabled;
  var c = color();
  function colored(fmt) {
    var curr = new Date;
    var ms = curr - (prev[name] || curr);
    prev[name] = curr;
    fmt = '  \033[9' + c + 'm' + name + ' '
      + '\033[3' + c + 'm\033[90m'
      + fmt + '\033[3' + c + 'm'
      + ' +' + humanize(ms) + '\033[0m';
    console.error.apply(this, arguments);
  }
  function plain(fmt) {
    fmt = new Date().toUTCString()
      + ' ' + name + ' ' + fmt;
    console.error.apply(this, arguments);
  }
  colored.enabled = plain.enabled = true;
  return isatty
    ? colored
    : plain;
}
    }
  };
});
horseDatastore.module(7, function(onejsModParent){
  return {
    'id':'index',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
module.exports = require('./lib/debug');
    }
  };
});
horseDatastore.pkg(1, function(parent){
  return {
    'id':8,
    'name':'coffee-script',
    'main':undefined,
    'mainModuleId':'coffee-script',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(8, function(onejsModParent){
  return {
    'id':'nodes',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // Generated by CoffeeScript 1.3.1
(function() {
  var Access, Arr, Assign, Base, Block, Call, Class, Closure, Code, Comment, Existence, Extends, For, IDENTIFIER, IDENTIFIER_STR, IS_STRING, If, In, Index, LEVEL_ACCESS, LEVEL_COND, LEVEL_LIST, LEVEL_OP, LEVEL_PAREN, LEVEL_TOP, Literal, METHOD_DEF, NEGATE, NO, Obj, Op, Param, Parens, RESERVED, Range, Return, SIMPLENUM, STRICT_PROSCRIBED, Scope, Slice, Splat, Switch, TAB, THIS, Throw, Try, UTILITIES, Value, While, YES, compact, del, ends, extend, flatten, last, merge, multident, starts, unfoldSoak, utility, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  Scope = require('./scope').Scope;
  _ref = require('./lexer'), RESERVED = _ref.RESERVED, STRICT_PROSCRIBED = _ref.STRICT_PROSCRIBED;
  _ref1 = require('./helpers'), compact = _ref1.compact, flatten = _ref1.flatten, extend = _ref1.extend, merge = _ref1.merge, del = _ref1.del, starts = _ref1.starts, ends = _ref1.ends, last = _ref1.last;
  exports.extend = extend;
  YES = function() {
    return true;
  };
  NO = function() {
    return false;
  };
  THIS = function() {
    return this;
  };
  NEGATE = function() {
    this.negated = !this.negated;
    return this;
  };
  exports.Base = Base = (function() {
    Base.name = 'Base';
    function Base() {}
    Base.prototype.compile = function(o, lvl) {
      var node;
      o = extend({}, o);
      if (lvl) {
        o.level = lvl;
      }
      node = this.unfoldSoak(o) || this;
      node.tab = o.indent;
      if (o.level === LEVEL_TOP || !node.isStatement(o)) {
        return node.compileNode(o);
      } else {
        return node.compileClosure(o);
      }
    };
    Base.prototype.compileClosure = function(o) {
      if (this.jumps()) {
        throw SyntaxError('cannot use a pure statement in an expression.');
      }
      o.sharedScope = true;
      return Closure.wrap(this).compileNode(o);
    };
    Base.prototype.cache = function(o, level, reused) {
      var ref, sub;
      if (!this.isComplex()) {
        ref = level ? this.compile(o, level) : this;
        return [ref, ref];
      } else {
        ref = new Literal(reused || o.scope.freeVariable('ref'));
        sub = new Assign(ref, this);
        if (level) {
          return [sub.compile(o, level), ref.value];
        } else {
          return [sub, ref];
        }
      }
    };
    Base.prototype.compileLoopReference = function(o, name) {
      var src, tmp;
      src = tmp = this.compile(o, LEVEL_LIST);
      if (!((-Infinity < +src && +src < Infinity) || IDENTIFIER.test(src) && o.scope.check(src, true))) {
        src = "" + (tmp = o.scope.freeVariable(name)) + " = " + src;
      }
      return [src, tmp];
    };
    Base.prototype.makeReturn = function(res) {
      var me;
      me = this.unwrapAll();
      if (res) {
        return new Call(new Literal("" + res + ".push"), [me]);
      } else {
        return new Return(me);
      }
    };
    Base.prototype.contains = function(pred) {
      var contains;
      contains = false;
      this.traverseChildren(false, function(node) {
        if (pred(node)) {
          contains = true;
          return false;
        }
      });
      return contains;
    };
    Base.prototype.containsType = function(type) {
      return this instanceof type || this.contains(function(node) {
        return node instanceof type;
      });
    };
    Base.prototype.lastNonComment = function(list) {
      var i;
      i = list.length;
      while (i--) {
        if (!(list[i] instanceof Comment)) {
          return list[i];
        }
      }
      return null;
    };
    Base.prototype.toString = function(idt, name) {
      var tree;
      if (idt == null) {
        idt = '';
      }
      if (name == null) {
        name = this.constructor.name;
      }
      tree = '\n' + idt + name;
      if (this.soak) {
        tree += '?';
      }
      this.eachChild(function(node) {
        return tree += node.toString(idt + TAB);
      });
      return tree;
    };
    Base.prototype.eachChild = function(func) {
      var attr, child, _i, _j, _len, _len1, _ref2, _ref3;
      if (!this.children) {
        return this;
      }
      _ref2 = this.children;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        attr = _ref2[_i];
        if (this[attr]) {
          _ref3 = flatten([this[attr]]);
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            child = _ref3[_j];
            if (func(child) === false) {
              return this;
            }
          }
        }
      }
      return this;
    };
    Base.prototype.traverseChildren = function(crossScope, func) {
      return this.eachChild(function(child) {
        if (func(child) === false) {
          return false;
        }
        return child.traverseChildren(crossScope, func);
      });
    };
    Base.prototype.invert = function() {
      return new Op('!', this);
    };
    Base.prototype.unwrapAll = function() {
      var node;
      node = this;
      while (node !== (node = node.unwrap())) {
        continue;
      }
      return node;
    };
    Base.prototype.children = [];
    Base.prototype.isStatement = NO;
    Base.prototype.jumps = NO;
    Base.prototype.isComplex = YES;
    Base.prototype.isChainable = NO;
    Base.prototype.isAssignable = NO;
    Base.prototype.unwrap = THIS;
    Base.prototype.unfoldSoak = NO;
    Base.prototype.assigns = NO;
    return Base;
  })();
  exports.Block = Block = (function(_super) {
    __extends(Block, _super);
    Block.name = 'Block';
    function Block(nodes) {
      this.expressions = compact(flatten(nodes || []));
    }
    Block.prototype.children = ['expressions'];
    Block.prototype.push = function(node) {
      this.expressions.push(node);
      return this;
    };
    Block.prototype.pop = function() {
      return this.expressions.pop();
    };
    Block.prototype.unshift = function(node) {
      this.expressions.unshift(node);
      return this;
    };
    Block.prototype.unwrap = function() {
      if (this.expressions.length === 1) {
        return this.expressions[0];
      } else {
        return this;
      }
    };
    Block.prototype.isEmpty = function() {
      return !this.expressions.length;
    };
    Block.prototype.isStatement = function(o) {
      var exp, _i, _len, _ref2;
      _ref2 = this.expressions;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        exp = _ref2[_i];
        if (exp.isStatement(o)) {
          return true;
        }
      }
      return false;
    };
    Block.prototype.jumps = function(o) {
      var exp, _i, _len, _ref2;
      _ref2 = this.expressions;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        exp = _ref2[_i];
        if (exp.jumps(o)) {
          return exp;
        }
      }
    };
    Block.prototype.makeReturn = function(res) {
      var expr, len;
      len = this.expressions.length;
      while (len--) {
        expr = this.expressions[len];
        if (!(expr instanceof Comment)) {
          this.expressions[len] = expr.makeReturn(res);
          if (expr instanceof Return && !expr.expression) {
            this.expressions.splice(len, 1);
          }
          break;
        }
      }
      return this;
    };
    Block.prototype.compile = function(o, level) {
      if (o == null) {
        o = {};
      }
      if (o.scope) {
        return Block.__super__.compile.call(this, o, level);
      } else {
        return this.compileRoot(o);
      }
    };
    Block.prototype.compileNode = function(o) {
      var code, codes, node, top, _i, _len, _ref2;
      this.tab = o.indent;
      top = o.level === LEVEL_TOP;
      codes = [];
      _ref2 = this.expressions;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        node = _ref2[_i];
        node = node.unwrapAll();
        node = node.unfoldSoak(o) || node;
        if (node instanceof Block) {
          codes.push(node.compileNode(o));
        } else if (top) {
          node.front = true;
          code = node.compile(o);
          if (!node.isStatement(o)) {
            code = "" + this.tab + code + ";";
            if (node instanceof Literal) {
              code = "" + code + "\n";
            }
          }
          codes.push(code);
        } else {
          codes.push(node.compile(o, LEVEL_LIST));
        }
      }
      if (top) {
        if (this.spaced) {
          return "\n" + (codes.join('\n\n')) + "\n";
        } else {
          return codes.join('\n');
        }
      }
      code = codes.join(', ') || 'void 0';
      if (codes.length > 1 && o.level >= LEVEL_LIST) {
        return "(" + code + ")";
      } else {
        return code;
      }
    };
    Block.prototype.compileRoot = function(o) {
      var code, exp, i, prelude, preludeExps, rest;
      o.indent = o.bare ? '' : TAB;
      o.scope = new Scope(null, this, null);
      o.level = LEVEL_TOP;
      this.spaced = true;
      prelude = "";
      if (!o.bare) {
        preludeExps = (function() {
          var _i, _len, _ref2, _results;
          _ref2 = this.expressions;
          _results = [];
          for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
            exp = _ref2[i];
            if (!(exp.unwrap() instanceof Comment)) {
              break;
            }
            _results.push(exp);
          }
          return _results;
        }).call(this);
        rest = this.expressions.slice(preludeExps.length);
        this.expressions = preludeExps;
        if (preludeExps.length) {
          prelude = "" + (this.compileNode(merge(o, {
            indent: ''
          }))) + "\n";
        }
        this.expressions = rest;
      }
      code = this.compileWithDeclarations(o);
      if (o.bare) {
        return code;
      }
      return "" + prelude + "(function() {\n" + code + "\n}).call(this);\n";
    };
    Block.prototype.compileWithDeclarations = function(o) {
      var assigns, code, declars, exp, i, post, rest, scope, spaced, _i, _len, _ref2, _ref3, _ref4;
      code = post = '';
      _ref2 = this.expressions;
      for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
        exp = _ref2[i];
        exp = exp.unwrap();
        if (!(exp instanceof Comment || exp instanceof Literal)) {
          break;
        }
      }
      o = merge(o, {
        level: LEVEL_TOP
      });
      if (i) {
        rest = this.expressions.splice(i, 9e9);
        _ref3 = [this.spaced, false], spaced = _ref3[0], this.spaced = _ref3[1];
        _ref4 = [this.compileNode(o), spaced], code = _ref4[0], this.spaced = _ref4[1];
        this.expressions = rest;
      }
      post = this.compileNode(o);
      scope = o.scope;
      if (scope.expressions === this) {
        declars = o.scope.hasDeclarations();
        assigns = scope.hasAssignments;
        if (declars || assigns) {
          if (i) {
            code += '\n';
          }
          code += "" + this.tab + "var ";
          if (declars) {
            code += scope.declaredVariables().join(', ');
          }
          if (assigns) {
            if (declars) {
              code += ",\n" + (this.tab + TAB);
            }
            code += scope.assignedVariables().join(",\n" + (this.tab + TAB));
          }
          code += ';\n';
        }
      }
      return code + post;
    };
    Block.wrap = function(nodes) {
      if (nodes.length === 1 && nodes[0] instanceof Block) {
        return nodes[0];
      }
      return new Block(nodes);
    };
    return Block;
  })(Base);
  exports.Literal = Literal = (function(_super) {
    __extends(Literal, _super);
    Literal.name = 'Literal';
    function Literal(value) {
      this.value = value;
    }
    Literal.prototype.makeReturn = function() {
      if (this.isStatement()) {
        return this;
      } else {
        return Literal.__super__.makeReturn.apply(this, arguments);
      }
    };
    Literal.prototype.isAssignable = function() {
      return IDENTIFIER.test(this.value);
    };
    Literal.prototype.isStatement = function() {
      var _ref2;
      return (_ref2 = this.value) === 'break' || _ref2 === 'continue' || _ref2 === 'debugger';
    };
    Literal.prototype.isComplex = NO;
    Literal.prototype.assigns = function(name) {
      return name === this.value;
    };
    Literal.prototype.jumps = function(o) {
      if (this.value === 'break' && !((o != null ? o.loop : void 0) || (o != null ? o.block : void 0))) {
        return this;
      }
      if (this.value === 'continue' && !(o != null ? o.loop : void 0)) {
        return this;
      }
    };
    Literal.prototype.compileNode = function(o) {
      var code, _ref2;
      code = this.isUndefined ? o.level >= LEVEL_ACCESS ? '(void 0)' : 'void 0' : this.value === 'this' ? ((_ref2 = o.scope.method) != null ? _ref2.bound : void 0) ? o.scope.method.context : this.value : this.value.reserved ? "\"" + this.value + "\"" : this.value;
      if (this.isStatement()) {
        return "" + this.tab + code + ";";
      } else {
        return code;
      }
    };
    Literal.prototype.toString = function() {
      return ' "' + this.value + '"';
    };
    return Literal;
  })(Base);
  exports.Return = Return = (function(_super) {
    __extends(Return, _super);
    Return.name = 'Return';
    function Return(expr) {
      if (expr && !expr.unwrap().isUndefined) {
        this.expression = expr;
      }
    }
    Return.prototype.children = ['expression'];
    Return.prototype.isStatement = YES;
    Return.prototype.makeReturn = THIS;
    Return.prototype.jumps = THIS;
    Return.prototype.compile = function(o, level) {
      var expr, _ref2;
      expr = (_ref2 = this.expression) != null ? _ref2.makeReturn() : void 0;
      if (expr && !(expr instanceof Return)) {
        return expr.compile(o, level);
      } else {
        return Return.__super__.compile.call(this, o, level);
      }
    };
    Return.prototype.compileNode = function(o) {
      return this.tab + ("return" + [this.expression ? " " + (this.expression.compile(o, LEVEL_PAREN)) : void 0] + ";");
    };
    return Return;
  })(Base);
  exports.Value = Value = (function(_super) {
    __extends(Value, _super);
    Value.name = 'Value';
    function Value(base, props, tag) {
      if (!props && base instanceof Value) {
        return base;
      }
      this.base = base;
      this.properties = props || [];
      if (tag) {
        this[tag] = true;
      }
      return this;
    }
    Value.prototype.children = ['base', 'properties'];
    Value.prototype.add = function(props) {
      this.properties = this.properties.concat(props);
      return this;
    };
    Value.prototype.hasProperties = function() {
      return !!this.properties.length;
    };
    Value.prototype.isArray = function() {
      return !this.properties.length && this.base instanceof Arr;
    };
    Value.prototype.isComplex = function() {
      return this.hasProperties() || this.base.isComplex();
    };
    Value.prototype.isAssignable = function() {
      return this.hasProperties() || this.base.isAssignable();
    };
    Value.prototype.isSimpleNumber = function() {
      return this.base instanceof Literal && SIMPLENUM.test(this.base.value);
    };
    Value.prototype.isString = function() {
      return this.base instanceof Literal && IS_STRING.test(this.base.value);
    };
    Value.prototype.isAtomic = function() {
      var node, _i, _len, _ref2;
      _ref2 = this.properties.concat(this.base);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        node = _ref2[_i];
        if (node.soak || node instanceof Call) {
          return false;
        }
      }
      return true;
    };
    Value.prototype.isStatement = function(o) {
      return !this.properties.length && this.base.isStatement(o);
    };
    Value.prototype.assigns = function(name) {
      return !this.properties.length && this.base.assigns(name);
    };
    Value.prototype.jumps = function(o) {
      return !this.properties.length && this.base.jumps(o);
    };
    Value.prototype.isObject = function(onlyGenerated) {
      if (this.properties.length) {
        return false;
      }
      return (this.base instanceof Obj) && (!onlyGenerated || this.base.generated);
    };
    Value.prototype.isSplice = function() {
      return last(this.properties) instanceof Slice;
    };
    Value.prototype.unwrap = function() {
      if (this.properties.length) {
        return this;
      } else {
        return this.base;
      }
    };
    Value.prototype.cacheReference = function(o) {
      var base, bref, name, nref;
      name = last(this.properties);
      if (this.properties.length < 2 && !this.base.isComplex() && !(name != null ? name.isComplex() : void 0)) {
        return [this, this];
      }
      base = new Value(this.base, this.properties.slice(0, -1));
      if (base.isComplex()) {
        bref = new Literal(o.scope.freeVariable('base'));
        base = new Value(new Parens(new Assign(bref, base)));
      }
      if (!name) {
        return [base, bref];
      }
      if (name.isComplex()) {
        nref = new Literal(o.scope.freeVariable('name'));
        name = new Index(new Assign(nref, name.index));
        nref = new Index(nref);
      }
      return [base.add(name), new Value(bref || base.base, [nref || name])];
    };
    Value.prototype.compileNode = function(o) {
      var code, prop, props, _i, _len;
      this.base.front = this.front;
      props = this.properties;
      code = this.base.compile(o, props.length ? LEVEL_ACCESS : null);
      if ((this.base instanceof Parens || props.length) && SIMPLENUM.test(code)) {
        code = "" + code + ".";
      }
      for (_i = 0, _len = props.length; _i < _len; _i++) {
        prop = props[_i];
        code += prop.compile(o);
      }
      return code;
    };
    Value.prototype.unfoldSoak = function(o) {
      var result,
        _this = this;
      if (this.unfoldedSoak != null) {
        return this.unfoldedSoak;
      }
      result = (function() {
        var fst, i, ifn, prop, ref, snd, _i, _len, _ref2;
        if (ifn = _this.base.unfoldSoak(o)) {
          Array.prototype.push.apply(ifn.body.properties, _this.properties);
          return ifn;
        }
        _ref2 = _this.properties;
        for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
          prop = _ref2[i];
          if (!prop.soak) {
            continue;
          }
          prop.soak = false;
          fst = new Value(_this.base, _this.properties.slice(0, i));
          snd = new Value(_this.base, _this.properties.slice(i));
          if (fst.isComplex()) {
            ref = new Literal(o.scope.freeVariable('ref'));
            fst = new Parens(new Assign(ref, fst));
            snd.base = ref;
          }
          return new If(new Existence(fst), snd, {
            soak: true
          });
        }
        return null;
      })();
      return this.unfoldedSoak = result || false;
    };
    return Value;
  })(Base);
  exports.Comment = Comment = (function(_super) {
    __extends(Comment, _super);
    Comment.name = 'Comment';
    function Comment(comment) {
      this.comment = comment;
    }
    Comment.prototype.isStatement = YES;
    Comment.prototype.makeReturn = THIS;
    Comment.prototype.compileNode = function(o, level) {
      var code;
      code = '/*' + multident(this.comment, this.tab) + ("\n" + this.tab + "*/\n");
      if ((level || o.level) === LEVEL_TOP) {
        code = o.indent + code;
      }
      return code;
    };
    return Comment;
  })(Base);
  exports.Call = Call = (function(_super) {
    __extends(Call, _super);
    Call.name = 'Call';
    function Call(variable, args, soak) {
      this.args = args != null ? args : [];
      this.soak = soak;
      this.isNew = false;
      this.isSuper = variable === 'super';
      this.variable = this.isSuper ? null : variable;
    }
    Call.prototype.children = ['variable', 'args'];
    Call.prototype.newInstance = function() {
      var base, _ref2;
      base = ((_ref2 = this.variable) != null ? _ref2.base : void 0) || this.variable;
      if (base instanceof Call && !base.isNew) {
        base.newInstance();
      } else {
        this.isNew = true;
      }
      return this;
    };
    Call.prototype.superReference = function(o) {
      var accesses, method, name;
      method = o.scope.method;
      if (!method) {
        throw SyntaxError('cannot call super outside of a function.');
      }
      name = method.name;
      if (name == null) {
        throw SyntaxError('cannot call super on an anonymous function.');
      }
      if (method.klass) {
        accesses = [new Access(new Literal('__super__'))];
        if (method["static"]) {
          accesses.push(new Access(new Literal('constructor')));
        }
        accesses.push(new Access(new Literal(name)));
        return (new Value(new Literal(method.klass), accesses)).compile(o);
      } else {
        return "" + name + ".__super__.constructor";
      }
    };
    Call.prototype.unfoldSoak = function(o) {
      var call, ifn, left, list, rite, _i, _len, _ref2, _ref3;
      if (this.soak) {
        if (this.variable) {
          if (ifn = unfoldSoak(o, this, 'variable')) {
            return ifn;
          }
          _ref2 = new Value(this.variable).cacheReference(o), left = _ref2[0], rite = _ref2[1];
        } else {
          left = new Literal(this.superReference(o));
          rite = new Value(left);
        }
        rite = new Call(rite, this.args);
        rite.isNew = this.isNew;
        left = new Literal("typeof " + (left.compile(o)) + " === \"function\"");
        return new If(left, new Value(rite), {
          soak: true
        });
      }
      call = this;
      list = [];
      while (true) {
        if (call.variable instanceof Call) {
          list.push(call);
          call = call.variable;
          continue;
        }
        if (!(call.variable instanceof Value)) {
          break;
        }
        list.push(call);
        if (!((call = call.variable.base) instanceof Call)) {
          break;
        }
      }
      _ref3 = list.reverse();
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        call = _ref3[_i];
        if (ifn) {
          if (call.variable instanceof Call) {
            call.variable = ifn;
          } else {
            call.variable.base = ifn;
          }
        }
        ifn = unfoldSoak(o, call, 'variable');
      }
      return ifn;
    };
    Call.prototype.filterImplicitObjects = function(list) {
      var node, nodes, obj, prop, properties, _i, _j, _len, _len1, _ref2;
      nodes = [];
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        node = list[_i];
        if (!((typeof node.isObject === "function" ? node.isObject() : void 0) && node.base.generated)) {
          nodes.push(node);
          continue;
        }
        obj = null;
        _ref2 = node.base.properties;
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          prop = _ref2[_j];
          if (prop instanceof Assign || prop instanceof Comment) {
            if (!obj) {
              nodes.push(obj = new Obj(properties = [], true));
            }
            properties.push(prop);
          } else {
            nodes.push(prop);
            obj = null;
          }
        }
      }
      return nodes;
    };
    Call.prototype.compileNode = function(o) {
      var arg, args, code, _ref2;
      if ((_ref2 = this.variable) != null) {
        _ref2.front = this.front;
      }
      if (code = Splat.compileSplattedArray(o, this.args, true)) {
        return this.compileSplat(o, code);
      }
      args = this.filterImplicitObjects(this.args);
      args = ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          arg = args[_i];
          _results.push(arg.compile(o, LEVEL_LIST));
        }
        return _results;
      })()).join(', ');
      if (this.isSuper) {
        return this.superReference(o) + (".call(this" + (args && ', ' + args) + ")");
      } else {
        return (this.isNew ? 'new ' : '') + this.variable.compile(o, LEVEL_ACCESS) + ("(" + args + ")");
      }
    };
    Call.prototype.compileSuper = function(args, o) {
      return "" + (this.superReference(o)) + ".call(this" + (args.length ? ', ' : '') + args + ")";
    };
    Call.prototype.compileSplat = function(o, splatArgs) {
      var base, fun, idt, name, ref;
      if (this.isSuper) {
        return "" + (this.superReference(o)) + ".apply(this, " + splatArgs + ")";
      }
      if (this.isNew) {
        idt = this.tab + TAB;
        return "(function(func, args, ctor) {\n" + idt + "ctor.prototype = func.prototype;\n" + idt + "var child = new ctor, result = func.apply(child, args), t = typeof result;\n" + idt + "return t == \"object\" || t == \"function\" ? result || child : child;\n" + this.tab + "})(" + (this.variable.compile(o, LEVEL_LIST)) + ", " + splatArgs + ", function(){})";
      }
      base = new Value(this.variable);
      if ((name = base.properties.pop()) && base.isComplex()) {
        ref = o.scope.freeVariable('ref');
        fun = "(" + ref + " = " + (base.compile(o, LEVEL_LIST)) + ")" + (name.compile(o));
      } else {
        fun = base.compile(o, LEVEL_ACCESS);
        if (SIMPLENUM.test(fun)) {
          fun = "(" + fun + ")";
        }
        if (name) {
          ref = fun;
          fun += name.compile(o);
        } else {
          ref = 'null';
        }
      }
      return "" + fun + ".apply(" + ref + ", " + splatArgs + ")";
    };
    return Call;
  })(Base);
  exports.Extends = Extends = (function(_super) {
    __extends(Extends, _super);
    Extends.name = 'Extends';
    function Extends(child, parent) {
      this.child = child;
      this.parent = parent;
    }
    Extends.prototype.children = ['child', 'parent'];
    Extends.prototype.compile = function(o) {
      return new Call(new Value(new Literal(utility('extends'))), [this.child, this.parent]).compile(o);
    };
    return Extends;
  })(Base);
  exports.Access = Access = (function(_super) {
    __extends(Access, _super);
    Access.name = 'Access';
    function Access(name, tag) {
      this.name = name;
      this.name.asKey = true;
      this.soak = tag === 'soak';
    }
    Access.prototype.children = ['name'];
    Access.prototype.compile = function(o) {
      var name;
      name = this.name.compile(o);
      if (IDENTIFIER.test(name)) {
        return "." + name;
      } else {
        return "[" + name + "]";
      }
    };
    Access.prototype.isComplex = NO;
    return Access;
  })(Base);
  exports.Index = Index = (function(_super) {
    __extends(Index, _super);
    Index.name = 'Index';
    function Index(index) {
      this.index = index;
    }
    Index.prototype.children = ['index'];
    Index.prototype.compile = function(o) {
      return "[" + (this.index.compile(o, LEVEL_PAREN)) + "]";
    };
    Index.prototype.isComplex = function() {
      return this.index.isComplex();
    };
    return Index;
  })(Base);
  exports.Range = Range = (function(_super) {
    __extends(Range, _super);
    Range.name = 'Range';
    Range.prototype.children = ['from', 'to'];
    function Range(from, to, tag) {
      this.from = from;
      this.to = to;
      this.exclusive = tag === 'exclusive';
      this.equals = this.exclusive ? '' : '=';
    }
    Range.prototype.compileVariables = function(o) {
      var step, _ref2, _ref3, _ref4, _ref5;
      o = merge(o, {
        top: true
      });
      _ref2 = this.from.cache(o, LEVEL_LIST), this.fromC = _ref2[0], this.fromVar = _ref2[1];
      _ref3 = this.to.cache(o, LEVEL_LIST), this.toC = _ref3[0], this.toVar = _ref3[1];
      if (step = del(o, 'step')) {
        _ref4 = step.cache(o, LEVEL_LIST), this.step = _ref4[0], this.stepVar = _ref4[1];
      }
      _ref5 = [this.fromVar.match(SIMPLENUM), this.toVar.match(SIMPLENUM)], this.fromNum = _ref5[0], this.toNum = _ref5[1];
      if (this.stepVar) {
        return this.stepNum = this.stepVar.match(SIMPLENUM);
      }
    };
    Range.prototype.compileNode = function(o) {
      var cond, condPart, from, gt, idx, idxName, known, lt, namedIndex, stepPart, to, varPart, _ref2, _ref3;
      if (!this.fromVar) {
        this.compileVariables(o);
      }
      if (!o.index) {
        return this.compileArray(o);
      }
      known = this.fromNum && this.toNum;
      idx = del(o, 'index');
      idxName = del(o, 'name');
      namedIndex = idxName && idxName !== idx;
      varPart = "" + idx + " = " + this.fromC;
      if (this.toC !== this.toVar) {
        varPart += ", " + this.toC;
      }
      if (this.step !== this.stepVar) {
        varPart += ", " + this.step;
      }
      _ref2 = ["" + idx + " <" + this.equals, "" + idx + " >" + this.equals], lt = _ref2[0], gt = _ref2[1];
      condPart = this.stepNum ? +this.stepNum > 0 ? "" + lt + " " + this.toVar : "" + gt + " " + this.toVar : known ? ((_ref3 = [+this.fromNum, +this.toNum], from = _ref3[0], to = _ref3[1], _ref3), from <= to ? "" + lt + " " + to : "" + gt + " " + to) : (cond = "" + this.fromVar + " <= " + this.toVar, "" + cond + " ? " + lt + " " + this.toVar + " : " + gt + " " + this.toVar);
      stepPart = this.stepVar ? "" + idx + " += " + this.stepVar : known ? namedIndex ? from <= to ? "++" + idx : "--" + idx : from <= to ? "" + idx + "++" : "" + idx + "--" : namedIndex ? "" + cond + " ? ++" + idx + " : --" + idx : "" + cond + " ? " + idx + "++ : " + idx + "--";
      if (namedIndex) {
        varPart = "" + idxName + " = " + varPart;
      }
      if (namedIndex) {
        stepPart = "" + idxName + " = " + stepPart;
      }
      return "" + varPart + "; " + condPart + "; " + stepPart;
    };
    Range.prototype.compileArray = function(o) {
      var args, body, cond, hasArgs, i, idt, post, pre, range, result, vars, _i, _ref2, _ref3, _results;
      if (this.fromNum && this.toNum && Math.abs(this.fromNum - this.toNum) <= 20) {
        range = (function() {
          _results = [];
          for (var _i = _ref2 = +this.fromNum, _ref3 = +this.toNum; _ref2 <= _ref3 ? _i <= _ref3 : _i >= _ref3; _ref2 <= _ref3 ? _i++ : _i--){ _results.push(_i); }
          return _results;
        }).apply(this);
        if (this.exclusive) {
          range.pop();
        }
        return "[" + (range.join(', ')) + "]";
      }
      idt = this.tab + TAB;
      i = o.scope.freeVariable('i');
      result = o.scope.freeVariable('results');
      pre = "\n" + idt + result + " = [];";
      if (this.fromNum && this.toNum) {
        o.index = i;
        body = this.compileNode(o);
      } else {
        vars = ("" + i + " = " + this.fromC) + (this.toC !== this.toVar ? ", " + this.toC : '');
        cond = "" + this.fromVar + " <= " + this.toVar;
        body = "var " + vars + "; " + cond + " ? " + i + " <" + this.equals + " " + this.toVar + " : " + i + " >" + this.equals + " " + this.toVar + "; " + cond + " ? " + i + "++ : " + i + "--";
      }
      post = "{ " + result + ".push(" + i + "); }\n" + idt + "return " + result + ";\n" + o.indent;
      hasArgs = function(node) {
        return node != null ? node.contains(function(n) {
          return n instanceof Literal && n.value === 'arguments' && !n.asKey;
        }) : void 0;
      };
      if (hasArgs(this.from) || hasArgs(this.to)) {
        args = ', arguments';
      }
      return "(function() {" + pre + "\n" + idt + "for (" + body + ")" + post + "}).apply(this" + (args != null ? args : '') + ")";
    };
    return Range;
  })(Base);
  exports.Slice = Slice = (function(_super) {
    __extends(Slice, _super);
    Slice.name = 'Slice';
    Slice.prototype.children = ['range'];
    function Slice(range) {
      this.range = range;
      Slice.__super__.constructor.call(this);
    }
    Slice.prototype.compileNode = function(o) {
      var compiled, from, fromStr, to, toStr, _ref2;
      _ref2 = this.range, to = _ref2.to, from = _ref2.from;
      fromStr = from && from.compile(o, LEVEL_PAREN) || '0';
      compiled = to && to.compile(o, LEVEL_PAREN);
      if (to && !(!this.range.exclusive && +compiled === -1)) {
        toStr = ', ' + (this.range.exclusive ? compiled : SIMPLENUM.test(compiled) ? "" + (+compiled + 1) : (compiled = to.compile(o, LEVEL_ACCESS), "" + compiled + " + 1 || 9e9"));
      }
      return ".slice(" + fromStr + (toStr || '') + ")";
    };
    return Slice;
  })(Base);
  exports.Obj = Obj = (function(_super) {
    __extends(Obj, _super);
    Obj.name = 'Obj';
    function Obj(props, generated) {
      this.generated = generated != null ? generated : false;
      this.objects = this.properties = props || [];
    }
    Obj.prototype.children = ['properties'];
    Obj.prototype.compileNode = function(o) {
      var i, idt, indent, join, lastNoncom, node, obj, prop, propName, propNames, props, _i, _j, _len, _len1, _ref2;
      props = this.properties;
      propNames = [];
      _ref2 = this.properties;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        prop = _ref2[_i];
        if (prop.isComplex()) {
          prop = prop.variable;
        }
        if (prop != null) {
          propName = prop.unwrapAll().value.toString();
          if (__indexOf.call(propNames, propName) >= 0) {
            throw SyntaxError("multiple object literal properties named \"" + propName + "\"");
          }
          propNames.push(propName);
        }
      }
      if (!props.length) {
        return (this.front ? '({})' : '{}');
      }
      if (this.generated) {
        for (_j = 0, _len1 = props.length; _j < _len1; _j++) {
          node = props[_j];
          if (node instanceof Value) {
            throw new Error('cannot have an implicit value in an implicit object');
          }
        }
      }
      idt = o.indent += TAB;
      lastNoncom = this.lastNonComment(this.properties);
      props = (function() {
        var _k, _len2, _results;
        _results = [];
        for (i = _k = 0, _len2 = props.length; _k < _len2; i = ++_k) {
          prop = props[i];
          join = i === props.length - 1 ? '' : prop === lastNoncom || prop instanceof Comment ? '\n' : ',\n';
          indent = prop instanceof Comment ? '' : idt;
          if (prop instanceof Value && prop["this"]) {
            prop = new Assign(prop.properties[0].name, prop, 'object');
          }
          if (!(prop instanceof Comment)) {
            if (!(prop instanceof Assign)) {
              prop = new Assign(prop, prop, 'object');
            }
            (prop.variable.base || prop.variable).asKey = true;
          }
          _results.push(indent + prop.compile(o, LEVEL_TOP) + join);
        }
        return _results;
      })();
      props = props.join('');
      obj = "{" + (props && '\n' + props + '\n' + this.tab) + "}";
      if (this.front) {
        return "(" + obj + ")";
      } else {
        return obj;
      }
    };
    Obj.prototype.assigns = function(name) {
      var prop, _i, _len, _ref2;
      _ref2 = this.properties;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        prop = _ref2[_i];
        if (prop.assigns(name)) {
          return true;
        }
      }
      return false;
    };
    return Obj;
  })(Base);
  exports.Arr = Arr = (function(_super) {
    __extends(Arr, _super);
    Arr.name = 'Arr';
    function Arr(objs) {
      this.objects = objs || [];
    }
    Arr.prototype.children = ['objects'];
    Arr.prototype.filterImplicitObjects = Call.prototype.filterImplicitObjects;
    Arr.prototype.compileNode = function(o) {
      var code, obj, objs;
      if (!this.objects.length) {
        return '[]';
      }
      o.indent += TAB;
      objs = this.filterImplicitObjects(this.objects);
      if (code = Splat.compileSplattedArray(o, objs)) {
        return code;
      }
      code = ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = objs.length; _i < _len; _i++) {
          obj = objs[_i];
          _results.push(obj.compile(o, LEVEL_LIST));
        }
        return _results;
      })()).join(', ');
      if (code.indexOf('\n') >= 0) {
        return "[\n" + o.indent + code + "\n" + this.tab + "]";
      } else {
        return "[" + code + "]";
      }
    };
    Arr.prototype.assigns = function(name) {
      var obj, _i, _len, _ref2;
      _ref2 = this.objects;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        obj = _ref2[_i];
        if (obj.assigns(name)) {
          return true;
        }
      }
      return false;
    };
    return Arr;
  })(Base);
  exports.Class = Class = (function(_super) {
    __extends(Class, _super);
    Class.name = 'Class';
    function Class(variable, parent, body) {
      this.variable = variable;
      this.parent = parent;
      this.body = body != null ? body : new Block;
      this.boundFuncs = [];
      this.body.classBody = true;
    }
    Class.prototype.children = ['variable', 'parent', 'body'];
    Class.prototype.determineName = function() {
      var decl, tail;
      if (!this.variable) {
        return null;
      }
      decl = (tail = last(this.variable.properties)) ? tail instanceof Access && tail.name.value : this.variable.base.value;
      if (__indexOf.call(STRICT_PROSCRIBED, decl) >= 0) {
        throw SyntaxError("variable name may not be " + decl);
      }
      return decl && (decl = IDENTIFIER.test(decl) && decl);
    };
    Class.prototype.setContext = function(name) {
      return this.body.traverseChildren(false, function(node) {
        if (node.classBody) {
          return false;
        }
        if (node instanceof Literal && node.value === 'this') {
          return node.value = name;
        } else if (node instanceof Code) {
          node.klass = name;
          if (node.bound) {
            return node.context = name;
          }
        }
      });
    };
    Class.prototype.addBoundFunctions = function(o) {
      var bvar, lhs, _i, _len, _ref2, _results;
      if (this.boundFuncs.length) {
        _ref2 = this.boundFuncs;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          bvar = _ref2[_i];
          lhs = (new Value(new Literal("this"), [new Access(bvar)])).compile(o);
          _results.push(this.ctor.body.unshift(new Literal("" + lhs + " = " + (utility('bind')) + "(" + lhs + ", this)")));
        }
        return _results;
      }
    };
    Class.prototype.addProperties = function(node, name, o) {
      var assign, base, exprs, func, props;
      props = node.base.properties.slice(0);
      exprs = (function() {
        var _results;
        _results = [];
        while (assign = props.shift()) {
          if (assign instanceof Assign) {
            base = assign.variable.base;
            delete assign.context;
            func = assign.value;
            if (base.value === 'constructor') {
              if (this.ctor) {
                throw new Error('cannot define more than one constructor in a class');
              }
              if (func.bound) {
                throw new Error('cannot define a constructor as a bound function');
              }
              if (func instanceof Code) {
                assign = this.ctor = func;
              } else {
                this.externalCtor = o.scope.freeVariable('class');
                assign = new Assign(new Literal(this.externalCtor), func);
              }
            } else {
              if (assign.variable["this"]) {
                func["static"] = true;
                if (func.bound) {
                  func.context = name;
                }
              } else {
                assign.variable = new Value(new Literal(name), [new Access(new Literal('prototype')), new Access(base)]);
                if (func instanceof Code && func.bound) {
                  this.boundFuncs.push(base);
                  func.bound = false;
                }
              }
            }
          }
          _results.push(assign);
        }
        return _results;
      }).call(this);
      return compact(exprs);
    };
    Class.prototype.walkBody = function(name, o) {
      var _this = this;
      return this.traverseChildren(false, function(child) {
        var exps, i, node, _i, _len, _ref2;
        if (child instanceof Class) {
          return false;
        }
        if (child instanceof Block) {
          _ref2 = exps = child.expressions;
          for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
            node = _ref2[i];
            if (node instanceof Value && node.isObject(true)) {
              exps[i] = _this.addProperties(node, name, o);
            }
          }
          return child.expressions = exps = flatten(exps);
        }
      });
    };
    Class.prototype.hoistDirectivePrologue = function() {
      var expressions, index, node;
      index = 0;
      expressions = this.body.expressions;
      while ((node = expressions[index]) && node instanceof Comment || node instanceof Value && node.isString()) {
        ++index;
      }
      return this.directives = expressions.splice(0, index);
    };
    Class.prototype.ensureConstructor = function(name) {
      if (!this.ctor) {
        this.ctor = new Code;
        if (this.parent) {
          this.ctor.body.push(new Literal("" + name + ".__super__.constructor.apply(this, arguments)"));
        }
        if (this.externalCtor) {
          this.ctor.body.push(new Literal("" + this.externalCtor + ".apply(this, arguments)"));
        }
        this.ctor.body.makeReturn();
        this.body.expressions.unshift(this.ctor);
      }
      this.ctor.ctor = this.ctor.name = name;
      this.ctor.klass = null;
      return this.ctor.noReturn = true;
    };
    Class.prototype.compileNode = function(o) {
      var call, decl, klass, lname, name, params, _ref2;
      decl = this.determineName();
      name = decl || '_Class';
      if (name.reserved) {
        name = "_" + name;
      }
      lname = new Literal(name);
      this.hoistDirectivePrologue();
      this.setContext(name);
      this.walkBody(name, o);
      this.ensureConstructor(name);
      this.body.spaced = true;
      if (!(this.ctor instanceof Code)) {
        this.body.expressions.unshift(this.ctor);
      }
      if (decl) {
        this.body.expressions.unshift(new Assign(new Value(new Literal(name), [new Access(new Literal('name'))]), new Literal("'" + name + "'")));
      }
      this.body.expressions.push(lname);
      (_ref2 = this.body.expressions).unshift.apply(_ref2, this.directives);
      this.addBoundFunctions(o);
      call = Closure.wrap(this.body);
      if (this.parent) {
        this.superClass = new Literal(o.scope.freeVariable('super', false));
        this.body.expressions.unshift(new Extends(lname, this.superClass));
        call.args.push(this.parent);
        params = call.variable.params || call.variable.base.params;
        params.push(new Param(this.superClass));
      }
      klass = new Parens(call, true);
      if (this.variable) {
        klass = new Assign(this.variable, klass);
      }
      return klass.compile(o);
    };
    return Class;
  })(Base);
  exports.Assign = Assign = (function(_super) {
    __extends(Assign, _super);
    Assign.name = 'Assign';
    function Assign(variable, value, context, options) {
      var forbidden, name, _ref2;
      this.variable = variable;
      this.value = value;
      this.context = context;
      this.param = options && options.param;
      this.subpattern = options && options.subpattern;
      forbidden = (_ref2 = (name = this.variable.unwrapAll().value), __indexOf.call(STRICT_PROSCRIBED, _ref2) >= 0);
      if (forbidden && this.context !== 'object') {
        throw SyntaxError("variable name may not be \"" + name + "\"");
      }
    }
    Assign.prototype.children = ['variable', 'value'];
    Assign.prototype.isStatement = function(o) {
      return (o != null ? o.level : void 0) === LEVEL_TOP && (this.context != null) && __indexOf.call(this.context, "?") >= 0;
    };
    Assign.prototype.assigns = function(name) {
      return this[this.context === 'object' ? 'value' : 'variable'].assigns(name);
    };
    Assign.prototype.unfoldSoak = function(o) {
      return unfoldSoak(o, this, 'variable');
    };
    Assign.prototype.compileNode = function(o) {
      var isValue, match, name, val, varBase, _ref2, _ref3, _ref4, _ref5;
      if (isValue = this.variable instanceof Value) {
        if (this.variable.isArray() || this.variable.isObject()) {
          return this.compilePatternMatch(o);
        }
        if (this.variable.isSplice()) {
          return this.compileSplice(o);
        }
        if ((_ref2 = this.context) === '||=' || _ref2 === '&&=' || _ref2 === '?=') {
          return this.compileConditional(o);
        }
      }
      name = this.variable.compile(o, LEVEL_LIST);
      if (!this.context) {
        if (!(varBase = this.variable.unwrapAll()).isAssignable()) {
          throw SyntaxError("\"" + (this.variable.compile(o)) + "\" cannot be assigned.");
        }
        if (!(typeof varBase.hasProperties === "function" ? varBase.hasProperties() : void 0)) {
          if (this.param) {
            o.scope.add(name, 'var');
          } else {
            o.scope.find(name);
          }
        }
      }
      if (this.value instanceof Code && (match = METHOD_DEF.exec(name))) {
        if (match[1]) {
          this.value.klass = match[1];
        }
        this.value.name = (_ref3 = (_ref4 = (_ref5 = match[2]) != null ? _ref5 : match[3]) != null ? _ref4 : match[4]) != null ? _ref3 : match[5];
      }
      val = this.value.compile(o, LEVEL_LIST);
      if (this.context === 'object') {
        return "" + name + ": " + val;
      }
      val = name + (" " + (this.context || '=') + " ") + val;
      if (o.level <= LEVEL_LIST) {
        return val;
      } else {
        return "(" + val + ")";
      }
    };
    Assign.prototype.compilePatternMatch = function(o) {
      var acc, assigns, code, i, idx, isObject, ivar, name, obj, objects, olen, ref, rest, splat, top, val, value, vvar, _i, _len, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
      top = o.level === LEVEL_TOP;
      value = this.value;
      objects = this.variable.base.objects;
      if (!(olen = objects.length)) {
        code = value.compile(o);
        if (o.level >= LEVEL_OP) {
          return "(" + code + ")";
        } else {
          return code;
        }
      }
      isObject = this.variable.isObject();
      if (top && olen === 1 && !((obj = objects[0]) instanceof Splat)) {
        if (obj instanceof Assign) {
          _ref2 = obj, (_ref3 = _ref2.variable, idx = _ref3.base), obj = _ref2.value;
        } else {
          if (obj.base instanceof Parens) {
            _ref4 = new Value(obj.unwrapAll()).cacheReference(o), obj = _ref4[0], idx = _ref4[1];
          } else {
            idx = isObject ? obj["this"] ? obj.properties[0].name : obj : new Literal(0);
          }
        }
        acc = IDENTIFIER.test(idx.unwrap().value || 0);
        value = new Value(value);
        value.properties.push(new (acc ? Access : Index)(idx));
        if (_ref5 = obj.unwrap().value, __indexOf.call(RESERVED, _ref5) >= 0) {
          throw new SyntaxError("assignment to a reserved word: " + (obj.compile(o)) + " = " + (value.compile(o)));
        }
        return new Assign(obj, value, null, {
          param: this.param
        }).compile(o, LEVEL_TOP);
      }
      vvar = value.compile(o, LEVEL_LIST);
      assigns = [];
      splat = false;
      if (!IDENTIFIER.test(vvar) || this.variable.assigns(vvar)) {
        assigns.push("" + (ref = o.scope.freeVariable('ref')) + " = " + vvar);
        vvar = ref;
      }
      for (i = _i = 0, _len = objects.length; _i < _len; i = ++_i) {
        obj = objects[i];
        idx = i;
        if (isObject) {
          if (obj instanceof Assign) {
            _ref6 = obj, (_ref7 = _ref6.variable, idx = _ref7.base), obj = _ref6.value;
          } else {
            if (obj.base instanceof Parens) {
              _ref8 = new Value(obj.unwrapAll()).cacheReference(o), obj = _ref8[0], idx = _ref8[1];
            } else {
              idx = obj["this"] ? obj.properties[0].name : obj;
            }
          }
        }
        if (!splat && obj instanceof Splat) {
          name = obj.name.unwrap().value;
          obj = obj.unwrap();
          val = "" + olen + " <= " + vvar + ".length ? " + (utility('slice')) + ".call(" + vvar + ", " + i;
          if (rest = olen - i - 1) {
            ivar = o.scope.freeVariable('i');
            val += ", " + ivar + " = " + vvar + ".length - " + rest + ") : (" + ivar + " = " + i + ", [])";
          } else {
            val += ") : []";
          }
          val = new Literal(val);
          splat = "" + ivar + "++";
        } else {
          name = obj.unwrap().value;
          if (obj instanceof Splat) {
            obj = obj.name.compile(o);
            throw new SyntaxError("multiple splats are disallowed in an assignment: " + obj + "...");
          }
          if (typeof idx === 'number') {
            idx = new Literal(splat || idx);
            acc = false;
          } else {
            acc = isObject && IDENTIFIER.test(idx.unwrap().value || 0);
          }
          val = new Value(new Literal(vvar), [new (acc ? Access : Index)(idx)]);
        }
        if ((name != null) && __indexOf.call(RESERVED, name) >= 0) {
          throw new SyntaxError("assignment to a reserved word: " + (obj.compile(o)) + " = " + (val.compile(o)));
        }
        assigns.push(new Assign(obj, val, null, {
          param: this.param,
          subpattern: true
        }).compile(o, LEVEL_LIST));
      }
      if (!(top || this.subpattern)) {
        assigns.push(vvar);
      }
      code = assigns.join(', ');
      if (o.level < LEVEL_LIST) {
        return code;
      } else {
        return "(" + code + ")";
      }
    };
    Assign.prototype.compileConditional = function(o) {
      var left, right, _ref2;
      _ref2 = this.variable.cacheReference(o), left = _ref2[0], right = _ref2[1];
      if (!left.properties.length && left.base instanceof Literal && left.base.value !== "this" && !o.scope.check(left.base.value)) {
        throw new Error("the variable \"" + left.base.value + "\" can't be assigned with " + this.context + " because it has not been defined.");
      }
      if (__indexOf.call(this.context, "?") >= 0) {
        o.isExistentialEquals = true;
      }
      return new Op(this.context.slice(0, -1), left, new Assign(right, this.value, '=')).compile(o);
    };
    Assign.prototype.compileSplice = function(o) {
      var code, exclusive, from, fromDecl, fromRef, name, to, valDef, valRef, _ref2, _ref3, _ref4;
      _ref2 = this.variable.properties.pop().range, from = _ref2.from, to = _ref2.to, exclusive = _ref2.exclusive;
      name = this.variable.compile(o);
      _ref3 = (from != null ? from.cache(o, LEVEL_OP) : void 0) || ['0', '0'], fromDecl = _ref3[0], fromRef = _ref3[1];
      if (to) {
        if ((from != null ? from.isSimpleNumber() : void 0) && to.isSimpleNumber()) {
          to = +to.compile(o) - +fromRef;
          if (!exclusive) {
            to += 1;
          }
        } else {
          to = to.compile(o, LEVEL_ACCESS) + ' - ' + fromRef;
          if (!exclusive) {
            to += ' + 1';
          }
        }
      } else {
        to = "9e9";
      }
      _ref4 = this.value.cache(o, LEVEL_LIST), valDef = _ref4[0], valRef = _ref4[1];
      code = "[].splice.apply(" + name + ", [" + fromDecl + ", " + to + "].concat(" + valDef + ")), " + valRef;
      if (o.level > LEVEL_TOP) {
        return "(" + code + ")";
      } else {
        return code;
      }
    };
    return Assign;
  })(Base);
  exports.Code = Code = (function(_super) {
    __extends(Code, _super);
    Code.name = 'Code';
    function Code(params, body, tag) {
      this.params = params || [];
      this.body = body || new Block;
      this.bound = tag === 'boundfunc';
      if (this.bound) {
        this.context = '_this';
      }
    }
    Code.prototype.children = ['params', 'body'];
    Code.prototype.isStatement = function() {
      return !!this.ctor;
    };
    Code.prototype.jumps = NO;
    Code.prototype.compileNode = function(o) {
      var code, exprs, i, idt, lit, name, p, param, params, ref, splats, uniqs, val, wasEmpty, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
      o.scope = new Scope(o.scope, this.body, this);
      o.scope.shared = del(o, 'sharedScope');
      o.indent += TAB;
      delete o.bare;
      delete o.isExistentialEquals;
      params = [];
      exprs = [];
      _ref2 = this.paramNames();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        name = _ref2[_i];
        if (!o.scope.check(name)) {
          o.scope.parameter(name);
        }
      }
      _ref3 = this.params;
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        param = _ref3[_j];
        if (!param.splat) {
          continue;
        }
        _ref4 = this.params;
        for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
          p = _ref4[_k];
          if (p.name.value) {
            o.scope.add(p.name.value, 'var', true);
          }
        }
        splats = new Assign(new Value(new Arr((function() {
          var _l, _len3, _ref5, _results;
          _ref5 = this.params;
          _results = [];
          for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
            p = _ref5[_l];
            _results.push(p.asReference(o));
          }
          return _results;
        }).call(this))), new Value(new Literal('arguments')));
        break;
      }
      _ref5 = this.params;
      for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
        param = _ref5[_l];
        if (param.isComplex()) {
          val = ref = param.asReference(o);
          if (param.value) {
            val = new Op('?', ref, param.value);
          }
          exprs.push(new Assign(new Value(param.name), val, '=', {
            param: true
          }));
        } else {
          ref = param;
          if (param.value) {
            lit = new Literal(ref.name.value + ' == null');
            val = new Assign(new Value(param.name), param.value, '=');
            exprs.push(new If(lit, val));
          }
        }
        if (!splats) {
          params.push(ref);
        }
      }
      wasEmpty = this.body.isEmpty();
      if (splats) {
        exprs.unshift(splats);
      }
      if (exprs.length) {
        (_ref6 = this.body.expressions).unshift.apply(_ref6, exprs);
      }
      for (i = _m = 0, _len4 = params.length; _m < _len4; i = ++_m) {
        p = params[i];
        o.scope.parameter(params[i] = p.compile(o));
      }
      uniqs = [];
      _ref7 = this.paramNames();
      for (_n = 0, _len5 = _ref7.length; _n < _len5; _n++) {
        name = _ref7[_n];
        if (__indexOf.call(uniqs, name) >= 0) {
          throw SyntaxError("multiple parameters named '" + name + "'");
        }
        uniqs.push(name);
      }
      if (!(wasEmpty || this.noReturn)) {
        this.body.makeReturn();
      }
      if (this.bound) {
        if ((_ref8 = o.scope.parent.method) != null ? _ref8.bound : void 0) {
          this.bound = this.context = o.scope.parent.method.context;
        } else if (!this["static"]) {
          o.scope.parent.assign('_this', 'this');
        }
      }
      idt = o.indent;
      code = 'function';
      if (this.ctor) {
        code += ' ' + this.name;
      }
      code += '(' + params.join(', ') + ') {';
      if (!this.body.isEmpty()) {
        code += "\n" + (this.body.compileWithDeclarations(o)) + "\n" + this.tab;
      }
      code += '}';
      if (this.ctor) {
        return this.tab + code;
      }
      if (this.front || (o.level >= LEVEL_ACCESS)) {
        return "(" + code + ")";
      } else {
        return code;
      }
    };
    Code.prototype.paramNames = function() {
      var names, param, _i, _len, _ref2;
      names = [];
      _ref2 = this.params;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        param = _ref2[_i];
        names.push.apply(names, param.names());
      }
      return names;
    };
    Code.prototype.traverseChildren = function(crossScope, func) {
      if (crossScope) {
        return Code.__super__.traverseChildren.call(this, crossScope, func);
      }
    };
    return Code;
  })(Base);
  exports.Param = Param = (function(_super) {
    __extends(Param, _super);
    Param.name = 'Param';
    function Param(name, value, splat) {
      var _ref2;
      this.name = name;
      this.value = value;
      this.splat = splat;
      if (_ref2 = (name = this.name.unwrapAll().value), __indexOf.call(STRICT_PROSCRIBED, _ref2) >= 0) {
        throw SyntaxError("parameter name \"" + name + "\" is not allowed");
      }
    }
    Param.prototype.children = ['name', 'value'];
    Param.prototype.compile = function(o) {
      return this.name.compile(o, LEVEL_LIST);
    };
    Param.prototype.asReference = function(o) {
      var node;
      if (this.reference) {
        return this.reference;
      }
      node = this.name;
      if (node["this"]) {
        node = node.properties[0].name;
        if (node.value.reserved) {
          node = new Literal(o.scope.freeVariable(node.value));
        }
      } else if (node.isComplex()) {
        node = new Literal(o.scope.freeVariable('arg'));
      }
      node = new Value(node);
      if (this.splat) {
        node = new Splat(node);
      }
      return this.reference = node;
    };
    Param.prototype.isComplex = function() {
      return this.name.isComplex();
    };
    Param.prototype.names = function(name) {
      var atParam, names, obj, _i, _len, _ref2;
      if (name == null) {
        name = this.name;
      }
      atParam = function(obj) {
        var value;
        value = obj.properties[0].name.value;
        if (value.reserved) {
          return [];
        } else {
          return [value];
        }
      };
      if (name instanceof Literal) {
        return [name.value];
      }
      if (name instanceof Value) {
        return atParam(name);
      }
      names = [];
      _ref2 = name.objects;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        obj = _ref2[_i];
        if (obj instanceof Assign) {
          names.push(obj.variable.base.value);
        } else if (obj.isArray() || obj.isObject()) {
          names.push.apply(names, this.names(obj.base));
        } else if (obj["this"]) {
          names.push.apply(names, atParam(obj));
        } else {
          names.push(obj.base.value);
        }
      }
      return names;
    };
    return Param;
  })(Base);
  exports.Splat = Splat = (function(_super) {
    __extends(Splat, _super);
    Splat.name = 'Splat';
    Splat.prototype.children = ['name'];
    Splat.prototype.isAssignable = YES;
    function Splat(name) {
      this.name = name.compile ? name : new Literal(name);
    }
    Splat.prototype.assigns = function(name) {
      return this.name.assigns(name);
    };
    Splat.prototype.compile = function(o) {
      if (this.index != null) {
        return this.compileParam(o);
      } else {
        return this.name.compile(o);
      }
    };
    Splat.prototype.unwrap = function() {
      return this.name;
    };
    Splat.compileSplattedArray = function(o, list, apply) {
      var args, base, code, i, index, node, _i, _len;
      index = -1;
      while ((node = list[++index]) && !(node instanceof Splat)) {
        continue;
      }
      if (index >= list.length) {
        return '';
      }
      if (list.length === 1) {
        code = list[0].compile(o, LEVEL_LIST);
        if (apply) {
          return code;
        }
        return "" + (utility('slice')) + ".call(" + code + ")";
      }
      args = list.slice(index);
      for (i = _i = 0, _len = args.length; _i < _len; i = ++_i) {
        node = args[i];
        code = node.compile(o, LEVEL_LIST);
        args[i] = node instanceof Splat ? "" + (utility('slice')) + ".call(" + code + ")" : "[" + code + "]";
      }
      if (index === 0) {
        return args[0] + (".concat(" + (args.slice(1).join(', ')) + ")");
      }
      base = (function() {
        var _j, _len1, _ref2, _results;
        _ref2 = list.slice(0, index);
        _results = [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          node = _ref2[_j];
          _results.push(node.compile(o, LEVEL_LIST));
        }
        return _results;
      })();
      return "[" + (base.join(', ')) + "].concat(" + (args.join(', ')) + ")";
    };
    return Splat;
  })(Base);
  exports.While = While = (function(_super) {
    __extends(While, _super);
    While.name = 'While';
    function While(condition, options) {
      this.condition = (options != null ? options.invert : void 0) ? condition.invert() : condition;
      this.guard = options != null ? options.guard : void 0;
    }
    While.prototype.children = ['condition', 'guard', 'body'];
    While.prototype.isStatement = YES;
    While.prototype.makeReturn = function(res) {
      if (res) {
        return While.__super__.makeReturn.apply(this, arguments);
      } else {
        this.returns = !this.jumps({
          loop: true
        });
        return this;
      }
    };
    While.prototype.addBody = function(body) {
      this.body = body;
      return this;
    };
    While.prototype.jumps = function() {
      var expressions, node, _i, _len;
      expressions = this.body.expressions;
      if (!expressions.length) {
        return false;
      }
      for (_i = 0, _len = expressions.length; _i < _len; _i++) {
        node = expressions[_i];
        if (node.jumps({
          loop: true
        })) {
          return node;
        }
      }
      return false;
    };
    While.prototype.compileNode = function(o) {
      var body, code, rvar, set;
      o.indent += TAB;
      set = '';
      body = this.body;
      if (body.isEmpty()) {
        body = '';
      } else {
        if (this.returns) {
          body.makeReturn(rvar = o.scope.freeVariable('results'));
          set = "" + this.tab + rvar + " = [];\n";
        }
        if (this.guard) {
          if (body.expressions.length > 1) {
            body.expressions.unshift(new If((new Parens(this.guard)).invert(), new Literal("continue")));
          } else {
            if (this.guard) {
              body = Block.wrap([new If(this.guard, body)]);
            }
          }
        }
        body = "\n" + (body.compile(o, LEVEL_TOP)) + "\n" + this.tab;
      }
      code = set + this.tab + ("while (" + (this.condition.compile(o, LEVEL_PAREN)) + ") {" + body + "}");
      if (this.returns) {
        code += "\n" + this.tab + "return " + rvar + ";";
      }
      return code;
    };
    return While;
  })(Base);
  exports.Op = Op = (function(_super) {
    var CONVERSIONS, INVERSIONS;
    __extends(Op, _super);
    Op.name = 'Op';
    function Op(op, first, second, flip) {
      if (op === 'in') {
        return new In(first, second);
      }
      if (op === 'do') {
        return this.generateDo(first);
      }
      if (op === 'new') {
        if (first instanceof Call && !first["do"] && !first.isNew) {
          return first.newInstance();
        }
        if (first instanceof Code && first.bound || first["do"]) {
          first = new Parens(first);
        }
      }
      this.operator = CONVERSIONS[op] || op;
      this.first = first;
      this.second = second;
      this.flip = !!flip;
      return this;
    }
    CONVERSIONS = {
      '==': '===',
      '!=': '!==',
      'of': 'in'
    };
    INVERSIONS = {
      '!==': '===',
      '===': '!=='
    };
    Op.prototype.children = ['first', 'second'];
    Op.prototype.isSimpleNumber = NO;
    Op.prototype.isUnary = function() {
      return !this.second;
    };
    Op.prototype.isComplex = function() {
      var _ref2;
      return !(this.isUnary() && ((_ref2 = this.operator) === '+' || _ref2 === '-')) || this.first.isComplex();
    };
    Op.prototype.isChainable = function() {
      var _ref2;
      return (_ref2 = this.operator) === '<' || _ref2 === '>' || _ref2 === '>=' || _ref2 === '<=' || _ref2 === '===' || _ref2 === '!==';
    };
    Op.prototype.invert = function() {
      var allInvertable, curr, fst, op, _ref2;
      if (this.isChainable() && this.first.isChainable()) {
        allInvertable = true;
        curr = this;
        while (curr && curr.operator) {
          allInvertable && (allInvertable = curr.operator in INVERSIONS);
          curr = curr.first;
        }
        if (!allInvertable) {
          return new Parens(this).invert();
        }
        curr = this;
        while (curr && curr.operator) {
          curr.invert = !curr.invert;
          curr.operator = INVERSIONS[curr.operator];
          curr = curr.first;
        }
        return this;
      } else if (op = INVERSIONS[this.operator]) {
        this.operator = op;
        if (this.first.unwrap() instanceof Op) {
          this.first.invert();
        }
        return this;
      } else if (this.second) {
        return new Parens(this).invert();
      } else if (this.operator === '!' && (fst = this.first.unwrap()) instanceof Op && ((_ref2 = fst.operator) === '!' || _ref2 === 'in' || _ref2 === 'instanceof')) {
        return fst;
      } else {
        return new Op('!', this);
      }
    };
    Op.prototype.unfoldSoak = function(o) {
      var _ref2;
      return ((_ref2 = this.operator) === '++' || _ref2 === '--' || _ref2 === 'delete') && unfoldSoak(o, this, 'first');
    };
    Op.prototype.generateDo = function(exp) {
      var call, func, param, passedParams, ref, _i, _len, _ref2;
      passedParams = [];
      func = exp instanceof Assign && (ref = exp.value.unwrap()) instanceof Code ? ref : exp;
      _ref2 = func.params || [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        param = _ref2[_i];
        if (param.value) {
          passedParams.push(param.value);
          delete param.value;
        } else {
          passedParams.push(param);
        }
      }
      call = new Call(exp, passedParams);
      call["do"] = true;
      return call;
    };
    Op.prototype.compileNode = function(o) {
      var code, isChain, _ref2, _ref3;
      isChain = this.isChainable() && this.first.isChainable();
      if (!isChain) {
        this.first.front = this.front;
      }
      if (this.operator === 'delete' && o.scope.check(this.first.unwrapAll().value)) {
        throw SyntaxError('delete operand may not be argument or var');
      }
      if (((_ref2 = this.operator) === '--' || _ref2 === '++') && (_ref3 = this.first.unwrapAll().value, __indexOf.call(STRICT_PROSCRIBED, _ref3) >= 0)) {
        throw SyntaxError('prefix increment/decrement may not have eval or arguments operand');
      }
      if (this.isUnary()) {
        return this.compileUnary(o);
      }
      if (isChain) {
        return this.compileChain(o);
      }
      if (this.operator === '?') {
        return this.compileExistence(o);
      }
      code = this.first.compile(o, LEVEL_OP) + ' ' + this.operator + ' ' + this.second.compile(o, LEVEL_OP);
      if (o.level <= LEVEL_OP) {
        return code;
      } else {
        return "(" + code + ")";
      }
    };
    Op.prototype.compileChain = function(o) {
      var code, fst, shared, _ref2;
      _ref2 = this.first.second.cache(o), this.first.second = _ref2[0], shared = _ref2[1];
      fst = this.first.compile(o, LEVEL_OP);
      code = "" + fst + " " + (this.invert ? '&&' : '||') + " " + (shared.compile(o)) + " " + this.operator + " " + (this.second.compile(o, LEVEL_OP));
      return "(" + code + ")";
    };
    Op.prototype.compileExistence = function(o) {
      var fst, ref;
      if (this.first.isComplex() && o.level > LEVEL_TOP) {
        ref = new Literal(o.scope.freeVariable('ref'));
        fst = new Parens(new Assign(ref, this.first));
      } else {
        fst = this.first;
        ref = fst;
      }
      return new If(new Existence(fst), ref, {
        type: 'if'
      }).addElse(this.second).compile(o);
    };
    Op.prototype.compileUnary = function(o) {
      var op, parts, plusMinus;
      if (o.level >= LEVEL_ACCESS) {
        return (new Parens(this)).compile(o);
      }
      parts = [op = this.operator];
      plusMinus = op === '+' || op === '-';
      if ((op === 'new' || op === 'typeof' || op === 'delete') || plusMinus && this.first instanceof Op && this.first.operator === op) {
        parts.push(' ');
      }
      if ((plusMinus && this.first instanceof Op) || (op === 'new' && this.first.isStatement(o))) {
        this.first = new Parens(this.first);
      }
      parts.push(this.first.compile(o, LEVEL_OP));
      if (this.flip) {
        parts.reverse();
      }
      return parts.join('');
    };
    Op.prototype.toString = function(idt) {
      return Op.__super__.toString.call(this, idt, this.constructor.name + ' ' + this.operator);
    };
    return Op;
  })(Base);
  exports.In = In = (function(_super) {
    __extends(In, _super);
    In.name = 'In';
    function In(object, array) {
      this.object = object;
      this.array = array;
    }
    In.prototype.children = ['object', 'array'];
    In.prototype.invert = NEGATE;
    In.prototype.compileNode = function(o) {
      var hasSplat, obj, _i, _len, _ref2;
      if (this.array instanceof Value && this.array.isArray()) {
        _ref2 = this.array.base.objects;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          obj = _ref2[_i];
          if (!(obj instanceof Splat)) {
            continue;
          }
          hasSplat = true;
          break;
        }
        if (!hasSplat) {
          return this.compileOrTest(o);
        }
      }
      return this.compileLoopTest(o);
    };
    In.prototype.compileOrTest = function(o) {
      var cmp, cnj, i, item, ref, sub, tests, _ref2, _ref3;
      if (this.array.base.objects.length === 0) {
        return "" + (!!this.negated);
      }
      _ref2 = this.object.cache(o, LEVEL_OP), sub = _ref2[0], ref = _ref2[1];
      _ref3 = this.negated ? [' !== ', ' && '] : [' === ', ' || '], cmp = _ref3[0], cnj = _ref3[1];
      tests = (function() {
        var _i, _len, _ref4, _results;
        _ref4 = this.array.base.objects;
        _results = [];
        for (i = _i = 0, _len = _ref4.length; _i < _len; i = ++_i) {
          item = _ref4[i];
          _results.push((i ? ref : sub) + cmp + item.compile(o, LEVEL_ACCESS));
        }
        return _results;
      }).call(this);
      tests = tests.join(cnj);
      if (o.level < LEVEL_OP) {
        return tests;
      } else {
        return "(" + tests + ")";
      }
    };
    In.prototype.compileLoopTest = function(o) {
      var code, ref, sub, _ref2;
      _ref2 = this.object.cache(o, LEVEL_LIST), sub = _ref2[0], ref = _ref2[1];
      code = utility('indexOf') + (".call(" + (this.array.compile(o, LEVEL_LIST)) + ", " + ref + ") ") + (this.negated ? '< 0' : '>= 0');
      if (sub === ref) {
        return code;
      }
      code = sub + ', ' + code;
      if (o.level < LEVEL_LIST) {
        return code;
      } else {
        return "(" + code + ")";
      }
    };
    In.prototype.toString = function(idt) {
      return In.__super__.toString.call(this, idt, this.constructor.name + (this.negated ? '!' : ''));
    };
    return In;
  })(Base);
  exports.Try = Try = (function(_super) {
    __extends(Try, _super);
    Try.name = 'Try';
    function Try(attempt, error, recovery, ensure) {
      this.attempt = attempt;
      this.error = error;
      this.recovery = recovery;
      this.ensure = ensure;
    }
    Try.prototype.children = ['attempt', 'recovery', 'ensure'];
    Try.prototype.isStatement = YES;
    Try.prototype.jumps = function(o) {
      var _ref2;
      return this.attempt.jumps(o) || ((_ref2 = this.recovery) != null ? _ref2.jumps(o) : void 0);
    };
    Try.prototype.makeReturn = function(res) {
      if (this.attempt) {
        this.attempt = this.attempt.makeReturn(res);
      }
      if (this.recovery) {
        this.recovery = this.recovery.makeReturn(res);
      }
      return this;
    };
    Try.prototype.compileNode = function(o) {
      var catchPart, ensurePart, errorPart, tryPart;
      o.indent += TAB;
      errorPart = this.error ? " (" + (this.error.compile(o)) + ") " : ' ';
      tryPart = this.attempt.compile(o, LEVEL_TOP);
      catchPart = (function() {
        var _ref2;
        if (this.recovery) {
          if (_ref2 = this.error.value, __indexOf.call(STRICT_PROSCRIBED, _ref2) >= 0) {
            throw SyntaxError("catch variable may not be \"" + this.error.value + "\"");
          }
          if (!o.scope.check(this.error.value)) {
            o.scope.add(this.error.value, 'param');
          }
          return " catch" + errorPart + "{\n" + (this.recovery.compile(o, LEVEL_TOP)) + "\n" + this.tab + "}";
        } else if (!(this.ensure || this.recovery)) {
          return ' catch (_error) {}';
        }
      }).call(this);
      ensurePart = this.ensure ? " finally {\n" + (this.ensure.compile(o, LEVEL_TOP)) + "\n" + this.tab + "}" : '';
      return "" + this.tab + "try {\n" + tryPart + "\n" + this.tab + "}" + (catchPart || '') + ensurePart;
    };
    return Try;
  })(Base);
  exports.Throw = Throw = (function(_super) {
    __extends(Throw, _super);
    Throw.name = 'Throw';
    function Throw(expression) {
      this.expression = expression;
    }
    Throw.prototype.children = ['expression'];
    Throw.prototype.isStatement = YES;
    Throw.prototype.jumps = NO;
    Throw.prototype.makeReturn = THIS;
    Throw.prototype.compileNode = function(o) {
      return this.tab + ("throw " + (this.expression.compile(o)) + ";");
    };
    return Throw;
  })(Base);
  exports.Existence = Existence = (function(_super) {
    __extends(Existence, _super);
    Existence.name = 'Existence';
    function Existence(expression) {
      this.expression = expression;
    }
    Existence.prototype.children = ['expression'];
    Existence.prototype.invert = NEGATE;
    Existence.prototype.compileNode = function(o) {
      var cmp, cnj, code, _ref2;
      this.expression.front = this.front;
      code = this.expression.compile(o, LEVEL_OP);
      if (IDENTIFIER.test(code) && !o.scope.check(code)) {
        _ref2 = this.negated ? ['===', '||'] : ['!==', '&&'], cmp = _ref2[0], cnj = _ref2[1];
        code = "typeof " + code + " " + cmp + " \"undefined\" " + cnj + " " + code + " " + cmp + " null";
      } else {
        code = "" + code + " " + (this.negated ? '==' : '!=') + " null";
      }
      if (o.level <= LEVEL_COND) {
        return code;
      } else {
        return "(" + code + ")";
      }
    };
    return Existence;
  })(Base);
  exports.Parens = Parens = (function(_super) {
    __extends(Parens, _super);
    Parens.name = 'Parens';
    function Parens(body) {
      this.body = body;
    }
    Parens.prototype.children = ['body'];
    Parens.prototype.unwrap = function() {
      return this.body;
    };
    Parens.prototype.isComplex = function() {
      return this.body.isComplex();
    };
    Parens.prototype.compileNode = function(o) {
      var bare, code, expr;
      expr = this.body.unwrap();
      if (expr instanceof Value && expr.isAtomic()) {
        expr.front = this.front;
        return expr.compile(o);
      }
      code = expr.compile(o, LEVEL_PAREN);
      bare = o.level < LEVEL_OP && (expr instanceof Op || expr instanceof Call || (expr instanceof For && expr.returns));
      if (bare) {
        return code;
      } else {
        return "(" + code + ")";
      }
    };
    return Parens;
  })(Base);
  exports.For = For = (function(_super) {
    __extends(For, _super);
    For.name = 'For';
    function For(body, source) {
      var _ref2;
      this.source = source.source, this.guard = source.guard, this.step = source.step, this.name = source.name, this.index = source.index;
      this.body = Block.wrap([body]);
      this.own = !!source.own;
      this.object = !!source.object;
      if (this.object) {
        _ref2 = [this.index, this.name], this.name = _ref2[0], this.index = _ref2[1];
      }
      if (this.index instanceof Value) {
        throw SyntaxError('index cannot be a pattern matching expression');
      }
      this.range = this.source instanceof Value && this.source.base instanceof Range && !this.source.properties.length;
      this.pattern = this.name instanceof Value;
      if (this.range && this.index) {
        throw SyntaxError('indexes do not apply to range loops');
      }
      if (this.range && this.pattern) {
        throw SyntaxError('cannot pattern match over range loops');
      }
      this.returns = false;
    }
    For.prototype.children = ['body', 'source', 'guard', 'step'];
    For.prototype.compileNode = function(o) {
      var body, defPart, forPart, forVarPart, guardPart, idt1, index, ivar, kvar, kvarAssign, lastJumps, lvar, name, namePart, ref, resultPart, returnResult, rvar, scope, source, stepPart, stepvar, svar, varPart, _ref2;
      body = Block.wrap([this.body]);
      lastJumps = (_ref2 = last(body.expressions)) != null ? _ref2.jumps() : void 0;
      if (lastJumps && lastJumps instanceof Return) {
        this.returns = false;
      }
      source = this.range ? this.source.base : this.source;
      scope = o.scope;
      name = this.name && this.name.compile(o, LEVEL_LIST);
      index = this.index && this.index.compile(o, LEVEL_LIST);
      if (name && !this.pattern) {
        scope.find(name, {
          immediate: true
        });
      }
      if (index) {
        scope.find(index, {
          immediate: true
        });
      }
      if (this.returns) {
        rvar = scope.freeVariable('results');
      }
      ivar = (this.object && index) || scope.freeVariable('i');
      kvar = (this.range && name) || index || ivar;
      kvarAssign = kvar !== ivar ? "" + kvar + " = " : "";
      if (this.step && !this.range) {
        stepvar = scope.freeVariable("step");
      }
      if (this.pattern) {
        name = ivar;
      }
      varPart = '';
      guardPart = '';
      defPart = '';
      idt1 = this.tab + TAB;
      if (this.range) {
        forPart = source.compile(merge(o, {
          index: ivar,
          name: name,
          step: this.step
        }));
      } else {
        svar = this.source.compile(o, LEVEL_LIST);
        if ((name || this.own) && !IDENTIFIER.test(svar)) {
          defPart = "" + this.tab + (ref = scope.freeVariable('ref')) + " = " + svar + ";\n";
          svar = ref;
        }
        if (name && !this.pattern) {
          namePart = "" + name + " = " + svar + "[" + kvar + "]";
        }
        if (!this.object) {
          lvar = scope.freeVariable('len');
          forVarPart = "" + kvarAssign + ivar + " = 0, " + lvar + " = " + svar + ".length";
          if (this.step) {
            forVarPart += ", " + stepvar + " = " + (this.step.compile(o, LEVEL_OP));
          }
          stepPart = "" + kvarAssign + (this.step ? "" + ivar + " += " + stepvar : (kvar !== ivar ? "++" + ivar : "" + ivar + "++"));
          forPart = "" + forVarPart + "; " + ivar + " < " + lvar + "; " + stepPart;
        }
      }
      if (this.returns) {
        resultPart = "" + this.tab + rvar + " = [];\n";
        returnResult = "\n" + this.tab + "return " + rvar + ";";
        body.makeReturn(rvar);
      }
      if (this.guard) {
        if (body.expressions.length > 1) {
          body.expressions.unshift(new If((new Parens(this.guard)).invert(), new Literal("continue")));
        } else {
          if (this.guard) {
            body = Block.wrap([new If(this.guard, body)]);
          }
        }
      }
      if (this.pattern) {
        body.expressions.unshift(new Assign(this.name, new Literal("" + svar + "[" + kvar + "]")));
      }
      defPart += this.pluckDirectCall(o, body);
      if (namePart) {
        varPart = "\n" + idt1 + namePart + ";";
      }
      if (this.object) {
        forPart = "" + kvar + " in " + svar;
        if (this.own) {
          guardPart = "\n" + idt1 + "if (!" + (utility('hasProp')) + ".call(" + svar + ", " + kvar + ")) continue;";
        }
      }
      body = body.compile(merge(o, {
        indent: idt1
      }), LEVEL_TOP);
      if (body) {
        body = '\n' + body + '\n';
      }
      return "" + defPart + (resultPart || '') + this.tab + "for (" + forPart + ") {" + guardPart + varPart + body + this.tab + "}" + (returnResult || '');
    };
    For.prototype.pluckDirectCall = function(o, body) {
      var base, defs, expr, fn, idx, ref, val, _i, _len, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      defs = '';
      _ref2 = body.expressions;
      for (idx = _i = 0, _len = _ref2.length; _i < _len; idx = ++_i) {
        expr = _ref2[idx];
        expr = expr.unwrapAll();
        if (!(expr instanceof Call)) {
          continue;
        }
        val = expr.variable.unwrapAll();
        if (!((val instanceof Code) || (val instanceof Value && ((_ref3 = val.base) != null ? _ref3.unwrapAll() : void 0) instanceof Code && val.properties.length === 1 && ((_ref4 = (_ref5 = val.properties[0].name) != null ? _ref5.value : void 0) === 'call' || _ref4 === 'apply')))) {
          continue;
        }
        fn = ((_ref6 = val.base) != null ? _ref6.unwrapAll() : void 0) || val;
        ref = new Literal(o.scope.freeVariable('fn'));
        base = new Value(ref);
        if (val.base) {
          _ref7 = [base, val], val.base = _ref7[0], base = _ref7[1];
        }
        body.expressions[idx] = new Call(base, expr.args);
        defs += this.tab + new Assign(ref, fn).compile(o, LEVEL_TOP) + ';\n';
      }
      return defs;
    };
    return For;
  })(While);
  exports.Switch = Switch = (function(_super) {
    __extends(Switch, _super);
    Switch.name = 'Switch';
    function Switch(subject, cases, otherwise) {
      this.subject = subject;
      this.cases = cases;
      this.otherwise = otherwise;
    }
    Switch.prototype.children = ['subject', 'cases', 'otherwise'];
    Switch.prototype.isStatement = YES;
    Switch.prototype.jumps = function(o) {
      var block, conds, _i, _len, _ref2, _ref3, _ref4;
      if (o == null) {
        o = {
          block: true
        };
      }
      _ref2 = this.cases;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        _ref3 = _ref2[_i], conds = _ref3[0], block = _ref3[1];
        if (block.jumps(o)) {
          return block;
        }
      }
      return (_ref4 = this.otherwise) != null ? _ref4.jumps(o) : void 0;
    };
    Switch.prototype.makeReturn = function(res) {
      var pair, _i, _len, _ref2, _ref3;
      _ref2 = this.cases;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        pair = _ref2[_i];
        pair[1].makeReturn(res);
      }
      if (res) {
        this.otherwise || (this.otherwise = new Block([new Literal('void 0')]));
      }
      if ((_ref3 = this.otherwise) != null) {
        _ref3.makeReturn(res);
      }
      return this;
    };
    Switch.prototype.compileNode = function(o) {
      var block, body, code, cond, conditions, expr, i, idt1, idt2, _i, _j, _len, _len1, _ref2, _ref3, _ref4, _ref5;
      idt1 = o.indent + TAB;
      idt2 = o.indent = idt1 + TAB;
      code = this.tab + ("switch (" + (((_ref2 = this.subject) != null ? _ref2.compile(o, LEVEL_PAREN) : void 0) || false) + ") {\n");
      _ref3 = this.cases;
      for (i = _i = 0, _len = _ref3.length; _i < _len; i = ++_i) {
        _ref4 = _ref3[i], conditions = _ref4[0], block = _ref4[1];
        _ref5 = flatten([conditions]);
        for (_j = 0, _len1 = _ref5.length; _j < _len1; _j++) {
          cond = _ref5[_j];
          if (!this.subject) {
            cond = cond.invert();
          }
          code += idt1 + ("case " + (cond.compile(o, LEVEL_PAREN)) + ":\n");
        }
        if (body = block.compile(o, LEVEL_TOP)) {
          code += body + '\n';
        }
        if (i === this.cases.length - 1 && !this.otherwise) {
          break;
        }
        expr = this.lastNonComment(block.expressions);
        if (expr instanceof Return || (expr instanceof Literal && expr.jumps() && expr.value !== 'debugger')) {
          continue;
        }
        code += idt2 + 'break;\n';
      }
      if (this.otherwise && this.otherwise.expressions.length) {
        code += idt1 + ("default:\n" + (this.otherwise.compile(o, LEVEL_TOP)) + "\n");
      }
      return code + this.tab + '}';
    };
    return Switch;
  })(Base);
  exports.If = If = (function(_super) {
    __extends(If, _super);
    If.name = 'If';
    function If(condition, body, options) {
      this.body = body;
      if (options == null) {
        options = {};
      }
      this.condition = options.type === 'unless' ? condition.invert() : condition;
      this.elseBody = null;
      this.isChain = false;
      this.soak = options.soak;
    }
    If.prototype.children = ['condition', 'body', 'elseBody'];
    If.prototype.bodyNode = function() {
      var _ref2;
      return (_ref2 = this.body) != null ? _ref2.unwrap() : void 0;
    };
    If.prototype.elseBodyNode = function() {
      var _ref2;
      return (_ref2 = this.elseBody) != null ? _ref2.unwrap() : void 0;
    };
    If.prototype.addElse = function(elseBody) {
      if (this.isChain) {
        this.elseBodyNode().addElse(elseBody);
      } else {
        this.isChain = elseBody instanceof If;
        this.elseBody = this.ensureBlock(elseBody);
      }
      return this;
    };
    If.prototype.isStatement = function(o) {
      var _ref2;
      return (o != null ? o.level : void 0) === LEVEL_TOP || this.bodyNode().isStatement(o) || ((_ref2 = this.elseBodyNode()) != null ? _ref2.isStatement(o) : void 0);
    };
    If.prototype.jumps = function(o) {
      var _ref2;
      return this.body.jumps(o) || ((_ref2 = this.elseBody) != null ? _ref2.jumps(o) : void 0);
    };
    If.prototype.compileNode = function(o) {
      if (this.isStatement(o)) {
        return this.compileStatement(o);
      } else {
        return this.compileExpression(o);
      }
    };
    If.prototype.makeReturn = function(res) {
      if (res) {
        this.elseBody || (this.elseBody = new Block([new Literal('void 0')]));
      }
      this.body && (this.body = new Block([this.body.makeReturn(res)]));
      this.elseBody && (this.elseBody = new Block([this.elseBody.makeReturn(res)]));
      return this;
    };
    If.prototype.ensureBlock = function(node) {
      if (node instanceof Block) {
        return node;
      } else {
        return new Block([node]);
      }
    };
    If.prototype.compileStatement = function(o) {
      var body, child, cond, exeq, ifPart;
      child = del(o, 'chainChild');
      exeq = del(o, 'isExistentialEquals');
      if (exeq) {
        return new If(this.condition.invert(), this.elseBodyNode(), {
          type: 'if'
        }).compile(o);
      }
      cond = this.condition.compile(o, LEVEL_PAREN);
      o.indent += TAB;
      body = this.ensureBlock(this.body);
      ifPart = "if (" + cond + ") {\n" + (body.compile(o)) + "\n" + this.tab + "}";
      if (!child) {
        ifPart = this.tab + ifPart;
      }
      if (!this.elseBody) {
        return ifPart;
      }
      return ifPart + ' else ' + (this.isChain ? (o.indent = this.tab, o.chainChild = true, this.elseBody.unwrap().compile(o, LEVEL_TOP)) : "{\n" + (this.elseBody.compile(o, LEVEL_TOP)) + "\n" + this.tab + "}");
    };
    If.prototype.compileExpression = function(o) {
      var alt, body, code, cond;
      cond = this.condition.compile(o, LEVEL_COND);
      body = this.bodyNode().compile(o, LEVEL_LIST);
      alt = this.elseBodyNode() ? this.elseBodyNode().compile(o, LEVEL_LIST) : 'void 0';
      code = "" + cond + " ? " + body + " : " + alt;
      if (o.level >= LEVEL_COND) {
        return "(" + code + ")";
      } else {
        return code;
      }
    };
    If.prototype.unfoldSoak = function() {
      return this.soak && this;
    };
    return If;
  })(Base);
  Closure = {
    wrap: function(expressions, statement, noReturn) {
      var args, call, func, mentionsArgs, meth;
      if (expressions.jumps()) {
        return expressions;
      }
      func = new Code([], Block.wrap([expressions]));
      args = [];
      if ((mentionsArgs = expressions.contains(this.literalArgs)) || expressions.contains(this.literalThis)) {
        meth = new Literal(mentionsArgs ? 'apply' : 'call');
        args = [new Literal('this')];
        if (mentionsArgs) {
          args.push(new Literal('arguments'));
        }
        func = new Value(func, [new Access(meth)]);
      }
      func.noReturn = noReturn;
      call = new Call(func, args);
      if (statement) {
        return Block.wrap([call]);
      } else {
        return call;
      }
    },
    literalArgs: function(node) {
      return node instanceof Literal && node.value === 'arguments' && !node.asKey;
    },
    literalThis: function(node) {
      return (node instanceof Literal && node.value === 'this' && !node.asKey) || (node instanceof Code && node.bound);
    }
  };
  unfoldSoak = function(o, parent, name) {
    var ifn;
    if (!(ifn = parent[name].unfoldSoak(o))) {
      return;
    }
    parent[name] = ifn.body;
    ifn.body = new Value(parent);
    return ifn;
  };
  UTILITIES = {
    "extends": function() {
      return "function(child, parent) { for (var key in parent) { if (" + (utility('hasProp')) + ".call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; }";
    },
    bind: function() {
      return 'function(fn, me){ return function(){ return fn.apply(me, arguments); }; }';
    },
    indexOf: function() {
      return "[].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; }";
    },
    hasProp: function() {
      return '{}.hasOwnProperty';
    },
    slice: function() {
      return '[].slice';
    }
  };
  LEVEL_TOP = 1;
  LEVEL_PAREN = 2;
  LEVEL_LIST = 3;
  LEVEL_COND = 4;
  LEVEL_OP = 5;
  LEVEL_ACCESS = 6;
  TAB = '  ';
  IDENTIFIER_STR = "[$A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff]*";
  IDENTIFIER = RegExp("^" + IDENTIFIER_STR + "$");
  SIMPLENUM = /^[+-]?\d+$/;
  METHOD_DEF = RegExp("^(?:(" + IDENTIFIER_STR + ")\\.prototype(?:\\.(" + IDENTIFIER_STR + ")|\\[(\"(?:[^\\\\\"\\r\\n]|\\\\.)*\"|'(?:[^\\\\'\\r\\n]|\\\\.)*')\\]|\\[(0x[\\da-fA-F]+|\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\]))|(" + IDENTIFIER_STR + ")$");
  IS_STRING = /^['"]/;
  utility = function(name) {
    var ref;
    ref = "__" + name;
    Scope.root.assign(ref, UTILITIES[name]());
    return ref;
  };
  multident = function(code, tab) {
    code = code.replace(/\n/g, '$&' + tab);
    return code.replace(/\s+$/, '');
  };
}).call(this);
    }
  };
});
horseDatastore.module(8, function(onejsModParent){
  return {
    'id':'cake',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // Generated by CoffeeScript 1.3.1
(function() {
  var CoffeeScript, cakefileDirectory, fatalError, fs, helpers, missingTask, oparse, options, optparse, path, printTasks, switches, tasks;
  fs = require('fs');
  path = require('path');
  helpers = require('./helpers');
  optparse = require('./optparse');
  CoffeeScript = require('./coffee-script');
  tasks = {};
  options = {};
  switches = [];
  oparse = null;
  helpers.extend(global, {
    task: function(name, description, action) {
      var _ref;
      if (!action) {
        _ref = [description, action], action = _ref[0], description = _ref[1];
      }
      return tasks[name] = {
        name: name,
        description: description,
        action: action
      };
    },
    option: function(letter, flag, description) {
      return switches.push([letter, flag, description]);
    },
    invoke: function(name) {
      if (!tasks[name]) {
        missingTask(name);
      }
      return tasks[name].action(options);
    }
  });
  exports.run = function() {
    var arg, args, _i, _len, _ref, _results;
    global.__originalDirname = fs.realpathSync('.');
    process.chdir(cakefileDirectory(__originalDirname));
    args = process.argv.slice(2);
    CoffeeScript.run(fs.readFileSync('Cakefile').toString(), {
      filename: 'Cakefile'
    });
    oparse = new optparse.OptionParser(switches);
    if (!args.length) {
      return printTasks();
    }
    try {
      options = oparse.parse(args);
    } catch (e) {
      return fatalError("" + e);
    }
    _ref = options["arguments"];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      arg = _ref[_i];
      _results.push(invoke(arg));
    }
    return _results;
  };
  printTasks = function() {
    var cakefilePath, desc, name, relative, spaces, task;
    relative = path.relative || path.resolve;
    cakefilePath = path.join(relative(__originalDirname, process.cwd()), 'Cakefile');
    console.log("" + cakefilePath + " defines the following tasks:\n");
    for (name in tasks) {
      task = tasks[name];
      spaces = 20 - name.length;
      spaces = spaces > 0 ? Array(spaces + 1).join(' ') : '';
      desc = task.description ? "# " + task.description : '';
      console.log("cake " + name + spaces + " " + desc);
    }
    if (switches.length) {
      return console.log(oparse.help());
    }
  };
  fatalError = function(message) {
    console.error(message + '\n');
    console.log('To see a list of all tasks/options, run "cake"');
    return process.exit(1);
  };
  missingTask = function(task) {
    return fatalError("No such task: " + task);
  };
  cakefileDirectory = function(dir) {
    var parent;
    if (path.existsSync(path.join(dir, 'Cakefile'))) {
      return dir;
    }
    parent = path.normalize(path.join(dir, '..'));
    if (parent !== dir) {
      return cakefileDirectory(parent);
    }
    throw new Error("Cakefile not found in " + (process.cwd()));
  };
}).call(this);
    }
  };
});
horseDatastore.module(8, function(onejsModParent){
  return {
    'id':'index',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // Generated by CoffeeScript 1.3.1
(function() {
  var key, val, _ref;
  _ref = require('./coffee-script');
  for (key in _ref) {
    val = _ref[key];
    exports[key] = val;
  }
}).call(this);
    }
  };
});
horseDatastore.module(8, function(onejsModParent){
  return {
    'id':'repl',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // Generated by CoffeeScript 1.3.1
(function() {
  var ACCESSOR, CoffeeScript, Module, REPL_PROMPT, REPL_PROMPT_CONTINUATION, REPL_PROMPT_MULTILINE, SIMPLEVAR, Script, autocomplete, backlog, completeAttribute, completeVariable, enableColours, error, getCompletions, inspect, multilineMode, pipedInput, readline, repl, run, stdin, stdout;
  stdin = process.openStdin();
  stdout = process.stdout;
  CoffeeScript = require('./coffee-script');
  readline = require('readline');
  inspect = require('util').inspect;
  Script = require('vm').Script;
  Module = require('module');
  REPL_PROMPT = 'coffee> ';
  REPL_PROMPT_MULTILINE = '------> ';
  REPL_PROMPT_CONTINUATION = '......> ';
  enableColours = false;
  if (process.platform !== 'win32') {
    enableColours = !process.env.NODE_DISABLE_COLORS;
  }
  error = function(err) {
    return stdout.write((err.stack || err.toString()) + '\n');
  };
  ACCESSOR = /\s*([\w\.]+)(?:\.(\w*))$/;
  SIMPLEVAR = /(\w+)$/i;
  autocomplete = function(text) {
    return completeAttribute(text) || completeVariable(text) || [[], text];
  };
  completeAttribute = function(text) {
    var all, completions, match, obj, prefix, val;
    if (match = text.match(ACCESSOR)) {
      all = match[0], obj = match[1], prefix = match[2];
      try {
        val = Script.runInThisContext(obj);
      } catch (error) {
        return;
      }
      completions = getCompletions(prefix, Object.getOwnPropertyNames(Object(val)));
      return [completions, prefix];
    }
  };
  completeVariable = function(text) {
    var completions, free, keywords, possibilities, r, vars, _ref;
    free = (_ref = text.match(SIMPLEVAR)) != null ? _ref[1] : void 0;
    if (text === "") {
      free = "";
    }
    if (free != null) {
      vars = Script.runInThisContext('Object.getOwnPropertyNames(Object(this))');
      keywords = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = CoffeeScript.RESERVED;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          r = _ref1[_i];
          if (r.slice(0, 2) !== '__') {
            _results.push(r);
          }
        }
        return _results;
      })();
      possibilities = vars.concat(keywords);
      completions = getCompletions(free, possibilities);
      return [completions, free];
    }
  };
  getCompletions = function(prefix, candidates) {
    var el, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = candidates.length; _i < _len; _i++) {
      el = candidates[_i];
      if (el.indexOf(prefix) === 0) {
        _results.push(el);
      }
    }
    return _results;
  };
  process.on('uncaughtException', error);
  backlog = '';
  run = function(buffer) {
    var code, returnValue, _;
    buffer = buffer.replace(/[\r\n]+$/, "");
    if (multilineMode) {
      backlog += "" + buffer + "\n";
      repl.setPrompt(REPL_PROMPT_CONTINUATION);
      repl.prompt();
      return;
    }
    if (!buffer.toString().trim() && !backlog) {
      repl.prompt();
      return;
    }
    code = backlog += buffer;
    if (code[code.length - 1] === '\\') {
      backlog = "" + backlog.slice(0, -1) + "\n";
      repl.setPrompt(REPL_PROMPT_CONTINUATION);
      repl.prompt();
      return;
    }
    repl.setPrompt(REPL_PROMPT);
    backlog = '';
    try {
      _ = global._;
      returnValue = CoffeeScript["eval"]("_=(undefined\n;" + code + "\n)", {
        filename: 'repl',
        modulename: 'repl'
      });
      if (returnValue === void 0) {
        global._ = _;
      }
      repl.output.write("" + (inspect(returnValue, false, 2, enableColours)) + "\n");
    } catch (err) {
      error(err);
    }
    return repl.prompt();
  };
  if (stdin.readable) {
    pipedInput = '';
    repl = {
      prompt: function() {
        return stdout.write(this._prompt);
      },
      setPrompt: function(p) {
        return this._prompt = p;
      },
      input: stdin,
      output: stdout,
      on: function() {}
    };
    stdin.on('data', function(chunk) {
      return pipedInput += chunk;
    });
    stdin.on('end', function() {
      var line, _i, _len, _ref;
      _ref = pipedInput.trim().split("\n");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        stdout.write("" + line + "\n");
        run(line);
      }
      stdout.write('\n');
      return process.exit(0);
    });
  } else {
    if (readline.createInterface.length < 3) {
      repl = readline.createInterface(stdin, autocomplete);
      stdin.on('data', function(buffer) {
        return repl.write(buffer);
      });
    } else {
      repl = readline.createInterface(stdin, stdout, autocomplete);
    }
  }
  multilineMode = false;
  repl.input.on('keypress', function(char, key) {
    var cursorPos, newPrompt;
    if (!(key && key.ctrl && !key.meta && !key.shift && key.name === 'v')) {
      return;
    }
    cursorPos = repl.cursor;
    repl.output.cursorTo(0);
    repl.output.clearLine(1);
    multilineMode = !multilineMode;
    if (!multilineMode && backlog) {
      repl._line();
    }
    backlog = '';
    repl.setPrompt((newPrompt = multilineMode ? REPL_PROMPT_MULTILINE : REPL_PROMPT));
    repl.prompt();
    return repl.output.cursorTo(newPrompt.length + (repl.cursor = cursorPos));
  });
  repl.input.on('keypress', function(char, key) {
    if (!(multilineMode && repl.line)) {
      return;
    }
    if (!(key && key.ctrl && !key.meta && !key.shift && key.name === 'd')) {
      return;
    }
    multilineMode = false;
    return repl._line();
  });
  repl.on('attemptClose', function() {
    if (multilineMode) {
      multilineMode = false;
      repl.output.cursorTo(0);
      repl.output.clearLine(1);
      repl._onLine(repl.line);
      return;
    }
    if (backlog) {
      backlog = '';
      repl.output.write('\n');
      repl.setPrompt(REPL_PROMPT);
      return repl.prompt();
    } else {
      return repl.close();
    }
  });
  repl.on('close', function() {
    repl.output.write('\n');
    return repl.input.destroy();
  });
  repl.on('line', run);
  repl.setPrompt(REPL_PROMPT);
  repl.prompt();
}).call(this);
    }
  };
});
horseDatastore.module(8, function(onejsModParent){
  return {
    'id':'scope',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // Generated by CoffeeScript 1.3.1
(function() {
  var Scope, extend, last, _ref;
  _ref = require('./helpers'), extend = _ref.extend, last = _ref.last;
  exports.Scope = Scope = (function() {
    Scope.name = 'Scope';
    Scope.root = null;
    function Scope(parent, expressions, method) {
      this.parent = parent;
      this.expressions = expressions;
      this.method = method;
      this.variables = [
        {
          name: 'arguments',
          type: 'arguments'
        }
      ];
      this.positions = {};
      if (!this.parent) {
        Scope.root = this;
      }
    }
    Scope.prototype.add = function(name, type, immediate) {
      if (this.shared && !immediate) {
        return this.parent.add(name, type, immediate);
      }
      if (Object.prototype.hasOwnProperty.call(this.positions, name)) {
        return this.variables[this.positions[name]].type = type;
      } else {
        return this.positions[name] = this.variables.push({
          name: name,
          type: type
        }) - 1;
      }
    };
    Scope.prototype.find = function(name, options) {
      if (this.check(name, options)) {
        return true;
      }
      this.add(name, 'var');
      return false;
    };
    Scope.prototype.parameter = function(name) {
      if (this.shared && this.parent.check(name, true)) {
        return;
      }
      return this.add(name, 'param');
    };
    Scope.prototype.check = function(name, immediate) {
      var found, _ref1;
      found = !!this.type(name);
      if (found || immediate) {
        return found;
      }
      return !!((_ref1 = this.parent) != null ? _ref1.check(name) : void 0);
    };
    Scope.prototype.temporary = function(name, index) {
      if (name.length > 1) {
        return '_' + name + (index > 1 ? index - 1 : '');
      } else {
        return '_' + (index + parseInt(name, 36)).toString(36).replace(/\d/g, 'a');
      }
    };
    Scope.prototype.type = function(name) {
      var v, _i, _len, _ref1;
      _ref1 = this.variables;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        v = _ref1[_i];
        if (v.name === name) {
          return v.type;
        }
      }
      return null;
    };
    Scope.prototype.freeVariable = function(name, reserve) {
      var index, temp;
      if (reserve == null) {
        reserve = true;
      }
      index = 0;
      while (this.check((temp = this.temporary(name, index)))) {
        index++;
      }
      if (reserve) {
        this.add(temp, 'var', true);
      }
      return temp;
    };
    Scope.prototype.assign = function(name, value) {
      this.add(name, {
        value: value,
        assigned: true
      }, true);
      return this.hasAssignments = true;
    };
    Scope.prototype.hasDeclarations = function() {
      return !!this.declaredVariables().length;
    };
    Scope.prototype.declaredVariables = function() {
      var realVars, tempVars, v, _i, _len, _ref1;
      realVars = [];
      tempVars = [];
      _ref1 = this.variables;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        v = _ref1[_i];
        if (v.type === 'var') {
          (v.name.charAt(0) === '_' ? tempVars : realVars).push(v.name);
        }
      }
      return realVars.sort().concat(tempVars.sort());
    };
    Scope.prototype.assignedVariables = function() {
      var v, _i, _len, _ref1, _results;
      _ref1 = this.variables;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        v = _ref1[_i];
        if (v.type.assigned) {
          _results.push("" + v.name + " = " + v.type.value);
        }
      }
      return _results;
    };
    return Scope;
  })();
}).call(this);
    }
  };
});
horseDatastore.module(8, function(onejsModParent){
  return {
    'id':'parser',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /* Jison generated parser */
var parser = (function(){
undefined
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"Line":7,"Expression":8,"Statement":9,"Return":10,"Comment":11,"STATEMENT":12,"Value":13,"Invocation":14,"Code":15,"Operation":16,"Assign":17,"If":18,"Try":19,"While":20,"For":21,"Switch":22,"Class":23,"Throw":24,"INDENT":25,"OUTDENT":26,"Identifier":27,"IDENTIFIER":28,"AlphaNumeric":29,"NUMBER":30,"STRING":31,"Literal":32,"JS":33,"REGEX":34,"DEBUGGER":35,"BOOL":36,"Assignable":37,"=":38,"AssignObj":39,"ObjAssignable":40,":":41,"ThisProperty":42,"RETURN":43,"HERECOMMENT":44,"PARAM_START":45,"ParamList":46,"PARAM_END":47,"FuncGlyph":48,"->":49,"=>":50,"OptComma":51,",":52,"Param":53,"ParamVar":54,"...":55,"Array":56,"Object":57,"Splat":58,"SimpleAssignable":59,"Accessor":60,"Parenthetical":61,"Range":62,"This":63,".":64,"?.":65,"::":66,"Index":67,"INDEX_START":68,"IndexValue":69,"INDEX_END":70,"INDEX_SOAK":71,"Slice":72,"{":73,"AssignList":74,"}":75,"CLASS":76,"EXTENDS":77,"OptFuncExist":78,"Arguments":79,"SUPER":80,"FUNC_EXIST":81,"CALL_START":82,"CALL_END":83,"ArgList":84,"THIS":85,"@":86,"[":87,"]":88,"RangeDots":89,"..":90,"Arg":91,"SimpleArgs":92,"TRY":93,"Catch":94,"FINALLY":95,"CATCH":96,"THROW":97,"(":98,")":99,"WhileSource":100,"WHILE":101,"WHEN":102,"UNTIL":103,"Loop":104,"LOOP":105,"ForBody":106,"FOR":107,"ForStart":108,"ForSource":109,"ForVariables":110,"OWN":111,"ForValue":112,"FORIN":113,"FOROF":114,"BY":115,"SWITCH":116,"Whens":117,"ELSE":118,"When":119,"LEADING_WHEN":120,"IfBlock":121,"IF":122,"POST_IF":123,"UNARY":124,"-":125,"+":126,"--":127,"++":128,"?":129,"MATH":130,"SHIFT":131,"COMPARE":132,"LOGIC":133,"RELATION":134,"COMPOUND_ASSIGN":135,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",12:"STATEMENT",25:"INDENT",26:"OUTDENT",28:"IDENTIFIER",30:"NUMBER",31:"STRING",33:"JS",34:"REGEX",35:"DEBUGGER",36:"BOOL",38:"=",41:":",43:"RETURN",44:"HERECOMMENT",45:"PARAM_START",47:"PARAM_END",49:"->",50:"=>",52:",",55:"...",64:".",65:"?.",66:"::",68:"INDEX_START",70:"INDEX_END",71:"INDEX_SOAK",73:"{",75:"}",76:"CLASS",77:"EXTENDS",80:"SUPER",81:"FUNC_EXIST",82:"CALL_START",83:"CALL_END",85:"THIS",86:"@",87:"[",88:"]",90:"..",93:"TRY",95:"FINALLY",96:"CATCH",97:"THROW",98:"(",99:")",101:"WHILE",102:"WHEN",103:"UNTIL",105:"LOOP",107:"FOR",111:"OWN",113:"FORIN",114:"FOROF",115:"BY",116:"SWITCH",118:"ELSE",120:"LEADING_WHEN",122:"IF",123:"POST_IF",124:"UNARY",125:"-",126:"+",127:"--",128:"++",129:"?",130:"MATH",131:"SHIFT",132:"COMPARE",133:"LOGIC",134:"RELATION",135:"COMPOUND_ASSIGN"},
productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,3],[4,2],[7,1],[7,1],[9,1],[9,1],[9,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[5,2],[5,3],[27,1],[29,1],[29,1],[32,1],[32,1],[32,1],[32,1],[32,1],[17,3],[17,4],[17,5],[39,1],[39,3],[39,5],[39,1],[40,1],[40,1],[40,1],[10,2],[10,1],[11,1],[15,5],[15,2],[48,1],[48,1],[51,0],[51,1],[46,0],[46,1],[46,3],[53,1],[53,2],[53,3],[54,1],[54,1],[54,1],[54,1],[58,2],[59,1],[59,2],[59,2],[59,1],[37,1],[37,1],[37,1],[13,1],[13,1],[13,1],[13,1],[13,1],[60,2],[60,2],[60,2],[60,1],[60,1],[67,3],[67,2],[69,1],[69,1],[57,4],[74,0],[74,1],[74,3],[74,4],[74,6],[23,1],[23,2],[23,3],[23,4],[23,2],[23,3],[23,4],[23,5],[14,3],[14,3],[14,1],[14,2],[78,0],[78,1],[79,2],[79,4],[63,1],[63,1],[42,2],[56,2],[56,4],[89,1],[89,1],[62,5],[72,3],[72,2],[72,2],[72,1],[84,1],[84,3],[84,4],[84,4],[84,6],[91,1],[91,1],[92,1],[92,3],[19,2],[19,3],[19,4],[19,5],[94,3],[24,2],[61,3],[61,5],[100,2],[100,4],[100,2],[100,4],[20,2],[20,2],[20,2],[20,1],[104,2],[104,2],[21,2],[21,2],[21,2],[106,2],[106,2],[108,2],[108,3],[112,1],[112,1],[112,1],[110,1],[110,3],[109,2],[109,2],[109,4],[109,4],[109,4],[109,6],[109,6],[22,5],[22,7],[22,4],[22,6],[117,1],[117,2],[119,3],[119,4],[121,3],[121,5],[18,1],[18,3],[18,3],[18,3],[16,2],[16,2],[16,2],[16,2],[16,2],[16,2],[16,2],[16,2],[16,3],[16,3],[16,3],[16,3],[16,3],[16,3],[16,3],[16,3],[16,5],[16,3]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {
var $0 = $$.length - 1;
switch (yystate) {
case 1:return this.$ = new yy.Block;
break;
case 2:return this.$ = $$[$0];
break;
case 3:return this.$ = $$[$0-1];
break;
case 4:this.$ = yy.Block.wrap([$$[$0]]);
break;
case 5:this.$ = $$[$0-2].push($$[$0]);
break;
case 6:this.$ = $$[$0-1];
break;
case 7:this.$ = $$[$0];
break;
case 8:this.$ = $$[$0];
break;
case 9:this.$ = $$[$0];
break;
case 10:this.$ = $$[$0];
break;
case 11:this.$ = new yy.Literal($$[$0]);
break;
case 12:this.$ = $$[$0];
break;
case 13:this.$ = $$[$0];
break;
case 14:this.$ = $$[$0];
break;
case 15:this.$ = $$[$0];
break;
case 16:this.$ = $$[$0];
break;
case 17:this.$ = $$[$0];
break;
case 18:this.$ = $$[$0];
break;
case 19:this.$ = $$[$0];
break;
case 20:this.$ = $$[$0];
break;
case 21:this.$ = $$[$0];
break;
case 22:this.$ = $$[$0];
break;
case 23:this.$ = $$[$0];
break;
case 24:this.$ = new yy.Block;
break;
case 25:this.$ = $$[$0-1];
break;
case 26:this.$ = new yy.Literal($$[$0]);
break;
case 27:this.$ = new yy.Literal($$[$0]);
break;
case 28:this.$ = new yy.Literal($$[$0]);
break;
case 29:this.$ = $$[$0];
break;
case 30:this.$ = new yy.Literal($$[$0]);
break;
case 31:this.$ = new yy.Literal($$[$0]);
break;
case 32:this.$ = new yy.Literal($$[$0]);
break;
case 33:this.$ = (function () {
        var val;
        val = new yy.Literal($$[$0]);
        if ($$[$0] === 'undefined') val.isUndefined = true;
        return val;
      }());
break;
case 34:this.$ = new yy.Assign($$[$0-2], $$[$0]);
break;
case 35:this.$ = new yy.Assign($$[$0-3], $$[$0]);
break;
case 36:this.$ = new yy.Assign($$[$0-4], $$[$0-1]);
break;
case 37:this.$ = new yy.Value($$[$0]);
break;
case 38:this.$ = new yy.Assign(new yy.Value($$[$0-2]), $$[$0], 'object');
break;
case 39:this.$ = new yy.Assign(new yy.Value($$[$0-4]), $$[$0-1], 'object');
break;
case 40:this.$ = $$[$0];
break;
case 41:this.$ = $$[$0];
break;
case 42:this.$ = $$[$0];
break;
case 43:this.$ = $$[$0];
break;
case 44:this.$ = new yy.Return($$[$0]);
break;
case 45:this.$ = new yy.Return;
break;
case 46:this.$ = new yy.Comment($$[$0]);
break;
case 47:this.$ = new yy.Code($$[$0-3], $$[$0], $$[$0-1]);
break;
case 48:this.$ = new yy.Code([], $$[$0], $$[$0-1]);
break;
case 49:this.$ = 'func';
break;
case 50:this.$ = 'boundfunc';
break;
case 51:this.$ = $$[$0];
break;
case 52:this.$ = $$[$0];
break;
case 53:this.$ = [];
break;
case 54:this.$ = [$$[$0]];
break;
case 55:this.$ = $$[$0-2].concat($$[$0]);
break;
case 56:this.$ = new yy.Param($$[$0]);
break;
case 57:this.$ = new yy.Param($$[$0-1], null, true);
break;
case 58:this.$ = new yy.Param($$[$0-2], $$[$0]);
break;
case 59:this.$ = $$[$0];
break;
case 60:this.$ = $$[$0];
break;
case 61:this.$ = $$[$0];
break;
case 62:this.$ = $$[$0];
break;
case 63:this.$ = new yy.Splat($$[$0-1]);
break;
case 64:this.$ = new yy.Value($$[$0]);
break;
case 65:this.$ = $$[$0-1].add($$[$0]);
break;
case 66:this.$ = new yy.Value($$[$0-1], [].concat($$[$0]));
break;
case 67:this.$ = $$[$0];
break;
case 68:this.$ = $$[$0];
break;
case 69:this.$ = new yy.Value($$[$0]);
break;
case 70:this.$ = new yy.Value($$[$0]);
break;
case 71:this.$ = $$[$0];
break;
case 72:this.$ = new yy.Value($$[$0]);
break;
case 73:this.$ = new yy.Value($$[$0]);
break;
case 74:this.$ = new yy.Value($$[$0]);
break;
case 75:this.$ = $$[$0];
break;
case 76:this.$ = new yy.Access($$[$0]);
break;
case 77:this.$ = new yy.Access($$[$0], 'soak');
break;
case 78:this.$ = [new yy.Access(new yy.Literal('prototype')), new yy.Access($$[$0])];
break;
case 79:this.$ = new yy.Access(new yy.Literal('prototype'));
break;
case 80:this.$ = $$[$0];
break;
case 81:this.$ = $$[$0-1];
break;
case 82:this.$ = yy.extend($$[$0], {
          soak: true
        });
break;
case 83:this.$ = new yy.Index($$[$0]);
break;
case 84:this.$ = new yy.Slice($$[$0]);
break;
case 85:this.$ = new yy.Obj($$[$0-2], $$[$0-3].generated);
break;
case 86:this.$ = [];
break;
case 87:this.$ = [$$[$0]];
break;
case 88:this.$ = $$[$0-2].concat($$[$0]);
break;
case 89:this.$ = $$[$0-3].concat($$[$0]);
break;
case 90:this.$ = $$[$0-5].concat($$[$0-2]);
break;
case 91:this.$ = new yy.Class;
break;
case 92:this.$ = new yy.Class(null, null, $$[$0]);
break;
case 93:this.$ = new yy.Class(null, $$[$0]);
break;
case 94:this.$ = new yy.Class(null, $$[$0-1], $$[$0]);
break;
case 95:this.$ = new yy.Class($$[$0]);
break;
case 96:this.$ = new yy.Class($$[$0-1], null, $$[$0]);
break;
case 97:this.$ = new yy.Class($$[$0-2], $$[$0]);
break;
case 98:this.$ = new yy.Class($$[$0-3], $$[$0-1], $$[$0]);
break;
case 99:this.$ = new yy.Call($$[$0-2], $$[$0], $$[$0-1]);
break;
case 100:this.$ = new yy.Call($$[$0-2], $$[$0], $$[$0-1]);
break;
case 101:this.$ = new yy.Call('super', [new yy.Splat(new yy.Literal('arguments'))]);
break;
case 102:this.$ = new yy.Call('super', $$[$0]);
break;
case 103:this.$ = false;
break;
case 104:this.$ = true;
break;
case 105:this.$ = [];
break;
case 106:this.$ = $$[$0-2];
break;
case 107:this.$ = new yy.Value(new yy.Literal('this'));
break;
case 108:this.$ = new yy.Value(new yy.Literal('this'));
break;
case 109:this.$ = new yy.Value(new yy.Literal('this'), [new yy.Access($$[$0])], 'this');
break;
case 110:this.$ = new yy.Arr([]);
break;
case 111:this.$ = new yy.Arr($$[$0-2]);
break;
case 112:this.$ = 'inclusive';
break;
case 113:this.$ = 'exclusive';
break;
case 114:this.$ = new yy.Range($$[$0-3], $$[$0-1], $$[$0-2]);
break;
case 115:this.$ = new yy.Range($$[$0-2], $$[$0], $$[$0-1]);
break;
case 116:this.$ = new yy.Range($$[$0-1], null, $$[$0]);
break;
case 117:this.$ = new yy.Range(null, $$[$0], $$[$0-1]);
break;
case 118:this.$ = new yy.Range(null, null, $$[$0]);
break;
case 119:this.$ = [$$[$0]];
break;
case 120:this.$ = $$[$0-2].concat($$[$0]);
break;
case 121:this.$ = $$[$0-3].concat($$[$0]);
break;
case 122:this.$ = $$[$0-2];
break;
case 123:this.$ = $$[$0-5].concat($$[$0-2]);
break;
case 124:this.$ = $$[$0];
break;
case 125:this.$ = $$[$0];
break;
case 126:this.$ = $$[$0];
break;
case 127:this.$ = [].concat($$[$0-2], $$[$0]);
break;
case 128:this.$ = new yy.Try($$[$0]);
break;
case 129:this.$ = new yy.Try($$[$0-1], $$[$0][0], $$[$0][1]);
break;
case 130:this.$ = new yy.Try($$[$0-2], null, null, $$[$0]);
break;
case 131:this.$ = new yy.Try($$[$0-3], $$[$0-2][0], $$[$0-2][1], $$[$0]);
break;
case 132:this.$ = [$$[$0-1], $$[$0]];
break;
case 133:this.$ = new yy.Throw($$[$0]);
break;
case 134:this.$ = new yy.Parens($$[$0-1]);
break;
case 135:this.$ = new yy.Parens($$[$0-2]);
break;
case 136:this.$ = new yy.While($$[$0]);
break;
case 137:this.$ = new yy.While($$[$0-2], {
          guard: $$[$0]
        });
break;
case 138:this.$ = new yy.While($$[$0], {
          invert: true
        });
break;
case 139:this.$ = new yy.While($$[$0-2], {
          invert: true,
          guard: $$[$0]
        });
break;
case 140:this.$ = $$[$0-1].addBody($$[$0]);
break;
case 141:this.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 142:this.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 143:this.$ = $$[$0];
break;
case 144:this.$ = new yy.While(new yy.Literal('true')).addBody($$[$0]);
break;
case 145:this.$ = new yy.While(new yy.Literal('true')).addBody(yy.Block.wrap([$$[$0]]));
break;
case 146:this.$ = new yy.For($$[$0-1], $$[$0]);
break;
case 147:this.$ = new yy.For($$[$0-1], $$[$0]);
break;
case 148:this.$ = new yy.For($$[$0], $$[$0-1]);
break;
case 149:this.$ = {
          source: new yy.Value($$[$0])
        };
break;
case 150:this.$ = (function () {
        $$[$0].own = $$[$0-1].own;
        $$[$0].name = $$[$0-1][0];
        $$[$0].index = $$[$0-1][1];
        return $$[$0];
      }());
break;
case 151:this.$ = $$[$0];
break;
case 152:this.$ = (function () {
        $$[$0].own = true;
        return $$[$0];
      }());
break;
case 153:this.$ = $$[$0];
break;
case 154:this.$ = new yy.Value($$[$0]);
break;
case 155:this.$ = new yy.Value($$[$0]);
break;
case 156:this.$ = [$$[$0]];
break;
case 157:this.$ = [$$[$0-2], $$[$0]];
break;
case 158:this.$ = {
          source: $$[$0]
        };
break;
case 159:this.$ = {
          source: $$[$0],
          object: true
        };
break;
case 160:this.$ = {
          source: $$[$0-2],
          guard: $$[$0]
        };
break;
case 161:this.$ = {
          source: $$[$0-2],
          guard: $$[$0],
          object: true
        };
break;
case 162:this.$ = {
          source: $$[$0-2],
          step: $$[$0]
        };
break;
case 163:this.$ = {
          source: $$[$0-4],
          guard: $$[$0-2],
          step: $$[$0]
        };
break;
case 164:this.$ = {
          source: $$[$0-4],
          step: $$[$0-2],
          guard: $$[$0]
        };
break;
case 165:this.$ = new yy.Switch($$[$0-3], $$[$0-1]);
break;
case 166:this.$ = new yy.Switch($$[$0-5], $$[$0-3], $$[$0-1]);
break;
case 167:this.$ = new yy.Switch(null, $$[$0-1]);
break;
case 168:this.$ = new yy.Switch(null, $$[$0-3], $$[$0-1]);
break;
case 169:this.$ = $$[$0];
break;
case 170:this.$ = $$[$0-1].concat($$[$0]);
break;
case 171:this.$ = [[$$[$0-1], $$[$0]]];
break;
case 172:this.$ = [[$$[$0-2], $$[$0-1]]];
break;
case 173:this.$ = new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        });
break;
case 174:this.$ = $$[$0-4].addElse(new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        }));
break;
case 175:this.$ = $$[$0];
break;
case 176:this.$ = $$[$0-2].addElse($$[$0]);
break;
case 177:this.$ = new yy.If($$[$0], yy.Block.wrap([$$[$0-2]]), {
          type: $$[$0-1],
          statement: true
        });
break;
case 178:this.$ = new yy.If($$[$0], yy.Block.wrap([$$[$0-2]]), {
          type: $$[$0-1],
          statement: true
        });
break;
case 179:this.$ = new yy.Op($$[$0-1], $$[$0]);
break;
case 180:this.$ = new yy.Op('-', $$[$0]);
break;
case 181:this.$ = new yy.Op('+', $$[$0]);
break;
case 182:this.$ = new yy.Op('--', $$[$0]);
break;
case 183:this.$ = new yy.Op('++', $$[$0]);
break;
case 184:this.$ = new yy.Op('--', $$[$0-1], null, true);
break;
case 185:this.$ = new yy.Op('++', $$[$0-1], null, true);
break;
case 186:this.$ = new yy.Existence($$[$0-1]);
break;
case 187:this.$ = new yy.Op('+', $$[$0-2], $$[$0]);
break;
case 188:this.$ = new yy.Op('-', $$[$0-2], $$[$0]);
break;
case 189:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 190:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 191:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 192:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 193:this.$ = (function () {
        if ($$[$0-1].charAt(0) === '!') {
          return new yy.Op($$[$0-1].slice(1), $$[$0-2], $$[$0]).invert();
        } else {
          return new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
        }
      }());
break;
case 194:this.$ = new yy.Assign($$[$0-2], $$[$0], $$[$0-1]);
break;
case 195:this.$ = new yy.Assign($$[$0-4], $$[$0-1], $$[$0-3]);
break;
case 196:this.$ = new yy.Extends($$[$0-2], $$[$0]);
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,7:4,8:6,9:7,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,5],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[3]},{1:[2,2],6:[1,72]},{6:[1,73]},{1:[2,4],6:[2,4],26:[2,4],99:[2,4]},{4:75,7:4,8:6,9:7,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,26:[1,74],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,7],6:[2,7],26:[2,7],99:[2,7],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,8],6:[2,8],26:[2,8],99:[2,8],100:88,101:[1,63],103:[1,64],106:89,107:[1,66],108:67,123:[1,87]},{1:[2,12],6:[2,12],25:[2,12],26:[2,12],47:[2,12],52:[2,12],55:[2,12],60:91,64:[1,93],65:[1,94],66:[1,95],67:96,68:[1,97],70:[2,12],71:[1,98],75:[2,12],78:90,81:[1,92],82:[2,103],83:[2,12],88:[2,12],90:[2,12],99:[2,12],101:[2,12],102:[2,12],103:[2,12],107:[2,12],115:[2,12],123:[2,12],125:[2,12],126:[2,12],129:[2,12],130:[2,12],131:[2,12],132:[2,12],133:[2,12],134:[2,12]},{1:[2,13],6:[2,13],25:[2,13],26:[2,13],47:[2,13],52:[2,13],55:[2,13],60:100,64:[1,93],65:[1,94],66:[1,95],67:96,68:[1,97],70:[2,13],71:[1,98],75:[2,13],78:99,81:[1,92],82:[2,103],83:[2,13],88:[2,13],90:[2,13],99:[2,13],101:[2,13],102:[2,13],103:[2,13],107:[2,13],115:[2,13],123:[2,13],125:[2,13],126:[2,13],129:[2,13],130:[2,13],131:[2,13],132:[2,13],133:[2,13],134:[2,13]},{1:[2,14],6:[2,14],25:[2,14],26:[2,14],47:[2,14],52:[2,14],55:[2,14],70:[2,14],75:[2,14],83:[2,14],88:[2,14],90:[2,14],99:[2,14],101:[2,14],102:[2,14],103:[2,14],107:[2,14],115:[2,14],123:[2,14],125:[2,14],126:[2,14],129:[2,14],130:[2,14],131:[2,14],132:[2,14],133:[2,14],134:[2,14]},{1:[2,15],6:[2,15],25:[2,15],26:[2,15],47:[2,15],52:[2,15],55:[2,15],70:[2,15],75:[2,15],83:[2,15],88:[2,15],90:[2,15],99:[2,15],101:[2,15],102:[2,15],103:[2,15],107:[2,15],115:[2,15],123:[2,15],125:[2,15],126:[2,15],129:[2,15],130:[2,15],131:[2,15],132:[2,15],133:[2,15],134:[2,15]},{1:[2,16],6:[2,16],25:[2,16],26:[2,16],47:[2,16],52:[2,16],55:[2,16],70:[2,16],75:[2,16],83:[2,16],88:[2,16],90:[2,16],99:[2,16],101:[2,16],102:[2,16],103:[2,16],107:[2,16],115:[2,16],123:[2,16],125:[2,16],126:[2,16],129:[2,16],130:[2,16],131:[2,16],132:[2,16],133:[2,16],134:[2,16]},{1:[2,17],6:[2,17],25:[2,17],26:[2,17],47:[2,17],52:[2,17],55:[2,17],70:[2,17],75:[2,17],83:[2,17],88:[2,17],90:[2,17],99:[2,17],101:[2,17],102:[2,17],103:[2,17],107:[2,17],115:[2,17],123:[2,17],125:[2,17],126:[2,17],129:[2,17],130:[2,17],131:[2,17],132:[2,17],133:[2,17],134:[2,17]},{1:[2,18],6:[2,18],25:[2,18],26:[2,18],47:[2,18],52:[2,18],55:[2,18],70:[2,18],75:[2,18],83:[2,18],88:[2,18],90:[2,18],99:[2,18],101:[2,18],102:[2,18],103:[2,18],107:[2,18],115:[2,18],123:[2,18],125:[2,18],126:[2,18],129:[2,18],130:[2,18],131:[2,18],132:[2,18],133:[2,18],134:[2,18]},{1:[2,19],6:[2,19],25:[2,19],26:[2,19],47:[2,19],52:[2,19],55:[2,19],70:[2,19],75:[2,19],83:[2,19],88:[2,19],90:[2,19],99:[2,19],101:[2,19],102:[2,19],103:[2,19],107:[2,19],115:[2,19],123:[2,19],125:[2,19],126:[2,19],129:[2,19],130:[2,19],131:[2,19],132:[2,19],133:[2,19],134:[2,19]},{1:[2,20],6:[2,20],25:[2,20],26:[2,20],47:[2,20],52:[2,20],55:[2,20],70:[2,20],75:[2,20],83:[2,20],88:[2,20],90:[2,20],99:[2,20],101:[2,20],102:[2,20],103:[2,20],107:[2,20],115:[2,20],123:[2,20],125:[2,20],126:[2,20],129:[2,20],130:[2,20],131:[2,20],132:[2,20],133:[2,20],134:[2,20]},{1:[2,21],6:[2,21],25:[2,21],26:[2,21],47:[2,21],52:[2,21],55:[2,21],70:[2,21],75:[2,21],83:[2,21],88:[2,21],90:[2,21],99:[2,21],101:[2,21],102:[2,21],103:[2,21],107:[2,21],115:[2,21],123:[2,21],125:[2,21],126:[2,21],129:[2,21],130:[2,21],131:[2,21],132:[2,21],133:[2,21],134:[2,21]},{1:[2,22],6:[2,22],25:[2,22],26:[2,22],47:[2,22],52:[2,22],55:[2,22],70:[2,22],75:[2,22],83:[2,22],88:[2,22],90:[2,22],99:[2,22],101:[2,22],102:[2,22],103:[2,22],107:[2,22],115:[2,22],123:[2,22],125:[2,22],126:[2,22],129:[2,22],130:[2,22],131:[2,22],132:[2,22],133:[2,22],134:[2,22]},{1:[2,23],6:[2,23],25:[2,23],26:[2,23],47:[2,23],52:[2,23],55:[2,23],70:[2,23],75:[2,23],83:[2,23],88:[2,23],90:[2,23],99:[2,23],101:[2,23],102:[2,23],103:[2,23],107:[2,23],115:[2,23],123:[2,23],125:[2,23],126:[2,23],129:[2,23],130:[2,23],131:[2,23],132:[2,23],133:[2,23],134:[2,23]},{1:[2,9],6:[2,9],26:[2,9],99:[2,9],101:[2,9],103:[2,9],107:[2,9],123:[2,9]},{1:[2,10],6:[2,10],26:[2,10],99:[2,10],101:[2,10],103:[2,10],107:[2,10],123:[2,10]},{1:[2,11],6:[2,11],26:[2,11],99:[2,11],101:[2,11],103:[2,11],107:[2,11],123:[2,11]},{1:[2,71],6:[2,71],25:[2,71],26:[2,71],38:[1,101],47:[2,71],52:[2,71],55:[2,71],64:[2,71],65:[2,71],66:[2,71],68:[2,71],70:[2,71],71:[2,71],75:[2,71],81:[2,71],82:[2,71],83:[2,71],88:[2,71],90:[2,71],99:[2,71],101:[2,71],102:[2,71],103:[2,71],107:[2,71],115:[2,71],123:[2,71],125:[2,71],126:[2,71],129:[2,71],130:[2,71],131:[2,71],132:[2,71],133:[2,71],134:[2,71]},{1:[2,72],6:[2,72],25:[2,72],26:[2,72],47:[2,72],52:[2,72],55:[2,72],64:[2,72],65:[2,72],66:[2,72],68:[2,72],70:[2,72],71:[2,72],75:[2,72],81:[2,72],82:[2,72],83:[2,72],88:[2,72],90:[2,72],99:[2,72],101:[2,72],102:[2,72],103:[2,72],107:[2,72],115:[2,72],123:[2,72],125:[2,72],126:[2,72],129:[2,72],130:[2,72],131:[2,72],132:[2,72],133:[2,72],134:[2,72]},{1:[2,73],6:[2,73],25:[2,73],26:[2,73],47:[2,73],52:[2,73],55:[2,73],64:[2,73],65:[2,73],66:[2,73],68:[2,73],70:[2,73],71:[2,73],75:[2,73],81:[2,73],82:[2,73],83:[2,73],88:[2,73],90:[2,73],99:[2,73],101:[2,73],102:[2,73],103:[2,73],107:[2,73],115:[2,73],123:[2,73],125:[2,73],126:[2,73],129:[2,73],130:[2,73],131:[2,73],132:[2,73],133:[2,73],134:[2,73]},{1:[2,74],6:[2,74],25:[2,74],26:[2,74],47:[2,74],52:[2,74],55:[2,74],64:[2,74],65:[2,74],66:[2,74],68:[2,74],70:[2,74],71:[2,74],75:[2,74],81:[2,74],82:[2,74],83:[2,74],88:[2,74],90:[2,74],99:[2,74],101:[2,74],102:[2,74],103:[2,74],107:[2,74],115:[2,74],123:[2,74],125:[2,74],126:[2,74],129:[2,74],130:[2,74],131:[2,74],132:[2,74],133:[2,74],134:[2,74]},{1:[2,75],6:[2,75],25:[2,75],26:[2,75],47:[2,75],52:[2,75],55:[2,75],64:[2,75],65:[2,75],66:[2,75],68:[2,75],70:[2,75],71:[2,75],75:[2,75],81:[2,75],82:[2,75],83:[2,75],88:[2,75],90:[2,75],99:[2,75],101:[2,75],102:[2,75],103:[2,75],107:[2,75],115:[2,75],123:[2,75],125:[2,75],126:[2,75],129:[2,75],130:[2,75],131:[2,75],132:[2,75],133:[2,75],134:[2,75]},{1:[2,101],6:[2,101],25:[2,101],26:[2,101],47:[2,101],52:[2,101],55:[2,101],64:[2,101],65:[2,101],66:[2,101],68:[2,101],70:[2,101],71:[2,101],75:[2,101],79:102,81:[2,101],82:[1,103],83:[2,101],88:[2,101],90:[2,101],99:[2,101],101:[2,101],102:[2,101],103:[2,101],107:[2,101],115:[2,101],123:[2,101],125:[2,101],126:[2,101],129:[2,101],130:[2,101],131:[2,101],132:[2,101],133:[2,101],134:[2,101]},{27:107,28:[1,71],42:108,46:104,47:[2,53],52:[2,53],53:105,54:106,56:109,57:110,73:[1,68],86:[1,111],87:[1,112]},{5:113,25:[1,5]},{8:114,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:116,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:117,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{13:119,14:120,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:121,42:61,56:47,57:48,59:118,61:25,62:26,63:27,73:[1,68],80:[1,28],85:[1,56],86:[1,57],87:[1,55],98:[1,54]},{13:119,14:120,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:121,42:61,56:47,57:48,59:122,61:25,62:26,63:27,73:[1,68],80:[1,28],85:[1,56],86:[1,57],87:[1,55],98:[1,54]},{1:[2,68],6:[2,68],25:[2,68],26:[2,68],38:[2,68],47:[2,68],52:[2,68],55:[2,68],64:[2,68],65:[2,68],66:[2,68],68:[2,68],70:[2,68],71:[2,68],75:[2,68],77:[1,126],81:[2,68],82:[2,68],83:[2,68],88:[2,68],90:[2,68],99:[2,68],101:[2,68],102:[2,68],103:[2,68],107:[2,68],115:[2,68],123:[2,68],125:[2,68],126:[2,68],127:[1,123],128:[1,124],129:[2,68],130:[2,68],131:[2,68],132:[2,68],133:[2,68],134:[2,68],135:[1,125]},{1:[2,175],6:[2,175],25:[2,175],26:[2,175],47:[2,175],52:[2,175],55:[2,175],70:[2,175],75:[2,175],83:[2,175],88:[2,175],90:[2,175],99:[2,175],101:[2,175],102:[2,175],103:[2,175],107:[2,175],115:[2,175],118:[1,127],123:[2,175],125:[2,175],126:[2,175],129:[2,175],130:[2,175],131:[2,175],132:[2,175],133:[2,175],134:[2,175]},{5:128,25:[1,5]},{5:129,25:[1,5]},{1:[2,143],6:[2,143],25:[2,143],26:[2,143],47:[2,143],52:[2,143],55:[2,143],70:[2,143],75:[2,143],83:[2,143],88:[2,143],90:[2,143],99:[2,143],101:[2,143],102:[2,143],103:[2,143],107:[2,143],115:[2,143],123:[2,143],125:[2,143],126:[2,143],129:[2,143],130:[2,143],131:[2,143],132:[2,143],133:[2,143],134:[2,143]},{5:130,25:[1,5]},{8:131,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,132],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,91],5:133,6:[2,91],13:119,14:120,25:[1,5],26:[2,91],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:121,42:61,47:[2,91],52:[2,91],55:[2,91],56:47,57:48,59:135,61:25,62:26,63:27,70:[2,91],73:[1,68],75:[2,91],77:[1,134],80:[1,28],83:[2,91],85:[1,56],86:[1,57],87:[1,55],88:[2,91],90:[2,91],98:[1,54],99:[2,91],101:[2,91],102:[2,91],103:[2,91],107:[2,91],115:[2,91],123:[2,91],125:[2,91],126:[2,91],129:[2,91],130:[2,91],131:[2,91],132:[2,91],133:[2,91],134:[2,91]},{8:136,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,45],6:[2,45],8:137,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,26:[2,45],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],99:[2,45],100:39,101:[2,45],103:[2,45],104:40,105:[1,65],106:41,107:[2,45],108:67,116:[1,42],121:37,122:[1,62],123:[2,45],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,46],6:[2,46],25:[2,46],26:[2,46],52:[2,46],75:[2,46],99:[2,46],101:[2,46],103:[2,46],107:[2,46],123:[2,46]},{1:[2,69],6:[2,69],25:[2,69],26:[2,69],38:[2,69],47:[2,69],52:[2,69],55:[2,69],64:[2,69],65:[2,69],66:[2,69],68:[2,69],70:[2,69],71:[2,69],75:[2,69],81:[2,69],82:[2,69],83:[2,69],88:[2,69],90:[2,69],99:[2,69],101:[2,69],102:[2,69],103:[2,69],107:[2,69],115:[2,69],123:[2,69],125:[2,69],126:[2,69],129:[2,69],130:[2,69],131:[2,69],132:[2,69],133:[2,69],134:[2,69]},{1:[2,70],6:[2,70],25:[2,70],26:[2,70],38:[2,70],47:[2,70],52:[2,70],55:[2,70],64:[2,70],65:[2,70],66:[2,70],68:[2,70],70:[2,70],71:[2,70],75:[2,70],81:[2,70],82:[2,70],83:[2,70],88:[2,70],90:[2,70],99:[2,70],101:[2,70],102:[2,70],103:[2,70],107:[2,70],115:[2,70],123:[2,70],125:[2,70],126:[2,70],129:[2,70],130:[2,70],131:[2,70],132:[2,70],133:[2,70],134:[2,70]},{1:[2,29],6:[2,29],25:[2,29],26:[2,29],47:[2,29],52:[2,29],55:[2,29],64:[2,29],65:[2,29],66:[2,29],68:[2,29],70:[2,29],71:[2,29],75:[2,29],81:[2,29],82:[2,29],83:[2,29],88:[2,29],90:[2,29],99:[2,29],101:[2,29],102:[2,29],103:[2,29],107:[2,29],115:[2,29],123:[2,29],125:[2,29],126:[2,29],129:[2,29],130:[2,29],131:[2,29],132:[2,29],133:[2,29],134:[2,29]},{1:[2,30],6:[2,30],25:[2,30],26:[2,30],47:[2,30],52:[2,30],55:[2,30],64:[2,30],65:[2,30],66:[2,30],68:[2,30],70:[2,30],71:[2,30],75:[2,30],81:[2,30],82:[2,30],83:[2,30],88:[2,30],90:[2,30],99:[2,30],101:[2,30],102:[2,30],103:[2,30],107:[2,30],115:[2,30],123:[2,30],125:[2,30],126:[2,30],129:[2,30],130:[2,30],131:[2,30],132:[2,30],133:[2,30],134:[2,30]},{1:[2,31],6:[2,31],25:[2,31],26:[2,31],47:[2,31],52:[2,31],55:[2,31],64:[2,31],65:[2,31],66:[2,31],68:[2,31],70:[2,31],71:[2,31],75:[2,31],81:[2,31],82:[2,31],83:[2,31],88:[2,31],90:[2,31],99:[2,31],101:[2,31],102:[2,31],103:[2,31],107:[2,31],115:[2,31],123:[2,31],125:[2,31],126:[2,31],129:[2,31],130:[2,31],131:[2,31],132:[2,31],133:[2,31],134:[2,31]},{1:[2,32],6:[2,32],25:[2,32],26:[2,32],47:[2,32],52:[2,32],55:[2,32],64:[2,32],65:[2,32],66:[2,32],68:[2,32],70:[2,32],71:[2,32],75:[2,32],81:[2,32],82:[2,32],83:[2,32],88:[2,32],90:[2,32],99:[2,32],101:[2,32],102:[2,32],103:[2,32],107:[2,32],115:[2,32],123:[2,32],125:[2,32],126:[2,32],129:[2,32],130:[2,32],131:[2,32],132:[2,32],133:[2,32],134:[2,32]},{1:[2,33],6:[2,33],25:[2,33],26:[2,33],47:[2,33],52:[2,33],55:[2,33],64:[2,33],65:[2,33],66:[2,33],68:[2,33],70:[2,33],71:[2,33],75:[2,33],81:[2,33],82:[2,33],83:[2,33],88:[2,33],90:[2,33],99:[2,33],101:[2,33],102:[2,33],103:[2,33],107:[2,33],115:[2,33],123:[2,33],125:[2,33],126:[2,33],129:[2,33],130:[2,33],131:[2,33],132:[2,33],133:[2,33],134:[2,33]},{4:138,7:4,8:6,9:7,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,139],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:140,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,144],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,58:145,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],84:142,85:[1,56],86:[1,57],87:[1,55],88:[1,141],91:143,93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,107],6:[2,107],25:[2,107],26:[2,107],47:[2,107],52:[2,107],55:[2,107],64:[2,107],65:[2,107],66:[2,107],68:[2,107],70:[2,107],71:[2,107],75:[2,107],81:[2,107],82:[2,107],83:[2,107],88:[2,107],90:[2,107],99:[2,107],101:[2,107],102:[2,107],103:[2,107],107:[2,107],115:[2,107],123:[2,107],125:[2,107],126:[2,107],129:[2,107],130:[2,107],131:[2,107],132:[2,107],133:[2,107],134:[2,107]},{1:[2,108],6:[2,108],25:[2,108],26:[2,108],27:146,28:[1,71],47:[2,108],52:[2,108],55:[2,108],64:[2,108],65:[2,108],66:[2,108],68:[2,108],70:[2,108],71:[2,108],75:[2,108],81:[2,108],82:[2,108],83:[2,108],88:[2,108],90:[2,108],99:[2,108],101:[2,108],102:[2,108],103:[2,108],107:[2,108],115:[2,108],123:[2,108],125:[2,108],126:[2,108],129:[2,108],130:[2,108],131:[2,108],132:[2,108],133:[2,108],134:[2,108]},{25:[2,49]},{25:[2,50]},{1:[2,64],6:[2,64],25:[2,64],26:[2,64],38:[2,64],47:[2,64],52:[2,64],55:[2,64],64:[2,64],65:[2,64],66:[2,64],68:[2,64],70:[2,64],71:[2,64],75:[2,64],77:[2,64],81:[2,64],82:[2,64],83:[2,64],88:[2,64],90:[2,64],99:[2,64],101:[2,64],102:[2,64],103:[2,64],107:[2,64],115:[2,64],123:[2,64],125:[2,64],126:[2,64],127:[2,64],128:[2,64],129:[2,64],130:[2,64],131:[2,64],132:[2,64],133:[2,64],134:[2,64],135:[2,64]},{1:[2,67],6:[2,67],25:[2,67],26:[2,67],38:[2,67],47:[2,67],52:[2,67],55:[2,67],64:[2,67],65:[2,67],66:[2,67],68:[2,67],70:[2,67],71:[2,67],75:[2,67],77:[2,67],81:[2,67],82:[2,67],83:[2,67],88:[2,67],90:[2,67],99:[2,67],101:[2,67],102:[2,67],103:[2,67],107:[2,67],115:[2,67],123:[2,67],125:[2,67],126:[2,67],127:[2,67],128:[2,67],129:[2,67],130:[2,67],131:[2,67],132:[2,67],133:[2,67],134:[2,67],135:[2,67]},{8:147,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:148,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:149,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{5:150,8:151,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,5],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{27:156,28:[1,71],56:157,57:158,62:152,73:[1,68],87:[1,55],110:153,111:[1,154],112:155},{109:159,113:[1,160],114:[1,161]},{6:[2,86],11:165,25:[2,86],27:166,28:[1,71],29:167,30:[1,69],31:[1,70],39:163,40:164,42:168,44:[1,46],52:[2,86],74:162,75:[2,86],86:[1,111]},{1:[2,27],6:[2,27],25:[2,27],26:[2,27],41:[2,27],47:[2,27],52:[2,27],55:[2,27],64:[2,27],65:[2,27],66:[2,27],68:[2,27],70:[2,27],71:[2,27],75:[2,27],81:[2,27],82:[2,27],83:[2,27],88:[2,27],90:[2,27],99:[2,27],101:[2,27],102:[2,27],103:[2,27],107:[2,27],115:[2,27],123:[2,27],125:[2,27],126:[2,27],129:[2,27],130:[2,27],131:[2,27],132:[2,27],133:[2,27],134:[2,27]},{1:[2,28],6:[2,28],25:[2,28],26:[2,28],41:[2,28],47:[2,28],52:[2,28],55:[2,28],64:[2,28],65:[2,28],66:[2,28],68:[2,28],70:[2,28],71:[2,28],75:[2,28],81:[2,28],82:[2,28],83:[2,28],88:[2,28],90:[2,28],99:[2,28],101:[2,28],102:[2,28],103:[2,28],107:[2,28],115:[2,28],123:[2,28],125:[2,28],126:[2,28],129:[2,28],130:[2,28],131:[2,28],132:[2,28],133:[2,28],134:[2,28]},{1:[2,26],6:[2,26],25:[2,26],26:[2,26],38:[2,26],41:[2,26],47:[2,26],52:[2,26],55:[2,26],64:[2,26],65:[2,26],66:[2,26],68:[2,26],70:[2,26],71:[2,26],75:[2,26],77:[2,26],81:[2,26],82:[2,26],83:[2,26],88:[2,26],90:[2,26],99:[2,26],101:[2,26],102:[2,26],103:[2,26],107:[2,26],113:[2,26],114:[2,26],115:[2,26],123:[2,26],125:[2,26],126:[2,26],127:[2,26],128:[2,26],129:[2,26],130:[2,26],131:[2,26],132:[2,26],133:[2,26],134:[2,26],135:[2,26]},{1:[2,6],6:[2,6],7:169,8:6,9:7,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,26:[2,6],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],99:[2,6],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,3]},{1:[2,24],6:[2,24],25:[2,24],26:[2,24],47:[2,24],52:[2,24],55:[2,24],70:[2,24],75:[2,24],83:[2,24],88:[2,24],90:[2,24],95:[2,24],96:[2,24],99:[2,24],101:[2,24],102:[2,24],103:[2,24],107:[2,24],115:[2,24],118:[2,24],120:[2,24],123:[2,24],125:[2,24],126:[2,24],129:[2,24],130:[2,24],131:[2,24],132:[2,24],133:[2,24],134:[2,24]},{6:[1,72],26:[1,170]},{1:[2,186],6:[2,186],25:[2,186],26:[2,186],47:[2,186],52:[2,186],55:[2,186],70:[2,186],75:[2,186],83:[2,186],88:[2,186],90:[2,186],99:[2,186],101:[2,186],102:[2,186],103:[2,186],107:[2,186],115:[2,186],123:[2,186],125:[2,186],126:[2,186],129:[2,186],130:[2,186],131:[2,186],132:[2,186],133:[2,186],134:[2,186]},{8:171,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:172,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:173,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:174,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:175,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:176,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:177,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:178,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,142],6:[2,142],25:[2,142],26:[2,142],47:[2,142],52:[2,142],55:[2,142],70:[2,142],75:[2,142],83:[2,142],88:[2,142],90:[2,142],99:[2,142],101:[2,142],102:[2,142],103:[2,142],107:[2,142],115:[2,142],123:[2,142],125:[2,142],126:[2,142],129:[2,142],130:[2,142],131:[2,142],132:[2,142],133:[2,142],134:[2,142]},{1:[2,147],6:[2,147],25:[2,147],26:[2,147],47:[2,147],52:[2,147],55:[2,147],70:[2,147],75:[2,147],83:[2,147],88:[2,147],90:[2,147],99:[2,147],101:[2,147],102:[2,147],103:[2,147],107:[2,147],115:[2,147],123:[2,147],125:[2,147],126:[2,147],129:[2,147],130:[2,147],131:[2,147],132:[2,147],133:[2,147],134:[2,147]},{8:179,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,141],6:[2,141],25:[2,141],26:[2,141],47:[2,141],52:[2,141],55:[2,141],70:[2,141],75:[2,141],83:[2,141],88:[2,141],90:[2,141],99:[2,141],101:[2,141],102:[2,141],103:[2,141],107:[2,141],115:[2,141],123:[2,141],125:[2,141],126:[2,141],129:[2,141],130:[2,141],131:[2,141],132:[2,141],133:[2,141],134:[2,141]},{1:[2,146],6:[2,146],25:[2,146],26:[2,146],47:[2,146],52:[2,146],55:[2,146],70:[2,146],75:[2,146],83:[2,146],88:[2,146],90:[2,146],99:[2,146],101:[2,146],102:[2,146],103:[2,146],107:[2,146],115:[2,146],123:[2,146],125:[2,146],126:[2,146],129:[2,146],130:[2,146],131:[2,146],132:[2,146],133:[2,146],134:[2,146]},{79:180,82:[1,103]},{1:[2,65],6:[2,65],25:[2,65],26:[2,65],38:[2,65],47:[2,65],52:[2,65],55:[2,65],64:[2,65],65:[2,65],66:[2,65],68:[2,65],70:[2,65],71:[2,65],75:[2,65],77:[2,65],81:[2,65],82:[2,65],83:[2,65],88:[2,65],90:[2,65],99:[2,65],101:[2,65],102:[2,65],103:[2,65],107:[2,65],115:[2,65],123:[2,65],125:[2,65],126:[2,65],127:[2,65],128:[2,65],129:[2,65],130:[2,65],131:[2,65],132:[2,65],133:[2,65],134:[2,65],135:[2,65]},{82:[2,104]},{27:181,28:[1,71]},{27:182,28:[1,71]},{1:[2,79],6:[2,79],25:[2,79],26:[2,79],27:183,28:[1,71],38:[2,79],47:[2,79],52:[2,79],55:[2,79],64:[2,79],65:[2,79],66:[2,79],68:[2,79],70:[2,79],71:[2,79],75:[2,79],77:[2,79],81:[2,79],82:[2,79],83:[2,79],88:[2,79],90:[2,79],99:[2,79],101:[2,79],102:[2,79],103:[2,79],107:[2,79],115:[2,79],123:[2,79],125:[2,79],126:[2,79],127:[2,79],128:[2,79],129:[2,79],130:[2,79],131:[2,79],132:[2,79],133:[2,79],134:[2,79],135:[2,79]},{1:[2,80],6:[2,80],25:[2,80],26:[2,80],38:[2,80],47:[2,80],52:[2,80],55:[2,80],64:[2,80],65:[2,80],66:[2,80],68:[2,80],70:[2,80],71:[2,80],75:[2,80],77:[2,80],81:[2,80],82:[2,80],83:[2,80],88:[2,80],90:[2,80],99:[2,80],101:[2,80],102:[2,80],103:[2,80],107:[2,80],115:[2,80],123:[2,80],125:[2,80],126:[2,80],127:[2,80],128:[2,80],129:[2,80],130:[2,80],131:[2,80],132:[2,80],133:[2,80],134:[2,80],135:[2,80]},{8:185,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],55:[1,189],56:47,57:48,59:36,61:25,62:26,63:27,69:184,72:186,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],89:187,90:[1,188],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{67:190,68:[1,97],71:[1,98]},{79:191,82:[1,103]},{1:[2,66],6:[2,66],25:[2,66],26:[2,66],38:[2,66],47:[2,66],52:[2,66],55:[2,66],64:[2,66],65:[2,66],66:[2,66],68:[2,66],70:[2,66],71:[2,66],75:[2,66],77:[2,66],81:[2,66],82:[2,66],83:[2,66],88:[2,66],90:[2,66],99:[2,66],101:[2,66],102:[2,66],103:[2,66],107:[2,66],115:[2,66],123:[2,66],125:[2,66],126:[2,66],127:[2,66],128:[2,66],129:[2,66],130:[2,66],131:[2,66],132:[2,66],133:[2,66],134:[2,66],135:[2,66]},{6:[1,193],8:192,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,194],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,102],6:[2,102],25:[2,102],26:[2,102],47:[2,102],52:[2,102],55:[2,102],64:[2,102],65:[2,102],66:[2,102],68:[2,102],70:[2,102],71:[2,102],75:[2,102],81:[2,102],82:[2,102],83:[2,102],88:[2,102],90:[2,102],99:[2,102],101:[2,102],102:[2,102],103:[2,102],107:[2,102],115:[2,102],123:[2,102],125:[2,102],126:[2,102],129:[2,102],130:[2,102],131:[2,102],132:[2,102],133:[2,102],134:[2,102]},{8:197,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,144],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,58:145,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],83:[1,195],84:196,85:[1,56],86:[1,57],87:[1,55],91:143,93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{47:[1,198],52:[1,199]},{47:[2,54],52:[2,54]},{38:[1,201],47:[2,56],52:[2,56],55:[1,200]},{38:[2,59],47:[2,59],52:[2,59],55:[2,59]},{38:[2,60],47:[2,60],52:[2,60],55:[2,60]},{38:[2,61],47:[2,61],52:[2,61],55:[2,61]},{38:[2,62],47:[2,62],52:[2,62],55:[2,62]},{27:146,28:[1,71]},{8:197,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,144],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,58:145,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],84:142,85:[1,56],86:[1,57],87:[1,55],88:[1,141],91:143,93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,48],6:[2,48],25:[2,48],26:[2,48],47:[2,48],52:[2,48],55:[2,48],70:[2,48],75:[2,48],83:[2,48],88:[2,48],90:[2,48],99:[2,48],101:[2,48],102:[2,48],103:[2,48],107:[2,48],115:[2,48],123:[2,48],125:[2,48],126:[2,48],129:[2,48],130:[2,48],131:[2,48],132:[2,48],133:[2,48],134:[2,48]},{1:[2,179],6:[2,179],25:[2,179],26:[2,179],47:[2,179],52:[2,179],55:[2,179],70:[2,179],75:[2,179],83:[2,179],88:[2,179],90:[2,179],99:[2,179],100:85,101:[2,179],102:[2,179],103:[2,179],106:86,107:[2,179],108:67,115:[2,179],123:[2,179],125:[2,179],126:[2,179],129:[1,76],130:[2,179],131:[2,179],132:[2,179],133:[2,179],134:[2,179]},{100:88,101:[1,63],103:[1,64],106:89,107:[1,66],108:67,123:[1,87]},{1:[2,180],6:[2,180],25:[2,180],26:[2,180],47:[2,180],52:[2,180],55:[2,180],70:[2,180],75:[2,180],83:[2,180],88:[2,180],90:[2,180],99:[2,180],100:85,101:[2,180],102:[2,180],103:[2,180],106:86,107:[2,180],108:67,115:[2,180],123:[2,180],125:[2,180],126:[2,180],129:[1,76],130:[2,180],131:[2,180],132:[2,180],133:[2,180],134:[2,180]},{1:[2,181],6:[2,181],25:[2,181],26:[2,181],47:[2,181],52:[2,181],55:[2,181],70:[2,181],75:[2,181],83:[2,181],88:[2,181],90:[2,181],99:[2,181],100:85,101:[2,181],102:[2,181],103:[2,181],106:86,107:[2,181],108:67,115:[2,181],123:[2,181],125:[2,181],126:[2,181],129:[1,76],130:[2,181],131:[2,181],132:[2,181],133:[2,181],134:[2,181]},{1:[2,182],6:[2,182],25:[2,182],26:[2,182],47:[2,182],52:[2,182],55:[2,182],64:[2,68],65:[2,68],66:[2,68],68:[2,68],70:[2,182],71:[2,68],75:[2,182],81:[2,68],82:[2,68],83:[2,182],88:[2,182],90:[2,182],99:[2,182],101:[2,182],102:[2,182],103:[2,182],107:[2,182],115:[2,182],123:[2,182],125:[2,182],126:[2,182],129:[2,182],130:[2,182],131:[2,182],132:[2,182],133:[2,182],134:[2,182]},{60:91,64:[1,93],65:[1,94],66:[1,95],67:96,68:[1,97],71:[1,98],78:90,81:[1,92],82:[2,103]},{60:100,64:[1,93],65:[1,94],66:[1,95],67:96,68:[1,97],71:[1,98],78:99,81:[1,92],82:[2,103]},{64:[2,71],65:[2,71],66:[2,71],68:[2,71],71:[2,71],81:[2,71],82:[2,71]},{1:[2,183],6:[2,183],25:[2,183],26:[2,183],47:[2,183],52:[2,183],55:[2,183],64:[2,68],65:[2,68],66:[2,68],68:[2,68],70:[2,183],71:[2,68],75:[2,183],81:[2,68],82:[2,68],83:[2,183],88:[2,183],90:[2,183],99:[2,183],101:[2,183],102:[2,183],103:[2,183],107:[2,183],115:[2,183],123:[2,183],125:[2,183],126:[2,183],129:[2,183],130:[2,183],131:[2,183],132:[2,183],133:[2,183],134:[2,183]},{1:[2,184],6:[2,184],25:[2,184],26:[2,184],47:[2,184],52:[2,184],55:[2,184],70:[2,184],75:[2,184],83:[2,184],88:[2,184],90:[2,184],99:[2,184],101:[2,184],102:[2,184],103:[2,184],107:[2,184],115:[2,184],123:[2,184],125:[2,184],126:[2,184],129:[2,184],130:[2,184],131:[2,184],132:[2,184],133:[2,184],134:[2,184]},{1:[2,185],6:[2,185],25:[2,185],26:[2,185],47:[2,185],52:[2,185],55:[2,185],70:[2,185],75:[2,185],83:[2,185],88:[2,185],90:[2,185],99:[2,185],101:[2,185],102:[2,185],103:[2,185],107:[2,185],115:[2,185],123:[2,185],125:[2,185],126:[2,185],129:[2,185],130:[2,185],131:[2,185],132:[2,185],133:[2,185],134:[2,185]},{8:202,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,203],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:204,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{5:205,25:[1,5],122:[1,206]},{1:[2,128],6:[2,128],25:[2,128],26:[2,128],47:[2,128],52:[2,128],55:[2,128],70:[2,128],75:[2,128],83:[2,128],88:[2,128],90:[2,128],94:207,95:[1,208],96:[1,209],99:[2,128],101:[2,128],102:[2,128],103:[2,128],107:[2,128],115:[2,128],123:[2,128],125:[2,128],126:[2,128],129:[2,128],130:[2,128],131:[2,128],132:[2,128],133:[2,128],134:[2,128]},{1:[2,140],6:[2,140],25:[2,140],26:[2,140],47:[2,140],52:[2,140],55:[2,140],70:[2,140],75:[2,140],83:[2,140],88:[2,140],90:[2,140],99:[2,140],101:[2,140],102:[2,140],103:[2,140],107:[2,140],115:[2,140],123:[2,140],125:[2,140],126:[2,140],129:[2,140],130:[2,140],131:[2,140],132:[2,140],133:[2,140],134:[2,140]},{1:[2,148],6:[2,148],25:[2,148],26:[2,148],47:[2,148],52:[2,148],55:[2,148],70:[2,148],75:[2,148],83:[2,148],88:[2,148],90:[2,148],99:[2,148],101:[2,148],102:[2,148],103:[2,148],107:[2,148],115:[2,148],123:[2,148],125:[2,148],126:[2,148],129:[2,148],130:[2,148],131:[2,148],132:[2,148],133:[2,148],134:[2,148]},{25:[1,210],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{117:211,119:212,120:[1,213]},{1:[2,92],6:[2,92],25:[2,92],26:[2,92],47:[2,92],52:[2,92],55:[2,92],70:[2,92],75:[2,92],83:[2,92],88:[2,92],90:[2,92],99:[2,92],101:[2,92],102:[2,92],103:[2,92],107:[2,92],115:[2,92],123:[2,92],125:[2,92],126:[2,92],129:[2,92],130:[2,92],131:[2,92],132:[2,92],133:[2,92],134:[2,92]},{8:214,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,95],5:215,6:[2,95],25:[1,5],26:[2,95],47:[2,95],52:[2,95],55:[2,95],64:[2,68],65:[2,68],66:[2,68],68:[2,68],70:[2,95],71:[2,68],75:[2,95],77:[1,216],81:[2,68],82:[2,68],83:[2,95],88:[2,95],90:[2,95],99:[2,95],101:[2,95],102:[2,95],103:[2,95],107:[2,95],115:[2,95],123:[2,95],125:[2,95],126:[2,95],129:[2,95],130:[2,95],131:[2,95],132:[2,95],133:[2,95],134:[2,95]},{1:[2,133],6:[2,133],25:[2,133],26:[2,133],47:[2,133],52:[2,133],55:[2,133],70:[2,133],75:[2,133],83:[2,133],88:[2,133],90:[2,133],99:[2,133],100:85,101:[2,133],102:[2,133],103:[2,133],106:86,107:[2,133],108:67,115:[2,133],123:[2,133],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,44],6:[2,44],26:[2,44],99:[2,44],100:85,101:[2,44],103:[2,44],106:86,107:[2,44],108:67,123:[2,44],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{6:[1,72],99:[1,217]},{4:218,7:4,8:6,9:7,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{6:[2,124],25:[2,124],52:[2,124],55:[1,220],88:[2,124],89:219,90:[1,188],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,110],6:[2,110],25:[2,110],26:[2,110],38:[2,110],47:[2,110],52:[2,110],55:[2,110],64:[2,110],65:[2,110],66:[2,110],68:[2,110],70:[2,110],71:[2,110],75:[2,110],81:[2,110],82:[2,110],83:[2,110],88:[2,110],90:[2,110],99:[2,110],101:[2,110],102:[2,110],103:[2,110],107:[2,110],113:[2,110],114:[2,110],115:[2,110],123:[2,110],125:[2,110],126:[2,110],129:[2,110],130:[2,110],131:[2,110],132:[2,110],133:[2,110],134:[2,110]},{6:[2,51],25:[2,51],51:221,52:[1,222],88:[2,51]},{6:[2,119],25:[2,119],26:[2,119],52:[2,119],83:[2,119],88:[2,119]},{8:197,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,144],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,58:145,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],84:223,85:[1,56],86:[1,57],87:[1,55],91:143,93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{6:[2,125],25:[2,125],26:[2,125],52:[2,125],83:[2,125],88:[2,125]},{1:[2,109],6:[2,109],25:[2,109],26:[2,109],38:[2,109],41:[2,109],47:[2,109],52:[2,109],55:[2,109],64:[2,109],65:[2,109],66:[2,109],68:[2,109],70:[2,109],71:[2,109],75:[2,109],77:[2,109],81:[2,109],82:[2,109],83:[2,109],88:[2,109],90:[2,109],99:[2,109],101:[2,109],102:[2,109],103:[2,109],107:[2,109],115:[2,109],123:[2,109],125:[2,109],126:[2,109],127:[2,109],128:[2,109],129:[2,109],130:[2,109],131:[2,109],132:[2,109],133:[2,109],134:[2,109],135:[2,109]},{5:224,25:[1,5],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,136],6:[2,136],25:[2,136],26:[2,136],47:[2,136],52:[2,136],55:[2,136],70:[2,136],75:[2,136],83:[2,136],88:[2,136],90:[2,136],99:[2,136],100:85,101:[1,63],102:[1,225],103:[1,64],106:86,107:[1,66],108:67,115:[2,136],123:[2,136],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,138],6:[2,138],25:[2,138],26:[2,138],47:[2,138],52:[2,138],55:[2,138],70:[2,138],75:[2,138],83:[2,138],88:[2,138],90:[2,138],99:[2,138],100:85,101:[1,63],102:[1,226],103:[1,64],106:86,107:[1,66],108:67,115:[2,138],123:[2,138],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,144],6:[2,144],25:[2,144],26:[2,144],47:[2,144],52:[2,144],55:[2,144],70:[2,144],75:[2,144],83:[2,144],88:[2,144],90:[2,144],99:[2,144],101:[2,144],102:[2,144],103:[2,144],107:[2,144],115:[2,144],123:[2,144],125:[2,144],126:[2,144],129:[2,144],130:[2,144],131:[2,144],132:[2,144],133:[2,144],134:[2,144]},{1:[2,145],6:[2,145],25:[2,145],26:[2,145],47:[2,145],52:[2,145],55:[2,145],70:[2,145],75:[2,145],83:[2,145],88:[2,145],90:[2,145],99:[2,145],100:85,101:[1,63],102:[2,145],103:[1,64],106:86,107:[1,66],108:67,115:[2,145],123:[2,145],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,149],6:[2,149],25:[2,149],26:[2,149],47:[2,149],52:[2,149],55:[2,149],70:[2,149],75:[2,149],83:[2,149],88:[2,149],90:[2,149],99:[2,149],101:[2,149],102:[2,149],103:[2,149],107:[2,149],115:[2,149],123:[2,149],125:[2,149],126:[2,149],129:[2,149],130:[2,149],131:[2,149],132:[2,149],133:[2,149],134:[2,149]},{113:[2,151],114:[2,151]},{27:156,28:[1,71],56:157,57:158,73:[1,68],87:[1,112],110:227,112:155},{52:[1,228],113:[2,156],114:[2,156]},{52:[2,153],113:[2,153],114:[2,153]},{52:[2,154],113:[2,154],114:[2,154]},{52:[2,155],113:[2,155],114:[2,155]},{1:[2,150],6:[2,150],25:[2,150],26:[2,150],47:[2,150],52:[2,150],55:[2,150],70:[2,150],75:[2,150],83:[2,150],88:[2,150],90:[2,150],99:[2,150],101:[2,150],102:[2,150],103:[2,150],107:[2,150],115:[2,150],123:[2,150],125:[2,150],126:[2,150],129:[2,150],130:[2,150],131:[2,150],132:[2,150],133:[2,150],134:[2,150]},{8:229,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:230,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{6:[2,51],25:[2,51],51:231,52:[1,232],75:[2,51]},{6:[2,87],25:[2,87],26:[2,87],52:[2,87],75:[2,87]},{6:[2,37],25:[2,37],26:[2,37],41:[1,233],52:[2,37],75:[2,37]},{6:[2,40],25:[2,40],26:[2,40],52:[2,40],75:[2,40]},{6:[2,41],25:[2,41],26:[2,41],41:[2,41],52:[2,41],75:[2,41]},{6:[2,42],25:[2,42],26:[2,42],41:[2,42],52:[2,42],75:[2,42]},{6:[2,43],25:[2,43],26:[2,43],41:[2,43],52:[2,43],75:[2,43]},{1:[2,5],6:[2,5],26:[2,5],99:[2,5]},{1:[2,25],6:[2,25],25:[2,25],26:[2,25],47:[2,25],52:[2,25],55:[2,25],70:[2,25],75:[2,25],83:[2,25],88:[2,25],90:[2,25],95:[2,25],96:[2,25],99:[2,25],101:[2,25],102:[2,25],103:[2,25],107:[2,25],115:[2,25],118:[2,25],120:[2,25],123:[2,25],125:[2,25],126:[2,25],129:[2,25],130:[2,25],131:[2,25],132:[2,25],133:[2,25],134:[2,25]},{1:[2,187],6:[2,187],25:[2,187],26:[2,187],47:[2,187],52:[2,187],55:[2,187],70:[2,187],75:[2,187],83:[2,187],88:[2,187],90:[2,187],99:[2,187],100:85,101:[2,187],102:[2,187],103:[2,187],106:86,107:[2,187],108:67,115:[2,187],123:[2,187],125:[2,187],126:[2,187],129:[1,76],130:[1,79],131:[2,187],132:[2,187],133:[2,187],134:[2,187]},{1:[2,188],6:[2,188],25:[2,188],26:[2,188],47:[2,188],52:[2,188],55:[2,188],70:[2,188],75:[2,188],83:[2,188],88:[2,188],90:[2,188],99:[2,188],100:85,101:[2,188],102:[2,188],103:[2,188],106:86,107:[2,188],108:67,115:[2,188],123:[2,188],125:[2,188],126:[2,188],129:[1,76],130:[1,79],131:[2,188],132:[2,188],133:[2,188],134:[2,188]},{1:[2,189],6:[2,189],25:[2,189],26:[2,189],47:[2,189],52:[2,189],55:[2,189],70:[2,189],75:[2,189],83:[2,189],88:[2,189],90:[2,189],99:[2,189],100:85,101:[2,189],102:[2,189],103:[2,189],106:86,107:[2,189],108:67,115:[2,189],123:[2,189],125:[2,189],126:[2,189],129:[1,76],130:[2,189],131:[2,189],132:[2,189],133:[2,189],134:[2,189]},{1:[2,190],6:[2,190],25:[2,190],26:[2,190],47:[2,190],52:[2,190],55:[2,190],70:[2,190],75:[2,190],83:[2,190],88:[2,190],90:[2,190],99:[2,190],100:85,101:[2,190],102:[2,190],103:[2,190],106:86,107:[2,190],108:67,115:[2,190],123:[2,190],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[2,190],132:[2,190],133:[2,190],134:[2,190]},{1:[2,191],6:[2,191],25:[2,191],26:[2,191],47:[2,191],52:[2,191],55:[2,191],70:[2,191],75:[2,191],83:[2,191],88:[2,191],90:[2,191],99:[2,191],100:85,101:[2,191],102:[2,191],103:[2,191],106:86,107:[2,191],108:67,115:[2,191],123:[2,191],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[2,191],133:[2,191],134:[1,83]},{1:[2,192],6:[2,192],25:[2,192],26:[2,192],47:[2,192],52:[2,192],55:[2,192],70:[2,192],75:[2,192],83:[2,192],88:[2,192],90:[2,192],99:[2,192],100:85,101:[2,192],102:[2,192],103:[2,192],106:86,107:[2,192],108:67,115:[2,192],123:[2,192],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[2,192],134:[1,83]},{1:[2,193],6:[2,193],25:[2,193],26:[2,193],47:[2,193],52:[2,193],55:[2,193],70:[2,193],75:[2,193],83:[2,193],88:[2,193],90:[2,193],99:[2,193],100:85,101:[2,193],102:[2,193],103:[2,193],106:86,107:[2,193],108:67,115:[2,193],123:[2,193],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[2,193],133:[2,193],134:[2,193]},{1:[2,178],6:[2,178],25:[2,178],26:[2,178],47:[2,178],52:[2,178],55:[2,178],70:[2,178],75:[2,178],83:[2,178],88:[2,178],90:[2,178],99:[2,178],100:85,101:[1,63],102:[2,178],103:[1,64],106:86,107:[1,66],108:67,115:[2,178],123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,177],6:[2,177],25:[2,177],26:[2,177],47:[2,177],52:[2,177],55:[2,177],70:[2,177],75:[2,177],83:[2,177],88:[2,177],90:[2,177],99:[2,177],100:85,101:[1,63],102:[2,177],103:[1,64],106:86,107:[1,66],108:67,115:[2,177],123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,99],6:[2,99],25:[2,99],26:[2,99],47:[2,99],52:[2,99],55:[2,99],64:[2,99],65:[2,99],66:[2,99],68:[2,99],70:[2,99],71:[2,99],75:[2,99],81:[2,99],82:[2,99],83:[2,99],88:[2,99],90:[2,99],99:[2,99],101:[2,99],102:[2,99],103:[2,99],107:[2,99],115:[2,99],123:[2,99],125:[2,99],126:[2,99],129:[2,99],130:[2,99],131:[2,99],132:[2,99],133:[2,99],134:[2,99]},{1:[2,76],6:[2,76],25:[2,76],26:[2,76],38:[2,76],47:[2,76],52:[2,76],55:[2,76],64:[2,76],65:[2,76],66:[2,76],68:[2,76],70:[2,76],71:[2,76],75:[2,76],77:[2,76],81:[2,76],82:[2,76],83:[2,76],88:[2,76],90:[2,76],99:[2,76],101:[2,76],102:[2,76],103:[2,76],107:[2,76],115:[2,76],123:[2,76],125:[2,76],126:[2,76],127:[2,76],128:[2,76],129:[2,76],130:[2,76],131:[2,76],132:[2,76],133:[2,76],134:[2,76],135:[2,76]},{1:[2,77],6:[2,77],25:[2,77],26:[2,77],38:[2,77],47:[2,77],52:[2,77],55:[2,77],64:[2,77],65:[2,77],66:[2,77],68:[2,77],70:[2,77],71:[2,77],75:[2,77],77:[2,77],81:[2,77],82:[2,77],83:[2,77],88:[2,77],90:[2,77],99:[2,77],101:[2,77],102:[2,77],103:[2,77],107:[2,77],115:[2,77],123:[2,77],125:[2,77],126:[2,77],127:[2,77],128:[2,77],129:[2,77],130:[2,77],131:[2,77],132:[2,77],133:[2,77],134:[2,77],135:[2,77]},{1:[2,78],6:[2,78],25:[2,78],26:[2,78],38:[2,78],47:[2,78],52:[2,78],55:[2,78],64:[2,78],65:[2,78],66:[2,78],68:[2,78],70:[2,78],71:[2,78],75:[2,78],77:[2,78],81:[2,78],82:[2,78],83:[2,78],88:[2,78],90:[2,78],99:[2,78],101:[2,78],102:[2,78],103:[2,78],107:[2,78],115:[2,78],123:[2,78],125:[2,78],126:[2,78],127:[2,78],128:[2,78],129:[2,78],130:[2,78],131:[2,78],132:[2,78],133:[2,78],134:[2,78],135:[2,78]},{70:[1,234]},{55:[1,189],70:[2,83],89:235,90:[1,188],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{70:[2,84]},{8:236,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,70:[2,118],73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{12:[2,112],28:[2,112],30:[2,112],31:[2,112],33:[2,112],34:[2,112],35:[2,112],36:[2,112],43:[2,112],44:[2,112],45:[2,112],49:[2,112],50:[2,112],70:[2,112],73:[2,112],76:[2,112],80:[2,112],85:[2,112],86:[2,112],87:[2,112],93:[2,112],97:[2,112],98:[2,112],101:[2,112],103:[2,112],105:[2,112],107:[2,112],116:[2,112],122:[2,112],124:[2,112],125:[2,112],126:[2,112],127:[2,112],128:[2,112]},{12:[2,113],28:[2,113],30:[2,113],31:[2,113],33:[2,113],34:[2,113],35:[2,113],36:[2,113],43:[2,113],44:[2,113],45:[2,113],49:[2,113],50:[2,113],70:[2,113],73:[2,113],76:[2,113],80:[2,113],85:[2,113],86:[2,113],87:[2,113],93:[2,113],97:[2,113],98:[2,113],101:[2,113],103:[2,113],105:[2,113],107:[2,113],116:[2,113],122:[2,113],124:[2,113],125:[2,113],126:[2,113],127:[2,113],128:[2,113]},{1:[2,82],6:[2,82],25:[2,82],26:[2,82],38:[2,82],47:[2,82],52:[2,82],55:[2,82],64:[2,82],65:[2,82],66:[2,82],68:[2,82],70:[2,82],71:[2,82],75:[2,82],77:[2,82],81:[2,82],82:[2,82],83:[2,82],88:[2,82],90:[2,82],99:[2,82],101:[2,82],102:[2,82],103:[2,82],107:[2,82],115:[2,82],123:[2,82],125:[2,82],126:[2,82],127:[2,82],128:[2,82],129:[2,82],130:[2,82],131:[2,82],132:[2,82],133:[2,82],134:[2,82],135:[2,82]},{1:[2,100],6:[2,100],25:[2,100],26:[2,100],47:[2,100],52:[2,100],55:[2,100],64:[2,100],65:[2,100],66:[2,100],68:[2,100],70:[2,100],71:[2,100],75:[2,100],81:[2,100],82:[2,100],83:[2,100],88:[2,100],90:[2,100],99:[2,100],101:[2,100],102:[2,100],103:[2,100],107:[2,100],115:[2,100],123:[2,100],125:[2,100],126:[2,100],129:[2,100],130:[2,100],131:[2,100],132:[2,100],133:[2,100],134:[2,100]},{1:[2,34],6:[2,34],25:[2,34],26:[2,34],47:[2,34],52:[2,34],55:[2,34],70:[2,34],75:[2,34],83:[2,34],88:[2,34],90:[2,34],99:[2,34],100:85,101:[2,34],102:[2,34],103:[2,34],106:86,107:[2,34],108:67,115:[2,34],123:[2,34],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{8:237,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:238,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,105],6:[2,105],25:[2,105],26:[2,105],47:[2,105],52:[2,105],55:[2,105],64:[2,105],65:[2,105],66:[2,105],68:[2,105],70:[2,105],71:[2,105],75:[2,105],81:[2,105],82:[2,105],83:[2,105],88:[2,105],90:[2,105],99:[2,105],101:[2,105],102:[2,105],103:[2,105],107:[2,105],115:[2,105],123:[2,105],125:[2,105],126:[2,105],129:[2,105],130:[2,105],131:[2,105],132:[2,105],133:[2,105],134:[2,105]},{6:[2,51],25:[2,51],51:239,52:[1,222],83:[2,51]},{6:[2,124],25:[2,124],26:[2,124],52:[2,124],55:[1,240],83:[2,124],88:[2,124],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{48:241,49:[1,58],50:[1,59]},{27:107,28:[1,71],42:108,53:242,54:106,56:109,57:110,73:[1,68],86:[1,111],87:[1,112]},{47:[2,57],52:[2,57]},{8:243,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,194],6:[2,194],25:[2,194],26:[2,194],47:[2,194],52:[2,194],55:[2,194],70:[2,194],75:[2,194],83:[2,194],88:[2,194],90:[2,194],99:[2,194],100:85,101:[2,194],102:[2,194],103:[2,194],106:86,107:[2,194],108:67,115:[2,194],123:[2,194],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{8:244,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,196],6:[2,196],25:[2,196],26:[2,196],47:[2,196],52:[2,196],55:[2,196],70:[2,196],75:[2,196],83:[2,196],88:[2,196],90:[2,196],99:[2,196],100:85,101:[2,196],102:[2,196],103:[2,196],106:86,107:[2,196],108:67,115:[2,196],123:[2,196],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,176],6:[2,176],25:[2,176],26:[2,176],47:[2,176],52:[2,176],55:[2,176],70:[2,176],75:[2,176],83:[2,176],88:[2,176],90:[2,176],99:[2,176],101:[2,176],102:[2,176],103:[2,176],107:[2,176],115:[2,176],123:[2,176],125:[2,176],126:[2,176],129:[2,176],130:[2,176],131:[2,176],132:[2,176],133:[2,176],134:[2,176]},{8:245,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,129],6:[2,129],25:[2,129],26:[2,129],47:[2,129],52:[2,129],55:[2,129],70:[2,129],75:[2,129],83:[2,129],88:[2,129],90:[2,129],95:[1,246],99:[2,129],101:[2,129],102:[2,129],103:[2,129],107:[2,129],115:[2,129],123:[2,129],125:[2,129],126:[2,129],129:[2,129],130:[2,129],131:[2,129],132:[2,129],133:[2,129],134:[2,129]},{5:247,25:[1,5]},{27:248,28:[1,71]},{117:249,119:212,120:[1,213]},{26:[1,250],118:[1,251],119:252,120:[1,213]},{26:[2,169],118:[2,169],120:[2,169]},{8:254,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],92:253,93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,93],5:255,6:[2,93],25:[1,5],26:[2,93],47:[2,93],52:[2,93],55:[2,93],70:[2,93],75:[2,93],83:[2,93],88:[2,93],90:[2,93],99:[2,93],100:85,101:[1,63],102:[2,93],103:[1,64],106:86,107:[1,66],108:67,115:[2,93],123:[2,93],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,96],6:[2,96],25:[2,96],26:[2,96],47:[2,96],52:[2,96],55:[2,96],70:[2,96],75:[2,96],83:[2,96],88:[2,96],90:[2,96],99:[2,96],101:[2,96],102:[2,96],103:[2,96],107:[2,96],115:[2,96],123:[2,96],125:[2,96],126:[2,96],129:[2,96],130:[2,96],131:[2,96],132:[2,96],133:[2,96],134:[2,96]},{8:256,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,134],6:[2,134],25:[2,134],26:[2,134],47:[2,134],52:[2,134],55:[2,134],64:[2,134],65:[2,134],66:[2,134],68:[2,134],70:[2,134],71:[2,134],75:[2,134],81:[2,134],82:[2,134],83:[2,134],88:[2,134],90:[2,134],99:[2,134],101:[2,134],102:[2,134],103:[2,134],107:[2,134],115:[2,134],123:[2,134],125:[2,134],126:[2,134],129:[2,134],130:[2,134],131:[2,134],132:[2,134],133:[2,134],134:[2,134]},{6:[1,72],26:[1,257]},{8:258,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{6:[2,63],12:[2,113],25:[2,63],28:[2,113],30:[2,113],31:[2,113],33:[2,113],34:[2,113],35:[2,113],36:[2,113],43:[2,113],44:[2,113],45:[2,113],49:[2,113],50:[2,113],52:[2,63],73:[2,113],76:[2,113],80:[2,113],85:[2,113],86:[2,113],87:[2,113],88:[2,63],93:[2,113],97:[2,113],98:[2,113],101:[2,113],103:[2,113],105:[2,113],107:[2,113],116:[2,113],122:[2,113],124:[2,113],125:[2,113],126:[2,113],127:[2,113],128:[2,113]},{6:[1,260],25:[1,261],88:[1,259]},{6:[2,52],8:197,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[2,52],26:[2,52],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,58:145,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],83:[2,52],85:[1,56],86:[1,57],87:[1,55],88:[2,52],91:262,93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{6:[2,51],25:[2,51],26:[2,51],51:263,52:[1,222]},{1:[2,173],6:[2,173],25:[2,173],26:[2,173],47:[2,173],52:[2,173],55:[2,173],70:[2,173],75:[2,173],83:[2,173],88:[2,173],90:[2,173],99:[2,173],101:[2,173],102:[2,173],103:[2,173],107:[2,173],115:[2,173],118:[2,173],123:[2,173],125:[2,173],126:[2,173],129:[2,173],130:[2,173],131:[2,173],132:[2,173],133:[2,173],134:[2,173]},{8:264,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:265,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{113:[2,152],114:[2,152]},{27:156,28:[1,71],56:157,57:158,73:[1,68],87:[1,112],112:266},{1:[2,158],6:[2,158],25:[2,158],26:[2,158],47:[2,158],52:[2,158],55:[2,158],70:[2,158],75:[2,158],83:[2,158],88:[2,158],90:[2,158],99:[2,158],100:85,101:[2,158],102:[1,267],103:[2,158],106:86,107:[2,158],108:67,115:[1,268],123:[2,158],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,159],6:[2,159],25:[2,159],26:[2,159],47:[2,159],52:[2,159],55:[2,159],70:[2,159],75:[2,159],83:[2,159],88:[2,159],90:[2,159],99:[2,159],100:85,101:[2,159],102:[1,269],103:[2,159],106:86,107:[2,159],108:67,115:[2,159],123:[2,159],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{6:[1,271],25:[1,272],75:[1,270]},{6:[2,52],11:165,25:[2,52],26:[2,52],27:166,28:[1,71],29:167,30:[1,69],31:[1,70],39:273,40:164,42:168,44:[1,46],75:[2,52],86:[1,111]},{8:274,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,275],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,81],6:[2,81],25:[2,81],26:[2,81],38:[2,81],47:[2,81],52:[2,81],55:[2,81],64:[2,81],65:[2,81],66:[2,81],68:[2,81],70:[2,81],71:[2,81],75:[2,81],77:[2,81],81:[2,81],82:[2,81],83:[2,81],88:[2,81],90:[2,81],99:[2,81],101:[2,81],102:[2,81],103:[2,81],107:[2,81],115:[2,81],123:[2,81],125:[2,81],126:[2,81],127:[2,81],128:[2,81],129:[2,81],130:[2,81],131:[2,81],132:[2,81],133:[2,81],134:[2,81],135:[2,81]},{8:276,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,70:[2,116],73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{70:[2,117],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,35],6:[2,35],25:[2,35],26:[2,35],47:[2,35],52:[2,35],55:[2,35],70:[2,35],75:[2,35],83:[2,35],88:[2,35],90:[2,35],99:[2,35],100:85,101:[2,35],102:[2,35],103:[2,35],106:86,107:[2,35],108:67,115:[2,35],123:[2,35],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{26:[1,277],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{6:[1,260],25:[1,261],83:[1,278]},{6:[2,63],25:[2,63],26:[2,63],52:[2,63],83:[2,63],88:[2,63]},{5:279,25:[1,5]},{47:[2,55],52:[2,55]},{47:[2,58],52:[2,58],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{26:[1,280],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{5:281,25:[1,5],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{5:282,25:[1,5]},{1:[2,130],6:[2,130],25:[2,130],26:[2,130],47:[2,130],52:[2,130],55:[2,130],70:[2,130],75:[2,130],83:[2,130],88:[2,130],90:[2,130],99:[2,130],101:[2,130],102:[2,130],103:[2,130],107:[2,130],115:[2,130],123:[2,130],125:[2,130],126:[2,130],129:[2,130],130:[2,130],131:[2,130],132:[2,130],133:[2,130],134:[2,130]},{5:283,25:[1,5]},{26:[1,284],118:[1,285],119:252,120:[1,213]},{1:[2,167],6:[2,167],25:[2,167],26:[2,167],47:[2,167],52:[2,167],55:[2,167],70:[2,167],75:[2,167],83:[2,167],88:[2,167],90:[2,167],99:[2,167],101:[2,167],102:[2,167],103:[2,167],107:[2,167],115:[2,167],123:[2,167],125:[2,167],126:[2,167],129:[2,167],130:[2,167],131:[2,167],132:[2,167],133:[2,167],134:[2,167]},{5:286,25:[1,5]},{26:[2,170],118:[2,170],120:[2,170]},{5:287,25:[1,5],52:[1,288]},{25:[2,126],52:[2,126],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,94],6:[2,94],25:[2,94],26:[2,94],47:[2,94],52:[2,94],55:[2,94],70:[2,94],75:[2,94],83:[2,94],88:[2,94],90:[2,94],99:[2,94],101:[2,94],102:[2,94],103:[2,94],107:[2,94],115:[2,94],123:[2,94],125:[2,94],126:[2,94],129:[2,94],130:[2,94],131:[2,94],132:[2,94],133:[2,94],134:[2,94]},{1:[2,97],5:289,6:[2,97],25:[1,5],26:[2,97],47:[2,97],52:[2,97],55:[2,97],70:[2,97],75:[2,97],83:[2,97],88:[2,97],90:[2,97],99:[2,97],100:85,101:[1,63],102:[2,97],103:[1,64],106:86,107:[1,66],108:67,115:[2,97],123:[2,97],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{99:[1,290]},{88:[1,291],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,111],6:[2,111],25:[2,111],26:[2,111],38:[2,111],47:[2,111],52:[2,111],55:[2,111],64:[2,111],65:[2,111],66:[2,111],68:[2,111],70:[2,111],71:[2,111],75:[2,111],81:[2,111],82:[2,111],83:[2,111],88:[2,111],90:[2,111],99:[2,111],101:[2,111],102:[2,111],103:[2,111],107:[2,111],113:[2,111],114:[2,111],115:[2,111],123:[2,111],125:[2,111],126:[2,111],129:[2,111],130:[2,111],131:[2,111],132:[2,111],133:[2,111],134:[2,111]},{8:197,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,58:145,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],91:292,93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:197,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,144],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,58:145,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],84:293,85:[1,56],86:[1,57],87:[1,55],91:143,93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{6:[2,120],25:[2,120],26:[2,120],52:[2,120],83:[2,120],88:[2,120]},{6:[1,260],25:[1,261],26:[1,294]},{1:[2,137],6:[2,137],25:[2,137],26:[2,137],47:[2,137],52:[2,137],55:[2,137],70:[2,137],75:[2,137],83:[2,137],88:[2,137],90:[2,137],99:[2,137],100:85,101:[1,63],102:[2,137],103:[1,64],106:86,107:[1,66],108:67,115:[2,137],123:[2,137],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,139],6:[2,139],25:[2,139],26:[2,139],47:[2,139],52:[2,139],55:[2,139],70:[2,139],75:[2,139],83:[2,139],88:[2,139],90:[2,139],99:[2,139],100:85,101:[1,63],102:[2,139],103:[1,64],106:86,107:[1,66],108:67,115:[2,139],123:[2,139],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{113:[2,157],114:[2,157]},{8:295,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:296,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:297,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,85],6:[2,85],25:[2,85],26:[2,85],38:[2,85],47:[2,85],52:[2,85],55:[2,85],64:[2,85],65:[2,85],66:[2,85],68:[2,85],70:[2,85],71:[2,85],75:[2,85],81:[2,85],82:[2,85],83:[2,85],88:[2,85],90:[2,85],99:[2,85],101:[2,85],102:[2,85],103:[2,85],107:[2,85],113:[2,85],114:[2,85],115:[2,85],123:[2,85],125:[2,85],126:[2,85],129:[2,85],130:[2,85],131:[2,85],132:[2,85],133:[2,85],134:[2,85]},{11:165,27:166,28:[1,71],29:167,30:[1,69],31:[1,70],39:298,40:164,42:168,44:[1,46],86:[1,111]},{6:[2,86],11:165,25:[2,86],26:[2,86],27:166,28:[1,71],29:167,30:[1,69],31:[1,70],39:163,40:164,42:168,44:[1,46],52:[2,86],74:299,86:[1,111]},{6:[2,88],25:[2,88],26:[2,88],52:[2,88],75:[2,88]},{6:[2,38],25:[2,38],26:[2,38],52:[2,38],75:[2,38],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{8:300,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{70:[2,115],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,36],6:[2,36],25:[2,36],26:[2,36],47:[2,36],52:[2,36],55:[2,36],70:[2,36],75:[2,36],83:[2,36],88:[2,36],90:[2,36],99:[2,36],101:[2,36],102:[2,36],103:[2,36],107:[2,36],115:[2,36],123:[2,36],125:[2,36],126:[2,36],129:[2,36],130:[2,36],131:[2,36],132:[2,36],133:[2,36],134:[2,36]},{1:[2,106],6:[2,106],25:[2,106],26:[2,106],47:[2,106],52:[2,106],55:[2,106],64:[2,106],65:[2,106],66:[2,106],68:[2,106],70:[2,106],71:[2,106],75:[2,106],81:[2,106],82:[2,106],83:[2,106],88:[2,106],90:[2,106],99:[2,106],101:[2,106],102:[2,106],103:[2,106],107:[2,106],115:[2,106],123:[2,106],125:[2,106],126:[2,106],129:[2,106],130:[2,106],131:[2,106],132:[2,106],133:[2,106],134:[2,106]},{1:[2,47],6:[2,47],25:[2,47],26:[2,47],47:[2,47],52:[2,47],55:[2,47],70:[2,47],75:[2,47],83:[2,47],88:[2,47],90:[2,47],99:[2,47],101:[2,47],102:[2,47],103:[2,47],107:[2,47],115:[2,47],123:[2,47],125:[2,47],126:[2,47],129:[2,47],130:[2,47],131:[2,47],132:[2,47],133:[2,47],134:[2,47]},{1:[2,195],6:[2,195],25:[2,195],26:[2,195],47:[2,195],52:[2,195],55:[2,195],70:[2,195],75:[2,195],83:[2,195],88:[2,195],90:[2,195],99:[2,195],101:[2,195],102:[2,195],103:[2,195],107:[2,195],115:[2,195],123:[2,195],125:[2,195],126:[2,195],129:[2,195],130:[2,195],131:[2,195],132:[2,195],133:[2,195],134:[2,195]},{1:[2,174],6:[2,174],25:[2,174],26:[2,174],47:[2,174],52:[2,174],55:[2,174],70:[2,174],75:[2,174],83:[2,174],88:[2,174],90:[2,174],99:[2,174],101:[2,174],102:[2,174],103:[2,174],107:[2,174],115:[2,174],118:[2,174],123:[2,174],125:[2,174],126:[2,174],129:[2,174],130:[2,174],131:[2,174],132:[2,174],133:[2,174],134:[2,174]},{1:[2,131],6:[2,131],25:[2,131],26:[2,131],47:[2,131],52:[2,131],55:[2,131],70:[2,131],75:[2,131],83:[2,131],88:[2,131],90:[2,131],99:[2,131],101:[2,131],102:[2,131],103:[2,131],107:[2,131],115:[2,131],123:[2,131],125:[2,131],126:[2,131],129:[2,131],130:[2,131],131:[2,131],132:[2,131],133:[2,131],134:[2,131]},{1:[2,132],6:[2,132],25:[2,132],26:[2,132],47:[2,132],52:[2,132],55:[2,132],70:[2,132],75:[2,132],83:[2,132],88:[2,132],90:[2,132],95:[2,132],99:[2,132],101:[2,132],102:[2,132],103:[2,132],107:[2,132],115:[2,132],123:[2,132],125:[2,132],126:[2,132],129:[2,132],130:[2,132],131:[2,132],132:[2,132],133:[2,132],134:[2,132]},{1:[2,165],6:[2,165],25:[2,165],26:[2,165],47:[2,165],52:[2,165],55:[2,165],70:[2,165],75:[2,165],83:[2,165],88:[2,165],90:[2,165],99:[2,165],101:[2,165],102:[2,165],103:[2,165],107:[2,165],115:[2,165],123:[2,165],125:[2,165],126:[2,165],129:[2,165],130:[2,165],131:[2,165],132:[2,165],133:[2,165],134:[2,165]},{5:301,25:[1,5]},{26:[1,302]},{6:[1,303],26:[2,171],118:[2,171],120:[2,171]},{8:304,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,98],6:[2,98],25:[2,98],26:[2,98],47:[2,98],52:[2,98],55:[2,98],70:[2,98],75:[2,98],83:[2,98],88:[2,98],90:[2,98],99:[2,98],101:[2,98],102:[2,98],103:[2,98],107:[2,98],115:[2,98],123:[2,98],125:[2,98],126:[2,98],129:[2,98],130:[2,98],131:[2,98],132:[2,98],133:[2,98],134:[2,98]},{1:[2,135],6:[2,135],25:[2,135],26:[2,135],47:[2,135],52:[2,135],55:[2,135],64:[2,135],65:[2,135],66:[2,135],68:[2,135],70:[2,135],71:[2,135],75:[2,135],81:[2,135],82:[2,135],83:[2,135],88:[2,135],90:[2,135],99:[2,135],101:[2,135],102:[2,135],103:[2,135],107:[2,135],115:[2,135],123:[2,135],125:[2,135],126:[2,135],129:[2,135],130:[2,135],131:[2,135],132:[2,135],133:[2,135],134:[2,135]},{1:[2,114],6:[2,114],25:[2,114],26:[2,114],47:[2,114],52:[2,114],55:[2,114],64:[2,114],65:[2,114],66:[2,114],68:[2,114],70:[2,114],71:[2,114],75:[2,114],81:[2,114],82:[2,114],83:[2,114],88:[2,114],90:[2,114],99:[2,114],101:[2,114],102:[2,114],103:[2,114],107:[2,114],115:[2,114],123:[2,114],125:[2,114],126:[2,114],129:[2,114],130:[2,114],131:[2,114],132:[2,114],133:[2,114],134:[2,114]},{6:[2,121],25:[2,121],26:[2,121],52:[2,121],83:[2,121],88:[2,121]},{6:[2,51],25:[2,51],26:[2,51],51:305,52:[1,222]},{6:[2,122],25:[2,122],26:[2,122],52:[2,122],83:[2,122],88:[2,122]},{1:[2,160],6:[2,160],25:[2,160],26:[2,160],47:[2,160],52:[2,160],55:[2,160],70:[2,160],75:[2,160],83:[2,160],88:[2,160],90:[2,160],99:[2,160],100:85,101:[2,160],102:[2,160],103:[2,160],106:86,107:[2,160],108:67,115:[1,306],123:[2,160],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,162],6:[2,162],25:[2,162],26:[2,162],47:[2,162],52:[2,162],55:[2,162],70:[2,162],75:[2,162],83:[2,162],88:[2,162],90:[2,162],99:[2,162],100:85,101:[2,162],102:[1,307],103:[2,162],106:86,107:[2,162],108:67,115:[2,162],123:[2,162],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,161],6:[2,161],25:[2,161],26:[2,161],47:[2,161],52:[2,161],55:[2,161],70:[2,161],75:[2,161],83:[2,161],88:[2,161],90:[2,161],99:[2,161],100:85,101:[2,161],102:[2,161],103:[2,161],106:86,107:[2,161],108:67,115:[2,161],123:[2,161],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{6:[2,89],25:[2,89],26:[2,89],52:[2,89],75:[2,89]},{6:[2,51],25:[2,51],26:[2,51],51:308,52:[1,232]},{26:[1,309],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{26:[1,310]},{1:[2,168],6:[2,168],25:[2,168],26:[2,168],47:[2,168],52:[2,168],55:[2,168],70:[2,168],75:[2,168],83:[2,168],88:[2,168],90:[2,168],99:[2,168],101:[2,168],102:[2,168],103:[2,168],107:[2,168],115:[2,168],123:[2,168],125:[2,168],126:[2,168],129:[2,168],130:[2,168],131:[2,168],132:[2,168],133:[2,168],134:[2,168]},{26:[2,172],118:[2,172],120:[2,172]},{25:[2,127],52:[2,127],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{6:[1,260],25:[1,261],26:[1,311]},{8:312,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:313,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{6:[1,271],25:[1,272],26:[1,314]},{6:[2,39],25:[2,39],26:[2,39],52:[2,39],75:[2,39]},{1:[2,166],6:[2,166],25:[2,166],26:[2,166],47:[2,166],52:[2,166],55:[2,166],70:[2,166],75:[2,166],83:[2,166],88:[2,166],90:[2,166],99:[2,166],101:[2,166],102:[2,166],103:[2,166],107:[2,166],115:[2,166],123:[2,166],125:[2,166],126:[2,166],129:[2,166],130:[2,166],131:[2,166],132:[2,166],133:[2,166],134:[2,166]},{6:[2,123],25:[2,123],26:[2,123],52:[2,123],83:[2,123],88:[2,123]},{1:[2,163],6:[2,163],25:[2,163],26:[2,163],47:[2,163],52:[2,163],55:[2,163],70:[2,163],75:[2,163],83:[2,163],88:[2,163],90:[2,163],99:[2,163],100:85,101:[2,163],102:[2,163],103:[2,163],106:86,107:[2,163],108:67,115:[2,163],123:[2,163],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,164],6:[2,164],25:[2,164],26:[2,164],47:[2,164],52:[2,164],55:[2,164],70:[2,164],75:[2,164],83:[2,164],88:[2,164],90:[2,164],99:[2,164],100:85,101:[2,164],102:[2,164],103:[2,164],106:86,107:[2,164],108:67,115:[2,164],123:[2,164],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{6:[2,90],25:[2,90],26:[2,90],52:[2,90],75:[2,90]}],
defaultActions: {58:[2,49],59:[2,50],73:[2,3],92:[2,104],186:[2,84]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    if (typeof this.lexer.yylloc == "undefined")
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    if (typeof this.yy.parseError === "function")
        this.parseError = this.yy.parseError;
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || 1;
        if (typeof token !== "number") {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            action = table[state] && table[state][symbol];
        }
        if (typeof action === "undefined" || !action.length || !action[0]) {
            if (!recovering) {
                expected = [];
                for (p in table[state])
                    if (this.terminals_[p] && p > 2) {
                        expected.push("'" + this.terminals_[p] + "'");
                    }
                var errStr = "";
                if (this.lexer.showPosition) {
                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + this.terminals_[symbol] + "'";
                } else {
                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
                }
                this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }
        }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0)
                    recovering--;
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== "undefined") {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}
};
return parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    if (typeof process !== 'undefined') {
        var source = require('fs').readFileSync(require('path').join(process.cwd(), args[1]), "utf8");
    } else {
        var cwd = require("file").path(require("file").cwd());
        var source = cwd.join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}
    }
  };
});
horseDatastore.module(8, function(onejsModParent){
  return {
    'id':'helpers',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // Generated by CoffeeScript 1.3.1
(function() {
  var extend, flatten;
  exports.starts = function(string, literal, start) {
    return literal === string.substr(start, literal.length);
  };
  exports.ends = function(string, literal, back) {
    var len;
    len = literal.length;
    return literal === string.substr(string.length - len - (back || 0), len);
  };
  exports.compact = function(array) {
    var item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      item = array[_i];
      if (item) {
        _results.push(item);
      }
    }
    return _results;
  };
  exports.count = function(string, substr) {
    var num, pos;
    num = pos = 0;
    if (!substr.length) {
      return 1 / 0;
    }
    while (pos = 1 + string.indexOf(substr, pos)) {
      num++;
    }
    return num;
  };
  exports.merge = function(options, overrides) {
    return extend(extend({}, options), overrides);
  };
  extend = exports.extend = function(object, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      object[key] = val;
    }
    return object;
  };
  exports.flatten = flatten = function(array) {
    var element, flattened, _i, _len;
    flattened = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      element = array[_i];
      if (element instanceof Array) {
        flattened = flattened.concat(flatten(element));
      } else {
        flattened.push(element);
      }
    }
    return flattened;
  };
  exports.del = function(obj, key) {
    var val;
    val = obj[key];
    delete obj[key];
    return val;
  };
  exports.last = function(array, back) {
    return array[array.length - (back || 0) - 1];
  };
}).call(this);
    }
  };
});
horseDatastore.module(8, function(onejsModParent){
  return {
    'id':'grammar',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // Generated by CoffeeScript 1.3.1
(function() {
  var Parser, alt, alternatives, grammar, name, o, operators, token, tokens, unwrap;
  Parser = require('jison').Parser;
  unwrap = /^function\s*\(\)\s*\{\s*return\s*([\s\S]*);\s*\}/;
  o = function(patternString, action, options) {
    var match;
    patternString = patternString.replace(/\s{2,}/g, ' ');
    if (!action) {
      return [patternString, '$$ = $1;', options];
    }
    action = (match = unwrap.exec(action)) ? match[1] : "(" + action + "())";
    action = action.replace(/\bnew /g, '$&yy.');
    action = action.replace(/\b(?:Block\.wrap|extend)\b/g, 'yy.$&');
    return [patternString, "$$ = " + action + ";", options];
  };
  grammar = {
    Root: [
      o('', function() {
        return new Block;
      }), o('Body'), o('Block TERMINATOR')
    ],
    Body: [
      o('Line', function() {
        return Block.wrap([$1]);
      }), o('Body TERMINATOR Line', function() {
        return $1.push($3);
      }), o('Body TERMINATOR')
    ],
    Line: [o('Expression'), o('Statement')],
    Statement: [
      o('Return'), o('Comment'), o('STATEMENT', function() {
        return new Literal($1);
      })
    ],
    Expression: [o('Value'), o('Invocation'), o('Code'), o('Operation'), o('Assign'), o('If'), o('Try'), o('While'), o('For'), o('Switch'), o('Class'), o('Throw')],
    Block: [
      o('INDENT OUTDENT', function() {
        return new Block;
      }), o('INDENT Body OUTDENT', function() {
        return $2;
      })
    ],
    Identifier: [
      o('IDENTIFIER', function() {
        return new Literal($1);
      })
    ],
    AlphaNumeric: [
      o('NUMBER', function() {
        return new Literal($1);
      }), o('STRING', function() {
        return new Literal($1);
      })
    ],
    Literal: [
      o('AlphaNumeric'), o('JS', function() {
        return new Literal($1);
      }), o('REGEX', function() {
        return new Literal($1);
      }), o('DEBUGGER', function() {
        return new Literal($1);
      }), o('BOOL', function() {
        var val;
        val = new Literal($1);
        if ($1 === 'undefined') {
          val.isUndefined = true;
        }
        return val;
      })
    ],
    Assign: [
      o('Assignable = Expression', function() {
        return new Assign($1, $3);
      }), o('Assignable = TERMINATOR Expression', function() {
        return new Assign($1, $4);
      }), o('Assignable = INDENT Expression OUTDENT', function() {
        return new Assign($1, $4);
      })
    ],
    AssignObj: [
      o('ObjAssignable', function() {
        return new Value($1);
      }), o('ObjAssignable : Expression', function() {
        return new Assign(new Value($1), $3, 'object');
      }), o('ObjAssignable :\
       INDENT Expression OUTDENT', function() {
        return new Assign(new Value($1), $4, 'object');
      }), o('Comment')
    ],
    ObjAssignable: [o('Identifier'), o('AlphaNumeric'), o('ThisProperty')],
    Return: [
      o('RETURN Expression', function() {
        return new Return($2);
      }), o('RETURN', function() {
        return new Return;
      })
    ],
    Comment: [
      o('HERECOMMENT', function() {
        return new Comment($1);
      })
    ],
    Code: [
      o('PARAM_START ParamList PARAM_END FuncGlyph Block', function() {
        return new Code($2, $5, $4);
      }), o('FuncGlyph Block', function() {
        return new Code([], $2, $1);
      })
    ],
    FuncGlyph: [
      o('->', function() {
        return 'func';
      }), o('=>', function() {
        return 'boundfunc';
      })
    ],
    OptComma: [o(''), o(',')],
    ParamList: [
      o('', function() {
        return [];
      }), o('Param', function() {
        return [$1];
      }), o('ParamList , Param', function() {
        return $1.concat($3);
      })
    ],
    Param: [
      o('ParamVar', function() {
        return new Param($1);
      }), o('ParamVar ...', function() {
        return new Param($1, null, true);
      }), o('ParamVar = Expression', function() {
        return new Param($1, $3);
      })
    ],
    ParamVar: [o('Identifier'), o('ThisProperty'), o('Array'), o('Object')],
    Splat: [
      o('Expression ...', function() {
        return new Splat($1);
      })
    ],
    SimpleAssignable: [
      o('Identifier', function() {
        return new Value($1);
      }), o('Value Accessor', function() {
        return $1.add($2);
      }), o('Invocation Accessor', function() {
        return new Value($1, [].concat($2));
      }), o('ThisProperty')
    ],
    Assignable: [
      o('SimpleAssignable'), o('Array', function() {
        return new Value($1);
      }), o('Object', function() {
        return new Value($1);
      })
    ],
    Value: [
      o('Assignable'), o('Literal', function() {
        return new Value($1);
      }), o('Parenthetical', function() {
        return new Value($1);
      }), o('Range', function() {
        return new Value($1);
      }), o('This')
    ],
    Accessor: [
      o('.  Identifier', function() {
        return new Access($2);
      }), o('?. Identifier', function() {
        return new Access($2, 'soak');
      }), o(':: Identifier', function() {
        return [new Access(new Literal('prototype')), new Access($2)];
      }), o('::', function() {
        return new Access(new Literal('prototype'));
      }), o('Index')
    ],
    Index: [
      o('INDEX_START IndexValue INDEX_END', function() {
        return $2;
      }), o('INDEX_SOAK  Index', function() {
        return extend($2, {
          soak: true
        });
      })
    ],
    IndexValue: [
      o('Expression', function() {
        return new Index($1);
      }), o('Slice', function() {
        return new Slice($1);
      })
    ],
    Object: [
      o('{ AssignList OptComma }', function() {
        return new Obj($2, $1.generated);
      })
    ],
    AssignList: [
      o('', function() {
        return [];
      }), o('AssignObj', function() {
        return [$1];
      }), o('AssignList , AssignObj', function() {
        return $1.concat($3);
      }), o('AssignList OptComma TERMINATOR AssignObj', function() {
        return $1.concat($4);
      }), o('AssignList OptComma INDENT AssignList OptComma OUTDENT', function() {
        return $1.concat($4);
      })
    ],
    Class: [
      o('CLASS', function() {
        return new Class;
      }), o('CLASS Block', function() {
        return new Class(null, null, $2);
      }), o('CLASS EXTENDS Expression', function() {
        return new Class(null, $3);
      }), o('CLASS EXTENDS Expression Block', function() {
        return new Class(null, $3, $4);
      }), o('CLASS SimpleAssignable', function() {
        return new Class($2);
      }), o('CLASS SimpleAssignable Block', function() {
        return new Class($2, null, $3);
      }), o('CLASS SimpleAssignable EXTENDS Expression', function() {
        return new Class($2, $4);
      }), o('CLASS SimpleAssignable EXTENDS Expression Block', function() {
        return new Class($2, $4, $5);
      })
    ],
    Invocation: [
      o('Value OptFuncExist Arguments', function() {
        return new Call($1, $3, $2);
      }), o('Invocation OptFuncExist Arguments', function() {
        return new Call($1, $3, $2);
      }), o('SUPER', function() {
        return new Call('super', [new Splat(new Literal('arguments'))]);
      }), o('SUPER Arguments', function() {
        return new Call('super', $2);
      })
    ],
    OptFuncExist: [
      o('', function() {
        return false;
      }), o('FUNC_EXIST', function() {
        return true;
      })
    ],
    Arguments: [
      o('CALL_START CALL_END', function() {
        return [];
      }), o('CALL_START ArgList OptComma CALL_END', function() {
        return $2;
      })
    ],
    This: [
      o('THIS', function() {
        return new Value(new Literal('this'));
      }), o('@', function() {
        return new Value(new Literal('this'));
      })
    ],
    ThisProperty: [
      o('@ Identifier', function() {
        return new Value(new Literal('this'), [new Access($2)], 'this');
      })
    ],
    Array: [
      o('[ ]', function() {
        return new Arr([]);
      }), o('[ ArgList OptComma ]', function() {
        return new Arr($2);
      })
    ],
    RangeDots: [
      o('..', function() {
        return 'inclusive';
      }), o('...', function() {
        return 'exclusive';
      })
    ],
    Range: [
      o('[ Expression RangeDots Expression ]', function() {
        return new Range($2, $4, $3);
      })
    ],
    Slice: [
      o('Expression RangeDots Expression', function() {
        return new Range($1, $3, $2);
      }), o('Expression RangeDots', function() {
        return new Range($1, null, $2);
      }), o('RangeDots Expression', function() {
        return new Range(null, $2, $1);
      }), o('RangeDots', function() {
        return new Range(null, null, $1);
      })
    ],
    ArgList: [
      o('Arg', function() {
        return [$1];
      }), o('ArgList , Arg', function() {
        return $1.concat($3);
      }), o('ArgList OptComma TERMINATOR Arg', function() {
        return $1.concat($4);
      }), o('INDENT ArgList OptComma OUTDENT', function() {
        return $2;
      }), o('ArgList OptComma INDENT ArgList OptComma OUTDENT', function() {
        return $1.concat($4);
      })
    ],
    Arg: [o('Expression'), o('Splat')],
    SimpleArgs: [
      o('Expression'), o('SimpleArgs , Expression', function() {
        return [].concat($1, $3);
      })
    ],
    Try: [
      o('TRY Block', function() {
        return new Try($2);
      }), o('TRY Block Catch', function() {
        return new Try($2, $3[0], $3[1]);
      }), o('TRY Block FINALLY Block', function() {
        return new Try($2, null, null, $4);
      }), o('TRY Block Catch FINALLY Block', function() {
        return new Try($2, $3[0], $3[1], $5);
      })
    ],
    Catch: [
      o('CATCH Identifier Block', function() {
        return [$2, $3];
      })
    ],
    Throw: [
      o('THROW Expression', function() {
        return new Throw($2);
      })
    ],
    Parenthetical: [
      o('( Body )', function() {
        return new Parens($2);
      }), o('( INDENT Body OUTDENT )', function() {
        return new Parens($3);
      })
    ],
    WhileSource: [
      o('WHILE Expression', function() {
        return new While($2);
      }), o('WHILE Expression WHEN Expression', function() {
        return new While($2, {
          guard: $4
        });
      }), o('UNTIL Expression', function() {
        return new While($2, {
          invert: true
        });
      }), o('UNTIL Expression WHEN Expression', function() {
        return new While($2, {
          invert: true,
          guard: $4
        });
      })
    ],
    While: [
      o('WhileSource Block', function() {
        return $1.addBody($2);
      }), o('Statement  WhileSource', function() {
        return $2.addBody(Block.wrap([$1]));
      }), o('Expression WhileSource', function() {
        return $2.addBody(Block.wrap([$1]));
      }), o('Loop', function() {
        return $1;
      })
    ],
    Loop: [
      o('LOOP Block', function() {
        return new While(new Literal('true')).addBody($2);
      }), o('LOOP Expression', function() {
        return new While(new Literal('true')).addBody(Block.wrap([$2]));
      })
    ],
    For: [
      o('Statement  ForBody', function() {
        return new For($1, $2);
      }), o('Expression ForBody', function() {
        return new For($1, $2);
      }), o('ForBody    Block', function() {
        return new For($2, $1);
      })
    ],
    ForBody: [
      o('FOR Range', function() {
        return {
          source: new Value($2)
        };
      }), o('ForStart ForSource', function() {
        $2.own = $1.own;
        $2.name = $1[0];
        $2.index = $1[1];
        return $2;
      })
    ],
    ForStart: [
      o('FOR ForVariables', function() {
        return $2;
      }), o('FOR OWN ForVariables', function() {
        $3.own = true;
        return $3;
      })
    ],
    ForValue: [
      o('Identifier'), o('Array', function() {
        return new Value($1);
      }), o('Object', function() {
        return new Value($1);
      })
    ],
    ForVariables: [
      o('ForValue', function() {
        return [$1];
      }), o('ForValue , ForValue', function() {
        return [$1, $3];
      })
    ],
    ForSource: [
      o('FORIN Expression', function() {
        return {
          source: $2
        };
      }), o('FOROF Expression', function() {
        return {
          source: $2,
          object: true
        };
      }), o('FORIN Expression WHEN Expression', function() {
        return {
          source: $2,
          guard: $4
        };
      }), o('FOROF Expression WHEN Expression', function() {
        return {
          source: $2,
          guard: $4,
          object: true
        };
      }), o('FORIN Expression BY Expression', function() {
        return {
          source: $2,
          step: $4
        };
      }), o('FORIN Expression WHEN Expression BY Expression', function() {
        return {
          source: $2,
          guard: $4,
          step: $6
        };
      }), o('FORIN Expression BY Expression WHEN Expression', function() {
        return {
          source: $2,
          step: $4,
          guard: $6
        };
      })
    ],
    Switch: [
      o('SWITCH Expression INDENT Whens OUTDENT', function() {
        return new Switch($2, $4);
      }), o('SWITCH Expression INDENT Whens ELSE Block OUTDENT', function() {
        return new Switch($2, $4, $6);
      }), o('SWITCH INDENT Whens OUTDENT', function() {
        return new Switch(null, $3);
      }), o('SWITCH INDENT Whens ELSE Block OUTDENT', function() {
        return new Switch(null, $3, $5);
      })
    ],
    Whens: [
      o('When'), o('Whens When', function() {
        return $1.concat($2);
      })
    ],
    When: [
      o('LEADING_WHEN SimpleArgs Block', function() {
        return [[$2, $3]];
      }), o('LEADING_WHEN SimpleArgs Block TERMINATOR', function() {
        return [[$2, $3]];
      })
    ],
    IfBlock: [
      o('IF Expression Block', function() {
        return new If($2, $3, {
          type: $1
        });
      }), o('IfBlock ELSE IF Expression Block', function() {
        return $1.addElse(new If($4, $5, {
          type: $3
        }));
      })
    ],
    If: [
      o('IfBlock'), o('IfBlock ELSE Block', function() {
        return $1.addElse($3);
      }), o('Statement  POST_IF Expression', function() {
        return new If($3, Block.wrap([$1]), {
          type: $2,
          statement: true
        });
      }), o('Expression POST_IF Expression', function() {
        return new If($3, Block.wrap([$1]), {
          type: $2,
          statement: true
        });
      })
    ],
    Operation: [
      o('UNARY Expression', function() {
        return new Op($1, $2);
      }), o('-     Expression', (function() {
        return new Op('-', $2);
      }), {
        prec: 'UNARY'
      }), o('+     Expression', (function() {
        return new Op('+', $2);
      }), {
        prec: 'UNARY'
      }), o('-- SimpleAssignable', function() {
        return new Op('--', $2);
      }), o('++ SimpleAssignable', function() {
        return new Op('++', $2);
      }), o('SimpleAssignable --', function() {
        return new Op('--', $1, null, true);
      }), o('SimpleAssignable ++', function() {
        return new Op('++', $1, null, true);
      }), o('Expression ?', function() {
        return new Existence($1);
      }), o('Expression +  Expression', function() {
        return new Op('+', $1, $3);
      }), o('Expression -  Expression', function() {
        return new Op('-', $1, $3);
      }), o('Expression MATH     Expression', function() {
        return new Op($2, $1, $3);
      }), o('Expression SHIFT    Expression', function() {
        return new Op($2, $1, $3);
      }), o('Expression COMPARE  Expression', function() {
        return new Op($2, $1, $3);
      }), o('Expression LOGIC    Expression', function() {
        return new Op($2, $1, $3);
      }), o('Expression RELATION Expression', function() {
        if ($2.charAt(0) === '!') {
          return new Op($2.slice(1), $1, $3).invert();
        } else {
          return new Op($2, $1, $3);
        }
      }), o('SimpleAssignable COMPOUND_ASSIGN\
       Expression', function() {
        return new Assign($1, $3, $2);
      }), o('SimpleAssignable COMPOUND_ASSIGN\
       INDENT Expression OUTDENT', function() {
        return new Assign($1, $4, $2);
      }), o('SimpleAssignable EXTENDS Expression', function() {
        return new Extends($1, $3);
      })
    ]
  };
  operators = [['left', '.', '?.', '::'], ['left', 'CALL_START', 'CALL_END'], ['nonassoc', '++', '--'], ['left', '?'], ['right', 'UNARY'], ['left', 'MATH'], ['left', '+', '-'], ['left', 'SHIFT'], ['left', 'RELATION'], ['left', 'COMPARE'], ['left', 'LOGIC'], ['nonassoc', 'INDENT', 'OUTDENT'], ['right', '=', ':', 'COMPOUND_ASSIGN', 'RETURN', 'THROW', 'EXTENDS'], ['right', 'FORIN', 'FOROF', 'BY', 'WHEN'], ['right', 'IF', 'ELSE', 'FOR', 'WHILE', 'UNTIL', 'LOOP', 'SUPER', 'CLASS'], ['right', 'POST_IF']];
  tokens = [];
  for (name in grammar) {
    alternatives = grammar[name];
    grammar[name] = (function() {
      var _i, _j, _len, _len1, _ref, _results;
      _results = [];
      for (_i = 0, _len = alternatives.length; _i < _len; _i++) {
        alt = alternatives[_i];
        _ref = alt[0].split(' ');
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          token = _ref[_j];
          if (!grammar[token]) {
            tokens.push(token);
          }
        }
        if (name === 'Root') {
          alt[1] = "return " + alt[1];
        }
        _results.push(alt);
      }
      return _results;
    })();
  }
  exports.parser = new Parser({
    tokens: tokens.join(' '),
    bnf: grammar,
    operators: operators.reverse(),
    startSymbol: 'Root'
  });
}).call(this);
    }
  };
});
horseDatastore.module(8, function(onejsModParent){
  return {
    'id':'browser',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // Generated by CoffeeScript 1.3.1
(function() {
  var CoffeeScript, runScripts;
  CoffeeScript = require('./coffee-script');
  CoffeeScript.require = require;
  CoffeeScript["eval"] = function(code, options) {
    if (options == null) {
      options = {};
    }
    if (options.bare == null) {
      options.bare = true;
    }
    return eval(CoffeeScript.compile(code, options));
  };
  CoffeeScript.run = function(code, options) {
    if (options == null) {
      options = {};
    }
    options.bare = true;
    return Function(CoffeeScript.compile(code, options))();
  };
  if (typeof window === "undefined" || window === null) {
    return;
  }
  CoffeeScript.load = function(url, callback) {
    var xhr;
    xhr = new (window.ActiveXObject || XMLHttpRequest)('Microsoft.XMLHTTP');
    xhr.open('GET', url, true);
    if ('overrideMimeType' in xhr) {
      xhr.overrideMimeType('text/plain');
    }
    xhr.onreadystatechange = function() {
      var _ref;
      if (xhr.readyState === 4) {
        if ((_ref = xhr.status) === 0 || _ref === 200) {
          CoffeeScript.run(xhr.responseText);
        } else {
          throw new Error("Could not load " + url);
        }
        if (callback) {
          return callback();
        }
      }
    };
    return xhr.send(null);
  };
  runScripts = function() {
    var coffees, execute, index, length, s, scripts;
    scripts = document.getElementsByTagName('script');
    coffees = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = scripts.length; _i < _len; _i++) {
        s = scripts[_i];
        if (s.type === 'text/coffeescript') {
          _results.push(s);
        }
      }
      return _results;
    })();
    index = 0;
    length = coffees.length;
    (execute = function() {
      var script;
      script = coffees[index++];
      if ((script != null ? script.type : void 0) === 'text/coffeescript') {
        if (script.src) {
          return CoffeeScript.load(script.src, execute);
        } else {
          CoffeeScript.run(script.innerHTML);
          return execute();
        }
      }
    })();
    return null;
  };
  if (window.addEventListener) {
    addEventListener('DOMContentLoaded', runScripts, false);
  } else {
    attachEvent('onload', runScripts);
  }
}).call(this);
    }
  };
});
horseDatastore.module(8, function(onejsModParent){
  return {
    'id':'coffee-script',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // Generated by CoffeeScript 1.3.1
(function() {
  var Lexer, RESERVED, compile, fs, lexer, parser, path, vm, _ref,
    __hasProp = {}.hasOwnProperty;
  fs = require('fs');
  path = require('path');
  _ref = require('./lexer'), Lexer = _ref.Lexer, RESERVED = _ref.RESERVED;
  parser = require('./parser').parser;
  vm = require('vm');
  if (require.extensions) {
    require.extensions['.coffee'] = function(module, filename) {
      var content;
      content = compile(fs.readFileSync(filename, 'utf8'), {
        filename: filename
      });
      return module._compile(content, filename);
    };
  } else if (require.registerExtension) {
    require.registerExtension('.coffee', function(content) {
      return compile(content);
    });
  }
  exports.VERSION = '1.3.1';
  exports.RESERVED = RESERVED;
  exports.helpers = require('./helpers');
  exports.compile = compile = function(code, options) {
    var header, js, merge;
    if (options == null) {
      options = {};
    }
    merge = exports.helpers.merge;
    try {
      js = (parser.parse(lexer.tokenize(code))).compile(options);
      if (!options.header) {
        return js;
      }
    } catch (err) {
      if (options.filename) {
        err.message = "In " + options.filename + ", " + err.message;
      }
      throw err;
    }
    header = "Generated by CoffeeScript " + this.VERSION;
    return "// " + header + "\n" + js;
  };
  exports.tokens = function(code, options) {
    return lexer.tokenize(code, options);
  };
  exports.nodes = function(source, options) {
    if (typeof source === 'string') {
      return parser.parse(lexer.tokenize(source, options));
    } else {
      return parser.parse(source);
    }
  };
  exports.run = function(code, options) {
    var mainModule;
    if (options == null) {
      options = {};
    }
    mainModule = require.main;
    mainModule.filename = process.argv[1] = options.filename ? fs.realpathSync(options.filename) : '.';
    mainModule.moduleCache && (mainModule.moduleCache = {});
    mainModule.paths = require('module')._nodeModulePaths(path.dirname(fs.realpathSync(options.filename)));
    if (path.extname(mainModule.filename) !== '.coffee' || require.extensions) {
      return mainModule._compile(compile(code, options), mainModule.filename);
    } else {
      return mainModule._compile(code, mainModule.filename);
    }
  };
  exports["eval"] = function(code, options) {
    var Module, Script, js, k, o, r, sandbox, v, _i, _len, _module, _ref1, _ref2, _require;
    if (options == null) {
      options = {};
    }
    if (!(code = code.trim())) {
      return;
    }
    Script = vm.Script;
    if (Script) {
      if (options.sandbox != null) {
        if (options.sandbox instanceof Script.createContext().constructor) {
          sandbox = options.sandbox;
        } else {
          sandbox = Script.createContext();
          _ref1 = options.sandbox;
          for (k in _ref1) {
            if (!__hasProp.call(_ref1, k)) continue;
            v = _ref1[k];
            sandbox[k] = v;
          }
        }
        sandbox.global = sandbox.root = sandbox.GLOBAL = sandbox;
      } else {
        sandbox = global;
      }
      sandbox.__filename = options.filename || 'eval';
      sandbox.__dirname = path.dirname(sandbox.__filename);
      if (!(sandbox !== global || sandbox.module || sandbox.require)) {
        Module = require('module');
        sandbox.module = _module = new Module(options.modulename || 'eval');
        sandbox.require = _require = function(path) {
          return Module._load(path, _module, true);
        };
        _module.filename = sandbox.__filename;
        _ref2 = Object.getOwnPropertyNames(require);
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          r = _ref2[_i];
          if (r !== 'paths') {
            _require[r] = require[r];
          }
        }
        _require.paths = _module.paths = Module._nodeModulePaths(process.cwd());
        _require.resolve = function(request) {
          return Module._resolveFilename(request, _module);
        };
      }
    }
    o = {};
    for (k in options) {
      if (!__hasProp.call(options, k)) continue;
      v = options[k];
      o[k] = v;
    }
    o.bare = true;
    js = compile(code, o);
    if (sandbox === global) {
      return vm.runInThisContext(js);
    } else {
      return vm.runInContext(js, sandbox);
    }
  };
  lexer = new Lexer;
  parser.lexer = {
    lex: function() {
      var tag, _ref1;
      _ref1 = this.tokens[this.pos++] || [''], tag = _ref1[0], this.yytext = _ref1[1], this.yylineno = _ref1[2];
      return tag;
    },
    setInput: function(tokens) {
      this.tokens = tokens;
      return this.pos = 0;
    },
    upcomingInput: function() {
      return "";
    }
  };
  parser.yy = require('./nodes');
}).call(this);
    }
  };
});
horseDatastore.module(8, function(onejsModParent){
  return {
    'id':'command',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // Generated by CoffeeScript 1.3.1
(function() {
  var BANNER, CoffeeScript, EventEmitter, SWITCHES, compileJoin, compileOptions, compilePath, compileScript, compileStdio, exec, forkNode, fs, helpers, hidden, joinTimeout, lint, loadRequires, notSources, optionParser, optparse, opts, outputPath, parseOptions, path, printLine, printTokens, printWarn, removeSource, sourceCode, sources, spawn, timeLog, unwatchDir, usage, version, wait, watch, watchDir, watchers, writeJs, _ref;
  fs = require('fs');
  path = require('path');
  helpers = require('./helpers');
  optparse = require('./optparse');
  CoffeeScript = require('./coffee-script');
  _ref = require('child_process'), spawn = _ref.spawn, exec = _ref.exec;
  EventEmitter = require('events').EventEmitter;
  helpers.extend(CoffeeScript, new EventEmitter);
  printLine = function(line) {
    return process.stdout.write(line + '\n');
  };
  printWarn = function(line) {
    return process.stderr.write(line + '\n');
  };
  hidden = function(file) {
    return /^\.|~$/.test(file);
  };
  BANNER = 'Usage: coffee [options] path/to/script.coffee -- [args]\n\nIf called without options, `coffee` will run your script.';
  SWITCHES = [['-b', '--bare', 'compile without a top-level function wrapper'], ['-c', '--compile', 'compile to JavaScript and save as .js files'], ['-e', '--eval', 'pass a string from the command line as input'], ['-h', '--help', 'display this help message'], ['-i', '--interactive', 'run an interactive CoffeeScript REPL'], ['-j', '--join [FILE]', 'concatenate the source CoffeeScript before compiling'], ['-l', '--lint', 'pipe the compiled JavaScript through JavaScript Lint'], ['-n', '--nodes', 'print out the parse tree that the parser produces'], ['--nodejs [ARGS]', 'pass options directly to the "node" binary'], ['-o', '--output [DIR]', 'set the output directory for compiled JavaScript'], ['-p', '--print', 'print out the compiled JavaScript'], ['-r', '--require [FILE*]', 'require a library before executing your script'], ['-s', '--stdio', 'listen for and compile scripts over stdio'], ['-t', '--tokens', 'print out the tokens that the lexer/rewriter produce'], ['-v', '--version', 'display the version number'], ['-w', '--watch', 'watch scripts for changes and rerun commands']];
  opts = {};
  sources = [];
  sourceCode = [];
  notSources = {};
  watchers = {};
  optionParser = null;
  exports.run = function() {
    var literals, source, _i, _len, _results;
    parseOptions();
    if (opts.nodejs) {
      return forkNode();
    }
    if (opts.help) {
      return usage();
    }
    if (opts.version) {
      return version();
    }
    if (opts.require) {
      loadRequires();
    }
    if (opts.interactive) {
      return require('./repl');
    }
    if (opts.watch && !fs.watch) {
      return printWarn("The --watch feature depends on Node v0.6.0+. You are running " + process.version + ".");
    }
    if (opts.stdio) {
      return compileStdio();
    }
    if (opts["eval"]) {
      return compileScript(null, sources[0]);
    }
    if (!sources.length) {
      return require('./repl');
    }
    literals = opts.run ? sources.splice(1) : [];
    process.argv = process.argv.slice(0, 2).concat(literals);
    process.argv[0] = 'coffee';
    process.execPath = require.main.filename;
    _results = [];
    for (_i = 0, _len = sources.length; _i < _len; _i++) {
      source = sources[_i];
      _results.push(compilePath(source, true, path.normalize(source)));
    }
    return _results;
  };
  compilePath = function(source, topLevel, base) {
    return fs.stat(source, function(err, stats) {
      if (err && err.code !== 'ENOENT') {
        throw err;
      }
      if ((err != null ? err.code : void 0) === 'ENOENT') {
        if (topLevel && source.slice(-7) !== '.coffee') {
          source = sources[sources.indexOf(source)] = "" + source + ".coffee";
          return compilePath(source, topLevel, base);
        }
        if (topLevel) {
          console.error("File not found: " + source);
          process.exit(1);
        }
        return;
      }
      if (stats.isDirectory()) {
        if (opts.watch) {
          watchDir(source, base);
        }
        return fs.readdir(source, function(err, files) {
          var file, index, _i, _len, _ref1, _ref2, _results;
          if (err && err.code !== 'ENOENT') {
            throw err;
          }
          if ((err != null ? err.code : void 0) === 'ENOENT') {
            return;
          }
          index = sources.indexOf(source);
          [].splice.apply(sources, [index, index - index + 1].concat(_ref1 = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = files.length; _i < _len; _i++) {
              file = files[_i];
              _results.push(path.join(source, file));
            }
            return _results;
          })())), _ref1;
          [].splice.apply(sourceCode, [index, index - index + 1].concat(_ref2 = files.map(function() {
            return null;
          }))), _ref2;
          _results = [];
          for (_i = 0, _len = files.length; _i < _len; _i++) {
            file = files[_i];
            if (!hidden(file)) {
              _results.push(compilePath(path.join(source, file), false, base));
            }
          }
          return _results;
        });
      } else if (topLevel || path.extname(source) === '.coffee') {
        if (opts.watch) {
          watch(source, base);
        }
        return fs.readFile(source, function(err, code) {
          if (err && err.code !== 'ENOENT') {
            throw err;
          }
          if ((err != null ? err.code : void 0) === 'ENOENT') {
            return;
          }
          return compileScript(source, code.toString(), base);
        });
      } else {
        notSources[source] = true;
        return removeSource(source, base);
      }
    });
  };
  compileScript = function(file, input, base) {
    var o, options, t, task;
    o = opts;
    options = compileOptions(file);
    try {
      t = task = {
        file: file,
        input: input,
        options: options
      };
      CoffeeScript.emit('compile', task);
      if (o.tokens) {
        return printTokens(CoffeeScript.tokens(t.input));
      } else if (o.nodes) {
        return printLine(CoffeeScript.nodes(t.input).toString().trim());
      } else if (o.run) {
        return CoffeeScript.run(t.input, t.options);
      } else if (o.join && t.file !== o.join) {
        sourceCode[sources.indexOf(t.file)] = t.input;
        return compileJoin();
      } else {
        t.output = CoffeeScript.compile(t.input, t.options);
        CoffeeScript.emit('success', task);
        if (o.print) {
          return printLine(t.output.trim());
        } else if (o.compile) {
          return writeJs(t.file, t.output, base);
        } else if (o.lint) {
          return lint(t.file, t.output);
        }
      }
    } catch (err) {
      CoffeeScript.emit('failure', err, task);
      if (CoffeeScript.listeners('failure').length) {
        return;
      }
      if (o.watch) {
        return printLine(err.message + '\x07');
      }
      printWarn(err instanceof Error && err.stack || ("ERROR: " + err));
      return process.exit(1);
    }
  };
  compileStdio = function() {
    var code, stdin;
    code = '';
    stdin = process.openStdin();
    stdin.on('data', function(buffer) {
      if (buffer) {
        return code += buffer.toString();
      }
    });
    return stdin.on('end', function() {
      return compileScript(null, code);
    });
  };
  joinTimeout = null;
  compileJoin = function() {
    if (!opts.join) {
      return;
    }
    if (!sourceCode.some(function(code) {
      return code === null;
    })) {
      clearTimeout(joinTimeout);
      return joinTimeout = wait(100, function() {
        return compileScript(opts.join, sourceCode.join('\n'), opts.join);
      });
    }
  };
  loadRequires = function() {
    var realFilename, req, _i, _len, _ref1;
    realFilename = module.filename;
    module.filename = '.';
    _ref1 = opts.require;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      req = _ref1[_i];
      require(req);
    }
    return module.filename = realFilename;
  };
  watch = function(source, base) {
    var compile, compileTimeout, prevStats, rewatch, watchErr, watcher;
    prevStats = null;
    compileTimeout = null;
    watchErr = function(e) {
      if (e.code === 'ENOENT') {
        if (sources.indexOf(source) === -1) {
          return;
        }
        try {
          rewatch();
          return compile();
        } catch (e) {
          removeSource(source, base, true);
          return compileJoin();
        }
      } else {
        throw e;
      }
    };
    compile = function() {
      clearTimeout(compileTimeout);
      return compileTimeout = wait(25, function() {
        return fs.stat(source, function(err, stats) {
          if (err) {
            return watchErr(err);
          }
          if (prevStats && stats.size === prevStats.size && stats.mtime.getTime() === prevStats.mtime.getTime()) {
            return rewatch();
          }
          prevStats = stats;
          return fs.readFile(source, function(err, code) {
            if (err) {
              return watchErr(err);
            }
            compileScript(source, code.toString(), base);
            return rewatch();
          });
        });
      });
    };
    try {
      watcher = fs.watch(source, compile);
    } catch (e) {
      watchErr(e);
    }
    return rewatch = function() {
      if (watcher != null) {
        watcher.close();
      }
      return watcher = fs.watch(source, compile);
    };
  };
  watchDir = function(source, base) {
    var readdirTimeout, watcher;
    readdirTimeout = null;
    try {
      return watcher = fs.watch(source, function() {
        clearTimeout(readdirTimeout);
        return readdirTimeout = wait(25, function() {
          return fs.readdir(source, function(err, files) {
            var file, _i, _len, _results;
            if (err) {
              if (err.code !== 'ENOENT') {
                throw err;
              }
              watcher.close();
              return unwatchDir(source, base);
            }
            _results = [];
            for (_i = 0, _len = files.length; _i < _len; _i++) {
              file = files[_i];
              if (!(!hidden(file) && !notSources[file])) {
                continue;
              }
              file = path.join(source, file);
              if (sources.some(function(s) {
                return s.indexOf(file) >= 0;
              })) {
                continue;
              }
              sources.push(file);
              sourceCode.push(null);
              _results.push(compilePath(file, false, base));
            }
            return _results;
          });
        });
      });
    } catch (e) {
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }
  };
  unwatchDir = function(source, base) {
    var file, prevSources, toRemove, _i, _len;
    prevSources = sources.slice(0);
    toRemove = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = sources.length; _i < _len; _i++) {
        file = sources[_i];
        if (file.indexOf(source) >= 0) {
          _results.push(file);
        }
      }
      return _results;
    })();
    for (_i = 0, _len = toRemove.length; _i < _len; _i++) {
      file = toRemove[_i];
      removeSource(file, base, true);
    }
    if (!sources.some(function(s, i) {
      return prevSources[i] !== s;
    })) {
      return;
    }
    return compileJoin();
  };
  removeSource = function(source, base, removeJs) {
    var index, jsPath;
    index = sources.indexOf(source);
    sources.splice(index, 1);
    sourceCode.splice(index, 1);
    if (removeJs && !opts.join) {
      jsPath = outputPath(source, base);
      return path.exists(jsPath, function(exists) {
        if (exists) {
          return fs.unlink(jsPath, function(err) {
            if (err && err.code !== 'ENOENT') {
              throw err;
            }
            return timeLog("removed " + source);
          });
        }
      });
    }
  };
  outputPath = function(source, base) {
    var baseDir, dir, filename, srcDir;
    filename = path.basename(source, path.extname(source)) + '.js';
    srcDir = path.dirname(source);
    baseDir = base === '.' ? srcDir : srcDir.substring(base.length);
    dir = opts.output ? path.join(opts.output, baseDir) : srcDir;
    return path.join(dir, filename);
  };
  writeJs = function(source, js, base) {
    var compile, jsDir, jsPath;
    jsPath = outputPath(source, base);
    jsDir = path.dirname(jsPath);
    compile = function() {
      if (js.length <= 0) {
        js = ' ';
      }
      return fs.writeFile(jsPath, js, function(err) {
        if (err) {
          return printLine(err.message);
        } else if (opts.compile && opts.watch) {
          return timeLog("compiled " + source);
        }
      });
    };
    return path.exists(jsDir, function(exists) {
      if (exists) {
        return compile();
      } else {
        return exec("mkdir -p " + jsDir, compile);
      }
    });
  };
  wait = function(milliseconds, func) {
    return setTimeout(func, milliseconds);
  };
  timeLog = function(message) {
    return console.log("" + ((new Date).toLocaleTimeString()) + " - " + message);
  };
  lint = function(file, js) {
    var conf, jsl, printIt;
    printIt = function(buffer) {
      return printLine(file + ':\t' + buffer.toString().trim());
    };
    conf = __dirname + '/../../extras/jsl.conf';
    jsl = spawn('jsl', ['-nologo', '-stdin', '-conf', conf]);
    jsl.stdout.on('data', printIt);
    jsl.stderr.on('data', printIt);
    jsl.stdin.write(js);
    return jsl.stdin.end();
  };
  printTokens = function(tokens) {
    var strings, tag, token, value;
    strings = (function() {
      var _i, _len, _ref1, _results;
      _results = [];
      for (_i = 0, _len = tokens.length; _i < _len; _i++) {
        token = tokens[_i];
        _ref1 = [token[0], token[1].toString().replace(/\n/, '\\n')], tag = _ref1[0], value = _ref1[1];
        _results.push("[" + tag + " " + value + "]");
      }
      return _results;
    })();
    return printLine(strings.join(' '));
  };
  parseOptions = function() {
    var i, o, source, _i, _len;
    optionParser = new optparse.OptionParser(SWITCHES, BANNER);
    o = opts = optionParser.parse(process.argv.slice(2));
    o.compile || (o.compile = !!o.output);
    o.run = !(o.compile || o.print || o.lint);
    o.print = !!(o.print || (o["eval"] || o.stdio && o.compile));
    sources = o["arguments"];
    for (i = _i = 0, _len = sources.length; _i < _len; i = ++_i) {
      source = sources[i];
      sourceCode[i] = null;
    }
  };
  compileOptions = function(filename) {
    return {
      filename: filename,
      bare: opts.bare,
      header: opts.compile
    };
  };
  forkNode = function() {
    var args, nodeArgs;
    nodeArgs = opts.nodejs.split(/\s+/);
    args = process.argv.slice(1);
    args.splice(args.indexOf('--nodejs'), 2);
    return spawn(process.execPath, nodeArgs.concat(args), {
      cwd: process.cwd(),
      env: process.env,
      customFds: [0, 1, 2]
    });
  };
  usage = function() {
    return printLine((new optparse.OptionParser(SWITCHES, BANNER)).help());
  };
  version = function() {
    return printLine("CoffeeScript version " + CoffeeScript.VERSION);
  };
}).call(this);
    }
  };
});
horseDatastore.module(8, function(onejsModParent){
  return {
    'id':'optparse',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // Generated by CoffeeScript 1.3.1
(function() {
  var LONG_FLAG, MULTI_FLAG, OPTIONAL, OptionParser, SHORT_FLAG, buildRule, buildRules, normalizeArguments;
  exports.OptionParser = OptionParser = (function() {
    OptionParser.name = 'OptionParser';
    function OptionParser(rules, banner) {
      this.banner = banner;
      this.rules = buildRules(rules);
    }
    OptionParser.prototype.parse = function(args) {
      var arg, i, isOption, matchedRule, options, originalArgs, pos, rule, seenNonOptionArg, skippingArgument, value, _i, _j, _len, _len1, _ref;
      options = {
        "arguments": []
      };
      skippingArgument = false;
      originalArgs = args;
      args = normalizeArguments(args);
      for (i = _i = 0, _len = args.length; _i < _len; i = ++_i) {
        arg = args[i];
        if (skippingArgument) {
          skippingArgument = false;
          continue;
        }
        if (arg === '--') {
          pos = originalArgs.indexOf('--');
          options["arguments"] = options["arguments"].concat(originalArgs.slice(pos + 1));
          break;
        }
        isOption = !!(arg.match(LONG_FLAG) || arg.match(SHORT_FLAG));
        seenNonOptionArg = options["arguments"].length > 0;
        if (!seenNonOptionArg) {
          matchedRule = false;
          _ref = this.rules;
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            rule = _ref[_j];
            if (rule.shortFlag === arg || rule.longFlag === arg) {
              value = true;
              if (rule.hasArgument) {
                skippingArgument = true;
                value = args[i + 1];
              }
              options[rule.name] = rule.isList ? (options[rule.name] || []).concat(value) : value;
              matchedRule = true;
              break;
            }
          }
          if (isOption && !matchedRule) {
            throw new Error("unrecognized option: " + arg);
          }
        }
        if (seenNonOptionArg || !isOption) {
          options["arguments"].push(arg);
        }
      }
      return options;
    };
    OptionParser.prototype.help = function() {
      var letPart, lines, rule, spaces, _i, _len, _ref;
      lines = [];
      if (this.banner) {
        lines.unshift("" + this.banner + "\n");
      }
      _ref = this.rules;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rule = _ref[_i];
        spaces = 15 - rule.longFlag.length;
        spaces = spaces > 0 ? Array(spaces + 1).join(' ') : '';
        letPart = rule.shortFlag ? rule.shortFlag + ', ' : '    ';
        lines.push('  ' + letPart + rule.longFlag + spaces + rule.description);
      }
      return "\n" + (lines.join('\n')) + "\n";
    };
    return OptionParser;
  })();
  LONG_FLAG = /^(--\w[\w\-]*)/;
  SHORT_FLAG = /^(-\w)$/;
  MULTI_FLAG = /^-(\w{2,})/;
  OPTIONAL = /\[(\w+(\*?))\]/;
  buildRules = function(rules) {
    var tuple, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = rules.length; _i < _len; _i++) {
      tuple = rules[_i];
      if (tuple.length < 3) {
        tuple.unshift(null);
      }
      _results.push(buildRule.apply(null, tuple));
    }
    return _results;
  };
  buildRule = function(shortFlag, longFlag, description, options) {
    var match;
    if (options == null) {
      options = {};
    }
    match = longFlag.match(OPTIONAL);
    longFlag = longFlag.match(LONG_FLAG)[1];
    return {
      name: longFlag.substr(2),
      shortFlag: shortFlag,
      longFlag: longFlag,
      description: description,
      hasArgument: !!(match && match[1]),
      isList: !!(match && match[2])
    };
  };
  normalizeArguments = function(args) {
    var arg, l, match, result, _i, _j, _len, _len1, _ref;
    args = args.slice(0);
    result = [];
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      arg = args[_i];
      if (match = arg.match(MULTI_FLAG)) {
        _ref = match[1].split('');
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          l = _ref[_j];
          result.push('-' + l);
        }
      } else {
        result.push(arg);
      }
    }
    return result;
  };
}).call(this);
    }
  };
});
horseDatastore.module(8, function(onejsModParent){
  return {
    'id':'lexer',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // Generated by CoffeeScript 1.3.1
(function() {
  var BOOL, CALLABLE, CODE, COFFEE_ALIASES, COFFEE_ALIAS_MAP, COFFEE_KEYWORDS, COMMENT, COMPARE, COMPOUND_ASSIGN, HEREDOC, HEREDOC_ILLEGAL, HEREDOC_INDENT, HEREGEX, HEREGEX_OMIT, IDENTIFIER, INDEXABLE, INVERSES, JSTOKEN, JS_FORBIDDEN, JS_KEYWORDS, LINE_BREAK, LINE_CONTINUER, LOGIC, Lexer, MATH, MULTILINER, MULTI_DENT, NOT_REGEX, NOT_SPACED_REGEX, NUMBER, OPERATOR, REGEX, RELATION, RESERVED, Rewriter, SHIFT, SIMPLESTR, STRICT_PROSCRIBED, TRAILING_SPACES, UNARY, WHITESPACE, compact, count, key, last, starts, _ref, _ref1,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  _ref = require('./rewriter'), Rewriter = _ref.Rewriter, INVERSES = _ref.INVERSES;
  _ref1 = require('./helpers'), count = _ref1.count, starts = _ref1.starts, compact = _ref1.compact, last = _ref1.last;
  exports.Lexer = Lexer = (function() {
    Lexer.name = 'Lexer';
    function Lexer() {}
    Lexer.prototype.tokenize = function(code, opts) {
      var i, tag;
      if (opts == null) {
        opts = {};
      }
      if (WHITESPACE.test(code)) {
        code = "\n" + code;
      }
      code = code.replace(/\r/g, '').replace(TRAILING_SPACES, '');
      this.code = code;
      this.line = opts.line || 0;
      this.indent = 0;
      this.indebt = 0;
      this.outdebt = 0;
      this.indents = [];
      this.ends = [];
      this.tokens = [];
      i = 0;
      while (this.chunk = code.slice(i)) {
        i += this.identifierToken() || this.commentToken() || this.whitespaceToken() || this.lineToken() || this.heredocToken() || this.stringToken() || this.numberToken() || this.regexToken() || this.jsToken() || this.literalToken();
      }
      this.closeIndentation();
      if (tag = this.ends.pop()) {
        this.error("missing " + tag);
      }
      if (opts.rewrite === false) {
        return this.tokens;
      }
      return (new Rewriter).rewrite(this.tokens);
    };
    Lexer.prototype.identifierToken = function() {
      var colon, forcedIdentifier, id, input, match, prev, tag, _ref2, _ref3;
      if (!(match = IDENTIFIER.exec(this.chunk))) {
        return 0;
      }
      input = match[0], id = match[1], colon = match[2];
      if (id === 'own' && this.tag() === 'FOR') {
        this.token('OWN', id);
        return id.length;
      }
      forcedIdentifier = colon || (prev = last(this.tokens)) && (((_ref2 = prev[0]) === '.' || _ref2 === '?.' || _ref2 === '::') || !prev.spaced && prev[0] === '@');
      tag = 'IDENTIFIER';
      if (!forcedIdentifier && (__indexOf.call(JS_KEYWORDS, id) >= 0 || __indexOf.call(COFFEE_KEYWORDS, id) >= 0)) {
        tag = id.toUpperCase();
        if (tag === 'WHEN' && (_ref3 = this.tag(), __indexOf.call(LINE_BREAK, _ref3) >= 0)) {
          tag = 'LEADING_WHEN';
        } else if (tag === 'FOR') {
          this.seenFor = true;
        } else if (tag === 'UNLESS') {
          tag = 'IF';
        } else if (__indexOf.call(UNARY, tag) >= 0) {
          tag = 'UNARY';
        } else if (__indexOf.call(RELATION, tag) >= 0) {
          if (tag !== 'INSTANCEOF' && this.seenFor) {
            tag = 'FOR' + tag;
            this.seenFor = false;
          } else {
            tag = 'RELATION';
            if (this.value() === '!') {
              this.tokens.pop();
              id = '!' + id;
            }
          }
        }
      }
      if (__indexOf.call(JS_FORBIDDEN, id) >= 0) {
        if (forcedIdentifier) {
          tag = 'IDENTIFIER';
          id = new String(id);
          id.reserved = true;
        } else if (__indexOf.call(RESERVED, id) >= 0) {
          this.error("reserved word \"" + id + "\"");
        }
      }
      if (!forcedIdentifier) {
        if (__indexOf.call(COFFEE_ALIASES, id) >= 0) {
          id = COFFEE_ALIAS_MAP[id];
        }
        tag = (function() {
          switch (id) {
            case '!':
              return 'UNARY';
            case '==':
            case '!=':
              return 'COMPARE';
            case '&&':
            case '||':
              return 'LOGIC';
            case 'true':
            case 'false':
            case 'null':
            case 'undefined':
              return 'BOOL';
            case 'break':
            case 'continue':
              return 'STATEMENT';
            default:
              return tag;
          }
        })();
      }
      this.token(tag, id);
      if (colon) {
        this.token(':', ':');
      }
      return input.length;
    };
    Lexer.prototype.numberToken = function() {
      var binaryLiteral, lexedLength, match, number, octalLiteral;
      if (!(match = NUMBER.exec(this.chunk))) {
        return 0;
      }
      number = match[0];
      if (/^0[BOX]/.test(number)) {
        this.error("radix prefix '" + number + "' must be lowercase");
      } else if (/E/.test(number) && !/^0x/.test(number)) {
        this.error("exponential notation '" + number + "' must be indicated with a lowercase 'e'");
      } else if (/^0\d*[89]/.test(number)) {
        this.error("decimal literal '" + number + "' must not be prefixed with '0'");
      } else if (/^0\d+/.test(number)) {
        this.error("octal literal '" + number + "' must be prefixed with '0o'");
      }
      lexedLength = number.length;
      if (octalLiteral = /^0o([0-7]+)/.exec(number)) {
        number = '0x' + (parseInt(octalLiteral[1], 8)).toString(16);
      }
      if (binaryLiteral = /^0b([01]+)/.exec(number)) {
        number = '0x' + (parseInt(binaryLiteral[1], 2)).toString(16);
      }
      this.token('NUMBER', number);
      return lexedLength;
    };
    Lexer.prototype.stringToken = function() {
      var match, octalEsc, string;
      switch (this.chunk.charAt(0)) {
        case "'":
          if (!(match = SIMPLESTR.exec(this.chunk))) {
            return 0;
          }
          this.token('STRING', (string = match[0]).replace(MULTILINER, '\\\n'));
          break;
        case '"':
          if (!(string = this.balancedString(this.chunk, '"'))) {
            return 0;
          }
          if (0 < string.indexOf('#{', 1)) {
            this.interpolateString(string.slice(1, -1));
          } else {
            this.token('STRING', this.escapeLines(string));
          }
          break;
        default:
          return 0;
      }
      if (octalEsc = /^(?:\\.|[^\\])*\\[0-7]/.test(string)) {
        this.error("octal escape sequences " + string + " are not allowed");
      }
      this.line += count(string, '\n');
      return string.length;
    };
    Lexer.prototype.heredocToken = function() {
      var doc, heredoc, match, quote;
      if (!(match = HEREDOC.exec(this.chunk))) {
        return 0;
      }
      heredoc = match[0];
      quote = heredoc.charAt(0);
      doc = this.sanitizeHeredoc(match[2], {
        quote: quote,
        indent: null
      });
      if (quote === '"' && 0 <= doc.indexOf('#{')) {
        this.interpolateString(doc, {
          heredoc: true
        });
      } else {
        this.token('STRING', this.makeString(doc, quote, true));
      }
      this.line += count(heredoc, '\n');
      return heredoc.length;
    };
    Lexer.prototype.commentToken = function() {
      var comment, here, match;
      if (!(match = this.chunk.match(COMMENT))) {
        return 0;
      }
      comment = match[0], here = match[1];
      if (here) {
        this.token('HERECOMMENT', this.sanitizeHeredoc(here, {
          herecomment: true,
          indent: Array(this.indent + 1).join(' ')
        }));
      }
      this.line += count(comment, '\n');
      return comment.length;
    };
    Lexer.prototype.jsToken = function() {
      var match, script;
      if (!(this.chunk.charAt(0) === '`' && (match = JSTOKEN.exec(this.chunk)))) {
        return 0;
      }
      this.token('JS', (script = match[0]).slice(1, -1));
      return script.length;
    };
    Lexer.prototype.regexToken = function() {
      var flags, length, match, prev, regex, _ref2, _ref3;
      if (this.chunk.charAt(0) !== '/') {
        return 0;
      }
      if (match = HEREGEX.exec(this.chunk)) {
        length = this.heregexToken(match);
        this.line += count(match[0], '\n');
        return length;
      }
      prev = last(this.tokens);
      if (prev && (_ref2 = prev[0], __indexOf.call((prev.spaced ? NOT_REGEX : NOT_SPACED_REGEX), _ref2) >= 0)) {
        return 0;
      }
      if (!(match = REGEX.exec(this.chunk))) {
        return 0;
      }
      _ref3 = match, match = _ref3[0], regex = _ref3[1], flags = _ref3[2];
      if (regex.slice(0, 2) === '/*') {
        this.error('regular expressions cannot begin with `*`');
      }
      if (regex === '//') {
        regex = '/(?:)/';
      }
      this.token('REGEX', "" + regex + flags);
      return match.length;
    };
    Lexer.prototype.heregexToken = function(match) {
      var body, flags, heregex, re, tag, tokens, value, _i, _len, _ref2, _ref3, _ref4, _ref5;
      heregex = match[0], body = match[1], flags = match[2];
      if (0 > body.indexOf('#{')) {
        re = body.replace(HEREGEX_OMIT, '').replace(/\//g, '\\/');
        if (re.match(/^\*/)) {
          this.error('regular expressions cannot begin with `*`');
        }
        this.token('REGEX', "/" + (re || '(?:)') + "/" + flags);
        return heregex.length;
      }
      this.token('IDENTIFIER', 'RegExp');
      this.tokens.push(['CALL_START', '(']);
      tokens = [];
      _ref2 = this.interpolateString(body, {
        regex: true
      });
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        _ref3 = _ref2[_i], tag = _ref3[0], value = _ref3[1];
        if (tag === 'TOKENS') {
          tokens.push.apply(tokens, value);
        } else {
          if (!(value = value.replace(HEREGEX_OMIT, ''))) {
            continue;
          }
          value = value.replace(/\\/g, '\\\\');
          tokens.push(['STRING', this.makeString(value, '"', true)]);
        }
        tokens.push(['+', '+']);
      }
      tokens.pop();
      if (((_ref4 = tokens[0]) != null ? _ref4[0] : void 0) !== 'STRING') {
        this.tokens.push(['STRING', '""'], ['+', '+']);
      }
      (_ref5 = this.tokens).push.apply(_ref5, tokens);
      if (flags) {
        this.tokens.push([',', ','], ['STRING', '"' + flags + '"']);
      }
      this.token(')', ')');
      return heregex.length;
    };
    Lexer.prototype.lineToken = function() {
      var diff, indent, match, noNewlines, prev, size;
      if (!(match = MULTI_DENT.exec(this.chunk))) {
        return 0;
      }
      indent = match[0];
      this.line += count(indent, '\n');
      this.seenFor = false;
      prev = last(this.tokens, 1);
      size = indent.length - 1 - indent.lastIndexOf('\n');
      noNewlines = this.unfinished();
      if (size - this.indebt === this.indent) {
        if (noNewlines) {
          this.suppressNewlines();
        } else {
          this.newlineToken();
        }
        return indent.length;
      }
      if (size > this.indent) {
        if (noNewlines) {
          this.indebt = size - this.indent;
          this.suppressNewlines();
          return indent.length;
        }
        diff = size - this.indent + this.outdebt;
        this.token('INDENT', diff);
        this.indents.push(diff);
        this.ends.push('OUTDENT');
        this.outdebt = this.indebt = 0;
      } else {
        this.indebt = 0;
        this.outdentToken(this.indent - size, noNewlines);
      }
      this.indent = size;
      return indent.length;
    };
    Lexer.prototype.outdentToken = function(moveOut, noNewlines) {
      var dent, len;
      while (moveOut > 0) {
        len = this.indents.length - 1;
        if (this.indents[len] === void 0) {
          moveOut = 0;
        } else if (this.indents[len] === this.outdebt) {
          moveOut -= this.outdebt;
          this.outdebt = 0;
        } else if (this.indents[len] < this.outdebt) {
          this.outdebt -= this.indents[len];
          moveOut -= this.indents[len];
        } else {
          dent = this.indents.pop() - this.outdebt;
          moveOut -= dent;
          this.outdebt = 0;
          this.pair('OUTDENT');
          this.token('OUTDENT', dent);
        }
      }
      if (dent) {
        this.outdebt -= moveOut;
      }
      while (this.value() === ';') {
        this.tokens.pop();
      }
      if (!(this.tag() === 'TERMINATOR' || noNewlines)) {
        this.token('TERMINATOR', '\n');
      }
      return this;
    };
    Lexer.prototype.whitespaceToken = function() {
      var match, nline, prev;
      if (!((match = WHITESPACE.exec(this.chunk)) || (nline = this.chunk.charAt(0) === '\n'))) {
        return 0;
      }
      prev = last(this.tokens);
      if (prev) {
        prev[match ? 'spaced' : 'newLine'] = true;
      }
      if (match) {
        return match[0].length;
      } else {
        return 0;
      }
    };
    Lexer.prototype.newlineToken = function() {
      while (this.value() === ';') {
        this.tokens.pop();
      }
      if (this.tag() !== 'TERMINATOR') {
        this.token('TERMINATOR', '\n');
      }
      return this;
    };
    Lexer.prototype.suppressNewlines = function() {
      if (this.value() === '\\') {
        this.tokens.pop();
      }
      return this;
    };
    Lexer.prototype.literalToken = function() {
      var match, prev, tag, value, _ref2, _ref3, _ref4, _ref5;
      if (match = OPERATOR.exec(this.chunk)) {
        value = match[0];
        if (CODE.test(value)) {
          this.tagParameters();
        }
      } else {
        value = this.chunk.charAt(0);
      }
      tag = value;
      prev = last(this.tokens);
      if (value === '=' && prev) {
        if (!prev[1].reserved && (_ref2 = prev[1], __indexOf.call(JS_FORBIDDEN, _ref2) >= 0)) {
          this.error("reserved word \"" + (this.value()) + "\" can't be assigned");
        }
        if ((_ref3 = prev[1]) === '||' || _ref3 === '&&') {
          prev[0] = 'COMPOUND_ASSIGN';
          prev[1] += '=';
          return value.length;
        }
      }
      if (value === ';') {
        this.seenFor = false;
        tag = 'TERMINATOR';
      } else if (__indexOf.call(MATH, value) >= 0) {
        tag = 'MATH';
      } else if (__indexOf.call(COMPARE, value) >= 0) {
        tag = 'COMPARE';
      } else if (__indexOf.call(COMPOUND_ASSIGN, value) >= 0) {
        tag = 'COMPOUND_ASSIGN';
      } else if (__indexOf.call(UNARY, value) >= 0) {
        tag = 'UNARY';
      } else if (__indexOf.call(SHIFT, value) >= 0) {
        tag = 'SHIFT';
      } else if (__indexOf.call(LOGIC, value) >= 0 || value === '?' && (prev != null ? prev.spaced : void 0)) {
        tag = 'LOGIC';
      } else if (prev && !prev.spaced) {
        if (value === '(' && (_ref4 = prev[0], __indexOf.call(CALLABLE, _ref4) >= 0)) {
          if (prev[0] === '?') {
            prev[0] = 'FUNC_EXIST';
          }
          tag = 'CALL_START';
        } else if (value === '[' && (_ref5 = prev[0], __indexOf.call(INDEXABLE, _ref5) >= 0)) {
          tag = 'INDEX_START';
          switch (prev[0]) {
            case '?':
              prev[0] = 'INDEX_SOAK';
          }
        }
      }
      switch (value) {
        case '(':
        case '{':
        case '[':
          this.ends.push(INVERSES[value]);
          break;
        case ')':
        case '}':
        case ']':
          this.pair(value);
      }
      this.token(tag, value);
      return value.length;
    };
    Lexer.prototype.sanitizeHeredoc = function(doc, options) {
      var attempt, herecomment, indent, match, _ref2;
      indent = options.indent, herecomment = options.herecomment;
      if (herecomment) {
        if (HEREDOC_ILLEGAL.test(doc)) {
          this.error("block comment cannot contain \"*/\", starting");
        }
        if (doc.indexOf('\n') <= 0) {
          return doc;
        }
      } else {
        while (match = HEREDOC_INDENT.exec(doc)) {
          attempt = match[1];
          if (indent === null || (0 < (_ref2 = attempt.length) && _ref2 < indent.length)) {
            indent = attempt;
          }
        }
      }
      if (indent) {
        doc = doc.replace(RegExp("\\n" + indent, "g"), '\n');
      }
      if (!herecomment) {
        doc = doc.replace(/^\n/, '');
      }
      return doc;
    };
    Lexer.prototype.tagParameters = function() {
      var i, stack, tok, tokens;
      if (this.tag() !== ')') {
        return this;
      }
      stack = [];
      tokens = this.tokens;
      i = tokens.length;
      tokens[--i][0] = 'PARAM_END';
      while (tok = tokens[--i]) {
        switch (tok[0]) {
          case ')':
            stack.push(tok);
            break;
          case '(':
          case 'CALL_START':
            if (stack.length) {
              stack.pop();
            } else if (tok[0] === '(') {
              tok[0] = 'PARAM_START';
              return this;
            } else {
              return this;
            }
        }
      }
      return this;
    };
    Lexer.prototype.closeIndentation = function() {
      return this.outdentToken(this.indent);
    };
    Lexer.prototype.balancedString = function(str, end) {
      var continueCount, i, letter, match, prev, stack, _i, _ref2;
      continueCount = 0;
      stack = [end];
      for (i = _i = 1, _ref2 = str.length; 1 <= _ref2 ? _i < _ref2 : _i > _ref2; i = 1 <= _ref2 ? ++_i : --_i) {
        if (continueCount) {
          --continueCount;
          continue;
        }
        switch (letter = str.charAt(i)) {
          case '\\':
            ++continueCount;
            continue;
          case end:
            stack.pop();
            if (!stack.length) {
              return str.slice(0, i + 1 || 9e9);
            }
            end = stack[stack.length - 1];
            continue;
        }
        if (end === '}' && (letter === '"' || letter === "'")) {
          stack.push(end = letter);
        } else if (end === '}' && letter === '/' && (match = HEREGEX.exec(str.slice(i)) || REGEX.exec(str.slice(i)))) {
          continueCount += match[0].length - 1;
        } else if (end === '}' && letter === '{') {
          stack.push(end = '}');
        } else if (end === '"' && prev === '#' && letter === '{') {
          stack.push(end = '}');
        }
        prev = letter;
      }
      return this.error("missing " + (stack.pop()) + ", starting");
    };
    Lexer.prototype.interpolateString = function(str, options) {
      var expr, heredoc, i, inner, interpolated, len, letter, nested, pi, regex, tag, tokens, value, _i, _len, _ref2, _ref3, _ref4;
      if (options == null) {
        options = {};
      }
      heredoc = options.heredoc, regex = options.regex;
      tokens = [];
      pi = 0;
      i = -1;
      while (letter = str.charAt(i += 1)) {
        if (letter === '\\') {
          i += 1;
          continue;
        }
        if (!(letter === '#' && str.charAt(i + 1) === '{' && (expr = this.balancedString(str.slice(i + 1), '}')))) {
          continue;
        }
        if (pi < i) {
          tokens.push(['NEOSTRING', str.slice(pi, i)]);
        }
        inner = expr.slice(1, -1);
        if (inner.length) {
          nested = new Lexer().tokenize(inner, {
            line: this.line,
            rewrite: false
          });
          nested.pop();
          if (((_ref2 = nested[0]) != null ? _ref2[0] : void 0) === 'TERMINATOR') {
            nested.shift();
          }
          if (len = nested.length) {
            if (len > 1) {
              nested.unshift(['(', '(', this.line]);
              nested.push([')', ')', this.line]);
            }
            tokens.push(['TOKENS', nested]);
          }
        }
        i += expr.length;
        pi = i + 1;
      }
      if ((i > pi && pi < str.length)) {
        tokens.push(['NEOSTRING', str.slice(pi)]);
      }
      if (regex) {
        return tokens;
      }
      if (!tokens.length) {
        return this.token('STRING', '""');
      }
      if (tokens[0][0] !== 'NEOSTRING') {
        tokens.unshift(['', '']);
      }
      if (interpolated = tokens.length > 1) {
        this.token('(', '(');
      }
      for (i = _i = 0, _len = tokens.length; _i < _len; i = ++_i) {
        _ref3 = tokens[i], tag = _ref3[0], value = _ref3[1];
        if (i) {
          this.token('+', '+');
        }
        if (tag === 'TOKENS') {
          (_ref4 = this.tokens).push.apply(_ref4, value);
        } else {
          this.token('STRING', this.makeString(value, '"', heredoc));
        }
      }
      if (interpolated) {
        this.token(')', ')');
      }
      return tokens;
    };
    Lexer.prototype.pair = function(tag) {
      var size, wanted;
      if (tag !== (wanted = last(this.ends))) {
        if ('OUTDENT' !== wanted) {
          this.error("unmatched " + tag);
        }
        this.indent -= size = last(this.indents);
        this.outdentToken(size, true);
        return this.pair(tag);
      }
      return this.ends.pop();
    };
    Lexer.prototype.token = function(tag, value) {
      return this.tokens.push([tag, value, this.line]);
    };
    Lexer.prototype.tag = function(index, tag) {
      var tok;
      return (tok = last(this.tokens, index)) && (tag ? tok[0] = tag : tok[0]);
    };
    Lexer.prototype.value = function(index, val) {
      var tok;
      return (tok = last(this.tokens, index)) && (val ? tok[1] = val : tok[1]);
    };
    Lexer.prototype.unfinished = function() {
      var _ref2;
      return LINE_CONTINUER.test(this.chunk) || ((_ref2 = this.tag()) === '\\' || _ref2 === '.' || _ref2 === '?.' || _ref2 === 'UNARY' || _ref2 === 'MATH' || _ref2 === '+' || _ref2 === '-' || _ref2 === 'SHIFT' || _ref2 === 'RELATION' || _ref2 === 'COMPARE' || _ref2 === 'LOGIC' || _ref2 === 'THROW' || _ref2 === 'EXTENDS');
    };
    Lexer.prototype.escapeLines = function(str, heredoc) {
      return str.replace(MULTILINER, heredoc ? '\\n' : '');
    };
    Lexer.prototype.makeString = function(body, quote, heredoc) {
      if (!body) {
        return quote + quote;
      }
      body = body.replace(/\\([\s\S])/g, function(match, contents) {
        if (contents === '\n' || contents === quote) {
          return contents;
        } else {
          return match;
        }
      });
      body = body.replace(RegExp("" + quote, "g"), '\\$&');
      return quote + this.escapeLines(body, heredoc) + quote;
    };
    Lexer.prototype.error = function(message) {
      throw SyntaxError("" + message + " on line " + (this.line + 1));
    };
    return Lexer;
  })();
  JS_KEYWORDS = ['true', 'false', 'null', 'this', 'new', 'delete', 'typeof', 'in', 'instanceof', 'return', 'throw', 'break', 'continue', 'debugger', 'if', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally', 'class', 'extends', 'super'];
  COFFEE_KEYWORDS = ['undefined', 'then', 'unless', 'until', 'loop', 'of', 'by', 'when'];
  COFFEE_ALIAS_MAP = {
    and: '&&',
    or: '||',
    is: '==',
    isnt: '!=',
    not: '!',
    yes: 'true',
    no: 'false',
    on: 'true',
    off: 'false'
  };
  COFFEE_ALIASES = (function() {
    var _results;
    _results = [];
    for (key in COFFEE_ALIAS_MAP) {
      _results.push(key);
    }
    return _results;
  })();
  COFFEE_KEYWORDS = COFFEE_KEYWORDS.concat(COFFEE_ALIASES);
  RESERVED = ['case', 'default', 'function', 'var', 'void', 'with', 'const', 'let', 'enum', 'export', 'import', 'native', '__hasProp', '__extends', '__slice', '__bind', '__indexOf', 'implements', 'interface', 'let', 'package', 'private', 'protected', 'public', 'static', 'yield'];
  STRICT_PROSCRIBED = ['arguments', 'eval'];
  JS_FORBIDDEN = JS_KEYWORDS.concat(RESERVED).concat(STRICT_PROSCRIBED);
  exports.RESERVED = RESERVED.concat(JS_KEYWORDS).concat(COFFEE_KEYWORDS).concat(STRICT_PROSCRIBED);
  exports.STRICT_PROSCRIBED = STRICT_PROSCRIBED;
  IDENTIFIER = /^([$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)([^\n\S]*:(?!:))?/;
  NUMBER = /^0b[01]+|^0o[0-7]+|^0x[\da-f]+|^\d*\.?\d+(?:e[+-]?\d+)?/i;
  HEREDOC = /^("""|''')([\s\S]*?)(?:\n[^\n\S]*)?\1/;
  OPERATOR = /^(?:[-=]>|[-+*\/%<>&|^!?=]=|>>>=?|([-+:])\1|([&|<>])\2=?|\?\.|\.{2,3})/;
  WHITESPACE = /^[^\n\S]+/;
  COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)|^(?:\s*#(?!##[^#]).*)+/;
  CODE = /^[-=]>/;
  MULTI_DENT = /^(?:\n[^\n\S]*)+/;
  SIMPLESTR = /^'[^\\']*(?:\\.[^\\']*)*'/;
  JSTOKEN = /^`[^\\`]*(?:\\.[^\\`]*)*`/;
  REGEX = /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/;
  HEREGEX = /^\/{3}([\s\S]+?)\/{3}([imgy]{0,4})(?!\w)/;
  HEREGEX_OMIT = /\s+(?:#.*)?/g;
  MULTILINER = /\n/g;
  HEREDOC_INDENT = /\n+([^\n\S]*)/g;
  HEREDOC_ILLEGAL = /\*\//;
  LINE_CONTINUER = /^\s*(?:,|\??\.(?![.\d])|::)/;
  TRAILING_SPACES = /\s+$/;
  COMPOUND_ASSIGN = ['-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|='];
  UNARY = ['!', '~', 'NEW', 'TYPEOF', 'DELETE', 'DO'];
  LOGIC = ['&&', '||', '&', '|', '^'];
  SHIFT = ['<<', '>>', '>>>'];
  COMPARE = ['==', '!=', '<', '>', '<=', '>='];
  MATH = ['*', '/', '%'];
  RELATION = ['IN', 'OF', 'INSTANCEOF'];
  BOOL = ['TRUE', 'FALSE', 'NULL', 'UNDEFINED'];
  NOT_REGEX = ['NUMBER', 'REGEX', 'BOOL', '++', '--', ']'];
  NOT_SPACED_REGEX = NOT_REGEX.concat(')', '}', 'THIS', 'IDENTIFIER', 'STRING');
  CALLABLE = ['IDENTIFIER', 'STRING', 'REGEX', ')', ']', '}', '?', '::', '@', 'THIS', 'SUPER'];
  INDEXABLE = CALLABLE.concat('NUMBER', 'BOOL');
  LINE_BREAK = ['INDENT', 'OUTDENT', 'TERMINATOR'];
}).call(this);
    }
  };
});
horseDatastore.module(8, function(onejsModParent){
  return {
    'id':'rewriter',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // Generated by CoffeeScript 1.3.1
(function() {
  var BALANCED_PAIRS, EXPRESSION_CLOSE, EXPRESSION_END, EXPRESSION_START, IMPLICIT_BLOCK, IMPLICIT_CALL, IMPLICIT_END, IMPLICIT_FUNC, IMPLICIT_UNSPACED_CALL, INVERSES, LINEBREAKS, SINGLE_CLOSERS, SINGLE_LINERS, left, rite, _i, _len, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;
  exports.Rewriter = (function() {
    Rewriter.name = 'Rewriter';
    function Rewriter() {}
    Rewriter.prototype.rewrite = function(tokens) {
      this.tokens = tokens;
      this.removeLeadingNewlines();
      this.removeMidExpressionNewlines();
      this.closeOpenCalls();
      this.closeOpenIndexes();
      this.addImplicitIndentation();
      this.tagPostfixConditionals();
      this.addImplicitBraces();
      this.addImplicitParentheses();
      return this.tokens;
    };
    Rewriter.prototype.scanTokens = function(block) {
      var i, token, tokens;
      tokens = this.tokens;
      i = 0;
      while (token = tokens[i]) {
        i += block.call(this, token, i, tokens);
      }
      return true;
    };
    Rewriter.prototype.detectEnd = function(i, condition, action) {
      var levels, token, tokens, _ref, _ref1;
      tokens = this.tokens;
      levels = 0;
      while (token = tokens[i]) {
        if (levels === 0 && condition.call(this, token, i)) {
          return action.call(this, token, i);
        }
        if (!token || levels < 0) {
          return action.call(this, token, i - 1);
        }
        if (_ref = token[0], __indexOf.call(EXPRESSION_START, _ref) >= 0) {
          levels += 1;
        } else if (_ref1 = token[0], __indexOf.call(EXPRESSION_END, _ref1) >= 0) {
          levels -= 1;
        }
        i += 1;
      }
      return i - 1;
    };
    Rewriter.prototype.removeLeadingNewlines = function() {
      var i, tag, _i, _len, _ref;
      _ref = this.tokens;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        tag = _ref[i][0];
        if (tag !== 'TERMINATOR') {
          break;
        }
      }
      if (i) {
        return this.tokens.splice(0, i);
      }
    };
    Rewriter.prototype.removeMidExpressionNewlines = function() {
      return this.scanTokens(function(token, i, tokens) {
        var _ref;
        if (!(token[0] === 'TERMINATOR' && (_ref = this.tag(i + 1), __indexOf.call(EXPRESSION_CLOSE, _ref) >= 0))) {
          return 1;
        }
        tokens.splice(i, 1);
        return 0;
      });
    };
    Rewriter.prototype.closeOpenCalls = function() {
      var action, condition;
      condition = function(token, i) {
        var _ref;
        return ((_ref = token[0]) === ')' || _ref === 'CALL_END') || token[0] === 'OUTDENT' && this.tag(i - 1) === ')';
      };
      action = function(token, i) {
        return this.tokens[token[0] === 'OUTDENT' ? i - 1 : i][0] = 'CALL_END';
      };
      return this.scanTokens(function(token, i) {
        if (token[0] === 'CALL_START') {
          this.detectEnd(i + 1, condition, action);
        }
        return 1;
      });
    };
    Rewriter.prototype.closeOpenIndexes = function() {
      var action, condition;
      condition = function(token, i) {
        var _ref;
        return (_ref = token[0]) === ']' || _ref === 'INDEX_END';
      };
      action = function(token, i) {
        return token[0] = 'INDEX_END';
      };
      return this.scanTokens(function(token, i) {
        if (token[0] === 'INDEX_START') {
          this.detectEnd(i + 1, condition, action);
        }
        return 1;
      });
    };
    Rewriter.prototype.addImplicitBraces = function() {
      var action, condition, sameLine, stack, start, startIndent, startsLine;
      stack = [];
      start = null;
      startsLine = null;
      sameLine = true;
      startIndent = 0;
      condition = function(token, i) {
        var one, tag, three, two, _ref, _ref1;
        _ref = this.tokens.slice(i + 1, (i + 3) + 1 || 9e9), one = _ref[0], two = _ref[1], three = _ref[2];
        if ('HERECOMMENT' === (one != null ? one[0] : void 0)) {
          return false;
        }
        tag = token[0];
        if (__indexOf.call(LINEBREAKS, tag) >= 0) {
          sameLine = false;
        }
        return (((tag === 'TERMINATOR' || tag === 'OUTDENT') || (__indexOf.call(IMPLICIT_END, tag) >= 0 && sameLine)) && ((!startsLine && this.tag(i - 1) !== ',') || !((two != null ? two[0] : void 0) === ':' || (one != null ? one[0] : void 0) === '@' && (three != null ? three[0] : void 0) === ':'))) || (tag === ',' && one && ((_ref1 = one[0]) !== 'IDENTIFIER' && _ref1 !== 'NUMBER' && _ref1 !== 'STRING' && _ref1 !== '@' && _ref1 !== 'TERMINATOR' && _ref1 !== 'OUTDENT'));
      };
      action = function(token, i) {
        var tok;
        tok = this.generate('}', '}', token[2]);
        return this.tokens.splice(i, 0, tok);
      };
      return this.scanTokens(function(token, i, tokens) {
        var ago, idx, prevTag, tag, tok, value, _ref, _ref1;
        if (_ref = (tag = token[0]), __indexOf.call(EXPRESSION_START, _ref) >= 0) {
          stack.push([(tag === 'INDENT' && this.tag(i - 1) === '{' ? '{' : tag), i]);
          return 1;
        }
        if (__indexOf.call(EXPRESSION_END, tag) >= 0) {
          start = stack.pop();
          return 1;
        }
        if (!(tag === ':' && ((ago = this.tag(i - 2)) === ':' || ((_ref1 = stack[stack.length - 1]) != null ? _ref1[0] : void 0) !== '{'))) {
          return 1;
        }
        sameLine = true;
        stack.push(['{']);
        idx = ago === '@' ? i - 2 : i - 1;
        while (this.tag(idx - 2) === 'HERECOMMENT') {
          idx -= 2;
        }
        prevTag = this.tag(idx - 1);
        startsLine = !prevTag || (__indexOf.call(LINEBREAKS, prevTag) >= 0);
        value = new String('{');
        value.generated = true;
        tok = this.generate('{', value, token[2]);
        tokens.splice(idx, 0, tok);
        this.detectEnd(i + 2, condition, action);
        return 2;
      });
    };
    Rewriter.prototype.addImplicitParentheses = function() {
      var action, condition, noCall, seenControl, seenSingle;
      noCall = seenSingle = seenControl = false;
      condition = function(token, i) {
        var post, tag, _ref, _ref1;
        tag = token[0];
        if (!seenSingle && token.fromThen) {
          return true;
        }
        if (tag === 'IF' || tag === 'ELSE' || tag === 'CATCH' || tag === '->' || tag === '=>' || tag === 'CLASS') {
          seenSingle = true;
        }
        if (tag === 'IF' || tag === 'ELSE' || tag === 'SWITCH' || tag === 'TRY' || tag === '=') {
          seenControl = true;
        }
        if ((tag === '.' || tag === '?.' || tag === '::') && this.tag(i - 1) === 'OUTDENT') {
          return true;
        }
        return !token.generated && this.tag(i - 1) !== ',' && (__indexOf.call(IMPLICIT_END, tag) >= 0 || (tag === 'INDENT' && !seenControl)) && (tag !== 'INDENT' || (((_ref = this.tag(i - 2)) !== 'CLASS' && _ref !== 'EXTENDS') && (_ref1 = this.tag(i - 1), __indexOf.call(IMPLICIT_BLOCK, _ref1) < 0) && !((post = this.tokens[i + 1]) && post.generated && post[0] === '{')));
      };
      action = function(token, i) {
        return this.tokens.splice(i, 0, this.generate('CALL_END', ')', token[2]));
      };
      return this.scanTokens(function(token, i, tokens) {
        var callObject, current, next, prev, tag, _ref, _ref1, _ref2;
        tag = token[0];
        if (tag === 'CLASS' || tag === 'IF' || tag === 'FOR' || tag === 'WHILE') {
          noCall = true;
        }
        _ref = tokens.slice(i - 1, (i + 1) + 1 || 9e9), prev = _ref[0], current = _ref[1], next = _ref[2];
        callObject = !noCall && tag === 'INDENT' && next && next.generated && next[0] === '{' && prev && (_ref1 = prev[0], __indexOf.call(IMPLICIT_FUNC, _ref1) >= 0);
        seenSingle = false;
        seenControl = false;
        if (__indexOf.call(LINEBREAKS, tag) >= 0) {
          noCall = false;
        }
        if (prev && !prev.spaced && tag === '?') {
          token.call = true;
        }
        if (token.fromThen) {
          return 1;
        }
        if (!(callObject || (prev != null ? prev.spaced : void 0) && (prev.call || (_ref2 = prev[0], __indexOf.call(IMPLICIT_FUNC, _ref2) >= 0)) && (__indexOf.call(IMPLICIT_CALL, tag) >= 0 || !(token.spaced || token.newLine) && __indexOf.call(IMPLICIT_UNSPACED_CALL, tag) >= 0))) {
          return 1;
        }
        tokens.splice(i, 0, this.generate('CALL_START', '(', token[2]));
        this.detectEnd(i + 1, condition, action);
        if (prev[0] === '?') {
          prev[0] = 'FUNC_EXIST';
        }
        return 2;
      });
    };
    Rewriter.prototype.addImplicitIndentation = function() {
      var action, condition, indent, outdent, starter;
      starter = indent = outdent = null;
      condition = function(token, i) {
        var _ref;
        return token[1] !== ';' && (_ref = token[0], __indexOf.call(SINGLE_CLOSERS, _ref) >= 0) && !(token[0] === 'ELSE' && (starter !== 'IF' && starter !== 'THEN'));
      };
      action = function(token, i) {
        return this.tokens.splice((this.tag(i - 1) === ',' ? i - 1 : i), 0, outdent);
      };
      return this.scanTokens(function(token, i, tokens) {
        var tag, _ref, _ref1;
        tag = token[0];
        if (tag === 'TERMINATOR' && this.tag(i + 1) === 'THEN') {
          tokens.splice(i, 1);
          return 0;
        }
        if (tag === 'ELSE' && this.tag(i - 1) !== 'OUTDENT') {
          tokens.splice.apply(tokens, [i, 0].concat(__slice.call(this.indentation(token))));
          return 2;
        }
        if (tag === 'CATCH' && ((_ref = this.tag(i + 2)) === 'OUTDENT' || _ref === 'TERMINATOR' || _ref === 'FINALLY')) {
          tokens.splice.apply(tokens, [i + 2, 0].concat(__slice.call(this.indentation(token))));
          return 4;
        }
        if (__indexOf.call(SINGLE_LINERS, tag) >= 0 && this.tag(i + 1) !== 'INDENT' && !(tag === 'ELSE' && this.tag(i + 1) === 'IF')) {
          starter = tag;
          _ref1 = this.indentation(token, true), indent = _ref1[0], outdent = _ref1[1];
          if (starter === 'THEN') {
            indent.fromThen = true;
          }
          tokens.splice(i + 1, 0, indent);
          this.detectEnd(i + 2, condition, action);
          if (tag === 'THEN') {
            tokens.splice(i, 1);
          }
          return 1;
        }
        return 1;
      });
    };
    Rewriter.prototype.tagPostfixConditionals = function() {
      var action, condition, original;
      original = null;
      condition = function(token, i) {
        var _ref;
        return (_ref = token[0]) === 'TERMINATOR' || _ref === 'INDENT';
      };
      action = function(token, i) {
        if (token[0] !== 'INDENT' || (token.generated && !token.fromThen)) {
          return original[0] = 'POST_' + original[0];
        }
      };
      return this.scanTokens(function(token, i) {
        if (token[0] !== 'IF') {
          return 1;
        }
        original = token;
        this.detectEnd(i + 1, condition, action);
        return 1;
      });
    };
    Rewriter.prototype.indentation = function(token, implicit) {
      var indent, outdent;
      if (implicit == null) {
        implicit = false;
      }
      indent = ['INDENT', 2, token[2]];
      outdent = ['OUTDENT', 2, token[2]];
      if (implicit) {
        indent.generated = outdent.generated = true;
      }
      return [indent, outdent];
    };
    Rewriter.prototype.generate = function(tag, value, line) {
      var tok;
      tok = [tag, value, line];
      tok.generated = true;
      return tok;
    };
    Rewriter.prototype.tag = function(i) {
      var _ref;
      return (_ref = this.tokens[i]) != null ? _ref[0] : void 0;
    };
    return Rewriter;
  })();
  BALANCED_PAIRS = [['(', ')'], ['[', ']'], ['{', '}'], ['INDENT', 'OUTDENT'], ['CALL_START', 'CALL_END'], ['PARAM_START', 'PARAM_END'], ['INDEX_START', 'INDEX_END']];
  exports.INVERSES = INVERSES = {};
  EXPRESSION_START = [];
  EXPRESSION_END = [];
  for (_i = 0, _len = BALANCED_PAIRS.length; _i < _len; _i++) {
    _ref = BALANCED_PAIRS[_i], left = _ref[0], rite = _ref[1];
    EXPRESSION_START.push(INVERSES[rite] = left);
    EXPRESSION_END.push(INVERSES[left] = rite);
  }
  EXPRESSION_CLOSE = ['CATCH', 'WHEN', 'ELSE', 'FINALLY'].concat(EXPRESSION_END);
  IMPLICIT_FUNC = ['IDENTIFIER', 'SUPER', ')', 'CALL_END', ']', 'INDEX_END', '@', 'THIS'];
  IMPLICIT_CALL = ['IDENTIFIER', 'NUMBER', 'STRING', 'JS', 'REGEX', 'NEW', 'PARAM_START', 'CLASS', 'IF', 'TRY', 'SWITCH', 'THIS', 'BOOL', 'UNARY', 'SUPER', '@', '->', '=>', '[', '(', '{', '--', '++'];
  IMPLICIT_UNSPACED_CALL = ['+', '-'];
  IMPLICIT_BLOCK = ['->', '=>', '{', '[', ','];
  IMPLICIT_END = ['POST_IF', 'FOR', 'WHILE', 'UNTIL', 'WHEN', 'BY', 'LOOP', 'TERMINATOR'];
  SINGLE_LINERS = ['ELSE', '->', '=>', 'TRY', 'FINALLY', 'THEN'];
  SINGLE_CLOSERS = ['TERMINATOR', 'CATCH', 'FINALLY', 'ELSE', 'OUTDENT', 'LEADING_WHEN'];
  LINEBREAKS = ['TERMINATOR', 'INDENT', 'OUTDENT'];
}).call(this);
    }
  };
});
horseDatastore.pkg(1, function(parent){
  return {
    'id':9,
    'name':'express',
    'main':undefined,
    'mainModuleId':'index',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(9, function(onejsModParent){
  return {
    'id':'lib/router/index',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Express - Router
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var Route = require('./route')
  , Collection = require('./collection')
  , utils = require('../utils')
  , parse = require('url').parse
  , toArray = utils.toArray;
/**
 * Expose `Router` constructor.
 */
exports = module.exports = Router;
/**
 * Expose HTTP methods.
 */
var methods = exports.methods = require('./methods');
/**
 * Initialize a new `Router` with the given `app`.
 * 
 * @param {express.HTTPServer} app
 * @api private
 */
function Router(app) {
  var self = this;
  this.app = app;
  this.routes = {};
  this.params = {};
  this._params = [];
  this.middleware = function(req, res, next){
    self._dispatch(req, res, next);
  };
}
/**
 * Register a param callback `fn` for the given `name`.
 *
 * @param {String|Function} name
 * @param {Function} fn
 * @return {Router} for chaining
 * @api public
 */
Router.prototype.param = function(name, fn){
  // param logic
  if ('function' == typeof name) {
    this._params.push(name);
    return;
  }
  // apply param functions
  var params = this._params
    , len = params.length
    , ret;
  for (var i = 0; i < len; ++i) {
    if (ret = params[i](name, fn)) {
      fn = ret;
    }
  }
  // ensure we end up with a
  // middleware function
  if ('function' != typeof fn) {
    throw new Error('invalid param() call for ' + name + ', got ' + fn);
  }
  (this.params[name] = this.params[name] || []).push(fn);
  return this;
};
/**
 * Return a `Collection` of all routes defined.
 *
 * @return {Collection}
 * @api public
 */
Router.prototype.all = function(){
  return this.find(function(){
    return true;
  });
};
/**
 * Remove the given `route`, returns
 * a bool indicating if the route was present
 * or not.
 *
 * @param {Route} route
 * @return {Boolean}
 * @api public
 */
Router.prototype.remove = function(route){
  var routes = this.routes[route.method]
    , len = routes.length;
  for (var i = 0; i < len; ++i) {
    if (route == routes[i]) {
      routes.splice(i, 1);
      return true;
    }
  }
};
/**
 * Return routes with route paths matching `path`.
 *
 * @param {String} method
 * @param {String} path
 * @return {Collection}
 * @api public
 */
Router.prototype.lookup = function(method, path){
  return this.find(function(route){
    return path == route.path
      && (route.method == method
      || method == 'all');
  });
};
/**
 * Return routes with regexps that match the given `url`.
 *
 * @param {String} method
 * @param {String} url
 * @return {Collection}
 * @api public
 */
Router.prototype.match = function(method, url){
  return this.find(function(route){
    return route.match(url)
      && (route.method == method
      || method == 'all');
  });
};
/**
 * Find routes based on the return value of `fn`
 * which is invoked once per route.
 *
 * @param {Function} fn
 * @return {Collection}
 * @api public
 */
Router.prototype.find = function(fn){
  var len = methods.length
    , ret = new Collection(this)
    , method
    , routes
    , route;
  for (var i = 0; i < len; ++i) {
    method = methods[i];
    routes = this.routes[method];
    if (!routes) continue;
    for (var j = 0, jlen = routes.length; j < jlen; ++j) {
      route = routes[j];
      if (fn(route)) ret.push(route);
    }
  }
  return ret;
};
/**
 * Route dispatcher aka the route "middleware".
 *
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @param {Function} next
 * @api private
 */
Router.prototype._dispatch = function(req, res, next){
  var params = this.params
    , self = this;
  // route dispatch
  (function pass(i, err){
    var paramCallbacks
      , paramIndex = 0
      , paramVal
      , route
      , keys
      , key
      , ret;
    // match next route
    function nextRoute(err) {
      pass(req._route_index + 1, err);
    }
    // match route
    req.route = route = self._match(req, i);
    // implied OPTIONS
    if (!route && 'OPTIONS' == req.method) return self._options(req, res);
    // no route
    if (!route) return next(err);
    // we have a route
    // start at param 0
    req.params = route.params;
    keys = route.keys;
    i = 0;
    // param callbacks
    function param(err) {
      paramIndex = 0;
      key = keys[i++];
      paramVal = key && req.params[key.name];
      paramCallbacks = key && params[key.name];
      try {
        if ('route' == err) {
          nextRoute();
        } else if (err) {
          i = 0;
          callbacks(err);
        } else if (paramCallbacks && undefined !== paramVal) {
          paramCallback();
        } else if (key) {
          param();
        } else {
          i = 0;
          callbacks();
        }
      } catch (err) {
        param(err);
      }
    };
    param(err);
    
    // single param callbacks
    function paramCallback(err) {
      var fn = paramCallbacks[paramIndex++];
      if (err || !fn) return param(err);
      fn(req, res, paramCallback, paramVal, key.name);
    }
    // invoke route callbacks
    function callbacks(err) {
      var fn = route.callbacks[i++];
      try {
        if ('route' == err) {
          nextRoute();
        } else if (err && fn) {
          if (fn.length < 4) return callbacks(err);
          fn(err, req, res, callbacks);
        } else if (fn) {
          fn(req, res, callbacks);
        } else {
          nextRoute(err);
        }
      } catch (err) {
        callbacks(err);
      }
    }
  })(0);
};
/**
 * Respond to __OPTIONS__ method.
 *
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @api private
 */
Router.prototype._options = function(req, res){
  var path = parse(req.url).pathname
    , body = this._optionsFor(path).join(',');
  res.send(body, { Allow: body });
};
/**
 * Return an array of HTTP verbs or "options" for `path`.
 *
 * @param {String} path
 * @return {Array}
 * @api private
 */
Router.prototype._optionsFor = function(path){
  var self = this;
  return methods.filter(function(method){
    var routes = self.routes[method];
    if (!routes || 'options' == method) return;
    for (var i = 0, len = routes.length; i < len; ++i) {
      if (routes[i].match(path)) return true;
    }
  }).map(function(method){
    return method.toUpperCase();
  });
};
/**
 * Attempt to match a route for `req`
 * starting from offset `i`.
 *
 * @param {IncomingMessage} req
 * @param {Number} i
 * @return {Route}
 * @api private
 */
Router.prototype._match = function(req, i){
  var method = req.method.toLowerCase()
    , url = parse(req.url)
    , path = url.pathname
    , routes = this.routes
    , captures
    , route
    , keys;
  // pass HEAD to GET routes
  if ('head' == method) method = 'get';
  // routes for this method
  if (routes = routes[method]) {
    // matching routes
    for (var len = routes.length; i < len; ++i) {
      route = routes[i];
      if (captures = route.match(path)) {
        keys = route.keys;
        route.params = [];
        // params from capture groups
        for (var j = 1, jlen = captures.length; j < jlen; ++j) {
          var key = keys[j-1]
            , val = 'string' == typeof captures[j]
              ? decodeURIComponent(captures[j])
              : captures[j];
          if (key) {
            route.params[key.name] = val;
          } else {
            route.params.push(val);
          }
        }
        // all done
        req._route_index = i;
        return route;
      }
    }
  }
};
/**
 * Route `method`, `path`, and one or more callbacks.
 *
 * @param {String} method
 * @param {String} path
 * @param {Function} callback...
 * @return {Router} for chaining
 * @api private
 */
Router.prototype._route = function(method, path, callbacks){
  var app = this.app
    , callbacks = utils.flatten(toArray(arguments, 2));
  // ensure path was given
  if (!path) throw new Error('app.' + method + '() requires a path');
  // create the route
  var route = new Route(method, path, callbacks, {
      sensitive: app.enabled('case sensitive routes')
    , strict: app.enabled('strict routing')
  });
  // add it
  (this.routes[method] = this.routes[method] || [])
    .push(route);
  return this;
};
    }
  };
});
horseDatastore.module(9, function(onejsModParent){
  return {
    'id':'lib/router/route',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Express - router - Route
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */
/**
 * Expose `Route`.
 */
module.exports = Route;
/**
 * Initialize `Route` with the given HTTP `method`, `path`,
 * and an array of `callbacks` and `options`.
 *
 * Options:
 *
 *   - `sensitive`    enable case-sensitive routes
 *   - `strict`       enable strict matching for trailing slashes
 *
 * @param {String} method
 * @param {String} path
 * @param {Array} callbacks
 * @param {Object} options.
 * @api private
 */
function Route(method, path, callbacks, options) {
  options = options || {};
  this.path = path;
  this.method = method;
  this.callbacks = callbacks;
  this.regexp = normalize(path
    , this.keys = []
    , options.sensitive
    , options.strict);
}
/**
 * Check if this route matches `path` and return captures made.
 *
 * @param {String} path
 * @return {Array}
 * @api private
 */
Route.prototype.match = function(path){
  return this.regexp.exec(path);
};
/**
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String|RegExp} path
 * @param  {Array} keys
 * @param  {Boolean} sensitive
 * @param  {Boolean} strict
 * @return {RegExp}
 * @api private
 */
function normalize(path, keys, sensitive, strict) {
  if (path instanceof RegExp) return path;
  path = path
    .concat(strict ? '' : '/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
      keys.push({ name: key, optional: !! optional });
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
        + (optional || '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.*)');
  return new RegExp('^' + path + '$', sensitive ? '' : 'i');
}
    }
  };
});
horseDatastore.module(9, function(onejsModParent){
  return {
    'id':'lib/router/collection',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Express - router - Collection
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */
/**
 * Expose `Collection`.
 */
module.exports = Collection;
/**
 * Initialize a new route `Collection`
 * with the given `router`.
 * 
 * @param {Router} router
 * @api private
 */
function Collection(router) {
  Array.apply(this, arguments);
  this.router = router;
}
/**
 * Inherit from `Array.prototype`.
 */
Collection.prototype.__proto__ = Array.prototype;
/**
 * Remove the routes in this collection.
 *
 * @return {Collection} of routes removed
 * @api public
 */
Collection.prototype.remove = function(){
  var router = this.router
    , len = this.length
    , ret = new Collection(this.router);
  for (var i = 0; i < len; ++i) {
    if (router.remove(this[i])) {
      ret.push(this[i]);
    }
  }
  return ret;
};
    }
  };
});
horseDatastore.module(9, function(onejsModParent){
  return {
    'id':'lib/router/methods',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Express - router - methods
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */
/**
 * Hypertext Transfer Protocol -- HTTP/1.1 
 * http://www.ietf.org/rfc/rfc2616.txt
 */
var RFC2616 = ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE', 'TRACE', 'CONNECT'];
/**
 * HTTP Extensions for Distributed Authoring -- WEBDAV
 * http://www.ietf.org/rfc/rfc2518.txt
 */
var RFC2518 = ['PROPFIND', 'PROPPATCH', 'MKCOL', 'COPY', 'MOVE', 'LOCK', 'UNLOCK'];
/**
 * Versioning Extensions to WebDAV 
 * http://www.ietf.org/rfc/rfc3253.txt
 */
var RFC3253 = ['VERSION-CONTROL', 'REPORT', 'CHECKOUT', 'CHECKIN', 'UNCHECKOUT', 'MKWORKSPACE', 'UPDATE', 'LABEL', 'MERGE', 'BASELINE-CONTROL', 'MKACTIVITY'];
/**
 * Ordered Collections Protocol (WebDAV) 
 * http://www.ietf.org/rfc/rfc3648.txt
 */
var RFC3648 = ['ORDERPATCH'];
/**
 * Web Distributed Authoring and Versioning (WebDAV) Access Control Protocol 
 * http://www.ietf.org/rfc/rfc3744.txt
 */
var RFC3744 = ['ACL'];
/**
 * Web Distributed Authoring and Versioning (WebDAV) SEARCH
 * http://www.ietf.org/rfc/rfc5323.txt
 */
var RFC5323 = ['SEARCH'];
/**
 * PATCH Method for HTTP 
 * http://www.ietf.org/rfc/rfc5789.txt
 */
var RFC5789 = ['PATCH'];
/**
 * PURGE Method for caching reverse-proxy
 * http://wiki.squid-cache.org/SquidFaq/OperatingSquid#How_can_I_purge_an_object_from_my_cache.3F
 * https://www.varnish-cache.org/docs/trunk/tutorial/purging.html
 */
var CACHE_PURGE = ['PURGE'];
/**
 * Expose the methods.
 */
module.exports = [].concat(
    RFC2616
  , RFC2518
  , RFC3253
  , RFC3648
  , RFC3744
  , RFC5323
  , RFC5789
  , CACHE_PURGE).map(function(method){
    return method.toLowerCase();
  });
    }
  };
});
horseDatastore.module(9, function(onejsModParent){
  return {
    'id':'lib/express',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Express
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var connect = require('connect')
  , HTTPSServer = require('./https')
  , HTTPServer = require('./http')
  , Route = require('./router/route')
/**
 * Re-export connect auto-loaders.
 * 
 * This prevents the need to `require('connect')` in order
 * to access core middleware, so for example `express.logger()` instead
 * of `require('connect').logger()`.
 */
var exports = module.exports = connect.middleware;
/**
 * Framework version.
 */
exports.version = '2.5.9';
/**
 * Shortcut for `new Server(...)`.
 *
 * @param {Function} ...
 * @return {Server}
 * @api public
 */
exports.createServer = function(options){
  if ('object' == typeof options) {
    return new HTTPSServer(options, Array.prototype.slice.call(arguments, 1));
  } else {
    return new HTTPServer(Array.prototype.slice.call(arguments));
  }
};
/**
 * Expose constructors.
 */
exports.HTTPServer = HTTPServer;
exports.HTTPSServer = HTTPSServer;
exports.Route = Route;
/**
 * View extensions.
 */
exports.View =
exports.view = require('./view');
/**
 * Response extensions.
 */
require('./response');
/**
 * Request extensions.
 */
require('./request');
// Error handler title
exports.errorHandler.title = 'Express';
    }
  };
});
horseDatastore.module(9, function(onejsModParent){
  return {
    'id':'lib/utils',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Express - Utils
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */
/**
 * Check if `path` looks absolute.
 *
 * @param {String} path
 * @return {Boolean}
 * @api private
 */
exports.isAbsolute = function(path){
  if ('/' == path[0]) return true;
  if (':' == path[1] && '\\' == path[2]) return true;
};
/**
 * Merge object `b` with `a` giving precedence to
 * values in object `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */
exports.union = function(a, b){
  if (a && b) {
    var keys = Object.keys(b)
      , len = keys.length
      , key;
    for (var i = 0; i < len; ++i) {
      key = keys[i];
      if (!a.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
  }
  return a;
};
/**
 * Flatten the given `arr`.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */
exports.flatten = function(arr, ret){
  var ret = ret || []
    , len = arr.length;
  for (var i = 0; i < len; ++i) {
    if (Array.isArray(arr[i])) {
      exports.flatten(arr[i], ret);
    } else {
      ret.push(arr[i]);
    }
  }
  return ret;
};
/**
 * Parse mini markdown implementation.
 * The following conversions are supported,
 * primarily for the "flash" middleware:
 *
 *    _foo_ or *foo* become <em>foo</em>
 *    __foo__ or **foo** become <strong>foo</strong>
 *    [A](B) becomes <a href="B">A</a>
 *
 * @param {String} str
 * @return {String}
 * @api private
 */
exports.miniMarkdown = function(str){
  return String(str)
    .replace(/(__|\*\*)(.*?)\1/g, '<strong>$2</strong>')
    .replace(/(_|\*)(.*?)\1/g, '<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
};
/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} html
 * @return {String}
 * @api private
 */
exports.escape = function(html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};
/**
 * Parse "Range" header `str` relative to the given file `size`.
 *
 * @param {Number} size
 * @param {String} str
 * @return {Array}
 * @api private
 */
exports.parseRange = function(size, str){
  var valid = true;
  var arr = str.substr(6).split(',').map(function(range){
    var range = range.split('-')
      , start = parseInt(range[0], 10)
      , end = parseInt(range[1], 10);
    // -500
    if (isNaN(start)) {
      start = size - end;
      end = size - 1;
    // 500-
    } else if (isNaN(end)) {
      end = size - 1;
    }
    // Invalid
    if (isNaN(start) || isNaN(end) || start > end) valid = false;
    return { start: start, end: end };
  });
  return valid ? arr : undefined;
};
/**
 * Fast alternative to `Array.prototype.slice.call()`.
 *
 * @param {Arguments} args
 * @param {Number} n
 * @return {Array}
 * @api public
 */
exports.toArray = function(args, i){
  var arr = []
    , len = args.length
    , i = i || 0;
  for (; i < len; ++i) arr.push(args[i]);
  return arr;
};
    }
  };
});
horseDatastore.module(9, function(onejsModParent){
  return {
    'id':'lib/request',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Express - request
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var http = require('http')
  , req = http.IncomingMessage.prototype
  , utils = require('./utils')
  , parse = require('url').parse
  , mime = require('mime');
/**
 * Default flash formatters.
 *
 * @type Object
 */
var flashFormatters = exports.flashFormatters = {
  s: function(val){
    return String(val);
  }
};
/**
 * Return request header or optional default.
 *
 * The `Referrer` header field is special-cased,
 * both `Referrer` and `Referer` will yield are
 * interchangeable.
 *
 * Examples:
 *
 *     req.header('Content-Type');
 *     // => "text/plain"
 *     
 *     req.header('content-type');
 *     // => "text/plain"
 *     
 *     req.header('Accept');
 *     // => undefined
 *     
 *     req.header('Accept', 'text/html');
 *     // => "text/html"
 *
 * @param {String} name
 * @param {String} defaultValue
 * @return {String} 
 * @api public
 */
req.header = function(name, defaultValue){
  switch (name = name.toLowerCase()) {
    case 'referer':
    case 'referrer':
      return this.headers.referrer
        || this.headers.referer
        || defaultValue;
    default:
      return this.headers[name] || defaultValue;
  }
};
/**
 * Get `field`'s `param` value, defaulting to ''.
 *
 * Examples:
 *
 *     req.get('content-disposition', 'filename');
 *     // => "something.png"
 *
 * @param {String} field
 * @param {String} param
 * @return {String}
 * @api public
 */
req.get = function(field, param){
  var val = this.header(field);
  if (!val) return '';
  var regexp = new RegExp(param + ' *= *(?:"([^"]+)"|([^;]+))', 'i');
  if (!regexp.exec(val)) return '';
  return RegExp.$1 || RegExp.$2;
};
/**
 * Short-hand for `require('url').parse(req.url).pathname`.
 *
 * @return {String}
 * @api public
 */
req.__defineGetter__('path', function(){
  return parse(this.url).pathname;
});
/**
 * Check if the _Accept_ header is present, and includes the given `type`.
 *
 * When the _Accept_ header is not present `true` is returned. Otherwise
 * the given `type` is matched by an exact match, and then subtypes. You
 * may pass the subtype such as "html" which is then converted internally
 * to "text/html" using the mime lookup table.
 *
 * Examples:
 * 
 *     // Accept: text/html
 *     req.accepts('html');
 *     // => true
 *
 *     // Accept: text/*; application/json
 *     req.accepts('html');
 *     req.accepts('text/html');
 *     req.accepts('text/plain');
 *     req.accepts('application/json');
 *     // => true
 *
 *     req.accepts('image/png');
 *     req.accepts('png');
 *     // => false
 *
 * @param {String} type
 * @return {Boolean}
 * @api public
 */
req.accepts = function(type){
  var accept = this.header('Accept');
  // normalize extensions ".json" -> "json"
  if (type && '.' == type[0]) type = type.substr(1);
  // when Accept does not exist, or contains '*/*' return true
  if (!accept || ~accept.indexOf('*/*')) {
    return true;
  } else if (type) {
    // allow "html" vs "text/html" etc
    if (!~type.indexOf('/')) type = mime.lookup(type);
    // check if we have a direct match
    if (~accept.indexOf(type)) return true;
    // check if we have type/*
    type = type.split('/')[0] + '/*';
    return !!~accept.indexOf(type);
  } else {
    return false;
  }
};
/**
 * Return the value of param `name` when present or `defaultValue`.
 *
 *  - Checks route placeholders, ex: _/user/:id_
 *  - Checks query string params, ex: ?id=12
 *  - Checks urlencoded body params, ex: id=12
 *
 * To utilize urlencoded request bodies, `req.body`
 * should be an object. This can be done by using
 * the `connect.bodyParser` middleware.
 *
 * @param {String} name
 * @param {Mixed} defaultValue
 * @return {String}
 * @api public
 */
req.param = function(name, defaultValue){
  // route params like /user/:id
  if (this.params && this.params.hasOwnProperty(name) && undefined !== this.params[name]) {
    return this.params[name]; 
  }
  // query string params
  if (undefined !== this.query[name]) {
    return this.query[name]; 
  }
  // request body params via connect.bodyParser
  if (this.body && undefined !== this.body[name]) {
    return this.body[name];
  }
  return defaultValue;
};
/**
 * Queue flash `msg` of the given `type`.
 *
 * Examples:
 *
 *      req.flash('info', 'email sent');
 *      req.flash('error', 'email delivery failed');
 *      req.flash('info', 'email re-sent');
 *      // => 2
 *
 *      req.flash('info');
 *      // => ['email sent', 'email re-sent']
 *
 *      req.flash('info');
 *      // => []
 *
 *      req.flash();
 *      // => { error: ['email delivery failed'], info: [] }
 *
 * Formatting:
 *
 * Flash notifications also support arbitrary formatting support.
 * For example you may pass variable arguments to `req.flash()`
 * and use the %s specifier to be replaced by the associated argument:
 *
 *     req.flash('info', 'email has been sent to %s.', userName);
 *
 * To add custom formatters use the `exports.flashFormatters` object.
 *
 * @param {String} type
 * @param {String} msg
 * @return {Array|Object|Number}
 * @api public
 */
req.flash = function(type, msg){
  if (this.session === undefined) throw Error('req.flash() requires sessions');
  var msgs = this.session.flash = this.session.flash || {};
  if (type && msg) {
    var i = 2
      , args = arguments
      , formatters = this.app.flashFormatters || {};
    formatters.__proto__ = flashFormatters;
    msg = utils.miniMarkdown(msg);
    msg = msg.replace(/%([a-zA-Z])/g, function(_, format){
      var formatter = formatters[format];
      if (formatter) return formatter(utils.escape(args[i++]));
    });
    return (msgs[type] = msgs[type] || []).push(msg);
  } else if (type) {
    var arr = msgs[type];
    delete msgs[type];
    return arr || [];
  } else {
    this.session.flash = {};
    return msgs;
  }
};
/**
 * Check if the incoming request contains the "Content-Type" 
 * header field, and it contains the give mime `type`.
 *
 * Examples:
 *
 *      // With Content-Type: text/html; charset=utf-8
 *      req.is('html');
 *      req.is('text/html');
 *      // => true
 *     
 *      // When Content-Type is application/json
 *      req.is('json');
 *      req.is('application/json');
 *      // => true
 *     
 *      req.is('html');
 *      // => false
 * 
 * Ad-hoc callbacks can also be registered with Express, to perform
 * assertions again the request, for example if we need an expressive
 * way to check if our incoming request is an image, we can register "an image"
 * callback:
 * 
 *       app.is('an image', function(req){
 *         return 0 == req.headers['content-type'].indexOf('image');
 *       });
 *       
 *  Now within our route callbacks, we can use to to assert content types
 *  such as "image/jpeg", "image/png", etc.
 * 
 *      app.post('/image/upload', function(req, res, next){
 *        if (req.is('an image')) {
 *          // do something
 *        } else {
 *          next();
 *        }
 *      });
 * 
 * @param {String} type
 * @return {Boolean}
 * @api public
 */
req.is = function(type){
  var fn = this.app.is(type);
  if (fn) return fn(this);
  var ct = this.headers['content-type'];
  if (!ct) return false;
  ct = ct.split(';')[0];
  if (!~type.indexOf('/')) type = mime.lookup(type);
  if (~type.indexOf('*')) {
    type = type.split('/');
    ct = ct.split('/');
    if ('*' == type[0] && type[1] == ct[1]) return true;
    if ('*' == type[1] && type[0] == ct[0]) return true;
    return false;
  }
  return !! ~ct.indexOf(type);
};
// Callback for isXMLHttpRequest / xhr
function isxhr() {
  return this.header('X-Requested-With', '').toLowerCase() === 'xmlhttprequest';
}
/**
 * Check if the request was an _XMLHttpRequest_.
 *
 * @return {Boolean}
 * @api public
 */
req.__defineGetter__('isXMLHttpRequest', isxhr);
req.__defineGetter__('xhr', isxhr);
    }
  };
});
horseDatastore.module(9, function(onejsModParent){
  return {
    'id':'lib/https',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Express - HTTPSServer
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var connect = require('connect')
  , HTTPServer = require('./http')
  , https = require('https');
/**
 * Expose `HTTPSServer`.
 */
exports = module.exports = HTTPSServer;
/**
 * Server proto.
 */
var app = HTTPSServer.prototype;
/**
 * Initialize a new `HTTPSServer` with the 
 * given `options`, and optional `middleware`.
 *
 * @param {Object} options
 * @param {Array} middleware
 * @api public
 */
function HTTPSServer(options, middleware){
  connect.HTTPSServer.call(this, options, []);
  this.init(middleware);
};
/**
 * Inherit from `connect.HTTPSServer`.
 */
app.__proto__ = connect.HTTPSServer.prototype;
// mixin HTTPServer methods
Object.keys(HTTPServer.prototype).forEach(function(method){
  app[method] = HTTPServer.prototype[method];
});
    }
  };
});
horseDatastore.module(9, function(onejsModParent){
  return {
    'id':'lib/view/partial',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Express - view - Partial
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */
/**
 * Memory cache.
 */
var cache = {};
/**
 * Resolve partial object name from the view path.
 *
 * Examples:
 *
 *   "user.ejs" becomes "user"
 *   "forum thread.ejs" becomes "forumThread"
 *   "forum/thread/post.ejs" becomes "post"
 *   "blog-post.ejs" becomes "blogPost"
 *
 * @return {String}
 * @api private
 */
exports.resolveObjectName = function(view){
  return cache[view] || (cache[view] = view
    .split('/')
    .slice(-1)[0]
    .split('.')[0]
    .replace(/^_/, '')
    .replace(/[^a-zA-Z0-9 ]+/g, ' ')
    .split(/ +/).map(function(word, i){
      return i
        ? word[0].toUpperCase() + word.substr(1)
        : word;
    }).join(''));
};
    }
  };
});
horseDatastore.module(9, function(onejsModParent){
  return {
    'id':'lib/view/view',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Express - View
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var path = require('path')
  , utils = require('../utils')
  , extname = path.extname
  , dirname = path.dirname
  , basename = path.basename
  , fs = require('fs')
  , stat = fs.statSync;
/**
 * Expose `View`.
 */
exports = module.exports = View;
/**
 * Require cache.
 */
var cache = {};
/**
 * Initialize a new `View` with the given `view` path and `options`.
 *
 * @param {String} view
 * @param {Object} options
 * @api private
 */
function View(view, options) {
  options = options || {};
  this.view = view;
  this.root = options.root;
  this.relative = false !== options.relative;
  this.defaultEngine = options.defaultEngine;
  this.parent = options.parentView;
  this.basename = basename(view);
  this.engine = this.resolveEngine();
  this.extension = '.' + this.engine;
  this.name = this.basename.replace(this.extension, '');
  this.path = this.resolvePath();
  this.dirname = dirname(this.path);
  if (options.attempts) {
    if (!~options.attempts.indexOf(this.path))
      options.attempts.push(this.path);
  }
};
/**
 * Check if the view path exists.
 *
 * @return {Boolean}
 * @api public
 */
View.prototype.__defineGetter__('exists', function(){
  try {
    stat(this.path);
    return true;
  } catch (err) {
    return false;
  }
});
/**
 * Resolve view engine.
 *
 * @return {String}
 * @api private
 */
View.prototype.resolveEngine = function(){
  // Explicit
  if (~this.basename.indexOf('.')) return extname(this.basename).substr(1);
  // Inherit from parent
  if (this.parent) return this.parent.engine;
  // Default
  return this.defaultEngine;
};
/**
 * Resolve view path.
 *
 * @return {String}
 * @api private
 */
View.prototype.resolvePath = function(){
  var path = this.view;
  // Implicit engine
  if (!~this.basename.indexOf('.')) path += this.extension;
  // Absolute
  if (utils.isAbsolute(path)) return path;
  // Relative to parent
  if (this.relative && this.parent) return this.parent.dirname + '/' + path;
  // Relative to root
  return this.root
    ? this.root + '/' + path
    : path;
};
/**
 * Get view contents. This is a one-time hit, so we
 * can afford to be sync.
 *
 * @return {String}
 * @api public
 */
View.prototype.__defineGetter__('contents', function(){
  return fs.readFileSync(this.path, 'utf8');
});
/**
 * Get template engine api, cache exports to reduce
 * require() calls.
 *
 * @return {Object}
 * @api public
 */
View.prototype.__defineGetter__('templateEngine', function(){
  var ext = this.extension;
  return cache[ext] || (cache[ext] = require(this.engine));
});
/**
 * Return root path alternative.
 *
 * @return {String}
 * @api public
 */
View.prototype.__defineGetter__('rootPath', function(){
  this.relative = false;
  return this.resolvePath();
});
/**
 * Return index path alternative.
 *
 * @return {String}
 * @api public
 */
View.prototype.__defineGetter__('indexPath', function(){
  return this.dirname
    + '/' + this.basename.replace(this.extension, '')
    + '/index' + this.extension;
});
/**
 * Return ../<name>/index path alternative.
 *
 * @return {String}
 * @api public
 */
View.prototype.__defineGetter__('upIndexPath', function(){
  return this.dirname + '/../' + this.name + '/index' + this.extension;
});
/**
 * Return _ prefix path alternative
 *
 * @return {String}
 * @api public
 */
View.prototype.__defineGetter__('prefixPath', function(){
  return this.dirname + '/_' + this.basename;
});
/**
 * Register the given template engine `exports`
 * as `ext`. For example we may wish to map ".html"
 * files to jade:
 *
 *    app.register('.html', require('jade'));
 *
 * or
 *
 *    app.register('html', require('jade'));
 *
 * This is also useful for libraries that may not
 * match extensions correctly. For example my haml.js
 * library is installed from npm as "hamljs" so instead
 * of layout.hamljs, we can register the engine as ".haml":
 *
 *    app.register('.haml', require('haml-js'));
 *
 * @param {String} ext
 * @param {Object} obj
 * @api public
 */
exports.register = function(ext, exports) {
  if ('.' != ext[0]) ext = '.' + ext;
  cache[ext] = exports;
};
    }
  };
});
horseDatastore.module(9, function(onejsModParent){
  return {
    'id':'lib/http',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Express - HTTPServer
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var qs = require('qs')
  , connect = require('connect')
  , router = require('./router')
  , Router = require('./router')
  , view = require('./view')
  , toArray = require('./utils').toArray
  , methods = router.methods.concat('del', 'all')
  , url = require('url')
  , utils = connect.utils;
/**
 * Expose `HTTPServer`.
 */
exports = module.exports = HTTPServer;
/**
 * Server proto.
 */
var app = HTTPServer.prototype;
/**
 * Initialize a new `HTTPServer` with optional `middleware`.
 *
 * @param {Array} middleware
 * @api public
 */
function HTTPServer(middleware){
  connect.HTTPServer.call(this, []);
  this.init(middleware);
};
/**
 * Inherit from `connect.HTTPServer`.
 */
app.__proto__ = connect.HTTPServer.prototype;
/**
 * Initialize the server.
 *
 * @param {Array} middleware
 * @api private
 */
app.init = function(middleware){
  var self = this;
  this.cache = {};
  this.settings = {};
  this.redirects = {};
  this.isCallbacks = {};
  this._locals = {};
  this.dynamicViewHelpers = {};
  this.errorHandlers = [];
  this.set('env', process.env.NODE_ENV || 'development');
  // expose objects to each other
  this.use(function(req, res, next){
    req.query = req.query || {};
    res.setHeader('X-Powered-By', 'Express');
    req.app = res.app = self;
    req.res = res;
    res.req = req;
    req.next = next;
    // assign req.query
    if (req.url.indexOf('?') > 0) {
      var query = url.parse(req.url).query;
      req.query = qs.parse(query);
    }
    next();
  });
  // apply middleware
  if (middleware) middleware.forEach(self.use.bind(self));
  // router
  this.routes = new Router(this);
  this.__defineGetter__('router', function(){
    this.__usedRouter = true;
    return self.routes.middleware;
  });
  // default locals
  this.locals({
      settings: this.settings
    , app: this
  });
  // default development configuration
  this.configure('development', function(){
    this.enable('hints');
  });
  // default production configuration
  this.configure('production', function(){
    this.enable('view cache');
  });
  // register error handlers on "listening"
  // so that they disregard definition position.
  this.on('listening', this.registerErrorHandlers.bind(this));
  // route manipulation methods
  methods.forEach(function(method){
    self.lookup[method] = function(path){
      return self.routes.lookup(method, path);
    };
    self.match[method] = function(path){
      return self.routes.match(method, path);
    };
    self.remove[method] = function(path){
      return self.routes.lookup(method, path).remove();
    };
  });
  // del -> delete
  self.lookup.del = self.lookup.delete;
  self.match.del = self.match.delete;
  self.remove.del = self.remove.delete;
};
/**
 * Remove routes matching the given `path`.
 *
 * @param {Route} path
 * @return {Boolean}
 * @api public
 */
app.remove = function(path){
  return this.routes.lookup('all', path).remove();
};
/**
 * Lookup routes defined with a path
 * equivalent to `path`.
 *
 * @param {Stirng} path
 * @return {Array}
 * @api public
 */
app.lookup = function(path){
  return this.routes.lookup('all', path);
};
/**
 * Lookup routes matching the given `url`.
 *
 * @param {Stirng} url
 * @return {Array}
 * @api public
 */
app.match = function(url){
  return this.routes.match('all', url);
};
/**
 * When using the vhost() middleware register error handlers.
 */
app.onvhost = function(){
  this.registerErrorHandlers();
};
/**
 * Register error handlers.
 *
 * @return {Server} for chaining
 * @api public
 */
app.registerErrorHandlers = function(){
  this.errorHandlers.forEach(function(fn){
    this.use(function(err, req, res, next){
      fn.apply(this, arguments);
    });
  }, this);
  return this;
};
/**
 * Proxy `connect.HTTPServer#use()` to apply settings to
 * mounted applications.
 *
 * @param {String|Function|Server} route
 * @param {Function|Server} middleware
 * @return {Server} for chaining
 * @api public
 */
app.use = function(route, middleware){
  var app, base, handle;
  if ('string' != typeof route) {
    middleware = route, route = '/';
  }
  // express app
  if (middleware.handle && middleware.set) app = middleware;
  // restore .app property on req and res
  if (app) {
    app.route = route;
    middleware = function(req, res, next) {
      var orig = req.app;
      app.handle(req, res, function(err){
        req.app = res.app = orig;
        next(err);
      });
    };
  }
  connect.HTTPServer.prototype.use.call(this, route, middleware);
  // mounted an app, invoke the hook
  // and adjust some settings
  if (app) {
    base = this.set('basepath') || this.route;
    if ('/' == base) base = '';
    base = base + (app.set('basepath') || app.route);
    app.set('basepath', base);
    app.parent = this;
    if (app.__mounted) app.__mounted.call(app, this);
  }
  return this;
};
/**
 * Assign a callback `fn` which is called
 * when this `Server` is passed to `Server#use()`.
 *
 * Examples:
 *
 *    var app = express.createServer()
 *      , blog = express.createServer();
 *
 *    blog.mounted(function(parent){
 *      // parent is app
 *      // "this" is blog
 *    });
 *
 *    app.use(blog);
 *
 * @param {Function} fn
 * @return {Server} for chaining
 * @api public
 */
app.mounted = function(fn){
  this.__mounted = fn;
  return this;
};
/**
 * See: view.register.
 *
 * @return {Server} for chaining
 * @api public
 */
app.register = function(){
  view.register.apply(this, arguments);
  return this;
};
/**
 * Register the given view helpers `obj`. This method
 * can be called several times to apply additional helpers.
 *
 * @param {Object} obj
 * @return {Server} for chaining
 * @api public
 */
app.helpers =
app.locals = function(obj){
  utils.merge(this._locals, obj);
  return this;
};
/**
 * Register the given dynamic view helpers `obj`. This method
 * can be called several times to apply additional helpers.
 *
 * @param {Object} obj
 * @return {Server} for chaining
 * @api public
 */
app.dynamicHelpers = function(obj){
  utils.merge(this.dynamicViewHelpers, obj);
  return this;
};
/**
 * Map the given param placeholder `name`(s) to the given callback(s).
 *
 * Param mapping is used to provide pre-conditions to routes
 * which us normalized placeholders. This callback has the same
 * signature as regular middleware, for example below when ":userId"
 * is used this function will be invoked in an attempt to load the user.
 *
 *      app.param('userId', function(req, res, next, id){
 *        User.find(id, function(err, user){
 *          if (err) {
 *            next(err);
 *          } else if (user) {
 *            req.user = user;
 *            next();
 *          } else {
 *            next(new Error('failed to load user'));
 *          }
 *        });
 *      });
 *
 * Passing a single function allows you to map logic
 * to the values passed to `app.param()`, for example
 * this is useful to provide coercion support in a concise manner.
 *
 * The following example maps regular expressions to param values
 * ensuring that they match, otherwise passing control to the next
 * route:
 *
 *      app.param(function(name, regexp){
 *        if (regexp instanceof RegExp) {
 *          return function(req, res, next, val){
 *            var captures;
 *            if (captures = regexp.exec(String(val))) {
 *              req.params[name] = captures;
 *              next();
 *            } else {
 *              next('route');
 *            }
 *          }
 *        }
 *      });
 *
 * We can now use it as shown below, where "/commit/:commit" expects
 * that the value for ":commit" is at 5 or more digits. The capture
 * groups are then available as `req.params.commit` as we defined
 * in the function above.
 *
 *    app.param('commit', /^\d{5,}$/);
 *
 * For more of this useful functionality take a look
 * at [express-params](http://github.com/visionmedia/express-params).
 *
 * @param {String|Array|Function} name
 * @param {Function} fn
 * @return {Server} for chaining
 * @api public
 */
app.param = function(name, fn){
  var self = this
    , fns = [].slice.call(arguments, 1);
  // array
  if (Array.isArray(name)) {
    name.forEach(function(name){
      fns.forEach(function(fn){
        self.param(name, fn);
      });
    });
  // param logic
  } else if ('function' == typeof name) {
    this.routes.param(name);
  // single
  } else {
    if (':' == name[0]) name = name.substr(1);
    fns.forEach(function(fn){
      self.routes.param(name, fn);
    });
  }
  return this;
};
/**
 * Assign a custom exception handler callback `fn`.
 * These handlers are always _last_ in the middleware stack.
 *
 * @param {Function} fn
 * @return {Server} for chaining
 * @api public
 */
app.error = function(fn){
  this.errorHandlers.push(fn);
  return this;
};
/**
 * Register the given callback `fn` for the given `type`.
 *
 * @param {String} type
 * @param {Function} fn
 * @return {Server} for chaining
 * @api public
 */
app.is = function(type, fn){
  if (!fn) return this.isCallbacks[type];
  this.isCallbacks[type] = fn;
  return this;
};
/**
 * Assign `setting` to `val`, or return `setting`'s value.
 * Mounted servers inherit their parent server's settings.
 *
 * @param {String} setting
 * @param {String} val
 * @return {Server|Mixed} for chaining, or the setting value
 * @api public
 */
app.set = function(setting, val){
  if (val === undefined) {
    if (this.settings.hasOwnProperty(setting)) {
      return this.settings[setting];
    } else if (this.parent) {
      return this.parent.set(setting);
    }
  } else {
    this.settings[setting] = val;
    return this;
  }
};
/**
 * Check if `setting` is enabled.
 *
 * @param {String} setting
 * @return {Boolean}
 * @api public
 */
app.enabled = function(setting){
  return !!this.set(setting);
};
/**
 * Check if `setting` is disabled.
 *
 * @param {String} setting
 * @return {Boolean}
 * @api public
 */
app.disabled = function(setting){
  return !this.set(setting);
};
/**
 * Enable `setting`.
 *
 * @param {String} setting
 * @return {Server} for chaining
 * @api public
 */
app.enable = function(setting){
  return this.set(setting, true);
};
/**
 * Disable `setting`.
 *
 * @param {String} setting
 * @return {Server} for chaining
 * @api public
 */
app.disable = function(setting){
  return this.set(setting, false);
};
/**
 * Redirect `key` to `url`.
 *
 * @param {String} key
 * @param {String} url
 * @return {Server} for chaining
 * @api public
 */
app.redirect = function(key, url){
  this.redirects[key] = url;
  return this;
};
/**
 * Configure callback for zero or more envs,
 * when no env is specified that callback will
 * be invoked for all environments. Any combination
 * can be used multiple times, in any order desired.
 *
 * Examples:
 *
 *    app.configure(function(){
 *      // executed for all envs
 *    });
 *
 *    app.configure('stage', function(){
 *      // executed staging env
 *    });
 *
 *    app.configure('stage', 'production', function(){
 *      // executed for stage and production
 *    });
 *
 * @param {String} env...
 * @param {Function} fn
 * @return {Server} for chaining
 * @api public
 */
app.configure = function(env, fn){
  var envs = 'all'
    , args = toArray(arguments);
  fn = args.pop();
  if (args.length) envs = args;
  if ('all' == envs || ~envs.indexOf(this.settings.env)) fn.call(this);
  return this;
};
/**
 * Delegate `.VERB(...)` calls to `.route(VERB, ...)`.
 */
methods.forEach(function(method){
  app[method] = function(path){
    if (1 == arguments.length) return this.routes.lookup(method, path);
    var args = [method].concat(toArray(arguments));
    if (!this.__usedRouter) this.use(this.router);
    return this.routes._route.apply(this.routes, args);
  }
});
/**
 * Special-cased "all" method, applying the given route `path`,
 * middleware, and callback to _every_ HTTP method.
 *
 * @param {String} path
 * @param {Function} ...
 * @return {Server} for chaining
 * @api public
 */
app.all = function(path){
  var args = arguments;
  if (1 == args.length) return this.routes.lookup('all', path);
  methods.forEach(function(method){
    if ('all' == method || 'del' == method) return;
    app[method].apply(this, args);
  }, this);
  return this;
};
// del -> delete alias
app.del = app.delete;
    }
  };
});
horseDatastore.module(9, function(onejsModParent){
  return {
    'id':'lib/view',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Express - view
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var path = require('path')
  , extname = path.extname
  , dirname = path.dirname
  , basename = path.basename
  , utils = require('connect').utils
  , View = require('./view/view')
  , partial = require('./view/partial')
  , union = require('./utils').union
  , merge = utils.merge
  , http = require('http')
  , res = http.ServerResponse.prototype;
/**
 * Expose constructors.
 */
exports = module.exports = View;
/**
 * Export template engine registrar.
 */
exports.register = View.register;
/**
 * Lookup and compile `view` with cache support by supplying
 * both the `cache` object and `cid` string,
 * followed by `options` passed to `exports.lookup()`.
 *
 * @param {String} view
 * @param {Object} cache
 * @param {Object} cid
 * @param {Object} options
 * @return {View}
 * @api private
 */
exports.compile = function(view, cache, cid, options){
  if (cache && cid && cache[cid]){
    options.filename = cache[cid].path;
    return cache[cid];
  }
  // lookup
  view = exports.lookup(view, options);
  // hints
  if (!view.exists) {
    if (options.hint) hintAtViewPaths(view.original, options);
    var err = new Error('failed to locate view "' + view.original.view + '"');
    err.view = view.original;
    throw err;
  }
  // compile
  options.filename = view.path;
  view.fn = view.templateEngine.compile(view.contents, options);
  cache[cid] = view;
  return view;
};
/**
 * Lookup `view`, returning an instanceof `View`.
 *
 * Options:
 *
 *   - `root` root directory path
 *   - `defaultEngine` default template engine
 *   - `parentView` parent `View` object
 *   - `cache` cache object
 *   - `cacheid` optional cache id
 *
 * Lookup:
 *
 *   - partial `_<name>`
 *   - any `<name>/index`
 *   - non-layout `../<name>/index`
 *   - any `<root>/<name>`
 *   - partial `<root>/_<name>`
 *
 * @param {String} view
 * @param {Object} options
 * @return {View}
 * @api private
 */
exports.lookup = function(view, options){
  var orig = view = new View(view, options)
    , partial = options.isPartial
    , layout = options.isLayout;
  // Try _ prefix ex: ./views/_<name>.jade
  // taking precedence over the direct path
  if (partial) {
    view = new View(orig.prefixPath, options);
    if (!view.exists) view = orig;
  }
  // Try index ex: ./views/user/index.jade
  if (!layout && !view.exists) view = new View(orig.indexPath, options);
  // Try ../<name>/index ex: ../user/index.jade
  // when calling partial('user') within the same dir
  if (!layout && !view.exists) view = new View(orig.upIndexPath, options);
  // Try root ex: <root>/user.jade
  if (!view.exists) view = new View(orig.rootPath, options);
  // Try root _ prefix ex: <root>/_user.jade
  if (!view.exists && partial) view = new View(view.prefixPath, options);
  view.original = orig;
  return view;
};
/**
 * Partial render helper.
 *
 * @api private
 */
function renderPartial(res, view, options, parentLocals, parent){
  var collection, object, locals;
  if (options) {
    // collection
    if (options.collection) {
      collection = options.collection;
      delete options.collection;
    } else if ('length' in options) {
      collection = options;
      options = {};
    }
    // locals
    if (options.locals) {
      locals = options.locals;
      delete options.locals;
    }
    // object
    if ('Object' != options.constructor.name) {
      object = options;
      options = {};
    } else if (undefined != options.object) {
      object = options.object;
      delete options.object;
    }
  } else {
    options = {};
  }
  // Inherit locals from parent
  union(options, parentLocals);
  // Merge locals
  if (locals) merge(options, locals);
  // Partials dont need layouts
  options.isPartial = true;
  options.layout = false;
  // Deduce name from view path
  var name = options.as || partial.resolveObjectName(view);
  // Render partial
  function render(){
    if (object) {
      if ('string' == typeof name) {
        options[name] = object;
      } else if (name === global) {
        merge(options, object);
      }
    }
    return res.render(view, options, null, parent, true);
  }
  // Collection support
  if (collection) {
    var len = collection.length
      , buf = ''
      , keys
      , key
      , val;
    options.collectionLength = len;
    if ('number' == typeof len || Array.isArray(collection)) {
      for (var i = 0; i < len; ++i) {
        val = collection[i];
        options.firstInCollection = i == 0;
        options.indexInCollection = i;
        options.lastInCollection = i == len - 1;
        object = val;
        buf += render();
      }
    } else {
      keys = Object.keys(collection);
      len = keys.length;
      options.collectionLength = len;
      options.collectionKeys = keys;
      for (var i = 0; i < len; ++i) {
        key = keys[i];
        val = collection[key];
        options.keyInCollection = key;
        options.firstInCollection = i == 0;
        options.indexInCollection = i;
        options.lastInCollection = i == len - 1;
        object = val;
        buf += render();
      }
    }
    return buf;
  } else {
    return render();
  }
};
/**
 * Render `view` partial with the given `options`. Optionally a
 * callback `fn(err, str)` may be passed instead of writing to
 * the socket.
 *
 * Options:
 *
 *   - `object` Single object with name derived from the view (unless `as` is present)
 *
 *   - `as` Variable name for each `collection` value, defaults to the view name.
 *     * as: 'something' will add the `something` local variable
 *     * as: this will use the collection value as the template context
 *     * as: global will merge the collection value's properties with `locals`
 *
 *   - `collection` Array of objects, the name is derived from the view name itself.
 *     For example _video.html_ will have a object _video_ available to it.
 *
 * @param  {String} view
 * @param  {Object|Array|Function} options, collection, callback, or object
 * @param  {Function} fn
 * @return {String}
 * @api public
 */
res.partial = function(view, options, fn){
  var app = this.app
    , options = options || {}
    , viewEngine = app.set('view engine')
    , parent = {};
  // accept callback as second argument
  if ('function' == typeof options) {
    fn = options;
    options = {};
  }
  // root "views" option
  parent.dirname = app.set('views') || process.cwd() + '/views';
  // utilize "view engine" option
  if (viewEngine) parent.engine = viewEngine;
  // render the partial
  try {
    var str = renderPartial(this, view, options, null, parent);
  } catch (err) {
    if (fn) {
      fn(err);
    } else {
      this.req.next(err);
    }
    return;
  }
  // callback or transfer
  if (fn) {
    fn(null, str);
  } else {
    this.send(str);
  }
};
/**
 * Render `view` with the given `options` and optional callback `fn`.
 * When a callback function is given a response will _not_ be made
 * automatically, however otherwise a response of _200_ and _text/html_ is given.
 *
 * Options:
 *
 *  - `scope`     Template evaluation context (the value of `this`)
 *  - `debug`     Output debugging information
 *  - `status`    Response status code
 *
 * @param  {String} view
 * @param  {Object|Function} options or callback function
 * @param  {Function} fn
 * @api public
 */
res.render = function(view, opts, fn, parent, sub){
  // support callback function as second arg
  if ('function' == typeof opts) {
    fn = opts, opts = null;
  }
  try {
    return this._render(view, opts, fn, parent, sub);
  } catch (err) {
    // callback given
    if (fn) {
      fn(err);
    // unwind to root call to prevent multiple callbacks
    } else if (sub) {
      throw err;
    // root template, next(err)
    } else {
      this.req.next(err);
    }
  }
};
// private render()
res._render = function(view, opts, fn, parent, sub){
  var options = {}
    , self = this
    , app = this.app
    , helpers = app._locals
    , dynamicHelpers = app.dynamicViewHelpers
    , viewOptions = app.set('view options')
    , root = app.set('views') || process.cwd() + '/views';
  // cache id
  var cid = app.enabled('view cache')
    ? view + (parent ? ':' + parent.path : '')
    : false;
  // merge "view options"
  if (viewOptions) merge(options, viewOptions);
  // merge res._locals
  if (this._locals) merge(options, this._locals);
  // merge render() options
  if (opts) merge(options, opts);
  // merge render() .locals
  if (opts && opts.locals) merge(options, opts.locals);
  // status support
  if (options.status) this.statusCode = options.status;
  // capture attempts
  options.attempts = [];
  var partial = options.isPartial
    , layout = options.layout;
  // Layout support
  if (true === layout || undefined === layout) {
    layout = 'layout';
  }
  // Default execution scope to a plain object
  options.scope = options.scope || {};
  // Populate view
  options.parentView = parent;
  // "views" setting
  options.root = root;
  // "view engine" setting
  options.defaultEngine = app.set('view engine');
  // charset option
  if (options.charset) this.charset = options.charset;
  // Dynamic helper support
  if (false !== options.dynamicHelpers) {
    // cache
    if (!this.__dynamicHelpers) {
      this.__dynamicHelpers = {};
      for (var key in dynamicHelpers) {
        this.__dynamicHelpers[key] = dynamicHelpers[key].call(
            this.app
          , this.req
          , this);
      }
    }
    // apply
    merge(options, this.__dynamicHelpers);
  }
  // Merge view helpers
  union(options, helpers);
  // Always expose partial() as a local
  options.partial = function(path, opts){
    return renderPartial(self, path, opts, options, view);
  };
  // View lookup
  options.hint = app.enabled('hints');
  view = exports.compile(view, app.cache, cid, options);
  // layout helper
  options.layout = function(path){
    layout = path;
  };
  // render
  var str = view.fn.call(options.scope, options);
  // layout expected
  if (layout) {
    options.isLayout = true;
    options.layout = false;
    options.body = str;
    this.render(layout, options, fn, view, true);
  // partial return
  } else if (partial) {
    return str;
  // render complete, and
  // callback given
  } else if (fn) {
    fn(null, str);
  // respond
  } else {
    this.send(str);
  }
}
/**
 * Hint at view path resolution, outputting the
 * paths that Express has tried.
 *
 * @api private
 */
function hintAtViewPaths(view, options) {
  console.error();
  console.error('failed to locate view "' + view.view + '", tried:');
  options.attempts.forEach(function(path){
    console.error('  - %s', path);
  });
  console.error();
}
    }
  };
});
horseDatastore.module(9, function(onejsModParent){
  return {
    'id':'lib/response',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Express - response
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var fs = require('fs')
  , http = require('http')
  , path = require('path')
  , connect = require('connect')
  , utils = connect.utils
  , parseRange = require('./utils').parseRange
  , res = http.ServerResponse.prototype
  , send = connect.static.send
  , mime = require('mime')
  , basename = path.basename
  , join = path.join;
/**
 * Send a response with the given `body` and optional `headers` and `status` code.
 *
 * Examples:
 *
 *     res.send();
 *     res.send(new Buffer('wahoo'));
 *     res.send({ some: 'json' });
 *     res.send('<p>some html</p>');
 *     res.send('Sorry, cant find that', 404);
 *     res.send('text', { 'Content-Type': 'text/plain' }, 201);
 *     res.send(404);
 *
 * @param {String|Object|Number|Buffer} body or status
 * @param {Object|Number} headers or status
 * @param {Number} status
 * @return {ServerResponse}
 * @api public
 */
res.send = function(body, headers, status){
  // allow status as second arg
  if ('number' == typeof headers) {
    status = headers,
    headers = null;
  }
  // default status
  status = status || this.statusCode;
  // allow 0 args as 204
  if (!arguments.length || undefined === body) status = 204;
  // determine content type
  switch (typeof body) {
    case 'number':
      if (!this.header('Content-Type')) {
        this.contentType('.txt');
      }
      body = http.STATUS_CODES[status = body];
      break;
    case 'string':
      if (!this.header('Content-Type')) {
        this.charset = this.charset || 'utf-8';
        this.contentType('.html');
      }
      break;
    case 'boolean':
    case 'object':
      if (Buffer.isBuffer(body)) {
        if (!this.header('Content-Type')) {
          this.contentType('.bin');
        }
      } else {
        return this.json(body, headers, status);
      }
      break;
  }
  // populate Content-Length
  if (undefined !== body && !this.header('Content-Length')) {
    this.header('Content-Length', Buffer.isBuffer(body)
      ? body.length
      : Buffer.byteLength(body));
  }
  // merge headers passed
  if (headers) {
    var fields = Object.keys(headers);
    for (var i = 0, len = fields.length; i < len; ++i) {
      var field = fields[i];
      this.header(field, headers[field]);
    }
  }
  // strip irrelevant headers
  if (204 == status || 304 == status) {
    this.removeHeader('Content-Type');
    this.removeHeader('Content-Length');
    body = '';
  }
  // respond
  this.statusCode = status;
  this.end('HEAD' == this.req.method ? null : body);
  return this;
};
/**
 * Send JSON response with `obj`, optional `headers`, and optional `status`.
 *
 * Examples:
 *
 *     res.json(null);
 *     res.json({ user: 'tj' });
 *     res.json('oh noes!', 500);
 *     res.json('I dont have that', 404);
 *
 * @param {Mixed} obj
 * @param {Object|Number} headers or status
 * @param {Number} status
 * @return {ServerResponse}
 * @api public
 */
res.json = function(obj, headers, status){
  var body = JSON.stringify(obj)
    , callback = this.req.query.callback
    , jsonp = this.app.enabled('jsonp callback');
  this.charset = this.charset || 'utf-8';
  this.header('Content-Type', 'application/json');
  if (callback && jsonp) {
    this.header('Content-Type', 'text/javascript');
    body = callback.replace(/[^\w$.]/g, '') + '(' + body + ');';
  }
  return this.send(body, headers, status);
};
/**
 * Set status `code`.
 *
 * @param {Number} code
 * @return {ServerResponse}
 * @api public
 */
res.status = function(code){
  this.statusCode = code;
  return this;
};
/**
 * Transfer the file at the given `path`. Automatically sets 
 * the _Content-Type_ response header field. `next()` is called
 * when `path` is a directory, or when an error occurs.
 *
 * Options:
 *
 *   - `maxAge` defaulting to 0
 *   - `root`   root directory for relative filenames
 *
 * @param {String} path
 * @param {Object|Function} options or fn
 * @param {Function} fn
 * @api public
 */
res.sendfile = function(path, options, fn){
  var next = this.req.next;
  options = options || {};
  // support function as second arg
  if ('function' == typeof options) {
    fn = options;
    options = {};
  }
  options.path = encodeURIComponent(path);
  options.callback = fn;
  send(this.req, this, next, options);
};
/**
 * Set _Content-Type_ response header passed through `mime.lookup()`.
 *
 * Examples:
 *
 *     var filename = 'path/to/image.png';
 *     res.contentType(filename);
 *     // res.headers['Content-Type'] is now "image/png"
 *
 *     res.contentType('.html');
 *     res.contentType('html');
 *     res.contentType('json');
 *     res.contentType('png');
 *
 * @param {String} type
 * @return {String} the resolved mime type
 * @api public
 */
res.contentType = function(type){
  return this.header('Content-Type', mime.lookup(type));
};
/**
 * Set _Content-Disposition_ header to _attachment_ with optional `filename`.
 *
 * @param {String} filename
 * @return {ServerResponse}
 * @api public
 */
res.attachment = function(filename){
  if (filename) this.contentType(filename);
  this.header('Content-Disposition', filename
    ? 'attachment; filename="' + basename(filename) + '"'
    : 'attachment');
  return this;
};
/**
 * Transfer the file at the given `path`, with optional 
 * `filename` as an attachment and optional callback `fn(err)`,
 * and optional `fn2(err)` which is invoked when an error has
 * occurred after header has been sent.
 *
 * @param {String} path
 * @param {String|Function} filename or fn
 * @param {Function} fn
 * @param {Function} fn2
 * @api public
 */
res.download = function(path, filename, fn, fn2){
  var self = this;
  // support callback as second arg
  if ('function' == typeof filename) {
    fn2 = fn;
    fn = filename;
    filename = null;
  }
  // transfer the file
  this.attachment(filename || path).sendfile(path, function(err){
    var sentHeader = self._header;
    if (err) {
      if (!sentHeader) self.removeHeader('Content-Disposition');
      if (sentHeader) {
        fn2 && fn2(err);
      } else if (fn) {
        fn(err);
      } else {
        self.req.next(err);
      }
    } else if (fn) {
      fn();
    }
  });
};
/**
 * Set or get response header `name` with optional `val`.
 *
 * @param {String} name
 * @param {String} val
 * @return {ServerResponse} for chaining
 * @api public
 */
res.header = function(name, val){
  if (1 == arguments.length) return this.getHeader(name);
  this.setHeader(name, val);
  return this;
};
/**
 * Clear cookie `name`.
 *
 * @param {String} name
 * @param {Object} options
 * @api public
 */
res.clearCookie = function(name, options){
  var opts = { expires: new Date(1) };
  this.cookie(name, '', options
    ? utils.merge(options, opts)
    : opts);
};
/**
 * Set cookie `name` to `val`, with the given `options`.
 *
 * Options:
 *
 *    - `maxAge`   max-age in milliseconds, converted to `expires`
 *    - `path`     defaults to the "basepath" setting which is typically "/"
 *
 * Examples:
 *
 *    // "Remember Me" for 15 minutes
 *    res.cookie('rememberme', '1', { expires: new Date(Date.now() + 900000), httpOnly: true });
 *
 *    // save as above
 *    res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true })
 *
 * @param {String} name
 * @param {String} val
 * @param {Options} options
 * @api public
 */
res.cookie = function(name, val, options){
  options = options || {};
  if ('maxAge' in options) options.expires = new Date(Date.now() + options.maxAge);
  if (undefined === options.path) options.path = this.app.set('basepath');
  var cookie = utils.serializeCookie(name, val, options);
  this.header('Set-Cookie', cookie);
};
/**
 * Redirect to the given `url` with optional response `status`
 * defauling to 302.
 *
 * The given `url` can also be the name of a mapped url, for
 * example by default express supports "back" which redirects
 * to the _Referrer_ or _Referer_ headers or the application's
 * "basepath" setting. Express also supports "basepath" out of the box,
 * which can be set via `app.set('basepath', '/blog');`, and defaults
 * to '/'.
 *
 * Redirect Mapping:
 * 
 *  To extend the redirect mapping capabilities that Express provides,
 *  we may use the `app.redirect()` method:
 * 
 *     app.redirect('google', 'http://google.com');
 * 
 *  Now in a route we may call:
 *
 *     res.redirect('google');
 *
 *  We may also map dynamic redirects:
 *
 *      app.redirect('comments', function(req, res){
 *          return '/post/' + req.params.id + '/comments';
 *      });
 *
 *  So now we may do the following, and the redirect will dynamically adjust to
 *  the context of the request. If we called this route with _GET /post/12_ our
 *  redirect _Location_ would be _/post/12/comments_.
 *
 *      app.get('/post/:id', function(req, res){
 *        res.redirect('comments');
 *      });
 *
 *  Unless an absolute `url` is given, the app's mount-point
 *  will be respected. For example if we redirect to `/posts`,
 *  and our app is mounted at `/blog` we will redirect to `/blog/posts`.
 *
 * @param {String} url
 * @param {Number} code
 * @api public
 */
res.redirect = function(url, status){
  var app = this.app
    , req = this.req
    , base = app.set('basepath') || app.route
    , status = status || 302
    , head = 'HEAD' == req.method
    , body;
  // Setup redirect map
  var map = {
      back: req.header('Referrer', base)
    , home: base
  };
  // Support custom redirect map
  map.__proto__ = app.redirects;
  // Attempt mapped redirect
  var mapped = 'function' == typeof map[url]
    ? map[url](req, this)
    : map[url];
  // Perform redirect
  url = mapped || url;
  // Relative
  if (!~url.indexOf('://')) {
    // Respect mount-point
    if ('/' != base && 0 != url.indexOf(base)) url = base + url;
    // Absolute
    var host = req.headers.host
      , tls = req.connection.encrypted;
    url = 'http' + (tls ? 's' : '') + '://' + host + url;
  }
  // Support text/{plain,html} by default
  if (req.accepts('html')) {
    body = '<p>' + http.STATUS_CODES[status] + '. Redirecting to <a href="' + url + '">' + url + '</a></p>';
    this.header('Content-Type', 'text/html');
  } else {
    body = http.STATUS_CODES[status] + '. Redirecting to ' + url;
    this.header('Content-Type', 'text/plain');
  }
  // Respond
  this.statusCode = status;
  this.header('Location', url);
  this.end(head ? null : body);
};
/**
 * Assign the view local variable `name` to `val` or return the
 * local previously assigned to `name`.
 *
 * @param {String} name
 * @param {Mixed} val
 * @return {Mixed} val
 * @api public
 */
res.local = function(name, val){
  this._locals = this._locals || {};
  return undefined === val
    ? this._locals[name]
    : this._locals[name] = val;
};
/**
 * Assign several locals with the given `obj`,
 * or return the locals.
 *
 * @param {Object} obj
 * @return {Object|Undefined}
 * @api public
 */
res.locals =
res.helpers = function(obj){
  if (obj) {
    for (var key in obj) {
      this.local(key, obj[key]);
    }
  } else {
    return this._locals;
  }
};
    }
  };
});
horseDatastore.module(9, function(onejsModParent){
  return {
    'id':'index',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
module.exports = require('./lib/express');
    }
  };
});
horseDatastore.pkg(9, function(parent){
  return {
    'id':10,
    'name':'mkdirp',
    'main':undefined,
    'mainModuleId':'index',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(10, function(onejsModParent){
  return {
    'id':'index',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var path = require('path');
var fs = require('fs');
module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;
function mkdirP (p, mode, f) {
    if (typeof mode === 'function' || mode === undefined) {
        f = mode;
        mode = 0777 & (~process.umask());
    }
    
    var cb = f || function () {};
    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);
    fs.mkdir(p, mode, function (er) {
        if (!er) return cb();
        switch (er.code) {
            case 'ENOENT':
                mkdirP(path.dirname(p), mode, function (er) {
                    if (er) cb(er);
                    else mkdirP(p, mode, cb);
                });
                break;
            case 'EEXIST':
                fs.stat(p, function (er2, stat) {
                    // if the stat fails, then that's super weird.
                    // let the original EEXIST be the failure reason.
                    if (er2 || !stat.isDirectory()) cb(er)
                    else cb();
                });
                break;
            default:
                cb(er);
                break;
        }
    });
}
mkdirP.sync = function sync (p, mode) {
    if (mode === undefined) {
        mode = 0777 & (~process.umask());
    }
    
    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);
    
    try {
        fs.mkdirSync(p, mode)
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                var err1 = sync(path.dirname(p), mode)
                if (err1) throw err1;
                else return sync(p, mode);
                break;
            
            case 'EEXIST' :
                var stat;
                try {
                    stat = fs.statSync(p);
                }
                catch (err1) {
                    throw err0
                }
                if (!stat.isDirectory()) throw err0;
                else return null;
                break;
            default :
                throw err0
                break;
        }
    }
    
    return null;
};
    }
  };
});
horseDatastore.pkg(1, function(parent){
  return {
    'id':11,
    'name':'redis2json',
    'main':undefined,
    'mainModuleId':'index',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(11, function(onejsModParent){
  return {
    'id':'lib/redis2json',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*
	Redis2JSON library
	http://github.com/igo/redis2json
	Copyright (c) 2010 by Igor Urmincek
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/
var async = require('async');
exports.version = '0.0.5';
exports.client = null;
exports.debugMode = false;
var __hasOwn = Object.prototype.hasOwnProperty;
var clone = function(obj) {
  var newObj = (obj instanceof Array) ? [] : {};
  for (i in obj) {
    if (i == 'clone') continue;
    if (obj[i] && typeof obj[i] == "object") {
      newObj[i] = clone(obj[i]);
    } else newObj[i] = obj[i]
  } return newObj;
};
var fillVariables = function (text, variables) {
	var newText = text;
	for (var prop in variables) {
		if (__hasOwn.call(variables, prop)) {
			newText = newText.replace("{" + prop + "}", variables[prop]);
		}
	}
	return newText;
}
var loadValue = function (key, redisKey, variables) {
	return function (callback) {
		var expandedRedisKey = fillVariables(redisKey, variables);
		if (redisKey.substring(0, 1) == ":") { // static string
			var o, v = expandedRedisKey.substring(1);
			// ordinal?
			if (key == null) {
				o = v;
			// hash key?
			} else {
				o = {};
				o[key] = v;
			}
			callback(null, o)
		} else { // redis key
			exports.client.get(expandedRedisKey, function (error, value) {
				if (key) {
					var o = {};
					o[key] = value;
					callback(error, o);
				} else {
					callback(error, value)
				}
			});
		}
	}
}
var loadArray = function (key, map, variables, arrayCommand) {
	return function (callback) {
		if (exports.debugMode)
			console.log("LOAD ARRAY " + key + " ; cmd: " + JSON.stringify(arrayCommand));
		var expandedRedisKey = fillVariables(arrayCommand.key, variables);
		var args = arrayCommand.args || [];
		args.unshift(expandedRedisKey);
		args.push(function (error, array) {
			if (array) { // array is not empty
				if (exports.debugMode)
					console.log("REDIS ARRAY LOADED " + JSON.stringify(array));
				var actions = [];
				for (var i=0; i < array.length; i++) {
					var newVars = clone(variables);
					newVars[arrayCommand.variable] = array[i];
					if (exports.debugMode)
						console.log("LOAD ARRAY vars: " + array[i] + " ; " + JSON.stringify(newVars));
					// collect actions that will be loaded
					for (var prop in map) {
						if (__hasOwn.call(map, prop) && prop.substring(0, 1) != "$") {
							if (typeof map[prop] === "string") {
								actions.push(loadValue(null, map[prop], newVars));
							} else if (typeof map[prop] === "object") {
								if (Array.isArray(map[prop])) {
									actions.push(loadArray(null, map[prop], newVars, clone(map["$$" + prop])));
								} else {
									actions.push(loadObject(null, map[prop], newVars));
								}
							}
						}
					}
				}
				async.parallel(actions, function (error, results) {
					if (key) {
						var o = {};
						o[key] = results;
						callback(error, o);
					} else {
						callback(error, o)
					}
				});
			} else { // array is empty
				if (key) {
					var o = {};
					o[key] = [];
					callback(null, o);
				} else {
					callback(error, [])
				}
			}
		});
		exports.client[arrayCommand.cmd].apply(exports.client, args);
	}
}
var loadObject = function (key, map, variables) {
	return function (callback) {
		if (exports.debugMode)
			console.log("LOAD OBJECT " + key + " with variables " + JSON.stringify(variables));
		var loadVarsActions = [];
		// collect actions that load new variables
		for (var prop in map) {
			if (__hasOwn.call(map, prop) && prop.substring(0, 1) == "$" && prop.substring(1, 2) != "$") {
				if (typeof map[prop] === "string") {
					loadVarsActions.push(loadValue(prop.substring(1), map[prop], variables));
				}
			}
		}
		// load variables
		async.parallel(loadVarsActions, function (error, results) {
			for (var i=0; i < results.length; i++) {
				for (var prop in results[i]) {
					variables[prop] = results[i][prop];
				}
			};
			// collect actions that will be loaded
			var loadActions = [];
			for (var prop in map) {
				if (__hasOwn.call(map, prop) && prop.substring(0, 1) != "$") {
					if (typeof map[prop] === "string") {
						loadActions.push(loadValue(prop, map[prop], variables));
					} else if (typeof map[prop] === "object") {
						if (Array.isArray(map[prop])) {
							loadActions.push(loadArray(prop, map[prop], clone(variables), clone(map["$$" + prop])));
						} else {
							loadActions.push(loadObject(prop, map[prop], clone(variables)));
						}
					}
				}
			}
			// load values, objects, arrays
			async.parallel(loadActions, function (error, results) {
				var o = {};
				for (var i=0; i < results.length; i++) {
					for (var prop in results[i]) {
						o[prop] = results[i][prop];
					}
				};
				if (key) {
					var o2 = {};
					o2[key] = o;
					callback(error, o2);
				} else {
					callback(error, o)
				}
			});
		});
	}
}
exports.load = function (map, variables, callback) {
	loadObject("object", map, variables)(function (error, result) {
		callback(error, result.object)
	});
}
    }
  };
});
horseDatastore.module(11, function(onejsModParent){
  return {
    'id':'index',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      module.exports = require('./lib/redis2json.js');
    }
  };
});
horseDatastore.pkg(11, function(parent){
  return {
    'id':12,
    'name':'async',
    'main':undefined,
    'mainModuleId':'index',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(12, function(onejsModParent){
  return {
    'id':'lib/async',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*global setTimeout: false, console: false */
(function () {
    var async = {};
    // global on the server, window in the browser
    var root = this,
        previous_async = root.async;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    else {
        root.async = async;
    }
    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };
    //// cross-browser compatiblity functions ////
    var _forEach = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };
    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _forEach(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };
    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _forEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };
    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };
    //// exported async module functions ////
    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        async.nextTick = function (fn) {
            setTimeout(fn, 0);
        };
    }
    else {
        async.nextTick = process.nextTick;
    }
    async.forEach = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _forEach(arr, function (x) {
            iterator(x, function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed === arr.length) {
                        callback();
                    }
                }
            });
        });
    };
    async.forEachSeries = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed === arr.length) {
                        callback();
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };
    
    async.forEachLimit = function (arr, limit, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length || limit <= 0) {
            return callback(); 
        }
        var completed = 0;
        var started = 0;
        var running = 0;
        
        (function replenish () {
          if (completed === arr.length) {
              return callback();
          }
          
          while (running < limit && started < arr.length) {
            iterator(arr[started], function (err) {
              if (err) {
                  callback(err);
                  callback = function () {};
              }
              else {
                  completed += 1;
                  running -= 1;
                  if (completed === arr.length) {
                      callback();
                  }
                  else {
                      replenish();
                  }
              }
            });
            started += 1;
            running += 1;
          }
        })();
    };
    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.forEach].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.forEachSeries].concat(args));
        };
    };
    var _asyncMap = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (err, v) {
                results[x.index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.forEachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;
    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;
    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);
    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = function () {};
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);
    async.some = function (arr, iterator, main_callback) {
        async.forEach(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;
    async.every = function (arr, iterator, main_callback) {
        async.forEach(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;
    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };
    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        if (!keys.length) {
            return callback(null);
        }
        var results = {};
        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            _forEach(listeners.slice(0), function (fn) {
                fn();
            });
        };
        addListener(function () {
            if (_keys(results).length === keys.length) {
                callback(null, results);
                callback = function () {};
            }
        });
        _forEach(keys, function (k) {
            var task = (tasks[k] instanceof Function) ? [tasks[k]]: tasks[k];
            var taskCallback = function (err) {
                if (err) {
                    callback(err);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    taskComplete();
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true);
            };
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback, results);
                    }
                };
                addListener(listener);
            }
        });
    };
    async.waterfall = function (tasks, callback) {
        callback = callback || function () {};
        if (!tasks.length) {
            return callback();
        }
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.nextTick(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };
    async.parallel = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            async.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.forEach(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };
    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.forEachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };
    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };
    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };
    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);
    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };
    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };
    async.queue = function (worker, concurrency) {
        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: null,
            empty: null,
            drain: null,
            push: function (data, callback) {
                if(data.constructor !== Array) {
                    data = [data];
                }
                _forEach(data, function(task) {
                    q.tasks.push({
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    });
                    if (q.saturated && q.tasks.length == concurrency) {
                        q.saturated();
                    }
                    async.nextTick(q.process);
                });
            },
            process: function () {
                if (workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if(q.empty && q.tasks.length == 0) q.empty();
                    workers += 1;
                    worker(task.data, function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        if(q.drain && q.tasks.length + workers == 0) q.drain();
                        q.process();
                    });
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            }
        };
        return q;
    };
    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _forEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/
    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        var memoized = function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                callback.apply(null, memo[key]);
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        };
        memoized.unmemoized = fn;
        return memoized;
    };
    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      }
    };
}());
    }
  };
});
horseDatastore.module(12, function(onejsModParent){
  return {
    'id':'index',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // This file is just added for convenience so this repository can be
// directly checked out into a project's deps folder
module.exports = require('./lib/async');
    }
  };
});
horseDatastore.pkg(1, function(parent){
  return {
    'id':13,
    'name':'underscore',
    'main':undefined,
    'mainModuleId':'underscore',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(13, function(onejsModParent){
  return {
    'id':'underscore',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      //     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore
(function() {
  // Baseline setup
  // --------------
  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;
  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;
  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};
  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;
  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;
  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };
  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }
  // Current version.
  _.VERSION = '1.3.3';
  // Collection Functions
  // --------------------
  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };
  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };
  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };
  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };
  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };
  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };
  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };
  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };
  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };
  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };
  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };
  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };
  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };
  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };
  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      rand = Math.floor(Math.random() * (index + 1));
      shuffled[index] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };
  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, val, context) {
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (a === void 0) return 1;
      if (b === void 0) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };
  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };
  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };
  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj)                                     return [];
    if (_.isArray(obj))                           return slice.call(obj);
    if (_.isArguments(obj))                       return slice.call(obj);
    if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
    return _.values(obj);
  };
  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.isArray(obj) ? obj.length : _.keys(obj).length;
  };
  // Array Functions
  // ---------------
  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };
  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };
  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };
  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };
  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };
  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };
  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };
  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    // The `isSorted` flag is irrelevant if the array only contains two elements.
    if (array.length < 3) isSorted = true;
    _.reduce(initial, function (memo, value, index) {
      if (isSorted ? _.last(memo) !== value || !memo.length : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };
  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };
  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };
  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1), true);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };
  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };
  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };
  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };
  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;
    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);
    while(idx < len) {
      range[idx++] = start;
      start += step;
    }
    return range;
  };
  // Function (ahem) Functions
  // ------------------
  // Reusable constructor function for prototype setting.
  var ctor = function(){};
  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };
  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };
  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };
  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };
  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };
  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        result = func.apply(context, args);
      }
      whenDone();
      throttling = true;
      return result;
    };
  };
  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      if (immediate && !timeout) func.apply(context, args);
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };
  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };
  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };
  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };
  // Object Functions
  // ----------------
  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };
  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };
  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };
  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };
  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var result = {};
    each(_.flatten(slice.call(arguments, 1)), function(key) {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  };
  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };
  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };
  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };
  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }
  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };
  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };
  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };
  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };
  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };
  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }
  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };
  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };
  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };
  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };
  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };
  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };
  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };
  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };
  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };
  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };
  // Has own property?
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };
  // Utility Functions
  // -----------------
  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };
  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };
  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };
  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };
  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };
  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };
  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };
  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };
  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;
  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\': '\\',
    "'": "'",
    'r': '\r',
    'n': '\n',
    't': '\t',
    'u2028': '\u2028',
    'u2029': '\u2029'
  };
  for (var p in escapes) escapes[escapes[p]] = p;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;
  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };
  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);
    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n_.escape(" + unescape(code) + ")+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n(" + unescape(code) + ")+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n;__p+='";
      }) + "';\n";
    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
    source = "var __p='';" +
      "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" +
      source + "return __p;\n";
    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };
    // Provide the compiled function source as a convenience for build time
    // precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' +
      source + '}';
    return template;
  };
  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };
  // The OOP Wrapper
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };
  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;
  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };
  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };
  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);
  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var wrapped = this._wrapped;
      method.apply(wrapped, arguments);
      var length = wrapped.length;
      if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
      return result(wrapped, this._chain);
    };
  });
  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });
  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };
  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };
}).call(this);
    }
  };
});
horseDatastore.pkg(1, function(parent){
  return {
    'id':14,
    'name':'hiredis',
    'main':undefined,
    'mainModuleId':'hiredis',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(14, function(onejsModParent){
  return {
    'id':'test/reader',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var assert = require("assert"),
    hiredis = require("../hiredis");
/* Monkey-patch Buffer.isBuffer on 0.3.1 */
if (process.versions.node == "0.3.1") {
    var SlowBuffer = process.binding('buffer').SlowBuffer;
    Buffer.isBuffer = function isBuffer(b) {
        return b instanceof Buffer || b instanceof SlowBuffer;
    };
}
var passed = 0;
var failed = 0;
function test(str, fn) {
    try {
        fn();
        passed++;
    } catch (err) {
        console.log("\x1B[1;31m" + str + " failed!\x1B[0m");
        console.log(err.stack + "\n");
        failed++;
    }
}
test("CreateReader", function() {
    var reader = new hiredis.Reader();
    assert.notEqual(reader, null);
});
test("StatusReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("+OK\r\n");
    assert.equal("OK", reader.get());
});
test("StatusReplyAsBuffer", function() {
    var reader = new hiredis.Reader({ return_buffers: true });
    reader.feed("+OK\r\n");
    var reply = reader.get();
    assert.ok(Buffer.isBuffer(reply));
    assert.equal("OK", reply.toString());
});
test("IntegerReply", function() {
    var reader = new hiredis.Reader();
    reader.feed(":1\r\n");
    assert.equal(1, reader.get());
});
// This test fails since v8 doesn't to 64-bit integers...
test("LargeIntegerReply", function() {
    var reader = new hiredis.Reader();
    reader.feed(":9223372036854775807\r\n");
    assert.equal("9223372036854775807", String(reader.get()));
});
test("ErrorReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("-ERR foo\r\n");
    var reply = reader.get();
    assert.equal(Error, reply.constructor);
    assert.equal("ERR foo", reply.message);
});
test("ErrorReplyWithReturnBuffers", function() {
    var reader = new hiredis.Reader({ return_buffers: true });
    reader.feed("-ERR foo\r\n");
    var reply = reader.get();
    assert.equal(Error, reply.constructor);
    assert.equal("ERR foo", reply.message);
});
test("NullBulkReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("$-1\r\n");
    assert.equal(null, reader.get());
});
test("EmptyBulkReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("$0\r\n\r\n");
    assert.equal("", reader.get());
});
test("BulkReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("$3\r\nfoo\r\n");
    assert.equal("foo", reader.get());
});
test("BulkReplyAsBuffer", function() {
    var reader = new hiredis.Reader({ return_buffers: true });
    reader.feed("$3\r\nfoo\r\n");
    var reply = reader.get();
    assert.ok(Buffer.isBuffer(reply));
    assert.equal("foo", reply.toString());
});
test("BulkReplyWithEncoding", function() {
    var reader = new hiredis.Reader();
    reader.feed("$" + Buffer.byteLength("☃") + "\r\n☃\r\n");
    assert.equal("☃", reader.get());
});
test("NullMultiBulkReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("*-1\r\n");
    assert.equal(null, reader.get());
});
test("EmptyMultiBulkReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("*0\r\n");
    assert.deepEqual([], reader.get());
});
test("MultiBulkReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("*2\r\n$3\r\nfoo\r\n$3\r\nbar\r\n");
    assert.deepEqual(["foo", "bar"], reader.get());
});
test("NestedMultiBulkReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("*2\r\n*2\r\n$3\r\nfoo\r\n$3\r\nbar\r\n$3\r\nqux\r\n");
    assert.deepEqual([["foo", "bar"], "qux"], reader.get());
});
test("MultiBulkReplyWithNonStringValues", function() {
    var reader = new hiredis.Reader();
    reader.feed("*3\r\n:1\r\n+OK\r\n$-1\r\n");
    assert.deepEqual([1, "OK", null], reader.get());
});
test("FeedWithBuffer", function() {
    var reader = new hiredis.Reader();
    reader.feed(new Buffer("$3\r\nfoo\r\n"));
    assert.deepEqual("foo", reader.get());
});
test("UndefinedReplyOnIncompleteFeed", function() {
    var reader = new hiredis.Reader();
    reader.feed("$3\r\nfoo");
    assert.deepEqual(undefined, reader.get());
    reader.feed("\r\n");
    assert.deepEqual("foo", reader.get());
});
test("Leaks", function(beforeExit) {
    /* The "leaks" utility is only available on OSX. */
    if (process.platform != "darwin") return;
    var done = 0;
    var leaks = require('child_process').spawn("leaks", [process.pid]);
    leaks.stdout.on("data", function(data) {
        var str = data.toString();
        var notice = "Node 0.2.5 always leaks 16 bytes (this is " + process.versions.node + ")";
        var matches;
        if ((matches = /(\d+) leaks?/i.exec(str)) != null) {
            if (parseInt(matches[1]) > 0) {
                console.log(str);
                console.log('\x1B[31mNotice: ' + notice + '\x1B[0m');
            }
        }
        done = 1;
    });
    process.on('exit', function() {
        assert.ok(done, "Leaks test should have completed");
    });
});
    }
  };
});
horseDatastore.module(14, function(onejsModParent){
  return {
    'id':'parser_bench',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var hiredis = require("./hiredis");
function go(num) {
  var parser = new hiredis.Reader();
  var i, j;
  var n = 10, m = 0;
  var feed = "*" + n + "\r\n";
  for (i = 0; i < n; i++) {
      if (m > 1) {
          feed += "*" + m + "\r\n";
          for (j = 0; j < m; j++) {
              feed += "$10\r\nxxxxxxxxxx\r\n";
          }
      } else {
          feed += "$10\r\nxxxxxxxxxx\r\n";
      }
  }
  var t1 = new Date, t2;
  for (i = 0; i < num; i++) {
      parser.feed(feed);
      parser.get();
  }
  t2 = new Date;
  console.log("" + num + " took: " + (t2-t1) + "ms");
}
var stdin = process.openStdin();
stdin.on('data', function(chunk) {
    go(parseInt(chunk));
});
    }
  };
});
horseDatastore.module(14, function(onejsModParent){
  return {
    'id':'hiredis',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var hiredis, net = require("net");
try {
  hiredis = require('./build/Release/hiredis');
} catch (e) {
  hiredis = require('./build/default/hiredis');
}
exports.Reader = hiredis.Reader;
exports.createConnection = function(port, host) {
    var s = net.createConnection(port || 6379, host);
    var r = new hiredis.Reader();
    var _write = s.write;
    s.write = function() {
        var i, args = arguments;
        _write.call(s, "*" + args.length + "\r\n");
        for (i = 0; i < args.length; i++) {
            var arg = args[i];
            _write.call(s, "$" + arg.length + "\r\n" + arg + "\r\n");
        }
    }
    s.on("data", function(data) {
        var reply;
        r.feed(data);
        try {
            while((reply = r.get()) !== undefined)
                s.emit("reply", reply);
        } catch(err) {
            r = null;
            s.emit("error", err);
            s.destroy();
        }
    });
    return s;
}
    }
  };
});
horseDatastore.module(14, function(onejsModParent){
  return {
    'id':'bench',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var hiredis = require("./hiredis"),
    num_clients = 10,
    active_clients = 0,
    pipeline = 0,
    num_requests = parseInt(process.argv[2]) || 20000,
    issued_requests = 0,
    test_start;
var tests = [];
tests.push({
    descr: "PING",
    command: ["PING"]
});
tests.push({
    descr: "SET",
    command: ["SET", "foo", "bar"]
});
tests.push({
    descr: "GET",
    command: ["GET", "foo"]
});
tests.push({
    descr: "LPUSH 8 bytes",
    command: ["LPUSH", "mylist-8", new Buffer(Array(8).join("-"))]
});
tests.push({
    descr: "LPUSH 64 bytes",
    command: ["LPUSH", "mylist-64", new Buffer(Array(64).join("-"))]
});
tests.push({
    descr: "LPUSH 512 bytes",
    command: ["LPUSH", "mylist-512", new Buffer(Array(512).join("-"))]
});
tests.push({
    descr: "LRANGE 10 elements, 8 bytes",
    command: ["LRANGE", "mylist-8", "0", "9"]
});
tests.push({
    descr: "LRANGE 100 elements, 8 bytes",
    command: ["LRANGE", "mylist-8", "0", "99"]
});
tests.push({
    descr: "LRANGE 100 elements, 64 bytes",
    command: ["LRANGE", "mylist-64", "0", "99"]
});
tests.push({
    descr: "LRANGE 100 elements, 512 bytes",
    command: ["LRANGE", "mylist-512", "0", "99"]
});
function call(client, test) {
    client.on("reply", function() {
        if (issued_requests < num_requests) {
            request();
        } else {
            client.end();
            if (--active_clients == 0)
                done(test);
        }
    });
    function request() {
        issued_requests++;
        client.write.apply(client,test.command);
    };
    request();
}
function done(test) {
    var time = (new Date - test_start);
    var op_rate = (num_requests/(time/1000.0)).toFixed(2);
    console.log(test.descr + ": " + op_rate + " ops/sec");
    next();
}
function concurrent_test(test) {
    var i = num_clients;
    var client;
    issued_requests = 0;
    test_start = new Date;
    while(i-- && issued_requests < num_requests) {
        active_clients++;
        client = hiredis.createConnection();
        call(client, test);
    }
}
function pipelined_test(test) {
    var client = hiredis.createConnection();
    var received_replies = 0;
    issued_requests = 0;
    while (issued_requests < num_requests) {
        issued_requests++;
        client.write.apply(client,test.command);
    }
    test_start = new Date;
    client.on("reply", function() {
        if (++received_replies == num_requests) {
            client.end();
            done(test);
        }
    });
}
function next() {
    var test = tests.shift();
    if (test) {
        if (pipeline) {
            pipelined_test(test);
        } else {
            concurrent_test(test);
        }
    }
}
next();
    }
  };
});
horseDatastore.pkg(1, function(parent){
  return {
    'id':15,
    'name':'redis',
    'main':undefined,
    'mainModuleId':'index',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(15, function(onejsModParent){
  return {
    'id':'lib/queue',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var to_array = require("./to_array");
// Queue class adapted from Tim Caswell's pattern library
// http://github.com/creationix/pattern/blob/master/lib/pattern/queue.js
function Queue() {
    this.tail = [];
    this.head = [];
    this.offset = 0;
}
Queue.prototype.shift = function () {
    if (this.offset === this.head.length) {
        var tmp = this.head;
        tmp.length = 0;
        this.head = this.tail;
        this.tail = tmp;
        this.offset = 0;
        if (this.head.length === 0) {
            return;
        }
    }
    return this.head[this.offset++]; // sorry, JSLint
};
Queue.prototype.push = function (item) {
    return this.tail.push(item);
};
Queue.prototype.forEach = function (fn, thisv) {
    var array = this.head.slice(this.offset), i, il;
    array.push.apply(array, this.tail);
    if (thisv) {
        for (i = 0, il = array.length; i < il; i += 1) {
            fn.call(thisv, array[i], i, array);
        }
    } else {
        for (i = 0, il = array.length; i < il; i += 1) {
            fn(array[i], i, array);
        }
    }
    return array;
};
Queue.prototype.getLength = function () {
    return this.head.length - this.offset + this.tail.length;
};
    
Object.defineProperty(Queue.prototype, 'length', {
    get: function () {
        return this.getLength();
    }
});
if(typeof module !== 'undefined' && module.exports) {
  module.exports = Queue;
}
    }
  };
});
horseDatastore.module(15, function(onejsModParent){
  return {
    'id':'lib/to_array',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      function to_array(args) {
    var len = args.length,
        arr = new Array(len), i;
    for (i = 0; i < len; i += 1) {
        arr[i] = args[i];
    }
    return arr;
}
module.exports = to_array;
    }
  };
});
horseDatastore.module(15, function(onejsModParent){
  return {
    'id':'lib/parser/javascript',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*global Buffer require exports console setTimeout */
// TODO - incorporate these V8 pro tips:
//    pre-allocate Arrays if length is known in advance
//    do not use delete
//    use numbers for parser state
var events = require("events"),
    util = require("../util");
exports.debug_mode = false;
exports.name = "javascript";
function RedisReplyParser(options) {
    this.name = exports.name;
    this.options = options || {};
    this.reset();
    events.EventEmitter.call(this);
}
util.inherits(RedisReplyParser, events.EventEmitter);
exports.Parser = RedisReplyParser;
// Buffer.toString() is quite slow for small strings
function small_toString(buf, len) {
    var tmp = "", i;
    for (i = 0; i < len; i += 1) {
        tmp += String.fromCharCode(buf[i]);
    }
    return tmp;
}
// Reset parser to it's original state.
RedisReplyParser.prototype.reset = function () {
    this.return_buffer = new Buffer(16384); // for holding replies, might grow
    this.return_string = "";
    this.tmp_string = ""; // for holding size fields
    this.multi_bulk_length = 0;
    this.multi_bulk_replies = null;
    this.multi_bulk_pos = 0;
    this.multi_bulk_nested_length = 0;
    this.multi_bulk_nested_replies = null;
    this.states = {
        TYPE: 1,
        SINGLE_LINE: 2,
        MULTI_BULK_COUNT: 3,
        INTEGER_LINE: 4,
        BULK_LENGTH: 5,
        ERROR_LINE: 6,
        BULK_DATA: 7,
        UNKNOWN_TYPE: 8,
        FINAL_CR: 9,
        FINAL_LF: 10,
        MULTI_BULK_COUNT_LF: 11,
        BULK_LF: 12
    };
    
    this.state = this.states.TYPE;
};
RedisReplyParser.prototype.parser_error = function (message) {
    this.emit("error", message);
    this.reset();
};
RedisReplyParser.prototype.execute = function (incoming_buf) {
    var pos = 0, bd_tmp, bd_str, i, il, states = this.states;
    //, state_times = {}, start_execute = new Date(), start_switch, end_switch, old_state;
    //start_switch = new Date();
    while (pos < incoming_buf.length) {
        // old_state = this.state;
        // console.log("execute: " + this.state + ", " + pos + "/" + incoming_buf.length + ", " + String.fromCharCode(incoming_buf[pos]));
        switch (this.state) {
        case 1: // states.TYPE
            this.type = incoming_buf[pos];
            pos += 1;
            switch (this.type) {
            case 43: // +
                this.state = states.SINGLE_LINE;
                this.return_buffer.end = 0;
                this.return_string = "";
                break;
            case 42: // *
                this.state = states.MULTI_BULK_COUNT;
                this.tmp_string = "";
                break;
            case 58: // :
                this.state = states.INTEGER_LINE;
                this.return_buffer.end = 0;
                this.return_string = "";
                break;
            case 36: // $
                this.state = states.BULK_LENGTH;
                this.tmp_string = "";
                break;
            case 45: // -
                this.state = states.ERROR_LINE;
                this.return_buffer.end = 0;
                this.return_string = "";
                break;
            default:
                this.state = states.UNKNOWN_TYPE;
            }
            break;
        case 4: // states.INTEGER_LINE
            if (incoming_buf[pos] === 13) {
                this.send_reply(+small_toString(this.return_buffer, this.return_buffer.end));
                this.state = states.FINAL_LF;
            } else {
                this.return_buffer[this.return_buffer.end] = incoming_buf[pos];
                this.return_buffer.end += 1;
            }
            pos += 1;
            break;
        case 6: // states.ERROR_LINE
            if (incoming_buf[pos] === 13) {
                this.send_error(this.return_buffer.toString("ascii", 0, this.return_buffer.end));
                this.state = states.FINAL_LF;
            } else {
                this.return_buffer[this.return_buffer.end] = incoming_buf[pos];
                this.return_buffer.end += 1;
            }
            pos += 1;
            break;
        case 2: // states.SINGLE_LINE
            if (incoming_buf[pos] === 13) {
                this.send_reply(this.return_string);
                this.state = states.FINAL_LF;
            } else {
                this.return_string += String.fromCharCode(incoming_buf[pos]);
            }
            pos += 1;
            break;
        case 3: // states.MULTI_BULK_COUNT
            if (incoming_buf[pos] === 13) { // \r
                this.state = states.MULTI_BULK_COUNT_LF;
            } else {
                this.tmp_string += String.fromCharCode(incoming_buf[pos]);
            }
            pos += 1;
            break;
        case 11: // states.MULTI_BULK_COUNT_LF
            if (incoming_buf[pos] === 10) { // \n
                if (this.multi_bulk_length) { // nested multi-bulk
                    this.multi_bulk_nested_length = this.multi_bulk_length;
                    this.multi_bulk_nested_replies = this.multi_bulk_replies;
                    this.multi_bulk_nested_pos = this.multi_bulk_pos;
                }
                this.multi_bulk_length = +this.tmp_string;
                this.multi_bulk_pos = 0;
                this.state = states.TYPE;
                if (this.multi_bulk_length < 0) {
                    this.send_reply(null);
                    this.multi_bulk_length = 0;
                } else if (this.multi_bulk_length === 0) {
                    this.multi_bulk_pos = 0;
                    this.multi_bulk_replies = null;
                    this.send_reply([]);
                } else {
                    this.multi_bulk_replies = new Array(this.multi_bulk_length);
                }
            } else {
                this.parser_error(new Error("didn't see LF after NL reading multi bulk count"));
                return;
            }
            pos += 1;
            break;
        case 5: // states.BULK_LENGTH
            if (incoming_buf[pos] === 13) { // \r
                this.state = states.BULK_LF;
            } else {
                this.tmp_string += String.fromCharCode(incoming_buf[pos]);
            }
            pos += 1;
            break;
        case 12: // states.BULK_LF
            if (incoming_buf[pos] === 10) { // \n
                this.bulk_length = +this.tmp_string;
                if (this.bulk_length === -1) {
                    this.send_reply(null);
                    this.state = states.TYPE;
                } else if (this.bulk_length === 0) {
                    this.send_reply(new Buffer(""));
                    this.state = states.FINAL_CR;
                } else {
                    this.state = states.BULK_DATA;
                    if (this.bulk_length > this.return_buffer.length) {
                        if (exports.debug_mode) {
                            console.log("Growing return_buffer from " + this.return_buffer.length + " to " + this.bulk_length);
                        }
                        this.return_buffer = new Buffer(this.bulk_length);
                    }
                    this.return_buffer.end = 0;
                }
            } else {
                this.parser_error(new Error("didn't see LF after NL while reading bulk length"));
                return;
            }
            pos += 1;
            break;
        case 7: // states.BULK_DATA
            this.return_buffer[this.return_buffer.end] = incoming_buf[pos];
            this.return_buffer.end += 1;
            pos += 1;
            if (this.return_buffer.end === this.bulk_length) {
                bd_tmp = new Buffer(this.bulk_length);
                // When the response is small, Buffer.copy() is a lot slower.
                if (this.bulk_length > 10) {
                    this.return_buffer.copy(bd_tmp, 0, 0, this.bulk_length);
                } else {
                    for (i = 0, il = this.bulk_length; i < il; i += 1) {
                        bd_tmp[i] = this.return_buffer[i];
                    }
                }
                this.send_reply(bd_tmp);
                this.state = states.FINAL_CR;
            }
            break;
        case 9: // states.FINAL_CR
            if (incoming_buf[pos] === 13) { // \r
                this.state = states.FINAL_LF;
                pos += 1;
            } else {
                this.parser_error(new Error("saw " + incoming_buf[pos] + " when expecting final CR"));
                return;
            }
            break;
        case 10: // states.FINAL_LF
            if (incoming_buf[pos] === 10) { // \n
                this.state = states.TYPE;
                pos += 1;
            } else {
                this.parser_error(new Error("saw " + incoming_buf[pos] + " when expecting final LF"));
                return;
            }
            break;
        default:
            this.parser_error(new Error("invalid state " + this.state));
        }
        // end_switch = new Date();
        // if (state_times[old_state] === undefined) {
        //     state_times[old_state] = 0;
        // }
        // state_times[old_state] += (end_switch - start_switch);
        // start_switch = end_switch;
    }
    // console.log("execute ran for " + (Date.now() - start_execute) + " ms, on " + incoming_buf.length + " Bytes. ");
    // Object.keys(state_times).forEach(function (state) {
    //     console.log("    " + state + ": " + state_times[state]);
    // });
};
RedisReplyParser.prototype.send_error = function (reply) {
    if (this.multi_bulk_length > 0 || this.multi_bulk_nested_length > 0) {
        // TODO - can this happen?  Seems like maybe not.
        this.add_multi_bulk_reply(reply);
    } else {
        this.emit("reply error", reply);
    }
};
RedisReplyParser.prototype.send_reply = function (reply) {
    if (this.multi_bulk_length > 0 || this.multi_bulk_nested_length > 0) {
        if (!this.options.return_buffers && Buffer.isBuffer(reply)) {
            this.add_multi_bulk_reply(reply.toString("utf8"));
        } else {
            this.add_multi_bulk_reply(reply);
        }
    } else {
        if (!this.options.return_buffers && Buffer.isBuffer(reply)) {
            this.emit("reply", reply.toString("utf8"));
        } else {
            this.emit("reply", reply);
        }
    }
};
RedisReplyParser.prototype.add_multi_bulk_reply = function (reply) {
    if (this.multi_bulk_replies) {
        this.multi_bulk_replies[this.multi_bulk_pos] = reply;
        this.multi_bulk_pos += 1;
        if (this.multi_bulk_pos < this.multi_bulk_length) {
            return;
        }
    } else {
        this.multi_bulk_replies = reply;
    }
    if (this.multi_bulk_nested_length > 0) {
        this.multi_bulk_nested_replies[this.multi_bulk_nested_pos] = this.multi_bulk_replies;
        this.multi_bulk_nested_pos += 1;
        this.multi_bulk_length = 0;
        this.multi_bulk_replies = null;
        this.multi_bulk_pos = 0;
        if (this.multi_bulk_nested_length === this.multi_bulk_nested_pos) {
            this.emit("reply", this.multi_bulk_nested_replies);
            this.multi_bulk_nested_length = 0;
            this.multi_bulk_nested_pos = 0;
            this.multi_bulk_nested_replies = null;
        }
    } else {
        this.emit("reply", this.multi_bulk_replies);
        this.multi_bulk_length = 0;
        this.multi_bulk_replies = null;
        this.multi_bulk_pos = 0;
    }
};
    }
  };
});
horseDatastore.module(15, function(onejsModParent){
  return {
    'id':'lib/parser/hiredis',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*global Buffer require exports console setTimeout */
var events = require("events"),
    util = require("../util"),
    hiredis = require("hiredis");
exports.debug_mode = false;
exports.name = "hiredis";
function HiredisReplyParser(options) {
    this.name = exports.name;
    this.options = options || {};
    this.reset();
    events.EventEmitter.call(this);
}
util.inherits(HiredisReplyParser, events.EventEmitter);
exports.Parser = HiredisReplyParser;
HiredisReplyParser.prototype.reset = function () {
    this.reader = new hiredis.Reader({
        return_buffers: this.options.return_buffers || false
    });
};
HiredisReplyParser.prototype.execute = function (data) {
    var reply;
    this.reader.feed(data);
    while (true) {
        try {
          reply = this.reader.get();
        } catch (err) {
          this.emit("error", err);
          break;
        }
        if (reply === undefined) break;
        if (reply && reply.constructor === Error) {
            this.emit("reply error", reply);
        } else {
            this.emit("reply", reply);
        }
    }
};
    }
  };
});
horseDatastore.module(15, function(onejsModParent){
  return {
    'id':'lib/util',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // Support for very old versions of node where the module was called "sys".  At some point, we should abandon this.
var util;
try {
    util = require("util");
} catch (err) {
    util = require("sys");
}
module.exports = util;
    }
  };
});
horseDatastore.module(15, function(onejsModParent){
  return {
    'id':'lib/commands',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // This file was generated by ./generate_commands.js on Tue Jun 28 2011 22:37:02 GMT-0700 (PDT)
module.exports = [
    "append",
    "auth",
    "bgrewriteaof",
    "bgsave",
    "blpop",
    "brpop",
    "brpoplpush",
    "config get",
    "config set",
    "config resetstat",
    "dbsize",
    "debug object",
    "debug segfault",
    "decr",
    "decrby",
    "del",
    "discard",
    "echo",
    "exec",
    "exists",
    "expire",
    "expireat",
    "flushall",
    "flushdb",
    "get",
    "getbit",
    "getrange",
    "getset",
    "hdel",
    "hexists",
    "hget",
    "hgetall",
    "hincrby",
    "hkeys",
    "hlen",
    "hmget",
    "hmset",
    "hset",
    "hsetnx",
    "hvals",
    "incr",
    "incrby",
    "info",
    "keys",
    "lastsave",
    "lindex",
    "linsert",
    "llen",
    "lpop",
    "lpush",
    "lpushx",
    "lrange",
    "lrem",
    "lset",
    "ltrim",
    "mget",
    "monitor",
    "move",
    "mset",
    "msetnx",
    "multi",
    "object",
    "persist",
    "ping",
    "psubscribe",
    "publish",
    "punsubscribe",
    "quit",
    "randomkey",
    "rename",
    "renamenx",
    "rpop",
    "rpoplpush",
    "rpush",
    "rpushx",
    "sadd",
    "save",
    "scard",
    "sdiff",
    "sdiffstore",
    "select",
    "set",
    "setbit",
    "setex",
    "setnx",
    "setrange",
    "shutdown",
    "sinter",
    "sinterstore",
    "sismember",
    "slaveof",
    "smembers",
    "smove",
    "sort",
    "spop",
    "srandmember",
    "srem",
    "strlen",
    "subscribe",
    "sunion",
    "sunionstore",
    "sync",
    "ttl",
    "type",
    "unsubscribe",
    "unwatch",
    "watch",
    "zadd",
    "zcard",
    "zcount",
    "zincrby",
    "zinterstore",
    "zrange",
    "zrangebyscore",
    "zrank",
    "zrem",
    "zremrangebyrank",
    "zremrangebyscore",
    "zrevrange",
    "zrevrangebyscore",
    "zrevrank",
    "zscore",
    "zunionstore"
];
    }
  };
});
horseDatastore.module(15, function(onejsModParent){
  return {
    'id':'index',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*global Buffer require exports console setTimeout */
var net = require("net"),
    util = require("./lib/util"),
    Queue = require("./lib/queue"),
    to_array = require("./lib/to_array"),
    events = require("events"),
    parsers = [], commands,
    connection_id = 0,
    default_port = 6379,
    default_host = "127.0.0.1";
// can set this to true to enable for all connections
exports.debug_mode = false;
// hiredis might not be installed
try {
    require("./lib/parser/hiredis");
    parsers.push(require("./lib/parser/hiredis"));
} catch (err) {
    if (exports.debug_mode) {
        console.warn("hiredis parser not installed.");
    }
}
parsers.push(require("./lib/parser/javascript"));
function RedisClient(stream, options) {
    this.stream = stream;
    this.options = options = options || {};
    this.connection_id = ++connection_id;
    this.connected = false;
    this.ready = false;
    this.connections = 0;
    if (this.options.socket_nodelay === undefined) {
        this.options.socket_nodelay = true;
    }
    this.should_buffer = false;
    this.command_queue_high_water = this.options.command_queue_high_water || 1000;
    this.command_queue_low_water = this.options.command_queue_low_water || 0;
    this.max_attempts = null;
    if (options.max_attempts && !isNaN(options.max_attempts) && options.max_attempts > 0) {
        this.max_attempts = +options.max_attempts;
    }
    this.command_queue = new Queue(); // holds sent commands to de-pipeline them
    this.offline_queue = new Queue(); // holds commands issued but not able to be sent
    this.commands_sent = 0;
    this.connect_timeout = false;
    if (options.connect_timeout && !isNaN(options.connect_timeout) && options.connect_timeout > 0) {
        this.connect_timeout = +options.connect_timeout;
    }
    this.initialize_retry_vars();
    this.pub_sub_mode = false;
    this.subscription_set = {};
    this.monitoring = false;
    this.closing = false;
    this.server_info = {};
    this.auth_pass = null;
    this.parser_module = null;
    this.selected_db = null;	// save the selected db here, used when reconnecting
	
    var self = this;
    this.stream.on("connect", function () {
        self.on_connect();
    });
    this.stream.on("data", function (buffer_from_socket) {
        self.on_data(buffer_from_socket);
    });
    this.stream.on("error", function (msg) {
        self.on_error(msg.message);
    });
    this.stream.on("close", function () {
        self.connection_gone("close");
    });
    this.stream.on("end", function () {
        self.connection_gone("end");
    });
    this.stream.on("drain", function () {
        self.should_buffer = false;
        self.emit("drain");
    });
    events.EventEmitter.call(this);
}
util.inherits(RedisClient, events.EventEmitter);
exports.RedisClient = RedisClient;
RedisClient.prototype.initialize_retry_vars = function () {
    this.retry_timer = null;
    this.retry_totaltime = 0;
    this.retry_delay = 150;
    this.retry_backoff = 1.7;
    this.attempts = 1;
};
// flush offline_queue and command_queue, erroring any items with a callback first
RedisClient.prototype.flush_and_error = function (message) {
    var command_obj;
    while (this.offline_queue.length > 0) {
        command_obj = this.offline_queue.shift();
        if (typeof command_obj.callback === "function") {
            command_obj.callback(message);
        }
    }
    this.offline_queue = new Queue();
    while (this.command_queue.length > 0) {
        command_obj = this.command_queue.shift();
        if (typeof command_obj.callback === "function") {
            command_obj.callback(message);
        }
    }
    this.command_queue = new Queue();
};
RedisClient.prototype.on_error = function (msg) {
    var message = "Redis connection to " + this.host + ":" + this.port + " failed - " + msg,
        self = this, command_obj;
    if (this.closing) {
        return;
    }
    if (exports.debug_mode) {
        console.warn(message);
    }
    this.flush_and_error(message);
    this.connected = false;
    this.ready = false;
    this.emit("error", new Error(message));
    // "error" events get turned into exceptions if they aren't listened for.  If the user handled this error
    // then we should try to reconnect.
    this.connection_gone("error");
};
RedisClient.prototype.do_auth = function () {
    var self = this;
    if (exports.debug_mode) {
        console.log("Sending auth to " + self.host + ":" + self.port + " id " + self.connection_id);
    }
    self.send_anyway = true;
    self.send_command("auth", [this.auth_pass], function (err, res) {
        if (err) {
            if (err.toString().match("LOADING")) {
                // if redis is still loading the db, it will not authenticate and everything else will fail
                console.log("Redis still loading, trying to authenticate later");
                setTimeout(function () {
                    self.do_auth();
                }, 2000); // TODO - magic number alert
                return;
            } else {
                return self.emit("error", new Error("Auth error: " + err.message));
            }
        }
        if (res.toString() !== "OK") {
            return self.emit("error", new Error("Auth failed: " + res.toString()));
        }
        if (exports.debug_mode) {
            console.log("Auth succeeded " + self.host + ":" + self.port + " id " + self.connection_id);
        }
        if (self.auth_callback) {
            self.auth_callback(err, res);
            self.auth_callback = null;
        }
        // now we are really connected
        self.emit("connect");
        if (self.options.no_ready_check) {
            self.on_ready();
        } else {
            self.ready_check();
        }
    });
    self.send_anyway = false;
};
RedisClient.prototype.on_connect = function () {
    if (exports.debug_mode) {
        console.log("Stream connected " + this.host + ":" + this.port + " id " + this.connection_id);
    }
    var self = this;
    this.connected = true;
    this.ready = false;
    this.attempts = 0;
    this.connections += 1;
    this.command_queue = new Queue();
    this.emitted_end = false;
    this.initialize_retry_vars();
    if (this.options.socket_nodelay) {
        this.stream.setNoDelay();
    }
    this.stream.setTimeout(0);
    this.init_parser();
    if (this.auth_pass) {
        this.do_auth();
    } else {
        this.emit("connect");
        if (this.options.no_ready_check) {
            this.on_ready();
        } else {
            this.ready_check();
        }
    }
};
RedisClient.prototype.init_parser = function () {
    var self = this;
    if (this.options.parser) {
        if (! parsers.some(function (parser) {
            if (parser.name === self.options.parser) {
                self.parser_module = parser;
                if (exports.debug_mode) {
                    console.log("Using parser module: " + self.parser_module.name);
                }
                return true;
            }
        })) {
            throw new Error("Couldn't find named parser " + self.options.parser + " on this system");
        }
    } else {
        if (exports.debug_mode) {
            console.log("Using default parser module: " + parsers[0].name);
        }
        this.parser_module = parsers[0];
    }
    this.parser_module.debug_mode = exports.debug_mode;
    // return_buffers sends back Buffers from parser to callback. detect_buffers sends back Buffers from parser, but
    // converts to Strings if the input arguments are not Buffers.
    this.reply_parser = new this.parser_module.Parser({
        return_buffers: self.options.return_buffers || self.options.detect_buffers || false
    });
    // "reply error" is an error sent back by Redis
    this.reply_parser.on("reply error", function (reply) {
        self.return_error(new Error(reply));
    });
    this.reply_parser.on("reply", function (reply) {
        self.return_reply(reply);
    });
    // "error" is bad.  Somehow the parser got confused.  It'll try to reset and continue.
    this.reply_parser.on("error", function (err) {
        self.emit("error", new Error("Redis reply parser error: " + err.stack));
    });
};
RedisClient.prototype.on_ready = function () {
    var self = this;
    this.ready = true;
    // magically restore any modal commands from a previous connection
    if (this.selected_db !== null) {
        this.send_command('select', [this.selected_db]);
    }
    if (this.pub_sub_mode === true) {
        Object.keys(this.subscription_set).forEach(function (key) {
            var parts = key.split(" ");
            if (exports.debug_mode) {
                console.warn("sending pub/sub on_ready " + parts[0] + ", " + parts[1]);
            }
            self.send_command(parts[0], [parts[1]]);
        });
    } else if (this.monitoring) {
        this.send_command("monitor");
    } else {
        this.send_offline_queue();
    }
    this.emit("ready");
};
RedisClient.prototype.on_info_cmd = function (err, res) {
    var self = this, obj = {}, lines, retry_time;
    if (err) {
        return self.emit("error", new Error("Ready check failed: " + err.message));
    }
    lines = res.toString().split("\r\n");
    lines.forEach(function (line) {
        var parts = line.split(':');
        if (parts[1]) {
            obj[parts[0]] = parts[1];
        }
    });
    obj.versions = [];
    obj.redis_version.split('.').forEach(function (num) {
        obj.versions.push(+num);
    });
    // expose info key/vals to users
    this.server_info = obj;
    if (!obj.loading || (obj.loading && obj.loading === "0")) {
        if (exports.debug_mode) {
            console.log("Redis server ready.");
        }
        this.on_ready();
    } else {
        retry_time = obj.loading_eta_seconds * 1000;
        if (retry_time > 1000) {
            retry_time = 1000;
        }
        if (exports.debug_mode) {
            console.log("Redis server still loading, trying again in " + retry_time);
        }
        setTimeout(function () {
            self.ready_check();
        }, retry_time);
    }
};
RedisClient.prototype.ready_check = function () {
    var self = this;
    if (exports.debug_mode) {
        console.log("checking server ready state...");
    }
    this.send_anyway = true;  // secret flag to send_command to send something even if not "ready"
    this.info(function (err, res) {
        self.on_info_cmd(err, res);
    });
    this.send_anyway = false;
};
RedisClient.prototype.send_offline_queue = function () {
    var command_obj, buffered_writes = 0;
    while (this.offline_queue.length > 0) {
        command_obj = this.offline_queue.shift();
        if (exports.debug_mode) {
            console.log("Sending offline command: " + command_obj.command);
        }
        buffered_writes += !this.send_command(command_obj.command, command_obj.args, command_obj.callback);
    }
    this.offline_queue = new Queue();
    // Even though items were shifted off, Queue backing store still uses memory until next add, so just get a new Queue
    if (!buffered_writes) {
        this.should_buffer = false;
        this.emit("drain");
    }
};
RedisClient.prototype.connection_gone = function (why) {
    var self = this, message;
    // If a retry is already in progress, just let that happen
    if (this.retry_timer) {
        return;
    }
    if (exports.debug_mode) {
        console.warn("Redis connection is gone from " + why + " event.");
    }
    this.connected = false;
    this.ready = false;
    // since we are collapsing end and close, users don't expect to be called twice
    if (! this.emitted_end) {
        this.emit("end");
        this.emitted_end = true;
    }
    this.flush_and_error("Redis connection gone from " + why + " event.");
    // If this is a requested shutdown, then don't retry
    if (this.closing) {
        this.retry_timer = null;
        if (exports.debug_mode) {
            console.warn("connection ended from quit command, not retrying.");
        }
        return;
    }
    this.retry_delay = Math.floor(this.retry_delay * this.retry_backoff);
    if (exports.debug_mode) {
        console.log("Retry connection in " + this.current_retry_delay + " ms");
    }
    if (this.max_attempts && this.attempts >= this.max_attempts) {
        this.retry_timer = null;
        // TODO - some people need a "Redis is Broken mode" for future commands that errors immediately, and others
        // want the program to exit.  Right now, we just log, which doesn't really help in either case.
        console.error("node_redis: Couldn't get Redis connection after " + this.max_attempts + " attempts.");
        return;
    }
    this.attempts += 1;
    this.emit("reconnecting", {
        delay: self.retry_delay,
        attempt: self.attempts
    });
    this.retry_timer = setTimeout(function () {
        if (exports.debug_mode) {
            console.log("Retrying connection...");
        }
        self.retry_totaltime += self.current_retry_delay;
        if (self.connect_timeout && self.retry_totaltime >= self.connect_timeout) {
            self.retry_timer = null;
            // TODO - engage Redis is Broken mode for future commands, or whatever
            console.error("node_redis: Couldn't get Redis connection after " + self.retry_totaltime + "ms.");
            return;
        }
        self.stream.connect(self.port, self.host);
        self.retry_timer = null;
    }, this.retry_delay);
};
RedisClient.prototype.on_data = function (data) {
    if (exports.debug_mode) {
        console.log("net read " + this.host + ":" + this.port + " id " + this.connection_id + ": " + data.toString());
    }
    try {
        this.reply_parser.execute(data);
    } catch (err) {
        // This is an unexpected parser problem, an exception that came from the parser code itself.
        // Parser should emit "error" events if it notices things are out of whack.
        // Callbacks that throw exceptions will land in return_reply(), below.
        // TODO - it might be nice to have a different "error" event for different types of errors
        this.emit("error", err);
    }
};
RedisClient.prototype.return_error = function (err) {
    var command_obj = this.command_queue.shift(), queue_len = this.command_queue.getLength();
    if (this.pub_sub_mode === false && queue_len === 0) {
        this.emit("idle");
        this.command_queue = new Queue();
    }
    if (this.should_buffer && queue_len <= this.command_queue_low_water) {
        this.emit("drain");
        this.should_buffer = false;
    }
    if (command_obj && typeof command_obj.callback === "function") {
        try {
            command_obj.callback(err);
        } catch (callback_err) {
            // if a callback throws an exception, re-throw it on a new stack so the parser can keep going
            process.nextTick(function () {
                throw callback_err;
            });
        }
    } else {
        console.log("node_redis: no callback to send error: " + err.message);
        // this will probably not make it anywhere useful, but we might as well throw
        process.nextTick(function () {
            throw err;
        });
    }
};
// if a callback throws an exception, re-throw it on a new stack so the parser can keep going.
// put this try/catch in its own function because V8 doesn't optimize this well yet.
function try_callback(callback, reply) {
    try {
        callback(null, reply);
    } catch (err) {
        process.nextTick(function () {
            throw err;
        });
    }
}
// hgetall converts its replies to an Object.  If the reply is empty, null is returned.
function reply_to_object(reply) {
    var obj = {}, j, jl, key, val;
    if (reply.length === 0) {
        return null;
    }
    for (j = 0, jl = reply.length; j < jl; j += 2) {
        key = reply[j].toString();
        val = reply[j + 1];
        obj[key] = val;
    }
    return obj;
}
function reply_to_strings(reply) {
    var i;
    if (Buffer.isBuffer(reply)) {
        return reply.toString();
    }
    if (Array.isArray(reply)) {
        for (i = 0; i < reply.length; i++) {
            reply[i] = reply[i].toString();
        }
        return reply;
    }
    return reply;
}
RedisClient.prototype.return_reply = function (reply) {
    var command_obj, obj, i, len, type, timestamp, argindex, args, queue_len;
    
    queue_len = this.command_queue.getLength();
    if (this.pub_sub_mode === false && queue_len === 0) {
        this.emit("idle");
        this.command_queue = new Queue();  // explicitly reclaim storage from old Queue
    }
    if (this.should_buffer && queue_len <= this.command_queue_low_water) {
        this.emit("drain");
        this.should_buffer = false;
    }
    command_obj = this.command_queue.shift();
    if (command_obj && !command_obj.sub_command) {
        if (typeof command_obj.callback === "function") {
            if (this.options.detect_buffers && command_obj.buffer_args === false) {
                // If detect_buffers option was specified, then the reply from the parser will be Buffers.
                // If this command did not use Buffer arguments, then convert the reply to Strings here.
                reply = reply_to_strings(reply);
            }
            // TODO - confusing and error-prone that hgetall is special cased in two places
            if (reply && 'hgetall' === command_obj.command.toLowerCase()) {
                reply = reply_to_object(reply);
            }
            try_callback(command_obj.callback, reply);
        } else if (exports.debug_mode) {
            console.log("no callback for reply: " + (reply && reply.toString && reply.toString()));
        }
    } else if (this.pub_sub_mode || (command_obj && command_obj.sub_command)) {
        if (Array.isArray(reply)) {
            type = reply[0].toString();
            if (type === "message") {
                this.emit("message", reply[1].toString(), reply[2]); // channel, message
            } else if (type === "pmessage") {
                this.emit("pmessage", reply[1].toString(), reply[2].toString(), reply[3]); // pattern, channel, message
            } else if (type === "subscribe" || type === "unsubscribe" || type === "psubscribe" || type === "punsubscribe") {
                if (reply[2] === 0) {
                    this.pub_sub_mode = false;
                    if (this.debug_mode) {
                        console.log("All subscriptions removed, exiting pub/sub mode");
                    }
                } else {
                    this.pub_sub_mode = true;
                }
                // subscribe commands take an optional callback and also emit an event, but only the first response is included in the callback
                // TODO - document this or fix it so it works in a more obvious way
                if (command_obj && typeof command_obj.callback === "function") {
                    try_callback(command_obj.callback, reply[1].toString());
                }
                this.emit(type, reply[1].toString(), reply[2]); // channel, count
            } else {
                throw new Error("subscriptions are active but got unknown reply type " + type);
            }
        } else if (! this.closing) {
            throw new Error("subscriptions are active but got an invalid reply: " + reply);
        }
    } else if (this.monitoring) {
        len = reply.indexOf(" ");
        timestamp = reply.slice(0, len);
        argindex = reply.indexOf('"');
        args = reply.slice(argindex + 1, -1).split('" "').map(function (elem) {
            return elem.replace(/\\"/g, '"');
        });
        this.emit("monitor", timestamp, args);
    } else {
        throw new Error("node_redis command queue state error. If you can reproduce this, please report it.");
    }
};
// This Command constructor is ever so slightly faster than using an object literal, but more importantly, using
// a named constructor helps it show up meaningfully in the V8 CPU profiler and in heap snapshots.
function Command(command, args, sub_command, buffer_args, callback) {
    this.command = command;
    this.args = args;
    this.sub_command = sub_command;
    this.buffer_args = buffer_args;
    this.callback = callback;
}
RedisClient.prototype.send_command = function (command, args, callback) {
    var arg, this_args, command_obj, i, il, elem_count, buffer_args, stream = this.stream, command_str = "", buffered_writes = 0, last_arg_type;
    if (typeof command !== "string") {
        throw new Error("First argument to send_command must be the command name string, not " + typeof command);
    }
    if (Array.isArray(args)) {
        if (typeof callback === "function") {
            // probably the fastest way:
            //     client.command([arg1, arg2], cb);  (straight passthrough)
            //         send_command(command, [arg1, arg2], cb);
        } else if (! callback) {
            // most people find this variable argument length form more convenient, but it uses arguments, which is slower
            //     client.command(arg1, arg2, cb);   (wraps up arguments into an array)
            //       send_command(command, [arg1, arg2, cb]);
            //     client.command(arg1, arg2);   (callback is optional)
            //       send_command(command, [arg1, arg2]);
            //     client.command(arg1, arg2, undefined);   (callback is undefined)
            //       send_command(command, [arg1, arg2, undefined]);
            last_arg_type = typeof args[args.length - 1];
            if (last_arg_type === "function" || last_arg_type === "undefined") {
                callback = args.pop();
            }
        } else {
            throw new Error("send_command: last argument must be a callback or undefined");
        }
    } else {
        throw new Error("send_command: second argument must be an array");
    }
    // if the last argument is an array, expand it out.  This allows commands like this:
    //     client.command(arg1, [arg2, arg3, arg4], cb);
    //  and converts to:
    //     client.command(arg1, arg2, arg3, arg4, cb);
    // which is convenient for some things like sadd
    if (args.length > 0 && Array.isArray(args[args.length - 1])) {
        args = args.slice(0, -1).concat(args[args.length - 1]);
    }
    buffer_args = false;
    for (i = 0, il = args.length, arg; i < il; i += 1) {
        if (Buffer.isBuffer(args[i])) {
            buffer_args = true;
        }
    }
    command_obj = new Command(command, args, false, buffer_args, callback);
    if ((!this.ready && !this.send_anyway) || !stream.writable) {
        if (exports.debug_mode) {
            if (!stream.writable) {
                console.log("send command: stream is not writeable.");
            }
            
            console.log("Queueing " + command + " for next server connection.");
        }
        this.offline_queue.push(command_obj);
        this.should_buffer = true;
        return false;
    }
    if (command === "subscribe" || command === "psubscribe" || command === "unsubscribe" || command === "punsubscribe") {
        this.pub_sub_command(command_obj);
    } else if (command === "monitor") {
        this.monitoring = true;
    } else if (command === "quit") {
        this.closing = true;
    } else if (this.pub_sub_mode === true) {
        throw new Error("Connection in pub/sub mode, only pub/sub commands may be used");
    }
    this.command_queue.push(command_obj);
    this.commands_sent += 1;
    elem_count = args.length + 1;
    // Always use "Multi bulk commands", but if passed any Buffer args, then do multiple writes, one for each arg.
    // This means that using Buffers in commands is going to be slower, so use Strings if you don't already have a Buffer.
    command_str = "*" + elem_count + "\r\n$" + command.length + "\r\n" + command + "\r\n";
    if (! buffer_args) { // Build up a string and send entire command in one write
        for (i = 0, il = args.length, arg; i < il; i += 1) {
            arg = args[i];
            if (typeof arg !== "string") {
                arg = String(arg);
            }
            command_str += "$" + Buffer.byteLength(arg) + "\r\n" + arg + "\r\n";
        }
        if (exports.debug_mode) {
            console.log("send " + this.host + ":" + this.port + " id " + this.connection_id + ": " + command_str);
        }
        buffered_writes += !stream.write(command_str);
    } else {
        if (exports.debug_mode) {
            console.log("send command (" + command_str + ") has Buffer arguments");
        }
        buffered_writes += !stream.write(command_str);
        for (i = 0, il = args.length, arg; i < il; i += 1) {
            arg = args[i];
            if (!(Buffer.isBuffer(arg) || arg instanceof String)) {
                arg = String(arg);
            }
            if (Buffer.isBuffer(arg)) {
                if (arg.length === 0) {
                    if (exports.debug_mode) {
                        console.log("send_command: using empty string for 0 length buffer");
                    }
                    buffered_writes += !stream.write("$0\r\n\r\n");
                } else {
                    buffered_writes += !stream.write("$" + arg.length + "\r\n");
                    buffered_writes += !stream.write(arg);
                    buffered_writes += !stream.write("\r\n");
                    if (exports.debug_mode) {
                        console.log("send_command: buffer send " + arg.length + " bytes");
                    }
                }
            } else {
                if (exports.debug_mode) {
                    console.log("send_command: string send " + Buffer.byteLength(arg) + " bytes: " + arg);
                }
                buffered_writes += !stream.write("$" + Buffer.byteLength(arg) + "\r\n" + arg + "\r\n");
            }
        }
    }
    if (exports.debug_mode) {
        console.log("send_command buffered_writes: " + buffered_writes, " should_buffer: " + this.should_buffer);
    }
    if (buffered_writes || this.command_queue.getLength() >= this.command_queue_high_water) {
        this.should_buffer = true;
    }
    return !this.should_buffer;
};
RedisClient.prototype.pub_sub_command = function (command_obj) {
    var i, key, command, args;
    
    if (this.pub_sub_mode === false && exports.debug_mode) {
        console.log("Entering pub/sub mode from " + command_obj.command);
    }
    this.pub_sub_mode = true;
    command_obj.sub_command = true;
    command = command_obj.command;
    args = command_obj.args;
    if (command === "subscribe" || command === "psubscribe") {
        if (command === "subscribe") {
            key = "sub";
        } else {
            key = "psub";
        }
        for (i = 0; i < args.length; i++) {
            this.subscription_set[key + " " + args[i]] = true;
        }
    } else {
        if (command === "unsubscribe") {
            key = "sub";
        } else {
            key = "psub";
        }
        for (i = 0; i < args.length; i++) {
            delete this.subscription_set[key + " " + args[i]];
        }
    }
};
RedisClient.prototype.end = function () {
    this.stream._events = {};
    this.connected = false;
    this.ready = false;
    return this.stream.end();
};
function Multi(client, args) {
    this.client = client;
    this.queue = [["MULTI"]];
    if (Array.isArray(args)) {
        this.queue = this.queue.concat(args);
    }
}
exports.Multi = Multi;
// take 2 arrays and return the union of their elements
function set_union(seta, setb) {
    var obj = {};
    
    seta.forEach(function (val) {
        obj[val] = true;
    });
    setb.forEach(function (val) {
        obj[val] = true;
    });
    return Object.keys(obj);
}
// This static list of commands is updated from time to time.  ./lib/commands.js can be updated with generate_commands.js
commands = set_union(["get", "set", "setnx", "setex", "append", "strlen", "del", "exists", "setbit", "getbit", "setrange", "getrange", "substr",
    "incr", "decr", "mget", "rpush", "lpush", "rpushx", "lpushx", "linsert", "rpop", "lpop", "brpop", "brpoplpush", "blpop", "llen", "lindex",
    "lset", "lrange", "ltrim", "lrem", "rpoplpush", "sadd", "srem", "smove", "sismember", "scard", "spop", "srandmember", "sinter", "sinterstore",
    "sunion", "sunionstore", "sdiff", "sdiffstore", "smembers", "zadd", "zincrby", "zrem", "zremrangebyscore", "zremrangebyrank", "zunionstore",
    "zinterstore", "zrange", "zrangebyscore", "zrevrangebyscore", "zcount", "zrevrange", "zcard", "zscore", "zrank", "zrevrank", "hset", "hsetnx",
    "hget", "hmset", "hmget", "hincrby", "hdel", "hlen", "hkeys", "hvals", "hgetall", "hexists", "incrby", "decrby", "getset", "mset", "msetnx",
    "randomkey", "select", "move", "rename", "renamenx", "expire", "expireat", "keys", "dbsize", "auth", "ping", "echo", "save", "bgsave",
    "bgrewriteaof", "shutdown", "lastsave", "type", "multi", "exec", "discard", "sync", "flushdb", "flushall", "sort", "info", "monitor", "ttl",
    "persist", "slaveof", "debug", "config", "subscribe", "unsubscribe", "psubscribe", "punsubscribe", "publish", "watch", "unwatch", "cluster",
    "restore", "migrate", "dump", "object", "client", "eval", "evalsha"], require("./lib/commands"));
commands.forEach(function (command) {
    RedisClient.prototype[command] = function (args, callback) {
        if (Array.isArray(args) && typeof callback === "function") {
            return this.send_command(command, args, callback);
        } else {
            return this.send_command(command, to_array(arguments));
        }
    };
    RedisClient.prototype[command.toUpperCase()] = RedisClient.prototype[command];
    Multi.prototype[command] = function () {
        this.queue.push([command].concat(to_array(arguments)));
        return this;
    };
    Multi.prototype[command.toUpperCase()] = Multi.prototype[command];
});
// store db in this.select_db to restore it on reconnect
RedisClient.prototype.select = function (db, callback) {
	var self = this;
	this.send_command('select', [db], function (err, res) {
        if (err === null) {
            self.selected_db = db;
        }
        if (typeof(callback) === 'function') {
            callback(err, res);
        }
    });
};
RedisClient.prototype.SELECT = RedisClient.prototype.select;
// Stash auth for connect and reconnect.  Send immediately if already connected.
RedisClient.prototype.auth = function () {
    var args = to_array(arguments);
    this.auth_pass = args[0];
    this.auth_callback = args[1];
    if (exports.debug_mode) {
        console.log("Saving auth as " + this.auth_pass);
    }
    if (this.connected) {
        this.send_command("auth", args);
    }
};
RedisClient.prototype.AUTH = RedisClient.prototype.auth;
RedisClient.prototype.hmget = function (arg1, arg2, arg3) {
    if (Array.isArray(arg2) && typeof arg3 === "function") {
        return this.send_command("hmget", [arg1].concat(arg2), arg3);
    } else if (Array.isArray(arg1) && typeof arg2 === "function") {
        return this.send_command("hmget", arg1, arg2);
    } else {
        return this.send_command("hmget", to_array(arguments));
    }
};
RedisClient.prototype.HMGET = RedisClient.prototype.hmget;
RedisClient.prototype.hmset = function (args, callback) {
    var tmp_args, tmp_keys, i, il, key;
    if (Array.isArray(args) && typeof callback === "function") {
        return this.send_command("hmset", args, callback);
    }
    args = to_array(arguments);
    if (typeof args[args.length - 1] === "function") {
        callback = args[args.length - 1];
        args.length -= 1;
    } else {
        callback = null;
    }
    if (args.length === 2 && typeof args[0] === "string" && typeof args[1] === "object") {
        // User does: client.hmset(key, {key1: val1, key2: val2})
        tmp_args = [ args[0] ];
        tmp_keys = Object.keys(args[1]);
        for (i = 0, il = tmp_keys.length; i < il ; i++) {
            key = tmp_keys[i];
            tmp_args.push(key);
            tmp_args.push(args[1][key]);
        }
        args = tmp_args;
    }
    return this.send_command("hmset", args, callback);
};
RedisClient.prototype.HMSET = RedisClient.prototype.hmset;
Multi.prototype.hmset = function () {
    var args = to_array(arguments), tmp_args;
    if (args.length >= 2 && typeof args[0] === "string" && typeof args[1] === "object") {
        tmp_args = [ "hmset", args[0] ];
        Object.keys(args[1]).map(function (key) {
            tmp_args.push(key);
            tmp_args.push(args[1][key]);
        });
        if (args[2]) {
            tmp_args.push(args[2]);
        }
        args = tmp_args;
    } else {
        args.unshift("hmset");
    }
    this.queue.push(args);
    return this;
};
Multi.prototype.HMSET = Multi.prototype.hmset;
Multi.prototype.exec = function (callback) {
    var self = this;
    // drain queue, callback will catch "QUEUED" or error
    // TODO - get rid of all of these anonymous functions which are elegant but slow
    this.queue.forEach(function (args, index) {
        var command = args[0], obj;
        if (typeof args[args.length - 1] === "function") {
            args = args.slice(1, -1);
        } else {
            args = args.slice(1);
        }
        if (args.length === 1 && Array.isArray(args[0])) {
            args = args[0];
        }
        if (command === 'hmset' && typeof args[1] === 'object') {
            obj = args.pop();
            Object.keys(obj).forEach(function (key) {
                args.push(key);
                args.push(obj[key]);
            });
        }
        this.client.send_command(command, args, function (err, reply) {
            if (err) {
                var cur = self.queue[index];
                if (typeof cur[cur.length - 1] === "function") {
                    cur[cur.length - 1](err);
                } else {
                    throw new Error(err);
                }
                self.queue.splice(index, 1);
            }
        });
    }, this);
    // TODO - make this callback part of Multi.prototype instead of creating it each time
    return this.client.send_command("EXEC", [], function (err, replies) {
        if (err) {
            if (callback) {
                callback(new Error(err));
                return;
            } else {
                throw new Error(err);
            }
        }
        var i, il, j, jl, reply, args;
        if (replies) {
            for (i = 1, il = self.queue.length; i < il; i += 1) {
                reply = replies[i - 1];
                args = self.queue[i];
                // TODO - confusing and error-prone that hgetall is special cased in two places
                if (reply && args[0].toLowerCase() === "hgetall") {
                    replies[i - 1] = reply = reply_to_object(reply);
                }
                if (typeof args[args.length - 1] === "function") {
                    args[args.length - 1](null, reply);
                }
            }
        }
        if (callback) {
            callback(null, replies);
        }
    });
};
Multi.prototype.EXEC = Multi.prototype.exec;
RedisClient.prototype.multi = function (args) {
    return new Multi(this, args);
};
RedisClient.prototype.MULTI = function (args) {
    return new Multi(this, args);
};
exports.createClient = function (port_arg, host_arg, options) {
    var port = port_arg || default_port,
        host = host_arg || default_host,
        redis_client, net_client;
    net_client = net.createConnection(port, host);
    redis_client = new RedisClient(net_client, options);
    redis_client.port = port;
    redis_client.host = host;
    return redis_client;
};
exports.print = function (err, reply) {
    if (err) {
        console.log("Error: " + err);
    } else {
        console.log("Reply: " + reply);
    }
};
    }
  };
});
horseDatastore.pkg(1, function(parent){
  return {
    'id':16,
    'name':'connect-redis',
    'main':undefined,
    'mainModuleId':'index',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(16, function(onejsModParent){
  return {
    'id':'lib/connect-redis',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
/*!
 * Connect - Redis
 * Copyright(c) 2012 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var redis = require('redis')
  , debug = require('debug')('connect:redis');
/**
 * One day in seconds.
 */
var oneDay = 86400;
/**
 * Return the `RedisStore` extending `connect`'s session Store.
 *
 * @param {object} connect
 * @return {Function}
 * @api public
 */
module.exports = function(connect){
  /**
   * Connect's Store.
   */
  var Store = connect.session.Store;
  /**
   * Initialize RedisStore with the given `options`.
   *
   * @param {Object} options
   * @api public
   */
  function RedisStore(options) {
    options = options || {};
    Store.call(this, options);
    this.prefix = null == options.prefix
      ? 'sess:'
      : options.prefix;
    this.client = options.client || new redis.createClient(options.port || options.socket, options.host, options);
    if (options.pass) {
      this.client.auth(options.pass, function(err){
        if (err) throw err;
      });    
    }
    if (options.db) {
      var self = this;
      self.client.select(options.db);
      self.client.on("connect", function() {
        self.client.send_anyways = true;
        self.client.select(options.db);
        self.client.send_anyways = false;
      });
    }
  };
  /**
   * Inherit from `Store`.
   */
  RedisStore.prototype.__proto__ = Store.prototype;
  /**
   * Attempt to fetch session by the given `sid`.
   *
   * @param {String} sid
   * @param {Function} fn
   * @api public
   */
  RedisStore.prototype.get = function(sid, fn){
    sid = this.prefix + sid;
    debug('GET "%s"', sid);
    this.client.get(sid, function(err, data){
      try {
        if (!data) return fn();
        data = data.toString();
        debug('GOT %s', data);
        fn(null, JSON.parse(data));
      } catch (err) {
        fn(err);
      } 
    });
  };
  /**
   * Commit the given `sess` object associated with the given `sid`.
   *
   * @param {String} sid
   * @param {Session} sess
   * @param {Function} fn
   * @api public
   */
  RedisStore.prototype.set = function(sid, sess, fn){
    sid = this.prefix + sid;
    try {
      var maxAge = sess.cookie.maxAge
        , ttl = 'number' == typeof maxAge
          ? maxAge / 1000 | 0
          : oneDay
        , sess = JSON.stringify(sess);
      debug('SETEX "%s" ttl:%s %s', sid, sess);
      this.client.setex(sid, ttl, sess, function(err){
        err || debug('SETEX complete');
        fn && fn.apply(this, arguments);
      });
    } catch (err) {
      fn && fn(err);
    } 
  };
  /**
   * Destroy the session associated with the given `sid`.
   *
   * @param {String} sid
   * @api public
   */
  RedisStore.prototype.destroy = function(sid, fn){
    sid = this.prefix + sid;
    this.client.del(sid, fn);
  };
  return RedisStore;
};
    }
  };
});
horseDatastore.module(16, function(onejsModParent){
  return {
    'id':'index',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      
module.exports = require('./lib/connect-redis');
    }
  };
});
horseDatastore.pkg(1, function(parent){
  return {
    'id':17,
    'name':'nohm',
    'main':undefined,
    'mainModuleId':'nohm',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(17, function(onejsModParent){
  return {
    'id':'properties',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var Nohm = null;
exports.setNohm = function (originalNohm) {
  Nohm = originalNohm;
};
/**
 *  Get or set a property.
 *  This automatically invokes typecasting and behaviours.
 */
exports.property = function property(key, val) {
  if (arguments.length > 2 || (typeof(key) === 'object' && typeof(val) === 'boolean')) {
    // TODO: remove this warning
    Nohm.logError('Deprecated: .property() does not support immediate validation anymore.');
  }
  var tmp;
  var old;
  var res = {};
  var p;
  if (typeof key === 'object') {
    for (p in key) {
      if (key.hasOwnProperty(p)) {
        res[p] = this.p(p, key[p]);
      }
    }
    return res;
  }
  if (!this.properties[key]) {
    Nohm.logError('Trying to access undefined property "'+key+
      '" of object "'+this.modelName+'" with id:'+this.id+'.');
    return false;
  }
  tmp = this.properties[key];
  if (typeof val === 'undefined') {
    return tmp.type === 'json' ? JSON.parse(tmp.value) : tmp.value;
  } else if (val !== tmp.value) {
    tmp = this.properties[key];
    old = tmp.value;
    tmp.value = this.__cast(key, val, old);
    tmp.__updated = tmp.value !== tmp.__oldValue;
  }
  return tmp.value;
};
/**
 * Alias for Nohm.property()
 * @name p
 * @methodOf Nohm
 * @see Nohm.property
 */
/**
 * Alias for Nohm.property()
 * @name prop
 * @methodOf Nohm
 * @see Nohm.property
 */
exports.p = exports.prop = exports.property;
/**
 * Resets the property meta data. Should be called internally after saving.
 */
exports.__resetProp = function resetProp(p) {
  var tmp = this.properties[p];
  tmp.__updated = false;
  tmp.__oldValue = tmp.value;
  tmp.__numericIndex = Nohm.indexNumberTypes.indexOf(tmp.type) > -1 && !tmp.noscore;
};
/**
   *  Casts a property to a certain datatype. (Might cause unexpected results.
   *  Behaviours offer greater control over what happens.)
   *  Currently supported:
   *  string,
   *  integer,
   *  float,
   *  timestamp (time/date string or number to unix timestamp),
   *  json
   */
exports.__cast = function __cast(key, value, old) {
  if (!this.properties[key]) {
    Nohm.logError('Trying to access undefined property "' +
    key + '" of object "' + this.modelName + '".');
    return false;
  }
  var type = this.properties[key].type,
    timezoneOffset,
    matches,
    hours,
    minutes;
    
  if (typeof (type) === 'undefined') {
    return value;
  }
  if (typeof (type) === 'function') {
    return type.call(this, value, key, old);
  }
  
  switch (type.toLowerCase()) {
  case 'boolean':
  case 'bool':
    return value === 'false' ? false : !!value;
  case 'string':
  case 'string':
    // no .toString() here. TODO: or should there be?
    return (
            (!(value instanceof String) ||
             value.toString() === '') && typeof value !== 'string'
            ) ? ''
              : value;
  case 'integer':
  case 'int':
    return isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10);
  case 'float':
    return isNaN(parseFloat(value)) ? 0 : parseFloat(value);
  case 'date':
  case 'time':
  case 'timestamp':
    // make it a timestamp aka. miliseconds from 1970
    if (isNaN(value) && typeof value === 'string') {
      // see if there is a timezone specified in the string
      matches = value.match(/(\+|\-)([\d]{1,2})\:([\d]{2})$/);
      if (value.match(/Z$/)) {
        // UTC timezone in an ISO string (hopefully)
        timezoneOffset = 0;
      } else if (matches) {
        // +/- hours:minutes specified.
        // calculating offsets in minutes and removing the offset from the string since new Date() can't handle those.
        hours = parseInt(matches[2], 10);
        minutes = parseInt(matches[3], 10);
        if (matches[1] === '-') {
          timezoneOffset = -1 * (hours * 60 + minutes);
        } else {
          timezoneOffset = hours * 60 - minutes;
        }
        value = value.substring(0, value.length - matches[0].length);
      } else {
        timezoneOffset = new Date(value).getTimezoneOffset();
      }
      return new Date(value).getTime() - timezoneOffset * 60 * 1000;
    }
    return parseInt(value, 10);
  case 'json':
    if (typeof (value) === 'object') {
      return JSON.stringify(value);
    } else {
      try {
        // already is json, do nothing
        JSON.parse(value);
        return value;
      } catch (e) {
        return JSON.stringify(value);
      }
    }
  default:
    return value;
  }
};
/**
 * Get an array of all properties that have been changed.
 */
exports.propertyDiff = function propertyDiff(key) {
  var diff = [],
  p;
  if (key && !this.properties[key]) {
    throw 'Invalid key specified for diffProperty';
  }
  for (p in this.properties) {
    if (!key || p === key) {
      if (this.properties[p].__updated) {
        diff.push({
          key: p,
          before: this.properties[p].__oldValue,
          after: this.properties[p].value
        });
      }
    }
  }
  return diff;
};
/**
 *  Resets the values of all or one propert(y/ies).
 */
exports.propertyReset = function propertyReset(key) {
  if (key && !this.properties[key]) {
    throw 'Invalid key specified for diffProperty';
  }
  for (var p in this.properties) {
    if (!key || p === key) {
      this.properties[p].__updated = false;
      this.properties[p].value = this.properties[p].__oldValue;
    }
  }
  return true;
};
/**
 *  Get all properties with values either as an array or as json (param true)
 */
exports.allProperties = function allProperties(json) {
  var props = {},
  p;
  for (p in this.properties) {
    if (this.properties.hasOwnProperty(p)) {
      props[p] = this.p(p);
    }
  }
  props.id = this.id;
  return json ? JSON.stringify(props) : props;
};
    }
  };
});
horseDatastore.module(17, function(onejsModParent){
  return {
    'id':'validation',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var Nohm = null;
exports.setNohm = function (originalNohm) {
  Nohm = originalNohm;
  Nohm.__validators = validators;
};
var async = require('async');
var util = require('util');
var h = require(__dirname + '/helpers');
var validators = require(__dirname + '/validators').validators;
/**
 *  Check if one or all propert(y/ies) are valid.
 * @see Validators
 */
exports.valid = function valid(key, setDirectly) {
  var p;
  var self = this;
  var noKeySpecified = !key || typeof(key) === 'function';
  var callback = h.getCallback(arguments);
  var parallel =  [];
  key = typeof(key) === 'string' ? key : false;
  setDirectly = typeof(setDirectly) === 'boolean' ? setDirectly : false;
  
  for (p in this.properties) {
    if (noKeySpecified || key === p) {
      parallel = parallel.concat(this.__validateProperty(p));
    }
  }
  async.parallel(parallel, function (error, results) {
    var validbool = results.indexOf(false) === -1;
    if (error) {
      Nohm.logError('Some validation caused an error');
    }
    
    if ( ! validbool) {
      // if others failed we must not set unique locks directly
      setDirectly = false;
    }
    
    self.__checkUniques(setDirectly, function (success) {
  
      if ( ! success) {
        validbool = false;
      }
      callback(validbool);
    }, key);
  });
};
/**
 *  Check whether all properties marked as unique have a value that is not set in the database yet.
 *  If setDirectly is set, it will occupy the unique in the db directly.
 *  Use setDirectly if you're saving the object to prevent race-conditions.
 */
exports.__checkUniques = function __checkUniques(setDirectly, saveCallback, p) {
  setDirectly = setDirectly || false;
  var tmp = this.properties,
  self = this,
  tmpUniques = [],
  success = true,
  client = self.getClient(),
  uniqueLocker = function uniqueLocker(propName, callback) {
    if (tmp[propName].unique && // is marked as unique
      (!p || propName === p) && // if all props are to be checked or the current one matches the 1
      tmp[propName].value !== '' &&
      (tmp[propName].__updated || !self.__inDB)) {
      var propLower = tmp[propName].type === 'string' ? self.p(propName).toLowerCase() : self.p(propName);
      var unique_key = Nohm.prefix.unique + self.modelName + ':' + propName + ':' + propLower;
      var checkCallback = function (err, value) {
        if (setDirectly && value) {
          tmpUniques.push(unique_key);
        }
        if (!setDirectly) {
          // client.exists returns 1 if the value exists, client.setnx returns 1 if the value did not exist.
          // what we pass to the callback is whether the property has a unique value or if it already exists.
          // that means if we used exists we have to use the opposite of the returned value.
          value = !value;
        }
        callback(err, {
          p: propName,
          unique: value
        });
      };
      
      if (setDirectly) {
        /*
         * We lock the unique value here if it's not locked yet, then later remove the old uniquelock when really saving it. (or we free the unique slot if we're not saving)
         */
        client.setnx(unique_key, self.id, checkCallback);
      } else {
        client.exists(unique_key, checkCallback);
      }
    } else {
      callback(null, null);
    }
  };
  if (setDirectly && !self.id) {
    Nohm.logError('Checking AND setting uniques without having an id set. self:' + require('util').inspect(self));
  }
  
  async.map(Object.keys(tmp), uniqueLocker, function (err, arr) {
    if (Array.isArray(arr) && arr.length > 0) {
      arr.forEach(function(val) {
        if (val && ! val.unique) {
          self.errors[val.p].push('notUnique');
          success = false;
        }
      });
    }
    
    if (setDirectly && ! success) {
      if (Array.isArray(tmpUniques) && tmpUniques.length > 0) {
        tmpUniques.forEach(function(val) {
          // delete tmp unique locks since the new values won't be saved.
          client.del(val, self.logError);
        });
      }
    }
    saveCallback(success);
  });
};
/**
 *  Set the real id of the unique values.
 */
exports.__setUniqueIds = function __setUniqueIds(id, cb) {
  var p,
  args = [];
  for (p in this.properties) {
    if (this.properties.hasOwnProperty(p) && this.properties[p].unique &&
      this.properties[p].value !== '' &&
      (this.properties[p].__updated || !this.__inDB)) {
        var val = this.properties[p].type === 'string' ? this.p(p).toLowerCase() : this.p(p);
        args.push(Nohm.prefix.unique + this.modelName + ':' + p + ':' + val);
        args.push(id);
    }
  }
  
  if (args.length > 0) {
    this.getClient().mset(args, cb);
  } else {
    cb();
  }
};
/**
 * Returns an array of functions that validate a given property.
 * 
 * Important: Any changes here should proably be done in validators.js for the browser validation functions as well!
 */
exports.__validateProperty = function __validateProperty(p) {
  if (!p || !this.properties[p]) {
    nohm.logError('Trying to validate undefined property or accessing __validateProperty without giving a property');
  }
  if (!this.properties[p].validations) {
    return [];
  }
  var self = this;
  this.errors[p] = [];
  var value = this.properties[p].value;
  var validations = this.properties[p].validations;
  var options = {
    old: this.properties[p].__oldValue,
    optional: false,
    trim: true
  };
  var wrap = function (func, options, name) {
    return function (cb) {
      if (options.optional && !value) {
        return cb(null, true);
      }
      var called = false;
      var res = func(value, options, function (result) {
        if (!result) {
          self.errors[p].push(name);
        }
        if (!called) {
          cb(null, !!result);
        }
      });
      if (typeof(res) !== 'undefined') {
        Nohm.logError('Deprecated: Synchronous validation: '+name);
        called = true;
        cb(null, res);
      }
    };
  };
  
  return validations.map(function (i) {
    if (typeof i === 'function') {
      // simple function
      var funcName = i.toString().match(/^function ([\w]*)[\s]?\(/);
      var errorName = 'custom_'+ (funcName[1] ? funcName[1] : p);
      
      return wrap(i, options, errorName);
    } else if (typeof i === 'string') {
      // simple string
      if (!Nohm.__validators[i]) {
        Nohm.logError('Trying to access unavailable validator.');
      }
      return wrap(Nohm.__validators[i], options, i);
    } else if (i instanceof Array && i.length > 0) {
      /* 
      array containing string and options: 
      [ 'someValidtaor', {
          someOption: false
        }
      ]
      */
      if (!Nohm.__validators[i[0]]) {
        Nohm.logError('Trying to access unavailable validator.');
      }
      var localOptions = h.$extend(true, {}, options, i[1]);
      return wrap(Nohm.__validators[i[0]], localOptions, i[0]);
    } else {
      Nohm.logError('Invalid validation definition for property "'+p+'": '+util.inspect(i));
    }
  });
};
    }
  };
});
horseDatastore.module(17, function(onejsModParent){
  return {
    'id':'pubsub',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var Nohm = null;
exports.setNohm = function (originalNohm) {
  Nohm = originalNohm;
  initialize();
};
var EventEmitter = require('events').EventEmitter;
var h = require(__dirname + '/helpers');
/**
 * Seperate redis client for pubSub.
 */
var pub_sub_client = false;
var pub_sub_all_pattern = false;
var pub_sub_event_emitter = false;
var do_publish = false;
var is_subscribed = false;
/**
 *  Publish something on the nohm client.
 */
var publish = function (channel, payload, parse) {
  var message;
  var client = Nohm.client;
  if (parse || typeof payload !== 'string') {
    message = JSON.stringify(payload);
  }
  if (!client) {
    Nohm.logError("No redis client specified. Please provide one (Nohm.setClient()).");
  } else if (!client.publish) {
    Nohm.logError("Specified client does not support pubsub.");
  } else {
    client.publish( Nohm.prefix.channel + channel, message );
  }
};
var initializePubSub = function initializePubSub (callback) {
    
  if (!pub_sub_client) {
    return Nohm.logError('A second redis client must be specified to use pub/sub methods. Please declare one.');
  } else if (is_subscribed === true) {
    // already in pubsub mode, don't need to initialize it again.
    if (typeof(callback) === 'function') {
      callback();
    }
    return;
  }
  
  is_subscribed = true;
  
  pub_sub_all_pattern = Nohm.prefix.channel + '*:*';
  pub_sub_event_emitter = new EventEmitter();
  pub_sub_event_emitter.setMaxListeners(0);
  pub_sub_client.psubscribe(pub_sub_all_pattern, callback);
  pub_sub_client.on('pmessage', function(pattern, channel, message){
    var modelName;
    var action;
    var payload;
    var suffix = channel.slice(Nohm.prefix.channel.length);
    var parts = suffix.match(/([^:]+)/g); // Pattern = _prefix_:channel:_modelname_:_action_
    if (!parts) {
      Nohm.logError("An erroneous channel has been captured.");
      return;
    }
    modelName = parts[0];
    action = parts[1];
    payload = {};
    try {
      payload = message ? JSON.parse(message) : {};
    } catch (e) {
      Nohm.logError('A published message is not valid JSON. Was : "'+message+'"');
      return;
    }
  
    pub_sub_event_emitter.emit(modelName+':'+action, payload);
    //pub_sub_event_emitter.emit(modelName+':all', action, payload);
  });
};
var initialize = function () {
  /**
   * Set the pubSub client and initialize the subscriptions and event emitters.
   * 
   * @param {Object} client Redis client to use. This client will be set to pubSub and cannot be used for normal commands after that.
   * @param {Function} callback Called after the provided redis client is subscribed to the necessary channels.
   */
  Nohm.setPubSubClient = function (client, callback) {
    pub_sub_client = client;
    Nohm.closePubSub(function () {
      initializePubSub(callback);
    });
  };
  /**
   * Return the PubSub Client, if set.
   */
  Nohm.getPubSubClient = function () {
    return pub_sub_client;
  };
  /**
   * Unsubscribes from the nohm redis pubsub channel.
   * 
   * @param {Function} callback Called after the unsubscibe. Parameters: redisClient
   */
  Nohm.closePubSub = function closePubSub (callback) {
    if (is_subscribed === true) {
      is_subscribed = false;
      pub_sub_client.punsubscribe(pub_sub_all_pattern, function () {
        callback(null, pub_sub_client);
      });
    } else {
      callback(null, pub_sub_client);
    }
  };
 
  var messageComposers = {
    // The default (base) message creator
    defaultComposer: function defaultComposer (action) {
      return {
        target: {
          id: this.id,
          modelName: this.modelName,
          properties: this.allProperties()
        }
      };
    }
  };
  // This populates the diff property for `save` and `update` events.
  messageComposers.save = messageComposers.update = function changeComposer (action, diff) {
    var result = messageComposers.defaultComposer.apply(this, arguments);
    result.target.diff = diff;
    return result;
  };
  // This sets the id and properties
  messageComposers.remove = function removeComposer (action, id) {
    var result = messageComposers.defaultComposer.apply(this, arguments);
    result.target.id = id;
    return result;
  };
  messageComposers.link = messageComposers.unlink = function relationComposer (action, parent, relationName) {
    var result = {};
    result.child = messageComposers.defaultComposer.call(this, action).target;
    result.parent = messageComposers.defaultComposer.call(parent, action).target;
    result.relation = relationName;
    return result;
  };
  var supportedActions = [ 'create', 'update', 'save', 'remove', 'unlink', 'link' ];
  
  /**
   * Fires an event to be published to the redis db by the internal publisher.
   * 
   * @param {String} event Name of the event to be published. Allowed are: [ 'create', 'update', 'save', 'remove', 'unlink', 'link' ]
   */
  Nohm.prototype.fireEvent = function (event) {
    var channel;
    var composer;
    var payload;
    var supported;
    
    if ( ! this.getPublish() ) {
      // global or model specific setting for publishing events is false.
      return false;
    }
    if (supportedActions.indexOf(event) < 0) {
      supported = supportedActions.join(', ');
      Nohm.logError(
        'Cannot fire an unsupported action. Was "' + event + '" ' +
        'and must be one of ' + supported
        );
      return false;
    }
    channel = this.modelName + ':' + event;
    composer = messageComposers[event] || messageComposers.defaultComposer;
    payload = composer.apply(this, arguments);
    publish(channel, payload);
  };  
  
  /**
   * Set global boolean to publish events or not.
   * By default publishing is disabled globally.
   * The model-specific setting overwrites the global setting.
   * 
   * @param {Boolean} publish Whether nohm should publish its events.
   */
  Nohm.setPublish = function (publish) {
    do_publish = !!publish;
  }
  
  /**
   * Get the model-specific status of whether event should be published or not.
   * If no model-specific setting is found, the global setting is returned.
   * 
   * @returns {Boolean} True if this model will publish its events, False if not.
   */
  Nohm.prototype.getPublish = function () {
    if (this.hasOwnProperty('publish')) {
      return !!this.publish;
    }
    return do_publish;
  };
  /**
   * Subscribe to events of nohm models.
   * 
   * @param {String} event_name Name of the event to be listened to. Allowed are: [ 'create', 'update', 'save', 'remove', 'unlink', 'link' ]
   * @param {Function} callback Called every time an event of the provided name is published on this model.
   */
  Nohm.prototype.subscribe = function (event_name, callback) {
    var self = this;
    initializePubSub(function () {
      pub_sub_event_emitter.on(self.modelName+':'+event_name, callback);
    });
  };
  /**
   * Subscribe to an event of nohm models only once.
   * 
   * @param {String} event_name Name of the event to be listened to. Allowed are: [ 'create', 'update', 'save', 'remove', 'unlink', 'link' ]
   * @param {Function} callback Called once when an event of the provided name is published on this model and then never again.
   */
  Nohm.prototype.subscribeOnce = function (event_name, callback) {
    var self = this;
    initializePubSub(function () {
      pub_sub_event_emitter.once(self.modelName+':'+event_name, callback);
    });
  };
  /**
   * Unsubscribe from a nohm model event.
   * 
   * @param {String} event_name Name of the event to be unsubscribed from. Allowed are: [ 'create', 'update', 'save', 'remove', 'unlink', 'link' ]
   * @param {Function} fn Function to unsubscribe. If none is provided all subscriptions of the given event are unsubscribed!
   */
  Nohm.prototype.unsubscribe = function (event_name, fn) {
    if (pub_sub_event_emitter !== false) {
      if (! fn) {
        pub_sub_event_emitter.removeAllListeners(self.modelName+':'+event_name);
      } else {
        pub_sub_event_emitter.removeListener(self.modelName+':'+event_name, fn);
      }
    }
  };
};
    }
  };
});
horseDatastore.module(17, function(onejsModParent){
  return {
    'id':'validators',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      (function (exports, undefined) {
var regexps = exports.regexps = {
  url: /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
  email: /^.+@.+\..+/i
};
/**
 * @namespace Validators
 */
var validators = exports.validators = {
  // most of these are copied from the jquery validation plugin http://code.google.com/p/bassistance-plugins/source/browse/trunk/plugins/validate/jquery.validate.js
  /**
   * Make sure a value is not empty.
   */
  notEmpty: function notEmpty(value, options, callback) {
    if (typeof(value) === 'string'  && options.trim) {
      value = value.trim();
    }
    callback(!!value);
  },
  
  /**
   * String length must be between options.min (default 0) and options.max (default positive infinity).
   */
  length: function length(value, options, callback) {
    if (options.trim) {
      ('' + value).trim();
    }
    
    var min = value.length >= (options.min || 0);
    var max = value.length <= (options.max || Number.POSITIVE_INFINITY);
    callback(min && max);
  },
  /**
   * Make sure a number value is between (inclusive) options.min (default: 0) and options.max (default: POSITIVE_INFINITY)
   */
  minMax: function minMax(value, options, callback) {
    value = +value;
    
    var min = value >= (options.min || 0);
    var max = value <= (options.max || Number.POSITIVE_INFINITY);
    callback(min && max);
  },
  /**
   * Make sure a value is a valid email adress.
   */
  email: function email(value, options, callback) {
    callback(regexps.email.test(value));
  },
  /**
   * Make sure a value is a valid url.
   */
  url: function url(value, options, callback) {
    callback(regexps.url.test(value));
  },
  /**
   * Make sure a value is a date that the Date object can parse.
   * Can be optional.
   */
  date: function date(value, options, callback) {
    callback(!/Invalid|NaN/.test(new Date(value)));
  },
  /**
   * Make sure a value is a valid ISO Date (YYYY-MM-DD) or is optional (params[0]) and empty
   */
  dateISO: function dateISO(value, options, callback) {
    callback(/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(value));
  },
  /**
   * Make sure a value is a valid US number (thousands seperator comma, decimal seperator point) string or is optional (params[0]) and empty
   */
  numberUS: function numberUS(value, options, callback) {
    callback(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value));
  },
  /**
   * Make sure a value is a valid EU number (thousands seperator point, decimal seperator comma) string or is optional (params[0]) and empty
   */
  numberEU: function numberEU(value, options, callback) {
    callback(/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:\,\d+)?$/.test(value));
  },
  /**
   * Make sure a value is a valid SI number (thousands seperator space, decimal seperator point or comma) string or is optional (params[0]) and empty
   */
  numberSI: function numberSI(value, options, callback) {
    callback(/^-?(?:\d+|\d{1,3}(?: \d{3})+)(?:[\,\.]\d+)?$/.test(value));
  },
  /**
   * Make sure a value is a valid (SI, US or EU) number string or is optional (params[0]) and empty
   */
  number: function number(value, options, callback) {
    callback(/^-?(?:\d+|\d{1,3}(?:[ ,\.]\d{3})+)(?:[\,\.]\d+)?$/.test(value));
  },
  /**
   * Please don't use this. Cast your property to an integer.
   *
   * The only valid use of this is a string of so many digits that an int can't hold it anymore. Why would you want to do that?
   */
  digits: function digits(value, options, callback) {
    callback(/^\d+$/.test(value));
  },
  /**
   * Test if the value is alphanumeric or optional (params[0]) and empty
   */
  alphanumeric: function alphanumeric(value, options, callback) {
    callback(/^[\w]+$/.test(value));
  },
  /**
   * Test if the value matches the provided regexp or optional (params[0]) and empty
   */
  regexp: function regexp(value, options, callback) {
    if (options.regex instanceof RegExp) {
      callback(options.regex.test(value));
    } else {
      callback(new RegExp(options.regex).test(value));
    }
  }
};
if (typeof(window) !== 'undefined' && typeof(nohmValidationsNamespaceName) !== 'undefined') {
  // we're in a browser and have a defined namespace
  var nohm = window[nohmValidationsNamespaceName];
  
  // get extra validators
  for (var i in nohm.extraValidations) {
    for (var name in nohm.extraValidations[i]) {
      if (nohm.extraValidations[i].hasOwnProperty(name)) {
        validators[name] = nohm.extraValidations[i][name];
      }
    }
  }
  
  
  var validateProperty = function (key, value, validations, cb) {
    var options = {
      optional: false,
      trim: true
    };
    
    var funcs = [];
    
    var wrap = function (func, options, name) {
      funcs.push(function () {
        if (options.optional && !value) {
          return cb(key, true);
        }
        func(value, options, function (result) {
          cb(key, result, name);
        });
      });
    };
    
    for (var i = 0, len = validations.length; i < len; i++) {
      var val = validations[i];
      
      if (typeof val === 'string') {
        // simple string
        if ( ! validators[val]) {
          throw new Error('Trying to access unavailable validator.');
        }
        wrap(validators[val], options, val);
      } else if (val instanceof Array && val.length > 0) {
        /* 
        array containing string and options: 
        [ 'someValidtaor', {
            someOption: false
          }
        ]
        */
        if ( ! validators[val[0]]) {
          throw new Error('Trying to access unavailable validator.');
        }
        var localOptions = $extend(true, {}, options, val[1]);
        wrap(validators[val[0]], localOptions, val[0]);
      } else {
        throw new Error('Invalid validation definition for property "'+key+'":'+val);
      }
    }
    
    return funcs;
    
  };
  
  nohm.nohmValidations = validators;
  nohm.validate = function (modelName, data, callback) {
    if (typeof(modelName) === 'undefined' || typeof(data) === 'undefined' || typeof(callback) !== 'function') {
      throw new Error('Invalid input passed to nohm validate() function. Needs a modelname, a data object and a callback.');
    }
    
    if ( ! nohm.models.hasOwnProperty(modelName)) {
      throw new Error('Invalid modelName passed to nohm or model was not properly exported.');
    }
    
    var model = nohm.models[modelName];
    var errors = {};
    var failed = false;
    var dispatched = 0;
    var doneCount = 0;
    var funcs = [];
    var validCallback = function (key, valid, errorName) {
      if ( ! valid) {
        failed = true;
        if ( ! errors.hasOwnProperty(key)) {
          errors[key] = [];
        }
        errors[key].push(errorName);
      }
      if (++doneCount >= dispatched) {
        done();
      }
    };
    var done = function () {
      done = function() {}; // just to be sure :D
      callback(!failed, errors);
    };
    for (var key in data) {
      if (data.hasOwnProperty(key) && model.hasOwnProperty(key)) {
        var innerFuncs = validateProperty(key, data[key], model[key], validCallback);
        for (var len = innerFuncs.length, i = 0; i < len; i++) {
          funcs.push(innerFuncs[i]);
        }
      }
    }
    dispatched = funcs.length;
    if (dispatched === 0) {
      return done();
    }
    for (var i = 0; i < dispatched; i++) {
      if (typeof(funcs[i]) === 'function') {
        funcs[i](); // this makes sure we first know how many funcs we have before we call them, thus not calling done() too early if all validators are instant
      } else {
        throw new Error('There were invalid validators');
      }
    }
  };
  
  
  /**
   * This extends an object with x other objects.
   * @see http://api.jquery.com/jQuery.extend/
   */
  var $extend = function() {
    var options, name, src, copy, copyIsArray, clone,
    target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false;
    
    // Handle a deep copy situation
    if ( typeof target === "boolean" ) {
      deep = target;
      target = arguments[1] || {};
      // skip the boolean and the target
      i = 2;
    }
    
    // Handle case when target is a string or something (possible in deep copy)
    if ( typeof target !== "object" && typeof(target) == 'function') {
      target = {};
    }
    
    for ( ; i < length; i++ ) {
      // Only deal with non-null/undefined values
      if ( (options = arguments[ i ]) !== null ) {
      // Extend the base object
        for ( name in options ) {
          if (options.hasOwnProperty(name)) { 
            src = target[ name ];
            copy = options[ name ];
    
            // Prevent never-ending loop
            if ( target === copy ) {
              continue;
            }
      
            // Recurse if we're merging plain objects or arrays
            if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) ) ) {
              if ( copyIsArray ) {
                copyIsArray = false;
                clone = src && Array.isArray(src) ? src : [];
      
              } else {
                clone = src && isPlainObject(src) ? src : {};
              }
      
              // Never move original objects, clone them
              target[ name ] = Helper.$extend( deep, clone, copy );
      
            // Don't bring in undefined values
            } else if ( copy !== undefined ) {
              target[ name ] = copy;
            }
          }
        }
      }
    }
  
    // Return the modified object
    return target;
  };
  
  // from jquery as well
  var isPlainObject = function( obj ) {
    // Not own constructor property must be Object
    if ( obj.constructor &&
      !obj.hasOwnProperty("constructor") &&
      !obj.constructor.prototype.hasOwnProperty("isPrototypeOf") ) {
      return false;
    }
    
    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.
    
    var key;
    for ( key in obj ) {}
    
    return key === undefined ||  obj.hasOwnProperty(key);
  };
}
})(typeof(exports) === 'undefined'? {} : exports);
    }
  };
});
horseDatastore.module(17, function(onejsModParent){
  return {
    'id':'helpers',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /**
 * Helper functions that are used throughout nohm
 * @namespace
 */
var Helper = {};
/**
 * This extends an object with x other objects.
 * @see http://api.jquery.com/jQuery.extend/
 */
Helper.$extend = function() {
  var options, name, src, copy, copyIsArray, clone,
  target = arguments[0] || {},
  i = 1,
  length = arguments.length,
  deep = false;
  // Handle a deep copy situation
  if ( typeof target === "boolean" ) {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }
  // Handle case when target is a string or something (possible in deep copy)
  if ( typeof target !== "object" && typeof(target) == 'function') {
    target = {};
  }
  for ( ; i < length; i++ ) {
    // Only deal with non-null/undefined values
    if ( (options = arguments[ i ]) !== null ) {
    // Extend the base object
      for ( name in options ) {
        if (options.hasOwnProperty(name)) {
          src = target[ name ];
          copy = options[ name ];
          // Prevent never-ending loop
          if ( target === copy ) {
            continue;
          }
          // Recurse if we're merging plain objects or arrays
          if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) ) ) {
            if ( copyIsArray ) {
              copyIsArray = false;
              clone = src && Array.isArray(src) ? src : [];
            } else {
              clone = src && isPlainObject(src) ? src : {};
            }
            // Never move original objects, clone them
            target[ name ] = Helper.$extend( deep, clone, copy );
          // Don't bring in undefined values
          } else if ( copy !== undefined ) {
            target[ name ] = copy;
          }
        }
      }
    }
  }
	// Return the modified object
	return target;
};
var isPlainObject = function( obj ) {
	// Not own constructor property must be Object
	if ( obj.constructor &&
		!obj.hasOwnProperty("constructor") &&
		!obj.constructor.prototype.hasOwnProperty("isPrototypeOf") ) {
		return false;
	}
	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for ( key in obj ) {}
	return key === undefined ||  obj.hasOwnProperty(key);
};
// redis.multi returns QUEUED on successfully queing a command.
Helper.__expectQueued = function __expectQueued(err, value) {
  if (value.toString() !== 'QUEUED') {
    ModelClass.logError('Queing of multi/exec failed. returned value: ' + value.toString());
  }
};
// extend a given object with the given prototypes
Helper.prototypeModule = function (obj, protos) {
  for (var proto in protos) {
    if (protos.hasOwnProperty(proto)) {
      obj.prototype[proto] = protos[proto];
    }
  }
  return obj;
};
/**
 * Get an object containing all the prefixes for the different key types.
 */
Helper.getPrefix = function (defaultPrefix) {
  var prefix = null;
  var obj;
  if (prefix === null)
    prefix = defaultPrefix;
  obj = {
    ids: prefix + ':ids:',
    idsets: prefix + ':idsets:',
    hash: prefix + ':hash:',
    unique: prefix + ':uniques:',
    scoredindex: prefix + ':scoredindex:',
    index: prefix + ':index:',
    relations: prefix + ':relations:',
    relationKeys: prefix + ':relationKeys:',
    meta: prefix + ':meta:',
    channel: prefix + ':channel:'
  };
  return obj;
};
/**
 * Get the intersection of 2 or more id arrays.
 * @param {Array[]} Arrays The arrays (containing ids) you want to check
 */
Helper.idIntersection = function idIntersection(first) {
  var ret = first,
      empty = false;
  Array.prototype.slice.call(arguments, 1).forEach(function (arr) {
    if ( ! Array.isArray(arr) ) {
      throw new Error('intersections received non-array argument');
    }
    if (arr.length === 0) {
      empty = true;
    }
    if (empty || arr === ret) {
      return false;
    }
    ret = arr.filter(function(value) {
      return value && ret.indexOf(value) !== -1;
    });
    if (ret.length === 0) {
      empty = true;
    }
  });
  return empty ? [] : ret;
};
/**
 *  Checks if the last item in the given array is a function and returns that or an empty function.
 */
Helper.getCallback = function getCallback(args) {
  if (args.length >= 1 &&
      typeof args[args.length - 1] === 'function') {
    return args[args.length - 1];
  } else {
    return function () {};
  }
};
/**
 * Checks whether 2 (nohm) objects are the same.
 */
Helper.checkEqual = function checkEqual(obj1, obj2) {
  if (!obj1 || (obj1 && !obj2)) {
    return false;
  }
  if (obj1 === obj2) {
    return true;
  }
  else if (obj1.hasOwnProperty('modelName') && obj2.hasOwnProperty('modelName') &&
           obj1.modelName === obj2.modelName) {
    // if both have been saved, both must have the same id.
    if (obj1.id && obj2.id && obj1.id === obj2.id) {
      return true;
    }
    else if (obj1.id && obj2.id) { // both have been saved but do not share the same id -> must be different.
      return false;
    }
    // if both have exactly the same properties (and at most one has been saved - see above)
    if (obj1.allProperties(true) === obj2.allProperties(true)) {
      return true;
    }
  }
  return false;
};
module.exports = Helper;
    }
  };
});
horseDatastore.module(17, function(onejsModParent){
  return {
    'id':'store',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var Nohm = null;
exports.setNohm = function (originalNohm) {
  Nohm = originalNohm;
};
var async = require('async'),
    h = require(__dirname + '/helpers');
var noop = function () {};
/**
 *  Saves the object by either creating, or updating it.
 */
exports.save = function save(options) {
  var callback = h.getCallback(arguments);
  
  options = h.$extend({
    silent: false,
    continue_on_link_error: false
  }, options);
  var self = this,
    id_tries = 0,
    action = 'create';
  var generateId = function () {
    // this is only a temporary id. it's negative so there's a way to identify some
    // corrupted data if there's a redis failure between the first write of this
    // model and the id change to its final real id
    var id = new Date() * -1 + Math.ceil(Math.random()*1e6);
    id_tries++;
    self.exists(id, function (exists) {
      if (exists && id_tries < 500) {
        generateId();
      } else if ( ! exists) {
        _save(id);
      } else {
        Nohm.logError('Unable to find a new free id after 500 tries.');
        callback('no free id found');
      }
    });
  };
  var _save = function (id) {
    if (id) {
      self.id = id;
    }
    self.valid(false, true, function (valid) {
      if (!valid && typeof callback === 'function') {
        if (action === 'create') {
          self.id = null;
        }
        callback.call(self, 'invalid');
      } else if (valid && action === 'create') {
        __create.call(self, options, callback);
      } else if (valid) {
        __update.call(self, false, options, callback);
      }
    });
  };
  if (!this.id) {
    generateId();
  } else {
    self.exists(this.id, function (exists) {
      if (exists) {
        action = 'update';
      }
      _save();
    });
  }
};
var idGenerators = {
  'default': function (cb) {
    function rnd() {
      return Math.floor(Math.random() * 1e9).toString(36);
    }
    cb((+ new Date()).toString(36) + rnd() + rnd());
  },
  'increment': function (cb) {
    this.getClient().incr(Nohm.prefix.ids + this.modelName, function (err, newId) {
    if (!err) {
      cb(newId);
    } else {
      console.log('Nohm: Creating a new id by incrementing resulted in a client error: ' + util.inspect(err));
      if (typeof cb === 'function') {
        cb.call(self, err);
      } else {
        throw err;
      }
    }
  });
  }
};
var __generate_id = function (cb) {
  var generator = this.idGenerator;
  if (typeof(generator) === 'function') {
    generator.call(this, function (id) {
      if (!id) {
        Nohm.logError('A custom id generator for model '+this.modelName+' failed to provide an id.');
      }
      cb(id);
    });
  } else {
    if (! idGenerators.hasOwnProperty(generator)) {
      generator = 'default';
    }
    idGenerators[generator].call(this, cb);
  }
};
/**
 *  Creates a new empty (!) dataset in the database and calls __update to populate it.
 * @ignore
 */
var __create = function __create(options, callback) {
  var self = this;
  __generate_id.call(this, function (newId) {
    self.getClient().sadd(Nohm.prefix.idsets + self.modelName, newId, function (err) {
      if (err) { Nohm.logError(err); }
      self.__setUniqueIds(newId, function (err) {
        if (err) { Nohm.logError(err); }
        self.id = newId;
        __update.call(self, true, options, callback);
      });
    });
  });
};
exports.__index = function __index(p, client) {
  var prefix;
  client = client || this.getClient();
  if (this.properties[p].__numericIndex) {
    // we use scored sets for things like "get all users older than 5"
    prefix = Nohm.prefix.scoredindex + this.modelName;
    if (this.__inDB) {
      client.zrem(prefix + ':' + p, this.id, Nohm.logError);
    }
    client.zadd(prefix + ':' + p, this.properties[p].value, this.id, Nohm.logError);
  }
  prefix = Nohm.prefix.index + this.modelName;
  if (this.__inDB) {
    client.srem(prefix + ':' + p + ':' + this.properties[p].__oldValue, this.id, Nohm.logError);
  }
  client.sadd(prefix + ':' + p + ':' + this.properties[p].value, this.id, Nohm.logError);
};
/**
 *  Update an existing dataset with the new values.
 * @ignore
 */
var __update = function __update(all, options, callback) {
  options = h.$extend({
    silent: false,
    continue_on_link_error: false
  }, options);
  var p,
    hmsetArgs = [],
    isCreation = !this.__inDB,
    props = this.properties,
    self = this,
    multi = this.getClient().multi();
  hmsetArgs.push(Nohm.prefix.hash + this.modelName + ':' + this.id);
  for (p in props) {
    if (all || props[p].__updated) {
      hmsetArgs.push(p);
      hmsetArgs.push(props[p].value);
    }
  }
  if (hmsetArgs.length > 1) {
    multi.hmset.apply(multi, hmsetArgs);
  }
  for (p in props) {
    if (props.hasOwnProperty(p)) {
      // free old uniques
      if (props[p].unique === true && props[p].__updated) {
        if (self.__inDB) {
          multi.del(Nohm.prefix.unique + self.modelName + ':' + p + ':' + props[p].__oldValue, Nohm.logError);
        }
      }
      if (props[p].index === true && (!self.__inDB || props[p].__updated)) {
        self.__index(p, multi);
      }
    }
  }
  multi.exec(function (err) {
    if (typeof callback !== 'function' && err) {
      Nohm.logError('Nohm: Updating an object resulted in a client error: ' + err);
      throw err;
    } else if (err) {
      callback(err);
    } else {
      // we're using a serial forEach here because otherwise multiple objects 
      // may error out without notifying the callback
      // this way once one fails it goes to error directly except if options.continue_on_link_error is set to true
      async.forEachSeries(self.relationChanges,
        function (item, cb) {
          item.options.continue_on_link_error = options.continue_on_link_error;
          item.options.silent = options.silent;
          self['__' + item.action](item.object, item.options, function (err, child_fail, child_name) {
            item.callback.call(self,
                          item.action,
                          self.modelName,
                          item.options.name,
                          item.object);
            
            if (options.continue_on_link_error || !err) {
              cb();
            } else if (child_fail) {
              cb({ err: err, modelName: child_name});
            } else {
              cb({ err: err, modelName: item.object.modelName});
            }
          });
        },
        function (err) {
          if (typeof callback !== 'function' && err) {
            Nohm.logError('Nohm: Updating an object resulted in an error and no callback was provided: ' + err);
          } else if (err) {
            callback.call(self, err.err, true, err.modelName);
          } else {
            var diff;
            if (!options.silent && self.getPublish()) {
              // we only need the diff if we'll fire the change to pubsub
               diff = self.propertyDiff();
            }
            self.__inDB = true;
            for (var p in self.properties) {
              if (self.properties.hasOwnProperty(p)) {
                self.__resetProp(p);
              }
            }
            if (!options.silent) {
              if (isCreation) {
                self.fireEvent('create');
              } else {
                self.fireEvent('update', diff);
              }
              self.fireEvent('save', diff);
            }
            callback.call(self);
          }
        }
      );
    }
  });
};
/**
 *  Remove an objet from the database.
 *  Note: Does not destroy the js object or its properties itself!
 */
exports.remove = function remove(options) {
  var callback = h.getCallback(arguments);
  options = options && typeof options !== 'function' ? options : {};
  var self = this,
    silent = !!options.silent;
  if (!this.id) {
    return callback('The object you are trying to delete has no id.');
  } else if (!this.__inDB) {
    this.load(this.id, function (err) {
      if (err) {
        return callback(err);
      } else {
        return __realDelete.call(self, silent, callback);
      }
    });
  } else {
    return __realDelete.call(self, silent, callback);
  }
};
var __realDelete = function __realDelete(silent, callback) {
  var self = this;
  var p,
  id = self.id,
  multi = self.getClient().multi();
  multi.del(Nohm.prefix.hash + this.modelName + ':' + this.id);
  multi.srem(Nohm.prefix.idsets + this.modelName, this.id);
  for (p in this.properties) {
    if (this.properties.hasOwnProperty(p)) {
      if (this.properties[p].unique) {
        multi.del(Nohm.prefix.unique + this.modelName + ':' + p + ':' +
                  this.properties[p].__oldValue);
      }
      if (self.properties[p].index) {
        multi.srem(Nohm.prefix.index + self.modelName + ':' + p + ':' +
                   this.properties[p].__oldValue,
                   this.id);
      }
      if (self.properties[p].__numericIndex) {
        multi.zrem(Nohm.prefix.scoredindex + this.modelName + ':' + p,
                   this.id);
      }
    }
  }
  this.unlinkAll(multi, function () {
    multi.exec(function (err, values) {
      self.id = 0;
      if (!silent && !err) {
        self.fireEvent('remove', id);
      }
      if (typeof callback === 'function') {
        callback.call(self, err);
      } else {
        Nohm.logError(err);
      }
    });
  });
};
    }
  };
});
horseDatastore.module(17, function(onejsModParent){
  return {
    'id':'retrieve',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var Nohm = null;
exports.setNohm = function (originalNohm) {
  Nohm = originalNohm;
};
var async = require('async'),
    h = require(__dirname + '/helpers');
/**
 * Check if a given id exists in the DB.
 */
exports.exists = function (id, callback) {
  this.getClient().sismember(Nohm.prefix.idsets+this.modelName, id, function (err, found) {
    Nohm.logError(err);
    callback(!!found);
  });
};
var convertIdsToInt = function (ids, callback) {
  if (this.idGenerator === 'increment' && Array.isArray(ids)) {
    ids = ids.map(function (val) {
      return parseInt(val, 10);
    });
  }
  callback(ids);
}
/**
 * Retrieves the hash data by id and puts it into the properties.
 */
exports.load = function (id, callback) {
  var self = this;
  if (!id) {
    Nohm.logError('Trying to pass load() a wrong kind of id. Needs to be a number over 0. (still trying to load it though)');
  }
  this.getClient().hgetall(this.getHashKey(id), function (err, values) {
    var p, value,
        keys = Object.keys(values),
        return_props = {};
    if (err) {
      Nohm.logError('loading a hash produced an error: ' + err);
    }
    if (Array.isArray(keys) && keys.length > 0) {
      for (p in values) {
        if (values.hasOwnProperty(p) && self.properties.hasOwnProperty(p)) {
          value = values[p] !== null ? values[p].toString() : null;
          if (self.properties[p].load_pure) {
            self.properties[p].value = value;
          } else {
            self.p(p, value);
          }
          return_props[p] = self.p(p);
          self.__resetProp(p);
        } else if ( ! self.properties.hasOwnProperty(p)) {
          Nohm.logError('WARNING: A hash in the DB contained a key that is not in the model definition. This might be because of model changes or database corruption/intrusion.')
        }
      }
      self.id = id;
      self.__inDB = true;
      self.__loaded = true;
    } else if (!err) {
      err = 'not found';
    }
    if (typeof(callback) === 'function') {
      callback.call(self, err, return_props);
    }
  });
};
/**
 * Finds ids of objects by search arguments
 */
exports.find = function find(searches, callback) {
  var self = this, sets = [], zsetKeys = [], s, prop,
  returnFunction = function (err, values) {
    var found = [];
    Nohm.logError(err);
    if (Array.isArray(values) && values.length > 0) {
      values = values.forEach(function (val) {
        if (val) {
          found.push(val);
        }
      });
    } else if ( ! Array.isArray(values) && values !== null) {
      found = [values];
    } else if (values === null) {
      found = [];
    }
    convertIdsToInt(found, function (ids) {
      callback.call(self, err, ids);
    });
  },
  getSets = function (callback) {
    self.getClient().sinter(sets, callback);
  },
  getSingleZSet = function (zSet, callback) {
    var rangeCallback = function (err, values) {
      if (err) {
        callback(err);
      } else {
        callback(null, values);
      }
    };
    var options = zSet.options;
    if ( ! options.min && options.min !== 0)
      options.min = '-inf';
    if ( ! options.max && options.max !== 0)
      options.max = '+inf';
    if ( ! options.offset && options.offset !== 0)
      options.offset = '+inf';
    if (options.limit) {
      self.getClient().zrangebyscore(zSet.key, options.min, options.max,
                      'LIMIT', options.offset, options.limit,
                      rangeCallback);
    } else {
      self.getClient().zrangebyscore(zSet.key, options.min, options.max,
                      rangeCallback);
    }
  },
  getZSets = function (callback) {
    async.map(zsetKeys, getSingleZSet, function done (err, arr) {
      var ids = h.idIntersection.apply(null, arr);
      callback(err, ids);
    });
  };
  
  
  if (typeof searches === 'function') {
    callback = searches;
    searches = {};
  }
  for (s in searches) {
    if (searches.hasOwnProperty(s) && this.properties.hasOwnProperty(s)) {
      prop = this.properties[s];
      if (prop.unique) {
        if (prop.type === 'string') {
          if ( ! searches[s].toLowerCase) {
            return returnFunction('Invalid search parameters: Searching for a unique (type "string") with a non-string value is not supported.');
          }
          searches[s] = searches[s].toLowerCase()
        }
        var key = Nohm.prefix.unique+self.modelName+':'+s+':'+searches[s];
        return this.getClient().get([key], returnFunction);
      }
      var isNum = ! isNaN(parseInt(searches[s], 10));
      if (prop.index && ( ! prop.__numericIndex || isNum) ) {
        sets.push(Nohm.prefix.index + self.modelName + ':' + s + ':' + searches[s]);
      } else if (prop.__numericIndex) {
        zsetKeys.push({
          key: Nohm.prefix.scoredindex + self.modelName + ':' + s,
          options: searches[s]
        });
      }
    }
  }
  if (sets.length === 0 && zsetKeys.length === 0) {
    // no specific searches, retrieve all ids
    this.getClient().smembers(Nohm.prefix.idsets + this.modelName, returnFunction);
  } else if (zsetKeys.length === 0) {
    getSets(returnFunction);
  } else if (sets.length === 0) {
    getZSets(returnFunction);
  } else {
    getSets(function (err, setids) {
      getZSets(function (err2, zsetids) {
        if (err2) {
          err = [err, err2];
        }
        returnFunction(err, h.idIntersection(setids, zsetids).sort());
      });
    });
  }
};
exports.sort = function (options, ids) {
  var callback = h.getCallback(arguments);
  if ( ! Array.isArray(ids) || ids.length === 0) {
    ids = false;
  }
  options = typeof(options) !== 'function' && typeof(options) === 'object' && Object.keys(options).length > 0 ? options : {};
  
  if (ids.length > 0 && options === {}) {
    return callback(ids.sort());
  }
  
  if ( ! options.field || ! this.properties.hasOwnProperty(options.field)) {
    callback('invalid field in options', ids);
    return Nohm.logError('Invalid field in sort() options: ' + options.field);
  }
  
  var field_type = this.properties[options.field].type;
  
  var alpha = options.alpha ||  field_type === 'string' ? 'ALPHA' : '';
  var direction = options.direction ? options.direction : 'ASC';
  var scored = Nohm.indexNumberTypes.indexOf(field_type) !== -1;
  var start = 0;
  var stop = 100;
  if (Array.isArray(options.limit) && options.limit.length > 0) {
    start = options.limit[0];
    if (scored) { // the limit arguments for sets and sorted sets work differently
      // stop is a 0-based index from the start of all zset members
      stop = options.limit[1] ? start+options.limit[1] : start+stop;
      stop--;
    } else {
      // stop is a 1-based index from the defined start limit (the wanted behaviour)
      stop = options.limit[1] || stop;
    }
  }
  var idset_key = Nohm.prefix.idsets+this.modelName;
  var zset_key = Nohm.prefix.scoredindex+this.modelName+':'+options.field;
  var client = this.getClient();
  var tmp_key;
  
  if (ids) {
    // to get the intersection of the given ids and all ids on the server we first
    // temporarily store the given ids either in a set or sorted set and then return the intersection
    
    client = client.multi(); 
    
    if (scored) {
      tmp_key = zset_key+':tmp_sort:'+(+ new Date()) + Math.ceil(Math.random()*1000);
      var tmp_zadd_args = [tmp_key];
      ids.forEach(function (id) {
        tmp_zadd_args.push(0, id);
      });
      client.zadd(tmp_zadd_args);
      client.zinterstore([tmp_key, 2, tmp_key, zset_key]);
      zset_key = tmp_key;
    } else {
      tmp_key = idset_key+':tmp_sort:'+(+ new Date()) + Math.ceil(Math.random()*1000);
      ids.unshift(tmp_key);
      client.SADD(ids);
      client.SINTERSTORE([tmp_key, tmp_key, idset_key]);
      idset_key = tmp_key;
    }
  }
  if (scored) {
    sortScored.call(this, client, zset_key, direction, start, stop, callback);
  } else {
    sortNormal.call(this, client, idset_key, options.field, alpha, direction, start, stop, callback);
  }
  if (ids) {
    client.del(tmp_key);
    client.exec(Nohm.logError);    
  }
};
var sortNormal = function (client, idset_key, field, alpha, direction, start, stop, callback) {
  var hash_key = Nohm.prefix.hash+this.modelName;
  client.sort([idset_key, 
    'BY', hash_key+':*->'+field, 
    'LIMIT', start, stop,
    direction,
    alpha],
    callback);
};
var sortScored = function (client, zset_key, direction, start, stop, callback) {
  var method = direction && direction === 'DESC' ? 'ZREVRANGE' : 'ZRANGE';
  if (start < 0 || stop < 0) {
    Nohm.logError('Notice: tried to limit a scored sort with a negative start('+start+') or stop('+stop+').');
  }
  if (stop < start) {
    Nohm.logError('Notice: tried to limit a scored sort with a higher start('+start+') than stop('+stop+').');
  }
  client[method](
    [zset_key,
      start, stop],
    callback
  );
};
    }
  };
});
horseDatastore.module(17, function(onejsModParent){
  return {
    'id':'nohm',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var h = require(__dirname + '/helpers');
var async = require('async');
/**
 * The Nohm object used for some general configuration and model creation.
 * @namespace Nohm
 * @exports exports as Nohm
 */
function Nohm () {
}
/**
 * The redis prefixed key object.
 * Defaults to prefixing with 'nohm' which then creates keys like 'nohm:idsets:someModel'.
 * @static
 */
Nohm.prefix = h.getPrefix('nohm');
/**
 * The property types that get indexed in a sorted set.
 * This should not be changed since it can invalidate already existing data.
 * @static
 */
Nohm.indexNumberTypes = ['integer', 'float', 'timestamp'];
/**
 * The current global nohm redis client
 * @static
 */
Nohm.client = null;
/**
 * Whether to store the meta values about models.
 * This is used for example by the admin app.
 * Defaults to false, since it's a little faster.
 * @static
 */
Nohm.meta = false; // check if this should be defaulted to true.
Nohm.meta_saved_models = [];
/**
 * Model cache
 */
var models = {};
/**
 * Creates and returns a new model with the given name and options.
 * @param {String} Name Name of the model. This needs to be unique and is used in data storage. Thus <b>changing this will invalidate existing data</b>!
 * @param {Object} Option This is an object containing the actual model definitions. These are: properties, methods (optional) and the client (optional) to be used.
 * @static
 */
Nohm.model = function (name, options) {
  var obj = function (id, cb) {
    this.init(name, options);
    // if this is changed, check if the factory needs to be changed as well!
    if(typeof(id) !== 'undefined' && typeof(cb) === 'function') {
      this.load(id, cb);
    }
  };
  obj.prototype = new Nohm();
  // this creates a few functions for short-form like: SomeModel.load(1, function (err, props) { /* `this` is someModelInstance here */ });
  var shortFormFuncs = ['load', 'find', 'save', 'sort', 'subscribe', 'subscribeOnce', 'unsubscribe'];
  shortFormFuncs.forEach(function (val) {
    obj[val] = function () {
      var instance = new obj();
      instance[val].apply(instance, Array.prototype.slice.call(arguments, 0));
    };
  });
  // special short form for removal because we first need to set the id on the instance
  obj.remove = function (id, cb) {
    var instance = new obj();
    instance.id = id;
    instance.remove(cb);
  };
  models[name] = obj;
  return obj;
};
/**
 * Factory to produce instances of models
 * 
 * @param {String} name Name of the model (as given to Nohm.model())
 * @param {Number} [id] Id to be loaded. This requires the callback.
 * @param {Function} [callback] Called when the user is loaded from the db.
 * @returns {ModelInstance} Returns the new model instance
 * @static
 */
Nohm.factory = function factory(name, id, callback) {
  if ( ! models.hasOwnProperty(name)) {
    Nohm.logError('Trying to instantiate inexistant model: '+name);
    return false;
  }
  var obj = new models[name]();
  if(typeof(id) !== 'undefined' && typeof(callback) === 'function') {
    obj.id = id;
    obj.load(id, callback);
  }
  return obj;
};
/**
 * Gets all registered models.
 * 
 * @returns {Object} Object containing all registered models
 * @static
 */
Nohm.getModels = function getModels() {
  return models;
};
/**
 * This function is used whenever an error occurs in nohm.
 * You can override this to whatever you want.
 * By default it only does a console.dir(errorObject);
 * @static
 */
Nohm.logError = function logError(err) {
  if (err) {
    console.dir({
      name: "Nohm Error",
      message: err
    });
  }
};
/**
 * Set the Nohm global redis client.
 * Note: this will not affect models that have a client set on their own.
 * @static
 */
Nohm.setPrefix = function (prefix) {
  Nohm.prefix = h.getPrefix(prefix);
};
/**
 * Set the Nohm global redis client.
 * Note: this will not affect models that have a client set on their own.
 * @static
 */
Nohm.setClient = function (client) {
  Nohm.client = client;
};
Nohm.__validators = {};
var __extraValidators = [];
/**
 * Set some extra validator files. These will also be exported to the browser via connect middleware if used.
 * @static
 */
Nohm.setExtraValidations = function (files) {
  if ( ! Array.isArray(files)) {
    files = [files];
  }
  files.forEach(function (path) {
    if (__extraValidators.indexOf(path) === -1) {
      __extraValidators.push(path);
      var validators = require(path);
      Object.keys(validators).forEach(function (name) {
        Nohm.__validators[name] = validators[name];
      });
    }
  });
};
Nohm.getExtraValidatorFileNames = function () {
  return __extraValidators;
};
// prototype methods:
/**
 * Returns the key needed to retreive a hash (properties) of an instance.
 * @param {Number} id Id of the model instance.
 */
Nohm.prototype.getHashKey = function (id) {
  return Nohm.prefix.hash + this.modelName + ':' + id;
};
/**
 * Returns the client of either the model (if set) or the global Nohm object.
 */
Nohm.prototype.getClient = function () {
  return this.client || Nohm.client;
};
var addMethods = function (methods) {
  for (var name in methods) {
    if (methods.hasOwnProperty(name) && typeof(methods[name]) === 'function') {
      if (this[name]) {
        this['_super_'+name] = this[name];
      }
      this[name] = methods[name].bind(this);
    }
  }
};
Nohm.prototype.init = function (name, options) {
  if ( ! name )
    this.logError('When creating a new model you have to provide a name!');
  if (typeof(options.client) === 'undefined' && Nohm.client === null)
    return Nohm.logError('Did not find a viable redis client in Nohm or the model: '+name) && false;
  if (typeof(options.client) !== 'undefined') {
    this.client = options.client;
  }
  this.modelName = name;
  this.idGenerator = options.idGenerator || 'default';
  this.properties = {};
  this.errors = {};
  // initialize the properties
  if (options.hasOwnProperty('properties')) {
    for (var p in options.properties) {
      if (options.properties.hasOwnProperty(p)) {
        this.properties[p] = h.$extend(true, {}, options.properties[p]); // deep copy
        var defaultValue = options.properties[p].defaultValue || 0;
        if (typeof(defaultValue) === 'function') {
          defaultValue = defaultValue();
        }
        if (typeof(options.properties[p].type) === 'function') {
          // behaviours should not be called on initialization
          this.properties[p].value = defaultValue;
        } else {
          this.property(p, defaultValue); // this ensures typecasing
        }
        this.__resetProp(p);
        this.errors[p] = [];
        if ( Nohm.meta && ! Nohm.meta_saved_models.hasOwnProperty(this.modelName)) {
          // try saving the meta data of this model
          var metaargs = [Nohm.prefix.meta + this.modelName, p, JSON.stringify(this.properties[p])];
          this.getClient().hmset(metaargs);
        }
      }
    }
  }
  if (options.hasOwnProperty('methods')) {
    addMethods.call(this, options.methods);
  }
  if (options.hasOwnProperty('publish')) {
    this.publish = options.publish;
  }
  this.relationChanges = [];
  this.id = null;
  this.__inDB = false;
  this.__loaded = false;
};
/**
 * DO NOT USE THIS UNLESS YOU ARE ABSOLUTELY SURE ABOUT IT!
 * 
 * Deletes any keys from the db that start with nohm prefixes.
 * 
 * DO NOT USE THIS UNLESS YOU ARE ABSOLUTELY SURE ABOUT IT!
 * 
 * @param {Object} [redis] You can specify the redis client to use. Default: Nohm.client
 * @param {Function} [callback] Called after all keys are deleted.
 */
Nohm.purgeDb = function (redis, callback) {
  callback = h.getCallback(arguments);
  redis = typeof(redis) !== 'function' || Nohm.client;
  var delKeys = function (prefix, next) {
    redis.keys(prefix+'*', function (err, keys) {
      if (err || keys.length === 0) {
        next(err);
      } else {
        keys.push(next);
        redis.del.apply(redis, keys);
      }
    });
  };
  var deletes = [];
  
  Object.keys(Nohm.prefix).forEach(function (key) {
    deletes.push(async.apply(delKeys, Nohm.prefix[key]));
  });
  
  async.series(deletes, function (err) {
    callback(err);
  });
};
var moduleNames = ['properties', 'retrieve', 'validation', 'store', 'relations', 'connectMiddleware', 'pubsub'],
    modules = {};
moduleNames.forEach(function (name) {
  // first integrate all the modules
  modules[name] = require(__dirname+'/'+name);
  h.prototypeModule(Nohm, modules[name]);
});
moduleNames.forEach(function (name) {
  // then give them the complete Nohm.
  if (typeof(modules[name].setNohm) !== 'undefined')
    modules[name].setNohm(Nohm);
});
exports.Nohm = Nohm;
    }
  };
});
horseDatastore.module(17, function(onejsModParent){
  return {
    'id':'connectMiddleware',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var Nohm = null;
exports.setNohm = function (originalNohm) {
  Nohm = originalNohm;
  Nohm.connect = connect;
};
/**
 * This is black magic for now. Stay away from it if you can for now!
 */
var fs = require('fs');
var maxDepth = 5;
var customToString = function (obj, depth) {
  depth = depth || 0;
  if (depth > maxDepth) {
    console.log('maxdepth exceeded');
    console.dir(obj);
    return '';
  }
  switch(typeof(obj)) {
    case 'string':
      return '"'+obj+'"';
    case 'number':
      return obj;
    case 'boolean':
      return obj ? 'true' : 'false';
    case 'function':
      if (obj instanceof RegExp) {
        return obj.toString();
      }
      break;
    case 'object':
      if (Array.isArray(obj)) {
        var arr = [];
        obj.forEach(function (val) {
          arr.push(customToString(val, depth+1));
        });
        return '['+arr.join(',')+']';
      } else if (obj instanceof RegExp) {
        return obj.toString();
      } else {
        var arr = [];
        Object.keys(obj).forEach(function (val) {
          arr.push('"'+val+'":'+customToString(obj[val], depth+1));
        });
        return '{'+arr.join(',')+'}';
      }
  }
};
var validationsFlatten = function (model, exclusions) {
  model = new model();
  var props = model.properties;
  var str = model.modelName+': {';
  
  /*
 *          User: { // modelName
 *            name: [0], // this will ignore the first validation in the validation definition array for name in the model definition
 *            salt: true // this will completely ignore all validations for the salt property
 *          },*/
  
  exclusions = exclusions || {};
  var exclusionsStrings = [];
  var exclusionsObject = {};
  Object.keys(exclusions).forEach(function (key) {
    var value = exclusions[key];
    if (Array.isArray(value)) {
      exclusionsObject[key] = value; // value should be like [true, false, true]
    }
    exclusionsStrings.push(key);
  });
  
  Object.keys(props).forEach(function (key) {
    var isExcepted = exclusionsStrings.indexOf(key) !== -1 && ! exclusionsObject.hasOwnProperty(key);
    if ( ! isExcepted) {
      var vals = props[key].validations;
      if (Array.isArray(vals) && vals.length > 0) {
        str += ""+key+': [';
        var strVals = [];
        vals.forEach(function (val, index) {
          if ( ! exclusionsObject[key] || exclusionsObject[key][index]) {
            strVals.push(customToString(val));
          }
        });
        str += strVals.join(',')+'],           ';
      }
    }
  });
  return str+'}';
};
var extraFilesIndex = 0;
var wrapFile = function (fileStr, namespace) {
  var str = namespace+'.extraValidations['+extraFilesIndex+'] = {};(function (exports) {';
  str += fileStr;
  str += '})('+namespace+'.extraValidations['+extraFilesIndex+']);';
  extraFilesIndex++;
  return str;
};
var wrapExtraFiles = function (files, namespace) {
  var str = '';
  files.forEach(function (path) {
    var fileStr = fs.readFileSync(path, 'utf-8');
    str += wrapFile(fileStr, namespace);
  });
  return str;
};
/**
 * Returns a middleware that can deliver the validations as a javascript file
 * and the modelspecific validations as a JSON object to the browser.
 * This is useful if you want to save some bandwith by doing the validations
 * in the browser before saving to the server.
 *
 * Options:
 *    - `url`         - Url under which the js file will be available. Default: '/nohmValidations.js'
 *    - `exclusions`  - Object containing exclusions for the validations export - see example for details
 *    - `namespace`   - Namespace to be used by the js file in the browser. Default: 'nohmValidations'
 *    - `extraFiles`  - Extra files containing validations. You should only use this if they are not already set via Nohm.setExtraValidations as this automatically includes those.
 *    - `maxAge`      - Cache control (in seconds)
 *    - `uglify`      - Boolean. True to enable minification. Requires uglify-js (not in dependencies of nohm!). Default: false // TODO
 * 
 * Example:
 * 
 *    server.use(nohm.connect(
 *      // options object
 *      {
 *        url: '/nohm.js',
 *        namespace: 'nohm',
 *        exclusions: {
 *          User: { // modelName
 *            name: [0], // this will ignore the first validation in the validation definition array for name in the model definition
 *            salt: true // this will completely ignore all validations for the salt property
 *          },
 *          Privileges: true // this will completely ignore the Priviledges model
 *        }
 *      }
 *    ));
 *
 * @param {Object} options Options for the middleware
 * @return {Function}
 * @static
 */
 
function connect(options){
  options = options || {};
  var url = options.url || '/nohmValidations.js';
  var namespace = options.namespace || 'nohmValidations';
  var maxAge = options.maxAge || 3600; // 1 hour
  var exclusions = options.exclusions || {};
  var extraFiles = options.extraFiles || [];
  var uglify = options.uglify || false;
  if ( ! Array.isArray(extraFiles)) {
    extraFiles = [extraFiles];
  }
  
  // collect models
  var arr = [];
  var models = Nohm.getModels();
  Object.keys(models).forEach(function (name) {
    var model = models[name];
    if (exclusions.hasOwnProperty(name) && exclusions[name] === true ) {
      return; // exception set, but no fields
    }
    arr.push(validationsFlatten(model, exclusions[name]));
  });
  
  var str = 'var nohmValidationsNamespaceName = "'+namespace+'";var '+namespace+'={"extraValidations": [], "models":{'+arr.join(',')+'}};';
  
  str += wrapExtraFiles(extraFiles, namespace);
  str += wrapExtraFiles(Nohm.getExtraValidatorFileNames(), namespace); // needs to somehow access the same thing
  str += fs.readFileSync(__dirname+'/validators.js', 'utf-8');
  
  if (uglify) {
    try {
      uglify = require('uglify-js');
    } catch (e) {
      Nohm.logError('You tried to use the uglify option in Nohm.connect but uglify-js is not requirable.');
    }
    if (uglify.parser && uglify.uglify) {
      var jsp = uglify.parser;
      var pro = uglify.uglify;
      
      var ast = jsp.parse(str);
      // ast = pro.ast_mangle(ast); // TODO: test if this works with our globals
      ast = pro.ast_squeeze(ast);
      str = pro.gen_code(ast);
    }
  }
  
  return function (req, res, next) {
    if (req.url === url) {
      var headers = {
          'Content-Type': 'text/javascript',
          'Content-Length': str.length,
          'Cache-Control': 'public, max-age=' + maxAge
      };
      res.writeHead(200, headers);
      res.end(str);
    } else {
      next();
    }
  };
}
    }
  };
});
horseDatastore.module(17, function(onejsModParent){
  return {
    'id':'relations',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var Nohm = null;
exports.setNohm = function (originalNohm) {
  Nohm = originalNohm;
};
var async = require('async');
var h = require(__dirname + '/helpers');
/**
 * Check if the object has a relation to another object.
 */
exports.belongsTo = function belongsTo(obj, name) {
  var callback = h.getCallback(arguments),
      self = this;
  name = name && typeof name !== 'function' ? name : 'default';
  if (!this.id || !obj.id) {
    Nohm.logError('Calling belongsTo() even though either the object itself or the relation does not have an id.');
  }
  this.getClient().sismember(this.relationKey(obj.modelName, name),
                  obj.id,
                  function (err, value) {
                    if (err) {
                      this.logError(err);
                    }
                    callback.call(self, err, !!value);
                  });
};
/**
 * Returns the key needed for getting related objects
 */
exports.relationKey = function relationKey(objName, name) {
  return Nohm.prefix.relations + this.modelName + ':' + name + ':' + objName +
    ':' + this.id;
};
/**
 * Retrieves all relations to another model.
 */
exports.getAll = function getAll(objName, name) {
  var callback = h.getCallback(arguments),
  self = this;
  name = name && typeof name !== 'function' ? name : 'default';
  if (!this.id) {
    Nohm.logError('Calling getAll() even though this '+this.modelName+' has no id. Please load or save it first.');
  }
  this.getClient().smembers(this.relationKey(objName, name),
                  function (err, value) {
                    if (err) {
                      self.logError(err);
                    }
                    if (!Array.isArray(value)) {
                      value = [];
                    } else {
                      value = value.map(function (val) {
                        if (self.idGenerator === 'increment') {
                          val = parseInt(val.toString(), 10);
                        }
                        return val;
                      });
                    }
                    callback.call(self, err, value);
                  });
};
/**
 *  Returns the number of links of a specified relation (or the default) an instance has to models of a given modelName.
 * 
 *  @param {String} obj_name Name of the model on the other end of the relation.
 *  @param {String} [relation_name="default"] Name of the relation
 *  @param {Function} callback Callback called with (err, num_relations
 */
exports.numLinks = function numLinks(obj_name, relation_name, callback) {
  callback = h.getCallback(arguments);
  var self = this;
  relation_name = relation_name && typeof relation_name !== 'function' ? relation_name : 'default';
  if (!this.id) {
    Nohm.logError('Calling numLinks() even though either the object itself or the relation does not have an id.');
  }
  this.getClient().scard(this.relationKey(obj_name, relation_name),
                  function (err, num_relations) {
                    if (err) {
                      self.logError(err);
                    }
                    callback.call(self, err, num_relations);
                  });
};
var allowedLinkTypes = ['sadd', 'srem'];
exports.__linkProxied = function __linkProxied(type, obj, options, callback) {
  
  options = typeof(options) === 'object' && Object.keys(options).length > 0 ? options : {};
  callback = h.getCallback(arguments);
  var self = this,
  foreignName = options.name + 'Foreign',
  silent = !!options.silent,
  client = self.getClient(),
  redisExec = function (cb) {
    var dbVals = [{
        key: self.relationKey(obj.modelName, options.name), 
        keyStore: self.modelName+':'+self.id,
        id: obj.id
      }, {
        key: obj.relationKey(self.modelName, foreignName),
        keyStore: obj.modelName+':'+obj.id,
        id: self.id
      }
    ];
    async.forEach(dbVals, 
      function (val, next) {
        var multi = client.multi();
        multi[type](Nohm.prefix.relationKeys+val.keyStore, val.key);
        multi[type](val.key, val.id);
        multi.exec(next);
      }, 
      function (err) {
        if (!silent && !err) {
          self.fireEvent( type === 'sadd' ? 'link' : 'unlink', obj, options.name );
        }
        if (err && typeof(options.error) === 'function') {
          options.error(err, 'Linking failed.', obj);
        }
        cb.call(self, err);
      }
    );
  };
  
  if (allowedLinkTypes.indexOf(type) === -1) {
    callback.call(self, 'wrong link/unlink type invocation');
  } else if (!this.id) {
    callback.call(self, 'You need to save an object before adding a link. (this might be a nohm error)');
  } else if (!obj.id) {
    obj.save(options, function (err, link_error, link_name) {
      if (err && !link_error && typeof(options.error) === 'function') {
        options.error(err, obj.errors, obj);
      }
      if (err) {
        callback(err, link_error, link_name);
      } else {
        redisExec(callback);
      }
    });
  } else {
    redisExec(callback);
  }
};
exports.__link = function __link(obj, options, cb) {
  this.__linkProxied('sadd', obj, options, cb);
};
exports.__unlink = function __unlink(obj, options, cb) {
  this.__linkProxied('srem', obj, options, cb);
};
/**
 *  Adds a reference to another object.
 */
exports.link = function link(obj, options, callback) {
  if (typeof(options) === 'string') {
    options = {name: options};
  }
  var opts = h.$extend({
    name: 'default'
  }, options);
  callback = h.getCallback(arguments);
  
  this.relationChanges.push({
    action: 'link',
    object: obj,
    options: opts,
    callback: callback
  });
};
/**
 *  Removes the reference in the current object to
 *  the object given in the first argument.
 *  Note: this leaves the given object itself intact.
 */
exports.unlink = function unlink(obj, options, callback) {
  if (typeof(options) === 'string') {
    options = {name: options};
  }
  var opts = h.$extend({
    name: 'default'
  }, options);
  callback = h.getCallback(arguments);
  
  var changes = this.relationChanges;
  for (var i in changes) {
    if (changes.hasOwnProperty(i) &&
        changes[i].name === opts.name &&
        h.checkEqual(changes[i].object, obj)) {
      delete this.relationChanges[i];
    }
  }
  
  this.relationChanges.push({
    action: 'unlink',
    options: opts,
    callback: callback,
    object: obj
  });
};
/**
 * Removes all links to all other object instances
 */
exports.unlinkAll = function (client, callback) {
  var self = this;
  var normalClient = this.getClient();
  var relationKeys_key = Nohm.prefix.relationKeys+this.modelName+':'+this.id;
  client = client || normalClient;
  this.relationChanges = [];
  // we usenormalClient for fetching data and client (which could be a provided client in multi mode) for manipulating data
  normalClient.smembers(relationKeys_key, function (err, keys) {
    var others = [];
    keys.forEach(function (key) {
      var matches = key.match(/:([\w]*):([\w]*):[\w]+$/i);
      var selfName = matches[1];
      var otherName;
      var namedMatches;
      if (matches[1] === 'default') {
        otherName = 'defaultForeign';
      } else if (matches[1] === 'defaultForeign') {
        otherName = 'default';
      } else {
        namedMatches = matches[1].match(/^([\w]*)Foreign$/);
        if (namedMatches) {
          selfName = matches[1];
          otherName = namedMatches[1];
        } else {
          selfName = matches[1];
          otherName = matches[1] + 'Foreign';
        }
      }
      others.push({
        model: matches[2],
        selfName: selfName,
        otherName: otherName
      });
    });
    async.map(others, function (item, cb) {
      normalClient.smembers(
        Nohm.prefix.relations+self.modelName+':'+item.selfName+':'+item.model+':'+self.id,
        function (err, ids) {
          if (err) {
            Nohm.logError(err);
          }
          ids.forEach(function (id) {
            client.srem(Nohm.prefix.relations+item.model+':'+item.otherName+':'+self.modelName+':'+id, self.id);
          });
          cb(err, Nohm.prefix.relations+self.modelName+':'+item.selfName+':'+item.model+':'+self.id);
        }
      );
    }, function (err, links) {
      if (links.length > 0) {
        links.push(relationKeys_key);
        links.push(function (err) {
          if (err) {
            Nohm.logError('There was a problem while deleting keys:'+err);
          }
        });
        client.del.apply(client, links);
      }
      callback.call(self, err);
    });
  });
};
    }
  };
});
horseDatastore.pkg(1, function(parent){
  return {
    'id':18,
    'name':'redback',
    'main':undefined,
    'mainModuleId':'index',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/Structure',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Redback
 * Copyright(c) 2011 Chris O'Hara <cohara87@gmail.com>
 * MIT Licensed
 */
/**
 * All Redback structures inherit from this.
 */
var Structure = exports.Structure = function () {};
/**
 * Create a new Structure by extending the base Structure.
 *
 * @param {Object} methods (optional)
 * @return structure
 * @api public
 */
exports.new = function (methods) {
    return Structure.prototype.extend(methods);
}
/**
 * Expire the structure after a certain number of seconds.
 *
 * @param {int} ttl
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Structure.prototype.expire = function (ttl, callback) {
    callback = callback || function () {};
    this.client.expire(this.key, ttl, callback);
    return this;
}
/**
 * Expire the structure at a certain date.
 *
 * @param {Date} when
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Structure.prototype.expireAt = function (when, callback) {
    callback = callback || function () {};
    if (typeof when.getTime === 'function') {
        when = Math.round(when.getTime() / 1000); //ms => s
    }
    this.client.expireat(this.key, when, callback);
    return this;
}
/**
 * Get the number of seconds before the structure expires.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
Structure.prototype.ttl = function (callback) {
    this.client.ttl(this.key, callback);
    return this;
}
/**
 * Checks whether the structure has an expiry.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
Structure.prototype.isVolatile = function (callback) {
    this.client.ttl(this.key, function (err, ttl) {
        if (err) return callback(err, null);
        callback(null, ttl != -1);
    });
    return this;
}
/**
 * Remove the structure's associated expiry.
 *
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Structure.prototype.persist = function (callback) {
    callback = callback || function () {};
    this.client.persist(this.key, callback);
    return this;
}
/**
 * Remove the structure from the Redis database.
 *
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Structure.prototype.destroy =
Structure.prototype.flush = function (callback) {
    callback = callback || function () {};
    this.client.del(this.key, callback);
    return this;
}
/**
 * A helper for creating atomically auto-incrementing keys.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
Structure.prototype.autoincrement = function (callback) {
    var key = this.key + ':_autoinc',
        multi = this.client.multi();
    multi.setnx(key, 1).get(key).incr(key);
    multi.exec(function (err, replies) {
        if (err) return callback(err, null);
        callback(null, replies[1]);
    });
    return this;
}
/**
 * Takes a redback structure or key string and returns the key.
 *
 * @param {string|Object} key
 * @return {string} key
 * @api public
 */
Structure.prototype.getKey = function (key, which) {
    which = which || 'key';
    if (typeof key[which] !== 'undefined') {
        return key[which];
    }
    return key;
}
/**
 * A helper that extracts the Redis keys from many Structure or string arguments.
 *
 * @param {Array} structures
 * @param {Function} callback
 * @return this
 * @api public
 */
Structure.prototype.getKeys = function (structures, which) {
    var structures = Array.prototype.slice.call(structures),
        callback = structures.pop(),
        self = this,
        keys = [];
    for (var i = 0, l = structures.length; i < l; i++) {
        if (Array.isArray(structures[i])) {
            structures[i].forEach(function (structure) {
                keys.push(self.getKey(structure, which));
            });
        } else {
            keys.push(this.getKey(structures[i], which));
        }
    }
    keys.push(callback);
    return keys;
}
/**
 * Add the namespace on to a key.
 *
 * @param {string} key
 * @return {string} namespaced_key
 * @api public
 */
Structure.prototype.namespaceKey = function (key) {
    key = key || '';
    if (this.namespace.length) {
        key = this.namespace + ':' + key;
    }
    return key;
}
/**
 * Extend the structure.
 *
 * @param {Object} methods (optional)
 * @return this
 * @api public
 */
Structure.prototype.extend = function (methods) {
    var structure = function (client, key, namespace, init_args) {
        this.client = client;
        this.namespace = namespace || '';
        if (!key) {
            throw new Error('A key is required');
        }
        if (Array.isArray(key)) {
            key = key.join(':');
        }
        this.id = key;
        if (this.namespace.length) {
            key = this.namespace + ':' + key;
        }
        this.key = key;
        if (typeof this.init === 'function') {
            this.init.apply(this, init_args);
        }
    }, ctor = function () {
        this.constructor = structure;
    }
    ctor.prototype = this;
    structure.prototype = new ctor;
    structure.__super__ = this;
    if (typeof methods === 'object') {
        for (var i in methods) {
            structure.prototype[i] = methods[i];
        }
    }
    return structure;
}
/**
 * Create a random key for temporary use.
 *
 * @return {string} random_key
 * @api public
 */
Structure.prototype.randomKey = function () {
    return Math.random();
}
/**
 * Get the type of the current structure.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
Structure.prototype.type = function (callback) {
    this.client.type(this.key, callback);
    return this;
}
/**
 * Rename the structure (change the Redis key).
 *
 * @param {string} new_key
 * @param {Function} callback
 * @return this
 * @api public
 */
Structure.prototype.rename = function (new_key, callback) {
    var self = this;
    new_key = this.namespaceKey(new_key);
    this.client.rename(this.key, new_key, function (err) {
        if (err) return callback(err, null);
        self.key = new_key;
        callback();
    });
    return this;
}
/**
 * Sort all elements in the structure.
 *
 * Options:
 *    limit, offset, by, get, alpha, desc, store
 *
 * Reference:
 *    http://redis.io/commands/sort
 *
 * @param {object} options
 * @param {Function} callback
 * @return this
 * @api public
 */
Structure.prototype.sort = function (options, callback) {
    var args = [this.key];
    //SORT key [BY pattern] [LIMIT offset count]
    //   [GET pattern [GET pattern ...]] [ASC|DESC] [ALPHA] [STORE destination]
    if (typeof options.by !== 'undefined') {
        args.push('BY', options.by);
    }
    if (typeof options.limit !== 'undefined') {
        args.push('LIMIT');
        if (typeof options.offset !== 'undefined') {
            args.push(options.offset);
        }
        args.push(options.limit);
    }
    if (typeof options.get !== 'undefined') {
        if (Array.isArray(options.get)) {
            options.get.forEach(function (pattern) {
                args.push('GET', pattern);
            });
        } else {
            args.push('GET', options.get);
        }
    }
    if (typeof options.desc !== 'undefined' && options.desc) {
        args.push('DESC');
    }
    if (typeof options.alpha !== 'undefined' && options.alpha) {
        args.push('ALPHA');
    }
    if (typeof options.store !== 'undefined') {
        args.push('STORE', options.store);
    }
    this.client.sort.apply(this.client, args);
    return this;
}
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/Redback',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Redback
 * Copyright(c) 2011 Chris O'Hara <cohara87@gmail.com>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var redis = require('redis'),
    Structure = require('./Structure'),
    Channel = require('./Channel').Channel,
    Cache = require('./Cache').Cache;
/**
 * Define the available Redis structures.
 */
var base = ['Hash','List','Set','SortedSet','Bitfield'];
/**
 * Define the available advanced structures.
 */
var advanced = ['KeyPair','DensitySet','CappedList','SocialGraph',
                'FullText', 'Queue', 'RateLimit', 'BloomFilter'];
/**
 * The Redback object wraps the Redis client and acts as a factory
 * for structures.
 *
 * @param {RedisClient} client
 * @param {Object} options (optional)
 * or
 * @param {string} host (optional)
 * @param {int} port (optional)
 * @param {Object} options (optional)
 * @api public
 */
var Redback = exports.Redback = function () {
    this.client = arguments[0] instanceof redis.RedisClient ?
        arguments[0] : redis.createClient.apply(this, arguments);
    var options = arguments[1] instanceof Object ?
        arguments[1] : arguments[2];
    this.namespace = '';
    if (typeof options === 'object' && options.namespace) {
        this.namespace = options.namespace;
    }
}
/**
 * Make a structure available to the client.
 *
 * @param {string} name
 * @param {Function|Object} Structure
 * @api private
 */
Redback.prototype.addStructure = function (name, obj) {
    if (typeof obj !== 'function') {
        obj = Structure.new(obj);
    }
    exports[name] = obj;
    Redback.prototype['create' + name] = function (key) {
        var init_args = Array.prototype.slice.call(arguments, 1);
        return new obj(this.client, key, this.namespace, init_args);
    }
}
/**
 * Create a new Cache.
 *
 * @param {string} namespace (optional)
 * @return Cache
 * @api public
 */
Redback.prototype.createCache = function (namespace) {
    namespace = namespace || 'cache';
    if (this.namespace.length) {
        namespace = this.namespace + ':' + namespace;
    }
    return new Cache(this.client, namespace);
}
/**
 * Create a new Channel.
 *
 * @param {string} channel - the channel name
 * @return Channel
 * @api public
 */
Redback.prototype.createChannel = function (channel) {
    if (!channel) {
        throw new Error('A channel key is required');
    }
    if (this.namespace.length) {
        channel = this.namespace + ':' + channel;
    }
    return new Channel(this.client, channel);
}
/**
 * Send a (BG)SAVE command to Redis.
 *
 * @param {string} background (optional - default is false)
 * @param {Function} callback
 * @return this
 * @api public
 */
Redback.prototype.save = function (background, callback) {
    if (typeof background === 'function') {
        callback = background;
        this.client.save(callback);
    } else {
        this.client.bgsave(callback);
    }
    return this;
}
/**
 * Close the connection to Redis.
 *
 * @return this
 * @api public
 */
Redback.prototype.quit = function () {
    this.client.quit();
    return this;
}
/**
 * Create a new Redback client.
 *
 * @param {string} host (optional)
 * @param {int} port (optional)
 * @param {Object} options (optional)
 * @api public
 */
exports.createClient = function (host, port, options) {
    return new Redback(host, port, options);
}
/**
 * Wrap a Redis client with Redback.
 *
 * @param {RedisClient} client
 * @param {Object} options (optional)
 * @api public
 */
exports.use = function (client, options) {
    return new Redback(client, options);
}
/**
 * Add the Redis structures from ./base_structures
 */
base.forEach(function (structure) {
    Redback.prototype.addStructure(structure,
        require('./base_structures/' + structure)[structure]);
});
/**
 * Add the advanced structures from ./advanced_structures
 */
advanced.forEach(function (structure) {
    Redback.prototype.addStructure(structure,
        require('./advanced_structures/' + structure)[structure]);
});
/**
 * Redis constants.
 */
Redback.prototype.INF  = exports.INF = '+inf';
Redback.prototype.NINF = exports.NINF = '-inf';
/**
 * Export prototypes so that they can be extended.
 */
exports.Client = redis.RedisClient;
exports.Structure = Structure.Structure;
exports.Cache = Cache;
exports.Channel = Channel;
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/Channel',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Redback
 * Copyright(c) 2011 Chris O'Hara <cohara87@gmail.com>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var EventEmitter = require('events').EventEmitter;
/**
 * Wrap the Redis pub/sub commands.
 *
 * Usage:
 *    `redback.createChannel(name);`
 *
 * Reference:
 *    http://redis.io/topics/pubsub
 */
var Channel = exports.Channel = function (client, channel_name) {
    this.name = channel_name;
    this.setClient(client);
}
/**
 * Channel is an event emitter.
 */
Channel.prototype = new EventEmitter();
/**
 * Bind a new Redis client (e.g. if not exclusively using pub/sub mode).
 *
 * @param {Object} client
 * @return this
 * @api public
 */
Channel.prototype.setClient = function (client) {
    this.client = client;
    var self = this;
    ['message','subscribe','unsubscribe'].forEach(function (event) {
        self.client.on(event, function (channel, arg) {
            if (channel == self.name) {
                self.emit(event, arg);
            }
        });
    });
    return this;
}
/**
 * Publish a message to the channel.
 *
 * @param {string} msg
 * @param {Function} callback
 * @return this
 * @api public
 */
Channel.prototype.publish = function (msg, callback) {
    this.client.publish(this.name, msg, callback);
    return this;
}
/**
 * Subscribe to the channel.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
Channel.prototype.subscribe = function (callback) {
    this.client.subscribe(this.name);
    if (typeof callback === 'function') {
        this.on('subscribe', callback);
    }
    return this;
}
/**
 * Unsubscribe from the channel.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
Channel.prototype.unsubscribe = function (callback) {
    this.client.unsubscribe(this.name);
    if (typeof callback === 'function') {
        this.on('unsubscribe', callback);
    }
    return this;
}
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/advanced_structures/DensitySet',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Redback
 * Copyright(c) 2011 Chris O'Hara <cohara87@gmail.com>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var SortedSet = require('../base_structures/SortedSet').SortedSet;
/**
 * The DensitySet is similar to a SortedSet but the ability to explicitly
 * set an element's score has been removed. Instead, adding/removing
 * an element will increment/decrement its score, e.g.
 *     `DensitySet.add(['foo','foo','foo'], ..)` //'foo' has a score of 3
 *
 * Usage:
 *    `redback.createDensitySet(key);`
 *
 * Reference:
 *    http://redis.io/topics/data-types#sorted-sets
 *
 * Redis Structure:
 *    `(namespace:)key = zset(count => element)`
 */
var DensitySet = exports.DensitySet = SortedSet.prototype.extend();
/**
 * Add one or more elements to the set.
 *
 * @param {string|Array} element(s)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
DensitySet.prototype.add = function (element, callback) {
    callback = callback || function () {};
    if (Array.isArray(element)) {
        return this.addAll(element, callback);
    }
    this.client.zincrby(this.key, 1, element, callback);
    return this;
}
/**
 * Remove one or more elements from the set.
 *
 * @param {string|Array} element(s)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
DensitySet.prototype.remove = function (element, callback) {
    callback = callback || function () {};
    if (Array.isArray(element)) {
        return this.removeAll(element, callback);
    }
    var self = this;
    this.client.zincrby(this.key, -1, element, function (err, removed) {
        if (err) return callback(err, null);
        self.client.zremrangebyscore(self.key, '-inf', 0, callback);
    });
    return this;
}
/**
 * Add multiple elements to the set.
 *
 * @param {Array} elements
 * @param {Function} callback
 * @return this
 * @api private
 */
DensitySet.prototype.addAll = function (elements, callback) {
    var self = this,
        remaining = elements.length,
        failed = false,
        add_count = 0;
    elements.forEach(function (element) {
        self.client.zincrby(self.key, 1, element, function (err, added) {
            if (failed) {
                return;
            } else if (err) {
                failed = true;
                return callback(err);
            } else {
                if (added) add_count++;
                if (!--remaining) callback(null, add_count);
            }
        });
    });
    return this;
}
/**
 * Remove multiple elements from the set.
 *
 * @param {Array} elements
 * @param {Function} callback
 * @return this
 * @api private
 */
DensitySet.prototype.removeAll = function (elements, callback) {
    var self = this,
        remaining = elements.length,
        failed = false,
        rem_count = 0;
    elements.forEach(function (element) {
        self.client.zincrby(self.key, -1, element, function (err, added) {
            if (failed) {
                return;
            } else if (err) {
                failed = true;
                return callback(err);
            } else {
                if (added) rem_count++;
                if (!--remaining) {
                    self.client.zremrangebyscore(self.key, '-inf', 0, function (err) {
                        callback(err, rem_count);
                    });
                }
            }
        });
    });
    return this;
}
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/advanced_structures/Queue',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Redback
 * Copyright(c) 2011 Chris O'Hara <cohara87@gmail.com>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var Structure = require('../Structure'),
    List = require('../base_structures/List').List;
/**
 * A simple FIFO/LIFO queue.
 *
 * Usage:
 *    `redback.createQueue(key [, is_fifo]);`
 *
 * Reference:
 *    http://redis.io/topics/data-types#lists
 *    http://en.wikipedia.org/wiki/Queue_(data_structure)
 *
 * Redis Structure:
 *    `(namespace:)key = list(values)`
 */
var Queue = exports.Queue = Structure.new();
/**
 * Setup the Queue to be either FIFO or LIFO.
 *
 * @param {bool} is_fifo
 * @api private
 */
Queue.prototype.init = function (is_fifo) {
    this.fifo = is_fifo;
    this.list = new List(this.client, this.id, this.namespace);
}
/**
 * Add one or more elements to the queue.
 *
 * @param {string|Array} value(s)
 * @param {Function} callback (optional)
 * @api public
 */
Queue.prototype.enqueue = Queue.prototype.add = function (values, callback) {
    this.list.unshift(values, callback);
    return this;
}
/**
 * Remove the next element from the queue.
 *
 * @param {int} wait (optional) - block for this many seconds
 * @param {Function} callback
 * @api public
 */
Queue.prototype.dequeue = Queue.prototype.next = function (wait, callback) {
    this.list[this.fifo ? 'pop' : 'shift'](wait, callback);
    return this;
}
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/advanced_structures/KeyPair',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Redback
 * Copyright(c) 2011 Chris O'Hara <cohara87@gmail.com>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var Structure = require('../Structure');
/**
 * The KeyPair is a structure where unique values are assigned an
 * ID (like a table with a primary auto-incrementing key and
 * a single unique column). Internally, the KeyPair uses two Redis
 * hashes to provide O(1) lookup by both ID and value.
 *
 * Usage:
 *    `redback.createKeyPair(key);`
 *
 * Reference:
 *    http://redis.io/topics/data-types#hashes
 *
 * Redis Structure:
 *    `(namespace:)key     = hash(id => value)`
 *    `(namespace:)key:ids = hash(value => id)`
 */
var KeyPair = exports.KeyPair = Structure.new();
/**
 * Initialise the KeyPair.
 *
 * @api private
 */
KeyPair.prototype.init = function () {
    this.idkey = this.key + ':ids';
}
/**
 * Add a unique value to the KeyPair and return its id. If the value already
 * exists, the existing id is returned.
 *
 * @param {string|Array} value(s)
 * @param {Function} callback
 * @return this
 * @api public
 */
KeyPair.prototype.add = function (value, callback) {
    //Pass on an array of values to addAll()
    if (Array.isArray(value)) {
        return this.addAll(value, callback);
    }
    var self = this, hashed_value = this.hashValue(value);
    //Check if the value already has an id
    this.client.hget(this.idkey, value, function (err, id) {
        if (err) return callback(err, null);
        if (null !== id) {
            callback(null, id);
        } else {
            //If not, create a new id
            self.autoincrement(function (err, id) {
                if (err) return callback(err, null);
                //Set the id and value simultaneously
                var multi = self.client.multi();
                multi.hsetnx(self.idkey, hashed_value, id);
                multi.hsetnx(self.key, id, value);
                multi.exec(function(err, response) {
                    if (err) return callback(err, null);
                    //Another client may have add at exactly the same time, so do
                    //another get to get the actual stored id
                    self.client.hget(self.idkey, hashed_value, function (err, real_id) {
                        if (err) return callback(err, null);
                        if (real_id == id) {
                            return callback(null, real_id);
                        } else {
                            //Another client did beat us! remove the bad key
                            self.client.hdel(self.key, id, function (err) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, real_id);
                                }
                            });
                        }
                    });
                });
            });
        }
    });
    return this;
}
/**
 * Add multiple unique values to the KeyPair and return and
 * object containing {value: id, ...}.
 *
 * @param {Array} values
 * @param {Function} callback
 * @return this
 * @api public
 */
KeyPair.prototype.addAll = function (values, callback) {
    var self = this,
        remaining = values.length,
        ids = {},
        failed = false;
    values.forEach(function (value) {
        self.add(value, function (err, id) {
            if (failed) {
                return;
            } else if (err) {
                failed = true;
                return callback(err, null);
            } else {
                ids[value] = id;
                if (!--remaining) callback(null, ids);
            }
        });
    });
}
/**
 * Lookup a unique value and get the associated id.
 *
 * @param {string} value
 * @param {Function} callback
 * @return this
 * @api public
 */
KeyPair.prototype.get = function (value, callback) {
    if (typeof value === 'function') {
        callback = value;
        this.client.hgetall(this.key, callback);
    } else if (Array.isArray(value)) {
        for (var i = 0, l = value.length; i < l; i++) {
            value[i] = this.hashValue(value[i]);
        }
        this.client.hmget(this.idkey, value, callback)
    } else {
        this.client.hget(this.idkey, this.hashValue(value), callback);
    }
    return this;
}
/**
 * Get the value associated with the id.
 *
 * @param {int} id
 * @param {Function} callback
 * @return this
 * @api public
 */
KeyPair.prototype.getById = function (id, callback) {
    this.client.hget(this.key, id, callback);
    return this;
}
/**
 * Get an array of ids.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
KeyPair.prototype.ids = function (callback) {
    this.client.hkeys(this.key, callback);
    return this;
}
/**
 * Get an array of values.
 *
 * @param {string} value
 * @param {Function} callback
 * @return this
 * @api public
 */
KeyPair.prototype.values = function (callback) {
    this.client.hvals(this.key, callback);
    return this;
}
/**
 * Check whether a unique value already exists and  has an associated id.
 *
 * @param {string} value
 * @param {Function} callback
 * @return this
 * @api public
 */
KeyPair.prototype.exists = function (value, callback) {
    this.client.hexists(this.idkey, this.hashValue(value), callback);
    return this;
}
/**
 * Checks whether an id exists.
 *
 * @param {string} value
 * @param {Function} callback
 * @return this
 * @api public
 */
KeyPair.prototype.idExists = function (id, callback) {
    this.client.hexists(this.key, id, callback);
    return this;
}
/**
 * Deletes a unique value and its associated id.
 *
 * @param {string} value
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
KeyPair.prototype.delete = function (value, callback) {
    callback = callback || function () {};
    var self = this, value = this.hashValue(value);
    this.client.hget(this.idkey, value, function (err, id) {
        if (err || value == null) return callback(err);
        self._delete(id, value, callback);
    });
    return this;
}
/**
 * Deletes an id and its associated unique value.
 *
 * @param {int} id
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
KeyPair.prototype.deleteById = function (id, callback) {
    callback = callback || function () {};
    var self = this;
    this.client.hget(this.key, id, function (err, value) {
        if (err || value == null) return callback(err);
        self._delete(id, self.hashValue(value), callback);
    });
    return this;
}
/**
 * An internal helper for simultaneously deleting an id/value pair.
 *
 * @param {int} id
 * @param {string} value
 * @param {Function} callback
 * @return this
 * @api private
 */
KeyPair.prototype._delete = function (id, value, callback) {
    var multi = this.client.multi();
    multi.hdel(this.key, id);
    multi.hdel(this.idkey, this.hashValue(value));
    multi.exec(callback);
    return this;
}
/**
 * Get the number of unique values.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
KeyPair.prototype.length = function (callback) {
    this.client.hlen(this.key, callback);
    return this;
}
/**
 * Override this method if you need to hash the unique value
 * in the second internal hash (i.e. if values are large).
 *
 * @param {string} value
 * @return {string} hashed_value
 * @api public
 */
KeyPair.prototype.hashValue = function (value) {
    return value;
}
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/advanced_structures/FullText',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Redback
 * Copyright(c) 2011 Chris O'Hara <cohara87@gmail.com>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var Structure = require('../Structure'),
    EventEmitter = require('events').EventEmitter,
    fs = require('fs');
/**
 * Stop words - words that shouldn't be indexed.
 */
var stopwords = {
    'a':1,'able':1,'about':1,'across':1,'after':1,'all':1,'almost':1,'also':1,'am':1,'among':1,
    'an':1,'and':1,'any':1,'are':1,'as':1,'at':1,'be':1,'because':1,'been':1,'but':1,'by':1,'can':1,
    'cannot':1,'could':1,'dear':1,'did':1,'do':1,'does':1,'either':1,'else':1,'ever':1,'every':1,
    'for':1,'from':1,'get':1,'got':1,'had':1,'has':1,'have':1,'he':1,'her':1,'hers':1,'him':1,'his':1,
    'how':1,'however':1,'i':1,'if':1,'in':1,'into':1,'is':1,'it':1,'its':1,'just':1,'least':1,'let':1,
    'like':1,'likely':1,'may':1,'me':1,'might':1,'most':1,'must':1,'my':1,'neither':1,'no':1,
    'nor':1,'not':1,'of':1,'off':1,'often':1,'on':1,'only':1,'or':1,'other':1,'our':1,'own':1,
    'rather':1,'said':1,'say':1,'says':1,'she':1,'should':1,'since':1,'so':1,'some':1,'than':1,
    'that':1,'the':1,'their':1,'them':1,'then':1,'there':1,'these':1,'they':1,'this':1,'tis':1,
    'to':1,'too':1,'twas':1,'us':1,'wants':1,'was':1,'we':1,'were':1,'what':1,'when':1,'where':1,
    'which':1,'while':1,'who':1,'whom':1,'why':1,'will':1,'with':1,'would':1,'yet':1,'you':1,
    'your':1,'':1
}
/**
 * A full text index with support for stop words, stemming and
 * a basic boolean search syntax.
 *
 * Usage:
 *    `redback.createFullText(key);`
 *
 * Reference:
 *    http://redis.io/topics/data-types#sets
 *
 * Redis Structure:
 *    `(namespace:)key:<word1> = set(docs)`
 *    `(namespace:)key:<word2> = set(docs)`
 *    `(namespace:)key:<wordN> = set(docs)`
 */
var FullText = exports.FullText = Structure.new();
/**
 * Initialise the index. libstemmer bindings are required.
 *
 * @api private
 */
FullText.prototype.init = function () {
    this.indexed_bytes = 0;
    try {
        this.stem = require('stem').stem;
    } catch (e) {
        console.error('Full text requires the libstemmer bindings: `npm install -g stem`');
        process.exit(1);
    }
}
/**
 * Index one or more documents.
 *
 * Index One Document:
 *    `text.indexFile(1, 'document string ...', callback);`
 *
 * Index Many Documents:
 *    `text.indexFile({1:'docstr1', 2:'docstr2'}, callback);`
 *
 * @param {int|string} id - the document's unique identifier
 * @param {string|ReadableStream|Buffer} document
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
FullText.prototype.index = function (id, document, callback) {
    if (typeof id === 'object') {
        return this.indexAll(id, document);
    } else if (document instanceof EventEmitter &&
            typeof document.readable !== 'undefined' && document.readable === true) {
        return this.indexStream(id, document, callback);
    } else if (document instanceof Buffer) {
        document = document.toString();
    }
    this.indexed_bytes += document.length;
    var stemmed = this.stemWords(this.extractWords(document));
    this.buildIndex(id, stemmed, callback || function () {});
}
/**
 * Index multiple documents.
 *
 * @param {Array} documents
 * @param {Function} callback (optional)
 * @return this
 * @api private
 */
FullText.prototype.indexAll = function (documents, callback) {
    var self = this, ids = Object.keys(documents),
        failed = false, remaining = ids.length;
    ids.forEach(function (id) {
        self.index(id, documents[id], function (err) {
            if (failed) {
                return;
            } else if (err) {
                return callback(err);
            } else {
                if (!--remaining) {
                    callback();
                }
            }
        });
    });
    return this;
}
/**
 * Index one or more files.
 *
 * Index One Document:
 *    `text.indexFile(1, '/path/to/file', callback);`
 *
 * Index Many Documents:
 *    `text.indexFile({1:'file1', 2:'file2'}, callback);`
 *
 * @param {int|string|Object} id
 * @param {string} filename (optional)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
FullText.prototype.indexFile =
FullText.prototype.indexFiles = function (id, filename, callback) {
    if (typeof id === 'object') {
        callback = filename;
        var self = this, files = id, ids = Object.keys(files),
            failed = false, remaining = ids.length;
        ids.forEach(function (id) {
            self.indexStream(id, fs.createReadStream(files[id]), function (err) {
                if (failed) {
                    return;
                } else if (err) {
                    return callback(err);
                } else {
                    if (!--remaining) callback();
                }
            });
        });
        return this;
    } else {
        return this.indexStream(id, fs.createReadStream(filename), callback);
    }
}
/**
 * Split a string into an array of words. Also strip punctuation and
 * lowercase all words.
 *
 * @param {string} str
 * @return {Array} words
 * @api private
 */
FullText.prototype.extractWords = function (str) {
    return str.toLowerCase()
              .replace(/[^a-zA-Z0-9'\s\r\n\t-]/g, '')
              .split(/[\s\r\n\t]/);
}
/**
 * Given an array of words, remove stop words and stem the remaining.
 *
 * @param {Array} words
 * @param {Array} stemmed (optional) - the array to add to
 * @return {Array} stemmed_words
 * @api private
 */
FullText.prototype.stemWords = function (words, stemmed) {
    stemmed = stemmed || [];
    for (var i = 0, l = words.length; i < l; i++) {
        if (typeof stopwords[words[i]] === 'undefined') {
            stemmed.push(this.stem(words[i]));
        }
    }
    return stemmed;
}
/**
 * Index a readable stream.
 *
 * @param {int} id
 * @param {string} document
 * @param {Function} callback (optional)
 * @api private
 */
FullText.prototype.indexStream = function (id, stream, callback) {
    var self = this, indexChunk, words, stemmed = [], i, l, last = '';
    indexChunk = function (chunk, end) {
        words = self.extractWords(chunk);
        if (!end) last += words.pop();
        self.stemWords(words, stemmed);
    }
    stream.setEncoding('utf8');
    stream.on('data', function (chunk) {
        self.indexed_bytes += chunk.length;
        indexChunk(last + chunk);
    });
    stream.on('end', function () {
        indexChunk(last, true);
        self.buildIndex(id, stemmed, callback || function () {});
    });
}
/**
 * Builds the reverse index of a document.
 *
 * @param {int|string} id
 * @param {Array} words
 * @param {Function} callback
 * @api private
 */
FullText.prototype.buildIndex = function (id, words, callback) {
    words.push('__documents');
    var self = this,
        remaining = words.length,
        failed = false,
        word_count = 0;
    words.forEach(function (word) {
        self.client.sadd(self.key + ':' + word, id, function (err, added) {
            if (failed) {
                return;
            } else if (err) {
                failed = true;
                return callback(err);
            } else {
                if (added) word_count++;
                if (!--remaining) callback(null, word_count);
            }
        });
    });
    return this;
}
/**
 * Search the full text index. Words will be extracted from the
 * search string and used to filter search results. To exclude certain
 * words, prefix them with a hyphen "-".
 *
 * Basic Search:
 *    `index.search('foo bar', callback);`
 *
 * Excluding Words:
 *    `index.search('foo -bar -cool', callback);`
 *
 * @param {string} search
 * @param {Function} callback
 * @api public
 */
FullText.prototype.search = function (search, callback) {
    var include = [], exclude = [];
    this.stemWords(this.extractWords(search)).forEach(function (word) {
        if (word[0] === '-') {
            exclude.push(word.substr(1));
        } else {
            include.push(word);
        }
    });
    return this._search(include, exclude, callback);
}
/**
 * Execute a search based on two arrays: a list of stemmed words to include,
 * and a list of stemmed words to exclude.
 *
 * @param {Array} include
 * @param {Array} exclude
 * @param {Function} callback
 * @api private
 */
FullText.prototype._search = function (include, exclude, callback) {
    if (include.length === 0) {
        include = ['__documents']; //A set containing all doc IDs
    }
    var multi = this.client.multi(), i, l, result_offset = 0;
    for (i = 0, l = include.length; i < l; i++) {
        include[i] = this.key + ':' + include[i];
    }
    l = exclude.length;
    if (l === 0) {
        multi.sinter.apply(multi, include);
    } else {
        var tmp_key = this.randomKey();
        include.unshift(tmp_key);
        multi.sinterstore.apply(multi, include);
        for (i = 0; i < l; i++) {
            exclude[i] = this.key + ':' + exclude[i];
        }
        exclude.unshift(tmp_key);
        multi.sdiff.apply(multi, exclude);
        multi.del(tmp_key);
        result_offset = 1;
    }
    multi.exec(function (err, results) {
        if (err) return callback(err, null);
        return callback(null, results[result_offset]);
    });
    return this;
}
/**
 * Clear the index.
 *
 * @param {Function} callback (optional)
 * @api public
 */
FullText.prototype.clear = function (callback) {
    var self = this;
    callback = callback || function () {};
    this.client.keys(this.key + ':*', function (err, keys) {
        if (err) return callback(err, null);
        var rem_count = 0, failed = false, remaining = keys.length;
        keys.forEach(function (key) {
            self.client.del(key, function (err, removed) {
                if (failed) {
                    return;
                } else if (err) {
                    failed = true;
                    return callback(err);
                } else {
                    if (removed) rem_count++;
                    if (!--remaining) callback(null, rem_count);
                }
            });
        });
    });
    return this;
}
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/advanced_structures/CappedList',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Redback
 * Copyright(c) 2011 Chris O'Hara <cohara87@gmail.com>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var List = require('../base_structures/List').List;
/**
 * A Redis list with a fixed length. Each command that adds a value to the
 * list is followed by an `LTRIM` command.
 *
 * Usage:
 *    `redback.createCappedList(key [, max_length]);`
 *
 * Reference:
 *    http://redis.io/topics/data-types#lists
 *    http://redis.io/commands/ltrim
 *
 * Redis Structure:
 *    `(namespace:)key = list(values)`
 */
var CappedList = exports.CappedList = List.prototype.extend();
/**
 * Setup the Capped List.
 *
 * @param {int} length - the maximum length of the list
 * @param {Function} callback
 * @api private
 */
CappedList.prototype.init = function (length) {
    this.len = length || 1000;
}
/**
 * Insert an element before the specified pivot.
 *
 * @param {int} pivot
 * @param {string} value
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
CappedList.prototype.insertBefore = function (pivot, value, callback) {
    callback = callback || function () {};
    var multi = this.client.multi()
    multi.linsert(this.key, 'BEFORE', pivot, value);
    multi.ltrim(this.key, -1 * this.len, -1);
    multi.exec(callback);
    return this;
}
/**
 * Insert an element after the specified pivot.
 *
 * @param {int} pivot
 * @param {string} value
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
CappedList.prototype.insertAfter = function (pivot, value, callback) {
    callback = callback || function () {};
    var multi = this.client.multi()
    multi.linsert(this.key, 'AFTER', pivot, value);
    multi.ltrim(this.key, -1 * this.len, -1);
    multi.exec(callback);
    return this;
}
/**
 * Add one or more elements to the start of the list.
 *
 * @param {string|array} value(s)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
CappedList.prototype.unshift = CappedList.prototype.lpush = function (values, callback) {
    callback = callback || function () {};
    var multi = this.client.multi();
    if (Array.isArray(values)) {
        var key = this.key;
        values.reverse().forEach(function (value) {
            multi.lpush(key, value);
        });
    } else {
        multi.lpush(this.key, values);
    }
    multi.ltrim(this.key, -1 * this.len, -1);
    multi.exec(callback);
    return this;
}
/**
 * Add one or more elements to the end of the list.
 *
 * @param {string|array} value(s)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
CappedList.prototype.push = CappedList.prototype.add = function (values, callback) {
    callback = callback || function () {};
    var multi = this.client.multi();
    if (Array.isArray(values)) {
        var key = this.key;
        values.forEach(function (value) {
            multi.rpush(key, value);
        });
    } else {
        multi.rpush(this.key, values);
    }
    multi.ltrim(this.key, -1 * this.len, -1);
    multi.exec(callback);
    return this;
}
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/advanced_structures/SocialGraph',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Redback
 * Copyright(c) 2011 Chris O'Hara <cohara87@gmail.com>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var Structure = require('../Structure');
/**
 * Build a social graph similar to Twitter's. User ID can be a string or
 * integer, as long as they're unique.
 *
 * Usage:
 *    `redback.createSocialGraph(id [, prefix]);`
 *
 * Reference:
 *    http://redis.io/topics/data-types#sets
 *
 * Redis Structure:
 *    `(namespace:)(prefix:)id:following = set(ids)`
 *    `(namespace:)(prefix:)id:followers = set(ids)`
 */
var SocialGraph = exports.SocialGraph = Structure.new();
/**
 * Initialise the SocialGraph.
 *
 * @param {string} prefix (optional)
 * @api private
 */
SocialGraph.prototype.init = function (prefix) {
    this.key_prefix = this.namespaceKey();
    if (prefix) {
        this.key_prefix += prefix + ':';
    }
    this.key = this.key_prefix + this.id;
    this.following = this.key + ':following';
    this.followers = this.key + ':followers';
}
/**
 * Follow one or more users.
 *
 * @param {int|SocialGraph|Array} user(s)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
SocialGraph.prototype.follow = function (users, callback) {
    var self = this,
        users = this.getKeys(arguments, 'id'),
        multi = this.client.multi();
    if (typeof users[users.length-1] === 'function') {
        callback = users.pop();
    } else {
        callback = function () {};
    }
    users.forEach(function (user) {
        multi.sadd(self.key_prefix + user + ':followers', self.id);
        multi.sadd(self.following, user);
    });
    multi.exec(callback);
    return this;
}
/**
 * Unfollow one or more users.
 *
 * @param {int|SocialGraph|Array} user(s)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
SocialGraph.prototype.unfollow = function (users, callback) {
    var self = this,
        users = this.getKeys(arguments, 'id'),
        multi = this.client.multi();
    if (typeof users[users.length-1] === 'function') {
        callback = users.pop();
    } else {
        callback = function () {};
    }
    users.forEach(function (user) {
        multi.srem(self.key_prefix + user + ':followers', self.id);
        multi.srem(self.following, user);
    });
    multi.exec(callback);
    return this;
}
/**
 * Gets the users whom the current users follows as an array.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
SocialGraph.prototype.getFollowing = function (callback) {
    this.client.smembers(this.following, callback);
    return this;
}
/**
 * Gets an array of users who follow the current user.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
SocialGraph.prototype.getFollowers = function (callback) {
    this.client.smembers(this.followers, callback);
    return this;
}
/**
 * Count how many users the current user follows.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
SocialGraph.prototype.countFollowing = function (callback) {
    this.client.scard(this.following, callback);
    return this;
}
/**
 * Count how many users follow the current user.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
SocialGraph.prototype.countFollowers = function (callback) {
    this.client.scard(this.followers, callback);
    return this;
}
/**
 * Checks whether the current user follows the specified user.
 *
 * @param {string|SocialGraph} user
 * @param {Function} callback
 * @return this
 * @api public
 */
SocialGraph.prototype.isFollowing = function (user, callback) {
    user = this.getKey(user, 'id');
    this.client.sismember(this.following, user, callback);
    return this;
}
/**
 * Checks whether the specified user follows the current user.
 *
 * @param {string|SocialGraph} user
 * @param {Function} callback
 * @return this
 * @api public
 */
SocialGraph.prototype.hasFollower = function (user, callback) {
    user = this.getKey(user, 'id');
    this.client.sismember(this.followers, user, callback);
    return this;
}
/**
 * Gets an array of common followers for one or more users.
 *
 * @param {string|SocialGraph|Array} user(s)
 * @param {Function} callback
 * @return this
 * @api public
 */
SocialGraph.prototype.getCommonFollowers = function (users, callback) {
    var users = this.getSocialKeys(arguments, 'followers');
    users.unshift(this.followers);
    this.client.sinter.apply(this.client, users);
    return this;
}
/**
 * Gets an array of users who are followed by all of the specified user(s).
 *
 * @param {string|SocialGraph|Array} user(s)
 * @param {Function} callback
 * @return this
 * @api public
 */
SocialGraph.prototype.getCommonFollowing = function (users, callback) {
    var users = this.getSocialKeys(arguments, 'following');
    users.unshift(this.following);
    this.client.sinter.apply(this.client, users);
    return this;
}
/**
 * Gets an array of users who follow the current user but do not follow any
 * of the other specified users.
 *
 * @param {string|SocialGraph|Array} user(s)
 * @param {Function} callback
 * @return this
 * @api public
 */
SocialGraph.prototype.getDifferentFollowers = function (users, callback) {
    var users = this.getSocialKeys(arguments, 'followers');
    users.unshift(this.followers);
    this.client.sdiff.apply(this.client, users);
    return this;
}
/**
 * Gets an array of users who are followed by the current user but not any of
 * the other specified users.
 *
 * @param {string|SocialGraph|Array} user(s)
 * @param {Function} callback
 * @return this
 * @api public
 */
SocialGraph.prototype.getDifferentFollowing = function (users, callback) {
    var users = this.getSocialKeys(arguments, 'following');
    users.unshift(this.following);
    this.client.sdiff.apply(this.client, users);
    return this;
}
/**
 * Grabs the specified SocialGraph key from a list of arguments.
 *
 * @param {Array} args
 * @param {string} key
 * @return {string} social_keys
 * @api private
 */
SocialGraph.prototype.getSocialKeys = function (args, key) {
    var users = Array.prototype.slice.call(args),
        callback = users.pop(),
        user_key,
        self = this,
        keys = [];
    for (var i = 0, l = users.length; i < l; i++) {
        if (Array.isArray(users[i])) {
            users[i].forEach(function (user) {
                if (typeof user[key] !== 'undefined') {
                    user_key = user[key];
                } else {
                    user_key = self.key_prefix + user + ':' + key;
                }
                keys.push(user_key);
            });
        } else {
            if (typeof users[i][key] !== 'undefined') {
                user_key = users[i][key];
            } else {
                user_key = self.key_prefix + users[i] + ':' + key;
            }
            keys.push(user_key);
        }
    }
    keys.push(callback);
    return keys;
}
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/advanced_structures/RateLimit',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Redback
 * Copyright(c) 2011 Chris O'Hara <cohara87@gmail.com>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var Structure = require('../Structure');
/**
 * See http://chris6f.com/rate-limiting-with-redis
 *
 * Count the number of times a subject performs an action over an interval
 * in the immediate past - this can be used to rate limit the subject if
 * the count goes over a certain threshold. For example, you could track
 * how many times an IP (the subject) has viewed a page (the action) over
 * a certain time frame and limit them accordingly.
 *
 * Usage:
 *    `redback.createRateLimit(action [, options]);`
 *
 * Options:
 *    `bucket_interval` - default is 5 seconds
 *    `bucket_span`     - default is 10 minutes
 *    `subject_expiry`  - default is 20 minutes
 *
 * Reference:
 *    http://chris6f.com/rate-limiting-with-redis
 *    http://redis.io/topics/data-types#hash
 *
 * Redis Structure:
 *    `(namespace:)action:<subject1> = hash(bucket => count)`
 *    `(namespace:)action:<subject2> = hash(bucket => count)`
 *    `(namespace:)action:<subjectN> = hash(bucket => count)`
 */
var RateLimit = exports.RateLimit = Structure.new();
/**
 * Setup the RateLimit structure.
 *
 * @param {Object} options (optional)
 * @api private
 */
RateLimit.prototype.init = function (options) {
    options = options || {};
    this.bucket_span = options.bucket_span || 600;
    this.bucket_interval = options.bucket_interval || 5;
    this.subject_expiry = options.subject_expiry || 1200;
    this.bucket_count = Math.round(this.bucket_span / this.bucket_interval);
}
/**
 * Get the bucket associated with the current time.
 *
 * @param {int} time (optional) - default is the current time (ms since epoch)
 * @return {int} bucket
 * @api private
 */
RateLimit.prototype.getBucket = function (time) {
    time = (time || new Date().getTime()) / 1000;
    return Math.floor((time % this.bucket_span) / this.bucket_interval);
}
/**
 * Increment the count for the specified subject.
 *
 * @param {string} subject
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
RateLimit.prototype.add = function (subject, callback) {
    if (Array.isArray(subject)) {
        return this.addAll(subject, callback);
    }
    var bucket = this.getBucket(), multi = this.client.multi();
    subject = this.key + ':' + subject;
    //Increment the current bucket
    multi.hincrby(subject, bucket, 1)
    //Clear the buckets ahead
    multi.hdel(subject, (bucket + 1) % this.bucket_count)
         .hdel(subject, (bucket + 2) % this.bucket_count)
    //Renew the key TTL
    multi.expire(subject, this.subject_expiry);
    multi.exec(function (err) {
        if (!callback) return;
        if (err) return callback(err);
        callback(null);
    });
    return this;
}
/**
 * Count the number of times the subject has performed an action
 * in the last `interval` seconds.
 *
 * @param {string} subject
 * @param {int} interval
 * @param {Function} callback
 * @return this
 * @api public
 */
RateLimit.prototype.count = function (subject, interval, callback) {
    var bucket = this.getBucket(),
        multi = this.client.multi(),
        count = Math.floor(interval / this.bucket_interval);
    subject = this.key + ':' + subject;
    //Get the counts from the previous `count` buckets
    multi.hget(subject, bucket);
    while (count--) {
        multi.hget(subject, (--bucket + this.bucket_count) % this.bucket_count);
    }
    //Add up the counts from each bucket
    multi.exec(function (err, counts) {
        if (err) return callback(err, null);
        for (var count = i = 0, l = counts.length; i < l; i++) {
            if (counts[i]) {
                count += parseInt(counts[i], 10);
            }
        }
        callback(null, count);
    });
    return this;
}
/**
 * An alias for `ratelimit.add(subject).count(subject, interval);`
 *
 * @param {string} subject
 * @param {int} interval
 * @param {Function} callback
 * @return this
 * @api public
 */
RateLimit.prototype.addCount = function (subject, interval, callback) {
    var bucket = this.getBucket(),
        multi = this.client.multi(),
        count = Math.floor(interval / this.bucket_interval);
    subject = this.key + ':' + subject;
    //Increment the current bucket
    multi.hincrby(subject, bucket, 1)
    //Clear the buckets ahead
    multi.hdel(subject, (bucket + 1) % this.bucket_count)
         .hdel(subject, (bucket + 2) % this.bucket_count)
    //Renew the key TTL
    multi.expire(subject, this.subject_expiry);
    //Get the counts from the previous `count` buckets
    multi.hget(subject, bucket);
    while (count--) {
        multi.hget(subject, (--bucket + this.bucket_count) % this.bucket_count);
    }
    //Add up the counts from each bucket
    multi.exec(function (err, counts) {
        if (err) return callback(err, null);
        for (var count = 0, i = 4, l = counts.length; i < l; i++) {
            if (counts[i]) {
                count += parseInt(counts[i], 10);
            }
        }
        callback(null, count);
    });
    return this;
}
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/advanced_structures/BloomFilter',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /**
 * Module dependencies.
 */
var Structure = require('../Structure'),
    crc32 = require('../Utils').crc32;
/**
 * A Simple BloomFilter. Bloomfilter is a probabilistic data structure used to
 * determine if an element is present in a set. There may be false positives,
 * but there cannot be false negatives.
 *
 * Usage:
 *    `redback.createBloomFilter(key [, size, hashes]);`
 *
 * Options:
 *    `size` - Size of the bloom filter , default is 100 bits.
 *    `hashes` - Number of hashes to perform. default is 2.
 *
 * Reference:
 *    http://redis.io/commands#string
 *    http://en.wikipedia.org/wiki/Bloom_filter
 *    http://pages.cs.wisc.edu/~cao/papers/summary-cache/node8.html
 *
 * Redis Structure:
 *    `(namespace:)key = string(bits)`
 */
var BloomFilter = exports.BloomFilter = Structure.new();
/**
 * Initialise the bloom filter.
 *
 * @param {int} size (optional) - Size of bloom filter.
 * @param {int} num_hashes(optional) - Number of hashes to perform while storing.
 * @api private
 */
BloomFilter.prototype.init = function(size, num_hashes) {
    this.num_hashes = num_hashes || 2;
    this.size = size || 101;
}
/**
 * Adds an element to the bloom filter.
 *
 * @param {string} item - Item to store into bloom filter
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
BloomFilter.prototype.add = function(item, callback) {
    var multi = this.client.multi(), crc;
    for (var hash_index = 0; hash_index < this.num_hashes; hash_index++) {
        crc = (crc32(item, hash_index) % this.size).toString(2);
        for (var i =0; i <crc.length; i++) {
            if (crc[i] === '1') {
                multi.setbit(this.key, i, 1);
            }
        }
    }
    multi.exec(callback || function () {});
    return this;
}
/**
 * Checks if the element exists in the bloom filter. 
 * This can return false positives( i.e An element does not exist but it returns true)
 * But this can never return false negatives. (i.e an element )
 *
 * @param {string} item - Item to check for existence in bloom filter
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
BloomFilter.prototype.exists = function(item, callback) {
    var multi = this.client.multi(), crc;
    callback = callback || function () {};
    for (var hash_index = 0; hash_index < this.num_hashes; hash_index++) {
        crc = (crc32(item, hash_index) % this.size).toString(2);
        for (var i =0; i < crc.length; i++) {
            if (crc[i] === '1') {
                multi.getbit(this.key, i);
            }
        }
    }
    multi.exec(function(err, results) {
        callback(err, results.indexOf(0) === -1);
    });
    return this;
}
/**
 * Resets the Bloom filter.
 *
 * @param {Function} callback (optional)
 * @return this
 */
BloomFilter.prototype.reset = function (callback) {
    this.client.set(this.key, 0, callback || function () {});
    return this;
}
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/base_structures/List',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Redback
 * Copyright(c) 2011 Chris O'Hara <cohara87@gmail.com>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var Structure = require('../Structure');
/**
 * A wrapper for the Redis list type.
 *
 * Usage:
 *    `redback.createList(key);`
 *
 * Reference:
 *    http://redis.io/topics/data-types#lists
 *
 * Redis Structure:
 *    `(namespace:)key = list(values)`
 */
var List = exports.List = Structure.new();
/**
 * Get the list as an array.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
List.prototype.values = function (callback) {
    this.client.lrange(this.key, 0, -1, callback);
    return this;
}
/**
 * Get a range of list elements.
 *
 * @param {int} start
 * @param {count} end (optional - defaults to the last element)
 * @param {Function} callback
 * @return this
 * @api public
 */
List.prototype.range = function (start, end, callback) {
    if (typeof end === 'function') {
        callback = end;
        end = -1;
    }
    this.client.lrange(this.key, start, end, callback);
    return this;
}
/**
 * Get one or more elements starting at the specified index.
 *
 * @param {int} index
 * @param {count} count (optional - default is 1)
 * @param {Function} callback
 * @return this
 * @api public
 */
List.prototype.get = function (index, count, callback) {
    if (typeof count === 'function') {
        callback = count;
        this.client.lindex(this.key, index, callback);
    } else {
        this.client.lrange(this.key, index, index + count - 1, callback);
    }
    return this;
}
/**
 * Cap the length of the list.
 *
 * @param {int} length
 * @param {bool} keep_earliest (optional - default is false)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
List.prototype.cap = function (length, keep_earliest, callback) {
    callback = callback || function () {};
    var start = 0, end = -1;
    if (typeof keep_earliest === 'function') {
        //Keep the last `length` elements
        start = -1 * length;
        callback = keep_earliest;
    } else {
        //Keep the first `length` elements
        end = length - 1;
    }
    this.client.ltrim(this.key, start, end, callback);
    return this;
}
/**
 * Remove one or more list elements matching the value.
 *
 * @param {string} value
 * @param {bool} count (optional - default is 1)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
List.prototype.remove = function (value, count, callback) {
    callback = callback || function () {};
    if (typeof count === 'function') {
        callback = count;
        count = 1;
    }
    this.client.lrem(this.key, count, value, callback);
    return this;
}
/**
 * Trim a list to the specified bounds.
 *
 * @param {int} start
 * @param {int} end
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
List.prototype.trim = function (start, end, callback) {
    callback = callback || function () {};
    this.client.ltrim(this.key, start, end, callback);
    return this;
}
/**
 * Insert an element before the specified pivot.
 *
 * @param {int} pivot
 * @param {string} value
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
List.prototype.insertBefore = function (pivot, value, callback) {
    callback = callback || function () {};
    this.client.linsert(this.key, 'BEFORE', pivot, value, callback);
    return this;
}
/**
 * Insert an element after the specified pivot.
 *
 * @param {int} pivot
 * @param {string} value
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
List.prototype.insertAfter = function (pivot, value, callback) {
    callback = callback || function () {};
    this.client.linsert(this.key, 'AFTER', pivot, value, callback);
    return this;
}
/**
 * Set the element at the specified index.
 *
 * @param {int} index
 * @param {string} value
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
List.prototype.set = function (index, value, callback) {
    callback = callback || function () {};
    this.client.lset(this.key, index, value, callback);
    return this;
}
/**
 * Get the number of elements in the list.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
List.prototype.length = function (callback) {
    this.client.llen(this.key, callback);
    return this;
}
/**
 * Get and remove the last element in the list. The first param can be used
 * to block the process and wait until list elements are available. If the list
 * is empty in both examples below, the first example will return `null`, while
 * the second will wait for up to 3 seconds. If a list element becomes available
 * during the 3 seconds it will be returned, otherwise `null` will be returned.
 *
 * Example:
 *    `list.shift(callback);`
 *
 * Blocking Example:
 *    `list.shift(3, callback)`
 *
 * @param {int} wait (optional) - seconds to block
 * @param {Function} callback
 * @return this
 * @api public
 */
List.prototype.shift = function (wait, callback) {
    if (typeof wait === 'function') {
        callback = wait;
        this.client.lpop(this.key, callback);
    } else {
        this.client.blpop(this.key, wait, callback);
    }
    return this;
}
/**
 * Get and remove the last element in the list. The first param can be used
 * to block the process and wait until list elements are available. If the list
 * is empty in both examples below, the first example will return `null`, while
 * the second will wait for up to 3 seconds. If a list element becomes available
 * during the 3 seconds it will be returned, otherwise `null` will be returned.
 *
 * Example:
 *    `list.pop(callback);`
 *
 * Blocking Example:
 *    `list.pop(3, callback)`
 *
 * @param {int} wait (optional) - seconds to block
 * @param {Function} callback
 * @return this
 * @api public
 */
List.prototype.pop = function (wait, callback) {
    if (typeof wait === 'function') {
        callback = wait;
        this.client.rpop(this.key, callback);
    } else {
        this.client.brpop(this.key, wait, callback);
    }
    return this;
}
/**
 * Add one or more elements to the start of the list.
 *
 * @param {string|array} value(s)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
List.prototype.unshift = List.prototype.lpush = function (values, callback) {
    callback = callback || function () {};
    if (Array.isArray(values)) {
        var multi = this.client.multi(), key = this.key;
        values.reverse().forEach(function (value) {
            multi.lpush(key, value);
        });
        multi.exec(callback);
    } else {
        this.client.lpush(this.key, values, callback);
    }
    return this;
}
/**
 * Add one or more elements to the end of the list.
 *
 * @param {string|array} value(s)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
List.prototype.push = List.prototype.add = function (values, callback) {
    callback = callback || function () {};
    if (Array.isArray(values)) {
        var multi = this.client.multi(), key = this.key;
        values.forEach(function (value) {
            multi.rpush(key, value);
        });
        multi.exec(callback);
    } else {
        this.client.rpush(this.key, values, callback);
    }
    return this;
}
/**
 * Remove the last element of the list and add it to the start
 * of another list.
 *
 * @param {String|List} list
 * @param {bool} wait (optional) - seconds to block while waiting
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
List.prototype.popShift = function (list, wait, callback) {
    callback = callback || function () {};
    list = this.getKey(list);
    if (typeof wait === 'function') {
        callback = wait;
        this.client.rpoplpush(this.key, list, callback);
    } else {
        this.client.brpoplpush(this.key, list, wait, callback);
    }
    return this;
}
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/base_structures/SortedSet',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Redback
 * Copyright(c) 2011 Chris O'Hara <cohara87@gmail.com>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var Structure = require('../Structure');
/**
 * A wrapper for the Redis sorted set (zset) type. Each element has a
 * score which is used to rank and order all elements in the set. Elements
 * are ranked from lowest score to highest (the lowest score has
 * a rank of 0)
 *
 * Usage:
 *    `redback.createSortedSet(key);`
 *
 * Reference:
 *    http://redis.io/topics/data-types#sorted-sets
 *
 * Redis Structure:
 *    `(namespace:)key = zset(score => element)`
 */
var SortedSet = exports.SortedSet = Structure.new();
/**
 * Add one or more elements to the set.
 *
 * To add a single element and score:
 *    `set.add(12, 'foo', callback);`
 *
 * To add multiple elements/scores:
 *    `set.add({foo:12, bar:3}, callback);`
 *
 * @param {int} score (optional)
 * @param {string|Object} element(s)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
SortedSet.prototype.add = function (score, element, callback) {
    callback = callback || function () {};
    if (typeof score === 'object') {
        callback = element;
        element = score;
        return this.addAll(element, callback);
    }
    this.client.zadd(this.key, score, element, callback);
    return this;
}
/**
 * Remove one or more elements from the set.
 *
 * @param {string|Array} element(s)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
SortedSet.prototype.remove = function (element, callback) {
    callback = callback || function () {};
    if (Array.isArray(element)) {
        return this.removeAll(element, callback);
    }
    this.client.zrem(this.key, element, callback);
    return this;
}
/**
 * Get the number of elements in the set.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
SortedSet.prototype.length = function (callback) {
    this.client.zcard(this.key, callback);
    return this;
}
/**
 * Check whether an element exists in the set.
 *
 * @param {string} element
 * @param {Function} callback
 * @return this
 * @api public
 */
SortedSet.prototype.exists =
SortedSet.prototype.contains = function (element, callback) {
    this.client.zscore(this.key, element, function (err, score) {
        callback(err, score != null);
    });
    return this;
}
/**
 * Get the rank of the specified element.
 *
 * @param {string} element
 * @param {Function} callback
 * @return this
 * @api public
 */
SortedSet.prototype.rank = function (element, callback) {
    this.client.zrank(this.key, element, callback)
    return this;
}
/**
 * Get the score of the specified element.
 *
 * @param {string} element
 * @param {Function} callback
 * @return this
 * @api public
 */
SortedSet.prototype.score = function (element, callback) {
    this.client.zscore(this.key, element, callback)
    return this;
}
/**
 * Increment the specified element's score.
 *
 * @param {string} element
 * @param {int} amount (optional - default is 1)
 * @param {Function} callback (optional)
 * @return this;
 * @api public
 */
SortedSet.prototype.increment =
SortedSet.prototype.incrBy = function (element, amount, callback) {
    callback = callback || function () {};
    if (typeof amount === 'function') {
        callback = amount;
        amount = 1;
    }
    this.client.zincrby(this.key, amount, element, callback);
    return this;
}
/**
 * Decrement the specified element's score.
 *
 * @param {string} element
 * @param {int} amount (optional - default is 1)
 * @param {Function} callback (optional)
 * @return this;
 * @api public
 */
SortedSet.prototype.decrement =
SortedSet.prototype.decrBy = function (element, amount, callback) {
    callback = callback || function () {};
    if (typeof amount === 'function') {
        callback = amount;
        amount = 1;
    }
    this.client.zincrby(this.key, -1 * amount, element, callback);
    return this;
}
/**
 * Add multiple elements to the set. See `add()`.
 *
 * @param {Object} elements
 * @param {Function} callback
 * @return this
 * @api private
 */
SortedSet.prototype.addAll = function (elements, callback) {
    var self = this, i,
        remaining = 0,
        failed = false,
        add_count = 0;
    for (i in elements) {
        remaining++;
        this.client.zadd(this.key, elements[i], i, function (err, added) {
            if (failed) {
                return;
            } else if (err) {
                failed = true;
                return callback(err);
            } else {
                if (added) add_count++;
                if (!--remaining) {
                    callback(null, add_count);
                }
            }
        });
    }
    return this;
}
/**
 * Remove multiple elements from the set. See `remove()`
 *
 * @param {Array} elements
 * @param {Function} callback
 * @return this
 * @api private
 */
SortedSet.prototype.removeAll = function (elements, callback) {
    var self = this,
        remaining = elements.length,
        failed = false,
        rem_count = 0;
    elements.forEach(function (element) {
        self.client.zrem(self.key, element, function (err, added) {
            if (failed) {
                return;
            } else if (err) {
                failed = true;
                return callback(err);
            } else {
                if (added) rem_count++;
                if (!--remaining) callback(null, rem_count);
            }
        });
    });
    return this;
}
/**
 * Get all elements in the set as an object `{element: score, ...}`.
 * If `without_scores` is true then just an array of elements is returned.
 *
 * @param {bool} without_scores (optional - scores are included by default)
 * @param {Function} callback
 * @return this
 * @api public
 */
SortedSet.prototype.get = function (without_scores, callback) {
    if (typeof without_scores === 'function') {
        callback = without_scores;
        this.client.zrange(this.key, 0, -1, 'WITHSCORES', this.parseScores(callback));
    } else {
        this.client.zrange(this.key, 0, -1, callback);
    }
    return this;
}
/**
 * Return a callback that parses a WITHSCORES result:
 *    `['foo','1','bar','2'] => {foo:1, bar:2}`
 *
 * @param {Function} callback
 * @api private
 */
SortedSet.prototype.parseScores = function (callback) {
    return function (err, results) {
        if (err) return callback(err, null);
        if (!results || results.length < 2) return callback(null, null);
        var len = results.length, i = 0, ret = {}, key, value;
        while (true) {
            key = results[i++];
            value = results[i++];
            ret[key] = value;
            if (i >= len) break;
        }
        callback(null, ret);
    }
}
/**
 * Get elements with scores between the specified range. Elements are returned
 * as an object `{element: score, ..}` and ordered from highest score to lowest.
 *
 * Note that the `start` and `end` range is inclusive and can be an integer or
 * the constants `redback.INF` to represent infinity, or `redback.NINF` to
 * represent negative infinity. `start` must be <= `end`.
 *
 * @param {int} start
 * @param {int} end
 * @param {int} count (optional) - the maximum number of elements to return
 * @param {int} offset (optional) - if using count, start at this offset
 * @param {Function} callback
 * @return this
 * @api public
 */
SortedSet.prototype.getScores = function (start, end, count, offset, callback) {
    if (null === start) start = '-inf';
    if (null === end) end = '+inf';
    if (typeof count === 'function') {
        callback = count;
        this.client.zrangebyscore(this.key, start, end,
            'WITHSCORES', this.parseScores(callback));
        return this;
    } else if (typeof offset === 'function') {
        callback = offset;
        offset = 0;
    }
    this.client.zrangebyscore(this.key, start, end, 'WITHSCORES',
        'LIMIT', offset, count, this.parseScores(callback));
    return this;
}
/**
 * The same as `getScores()` but elements are ordered from lowest score to
 * highest.
 *
 * Note that `end` must be <= `start`.
 *
 * @param {int} start
 * @param {int} end
 * @param {int} count (optional) - the maximum number of elements to return
 * @param {int} offset (optional) - if using count, start at this offset
 * @param {Function} callback
 * @return this
 * @api public
 */
SortedSet.prototype.getScoresReverse = function (start, end, count, offset, callback) {
    if (null === start) start = '+inf';
    if (null === end) end = '-inf';
    if (typeof count === 'function') {
        callback = count;
        this.client.zrevrangebyscore(this.key, start, end,
            'WITHSCORES', this.parseScores(callback));
        return this;
    } else if (typeof offset === 'function') {
        callback = offset;
        offset = 0;
    }
    this.client.zrevrangebyscore(this.key, start, end, 'WITHSCORES',
        'LIMIT', offset, count, this.parseScores(callback));
    return this;
}
/**
 * Remove elements with scores between the specified range (inclusive).
 *
 * @param {int} start
 * @param {int} end
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
SortedSet.prototype.removeScores = function (start, end, callback) {
    callback = callback || function () {};
    if (null === start) start = '-inf';
    if (null === end) end = '+inf';
    this.client.zremrangebyscore(this.key, start, end, callback);
    return this;
}
/**
 * Count the number of elements with scores between the specified
 * range (inclusive).
 *
 * @param {int} start
 * @param {int} end
 * @param {Function} callback
 * @return this
 * @api public
 */
SortedSet.prototype.countScores = function (start, end, callback) {
    if (null === start) start = '-inf';
    if (null === end) end = '+inf';
    this.client.zcount(this.key, start, end, callback);
    return this;
}
/**
 * Get elements with ranks between the specified range (inclusive).
 *
 * To get the first 3 elements in the set (with the highest scores):
 *    `set.getRanks(0, 2, callback);`
 *
 * To get the last 3 elements in the set (lowest scores):
 *    `set.getRanks(-3, -1, callback);`
 *
 * @param {int} start
 * @param {int} end
 * @param {Function} callback
 * @return this
 * @api public
 */
SortedSet.prototype.getRanks = function (start, end, callback) {
    if (null === start) start = 0;
    if (null === end) end = -1;
    this.client.zrange(this.key, start, end,
        'WITHSCORES', this.parseScores(callback));
    return this;
}
/**
 * The same as `getRanks()` but elements are ordered from lowest score
 * to the highest.
 *
 * Note that start and end have been deliberately switched for consistency.
 *
 * getScoresReverse(arg1, arg2, ..) expects arg1 >= arg2 and so does this
 * method.
 *
 * @param {int} end
 * @param {int} start
 * @param {Function} callback
 * @return this
 * @api public
 */
SortedSet.prototype.getRanksReverse = function (end, start, callback) {
    if (null === start) start = -1;
    if (null === end) end = 0;
    this.client.zrevrange(this.key, start, end,
        'WITHSCORES', this.parseScores(callback));
    return this;
}
/**
 * Remove elements with ranks between the specified range (inclusive).
 *
 * @param {int} start
 * @param {int} end
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
SortedSet.prototype.removeRanks = function (start, end, callback) {
    callback = callback || function () {};
    if (null === start) start = -1;
    if (null === end) end = 0;
    this.client.zremrangebyrank(this.key, start, end, callback);
    return this;
}
/**
 * Get `count` elements with the highest scores.
 *
 * @param {int} count
 * @param {Function} callback
 * @return this
 * @api public
 */
SortedSet.prototype.highestScores = function (count, callback) {
    this.getRanks(-1 * count, -1, callback);
    return this;
}
/**
 * Get `count` elements with the lowest scores.
 *
 * @param {int} count
 * @param {Function} callback
 * @return this
 * @api public
 */
SortedSet.prototype.lowestScores = function (count, callback) {
    this.getRanks(0, count - 1, callback);
    return this;
}
/**
 * Get the intersection of one or more sets. For more information on weights,
 * aggregate functions, etc. see: http://redis.io/commands/zinterstore
 *
 * @param {int} dest
 * @param {string|Set|Array} set(s)
 * @param {int|Array} weights (optional)
 * @param {string} aggregate (optional) - either SUM, MIN or MAX
 * @param {Function} callback
 * @return this
 * @api public
 */
SortedSet.prototype.inter = function (dest, sets, weights, aggregate, callback) {
    var args = [], self = this;
    args.push(this.getKey(dest));
    //weights/aggregate are optional
    if (typeof weights === 'function') {
        callback = weights;
        weights = aggregate = false;
    } else if (typeof aggregate === 'function') {
        callback = aggregate;
        aggregate = false;
    }
    //ZINTERSTORE destination numkeys key [key ...]
    //    [WEIGHTS weight [weight ...]] [AGGREGATE SUM|MIN|MAX]
    if (Array.isArray(sets)) {
        args.push(sets.length);
        sets.forEach(function (set) {
            args.push(self.getKey(set));
        });
    } else {
        args.push(1, this.getKey(sets));
    }
    if (weights) {
        args.push('WEIGHTS');
        if (Array.isArray(weights)) {
            weights.forEach(function (weight) {
                args.push(weight);
            });
        } else {
            args.push(weights);
        }
    }
    if (aggregate) {
        args.push('AGGREGATE', aggregate);
    }
    args.push(callback);
    this.client.zinterstore.apply(this.client, args);
    return this;
}
/**
 * Get the union of one or more sets. For more information on weights,
 * aggregate functions, etc. see: http://redis.io/commands/zunionstore
 *
 * @param {int} dest
 * @param {string|Set|Array} set(s)
 * @param {int|Array} weights (optional)
 * @param {string} aggregate (optional) - either SUM, MIN or MAX
 * @param {Function} callback
 * @return this
 * @api public
 */
SortedSet.prototype.union = function (dest, sets, weights, aggregate, callback) {
    var args = [], self = this;
    args.push(this.getKey(dest));
    //weights/aggregate are optional
    if (typeof weights === 'function') {
        callback = weights;
        weights = aggregate = false;
    } else if (typeof aggregate === 'function') {
        callback = aggregate;
        aggregate = false;
    }
    //ZUNIONSTORE destination numkeys key [key ...]
    //    [WEIGHTS weight [weight ...]] [AGGREGATE SUM|MIN|MAX]
    if (Array.isArray(sets)) {
        args.push(sets.length);
        sets.forEach(function (set) {
            args.push(self.getKey(set));
        });
    } else {
        args.push(1, this.getKey(sets));
    }
    if (weights) {
        args.push('WEIGHTS');
        if (Array.isArray(weights)) {
            weights.forEach(function (weight) {
                args.push(weight);
            });
        } else {
            args.push(weights);
        }
    }
    if (aggregate) {
        args.push('AGGREGATE', aggregate);
    }
    args.push(callback);
    this.client.zunionstore.apply(this.client, args);
    return this;
}
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/base_structures/Hash',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Redback
 * Copyright(c) 2011 Chris O'Hara <cohara87@gmail.com>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var Structure = require('../Structure');
/**
 * A wrapper for the Redis hash type.
 *
 * Usage:
 *    `redback.createHash(key);`
 *
 * Reference:
 *    http://redis.io/topics/data-types#hashes
 *
 * Redis Structure:
 *    `(namespace:)key = hash(key => value)`
 */
var Hash = exports.Hash = Structure.new();
/**
 * Get an array of hash keys.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
Hash.prototype.keys = function (callback) {
    this.client.hkeys(this.key, callback);
    return this;
}
/**
 * Get an array of hash values.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
Hash.prototype.values = function (callback) {
    this.client.hvals(this.key, callback);
    return this;
}
/**
 * Get the number of hash keys.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
Hash.prototype.length = function (callback) {
    this.client.hlen(this.key, callback);
    return this;
}
/**
 * Delete a hash key.
 *
 * @param {string} hash_key
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Hash.prototype.delete = Hash.prototype.del = function (hash_key, callback) {
    callback = callback || function () {};
    this.client.hdel(this.key, hash_key, callback);
    return this;
}
/**
 * Checks whether a hash key exists.
 *
 * @param {string} hash_key
 * @param {Function} callback
 * @return this
 * @api public
 */
Hash.prototype.exists = function (hash_key, callback) {
    this.client.hexists(this.key, hash_key, callback);
    return this;
}
/**
 * Sets one or more key/value pairs.
 *
 * To set one key/value pair:
 *    `hash.set('foo', 'bar', callback);`
 *
 * To set multiple:
 *    `hash.set({key1:'value1', key2:'value2}, callback);`
 *
 * @param {string|Object} hash_key
 * @param {string} value (optional)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Hash.prototype.set = function (hash_key, value, callback) {
    if (typeof hash_key === 'object') {
        callback = value || function () {};
        this.client.hmset(this.key, hash_key, callback);
    } else {
        callback = callback || function () {};
        this.client.hset(this.key, hash_key, value, callback);
    }
    return this;
}
/**
 * Sets a key/value pair if the key doesn't already exist.
 *
 * @param {string} hash_key
 * @param {string} value
 * @param {Function} callback
 * @return this
 * @api public
 */
Hash.prototype.add = function (hash_key, value, callback) {
    callback = callback || function () {};
    this.client.hsetnx(this.key, hash_key, value, callback);
    return this;
}
/**
 * Gets one or more key/value pairs.
 *
 * To get all key/value pairs in the hash:
 *    `hash.get('foo', callback);`
 *
 * To get certain key/value pairs:
 *    `hash.get(['foo','bar'], callback);`
 *    `hash.get('foo', callback);`
 *
 * @param {string} hash_key (optional)
 * @param {Function} callback
 * @return this
 * @api public
 */
Hash.prototype.get = function (hash_key, callback) {
    if (typeof hash_key === 'function') {
        callback = hash_key;
        this.client.hgetall(this.key, callback);
    } else if (Array.isArray(hash_key)) {
        this.client.hmget(this.key, hash_key, callback)
    } else {
        this.client.hget(this.key, hash_key, callback);
    }
    return this;
}
/**
 * Increment the specified hash value.
 *
 * @param {string} hash_key
 * @param {int} amount (optional - default is 1)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Hash.prototype.increment =
Hash.prototype.incrBy = function (hash_key, amount, callback) {
    callback = callback || function () {};
    if (typeof amount === 'function') {
        callback = amount;
        amount = 1;
    }
    this.client.hincrby(this.key, hash_key, amount, callback);
    return this;
}
/**
 * Decrement the specified hash value.
 *
 * @param {string} hash_key
 * @param {int} amount (optional - default is 1)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Hash.prototype.decrement =
Hash.prototype.decrBy = function (hash_key, amount, callback) {
    callback = callback || function () {};
    if (typeof amount === 'function') {
        callback = amount;
        amount = 1;
    }
    this.client.hincrby(this.key, hash_key, -1 * amount, callback);
    return this;
}
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/base_structures/Bitfield',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Redback
 * Copyright(c) 2011 Chris O'Hara <cohara87@gmail.com>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var Structure = require('../Structure');
/**
 * Wrap the Redis bit commands.
 *
 * Usage:
 *    `redback.createBitfield(key);`
 *
 * Reference:
 *    http://redis.io/commands#string
 *
 * Redis Structure:
 *    `(namespace:)key = string`
 */
var Bitfield = exports.Bitfield = Structure.new();
/**
 * Get a single bit
 *
 * @param {int} bit
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Bitfield.prototype.get = function (bit, callback) {
    callback = callback || function () {};
    this.client.getbit(this.key, bit, callback);
    return this;
}
/**
 * Set a single bit. The callback receives the previous value.
 *
 * @param {int} bit
 * @param {bool} value
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Bitfield.prototype.set = function (bit, value, callback) {
    callback = callback || function () {};
    this.client.setbit(this.key, bit, value ? 1 : 0, callback);
    return this;
}
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/base_structures/Set',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Redback
 * Copyright(c) 2011 Chris O'Hara <cohara87@gmail.com>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
var Structure = require('../Structure');
/**
 * A wrapper for the Redis set type.
 *
 * Usage:
 *    `redback.createSet(key);`
 *
 * Reference:
 *    http://redis.io/topics/data-types#sets
 *
 * Redis Structure:
 *    `(namespace:)key = set(elements)`
 */
var Set = exports.Set = Structure.new();
/**
 * Add one or more elements to the set.
 *
 * @param {string|Array} element(s)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Set.prototype.add = function (element, callback) {
    callback = callback || function () {};
    if (Array.isArray(element)) {
        return this.addAll(element, callback);
    }
    this.client.sadd(this.key, element, callback);
    return this;
}
/**
 * Remove one or more elements from the set.
 *
 * @param {string|Array} element(s)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Set.prototype.remove = function (element, callback) {
    callback = callback || function () {};
    if (Array.isArray(element)) {
        return this.removeAll(element, callback);
    }
    this.client.srem(this.key, element, callback);
    return this;
}
/**
 * Get an array of elements in the set.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
Set.prototype.elements = Set.prototype.members = function (callback) {
    this.client.smembers(this.key, callback);
    return this;
}
/**
 * Move an element to another set.
 *
 * @param {string|Set} dest
 * @param {string} element
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Set.prototype.move = function (dest, element, callback) {
    callback = callback || function () {};
    this.client.smove(this.key, this.getKey(dest), element, callback);
    return this;
}
/**
 * Check whether an element exists in the set.
 *
 * @param {string} element
 * @param {Function} callback
 * @return this
 * @api public
 */
Set.prototype.exists = Set.prototype.contains = function (element, callback) {
    this.client.sismember(this.key, element, callback);
    return this;
}
/**
 * Get the length (cardinality) of the set.
 *
 * @param {Function} callback
 * @return this
 * @api public
 */
Set.prototype.length = Set.prototype.cardinality = function (callback) {
    this.client.scard(this.key, callback);
    return this;
}
/**
 * Get a random element from the set and optionally remove it.
 *
 * @param {bool} remove (optional - default is false)
 * @param {Function} callback
 * @return this
 * @api public
 */
Set.prototype.random = function (remove, callback) {
    if (typeof remove === 'function') {
        callback = remove;
        this.client.srandmember(this.key, callback);
    } else {
        this.client.spop(this.key, callback);
    }
    return this;
}
/**
 * Get the intersection of one or more sets.
 *
 * @param {string|Set|Array} set(s)
 * @param {Function} callback
 * @return this
 * @api public
 */
Set.prototype.inter = function (sets, callback) {
    sets = this.getKeys(arguments);
    sets.unshift(this.key);
    this.client.sinter.apply(this.client, sets);
    return this;
}
/**
 * Get the intersection of one or more sets and store it another
 * set (dest).
 *
 * @param {string|Set} dest
 * @param {string|Set|Array} set(s)
 * @param {Function} callback
 * @return this
 * @api public
 */
Set.prototype.interStore = function (dest, sets, callback) {
    sets = this.getKeys(arguments);
    dest = sets.shift();
    sets.unshift(dest, this.key);
    this.client.sinterstore.apply(this.client, sets);
    return this;
}
/**
 * Get the union of one or more sets.
 *
 * @param {string|Set|Array} set(s)
 * @param {Function} callback
 * @return this
 * @api public
 */
Set.prototype.union = function (sets, callback) {
    sets = this.getKeys(arguments);
    sets.unshift(this.key);
    this.client.sunion.apply(this.client, sets);
    return this;
}
/**
 * Get the union of one or more sets and store it another
 * set (dest).
 *
 * @param {string|Set} dest
 * @param {string|Set|Array} set(s)
 * @param {Function} callback
 * @return this
 * @api public
 */
Set.prototype.unionStore = function (dest, sets, callback) {
    sets = this.getKeys(arguments);
    dest = sets.shift();
    sets.unshift(dest, this.key);
    this.client.sunionstore.apply(this.client, sets);
    return this;
}
/**
 * Get the difference of one or more sets.
 *
 * @param {string|Set|Array} set(s)
 * @param {Function} callback
 * @return this
 * @api public
 */
Set.prototype.diff = function (sets, callback) {
    sets = this.getKeys(arguments);
    sets.unshift(this.key);
    this.client.sdiff.apply(this.client, sets);
    return this;
}
/**
 * Get the difference of one or more sets and store it another
 * set (dest).
 *
 * @param {string|Set} dest
 * @param {string|Set|Array} set(s)
 * @param {Function} callback
 * @return this
 * @api public
 */
Set.prototype.diffStore = function (dest, sets, callback) {
    sets = this.getKeys(arguments);
    dest = sets.shift();
    sets.unshift(dest, this.key);
    this.client.sdiffstore.apply(this.client, sets);
    return this;
}
/**
 * Add multiple elements to the set.
 *
 * @param {Array} elements
 * @param {Function} callback
 * @return this
 * @api private
 */
Set.prototype.addAll = function (elements, callback) {
    var self = this,
        remaining = elements.length,
        failed = false,
        add_count = 0;
    elements.forEach(function (element) {
        self.client.sadd(self.key, element, function (err, added) {
            if (failed) {
                return;
            } else if (err) {
                failed = true;
                return callback(err);
            } else {
                if (added) add_count++;
                if (!--remaining) callback(null, add_count);
            }
        });
    });
    return this;
}
/**
 * Remove multiple elements from the set.
 *
 * @param {Array} elements
 * @param {Function} callback
 * @return this
 * @api private
 */
Set.prototype.removeAll = function (elements, callback) {
    var self = this,
        remaining = elements.length,
        failed = false,
        rem_count = 0;
    elements.forEach(function (element) {
        self.client.srem(self.key, element, function (err, removed) {
            if (failed) {
                return;
            } else if (err) {
                failed = true;
                return callback(err);
            } else {
                if (removed) rem_count++;
                if (!--remaining) callback(null, rem_count);
            }
        });
    });
    return this;
}
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/Cache',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*!
 * Redback
 * Copyright(c) 2011 Chris O'Hara <cohara87@gmail.com>
 * MIT Licensed
 */
/**
 * Use Redis as a cache backend.
 *
 * Usage:
 *    `redback.createCache(namespace);`
 *
 * Reference:
 *    http://redis.io/commands#string
 *
 * Redis Structure:
 *    `(namespace:)cache_namespace:key = string`
 */
var Cache = exports.Cache = function (client, namespace) {
    this.client = client;
    this.namespace = namespace;
}
/**
 * Add the namespace on to cache keys.
 *
 * @param {string} key
 * @return namespaced_key;
 * @api private
 */
Cache.prototype.getKey = function (key) {
    return this.namespace + ':' + key;
}
/**
 * Cache one or more values.
 *
 * To cache a single value by key:
 *    `cache.set('foo', 'bar', callback);`
 *
 * To set multiple cached values by key:
 *    `cache.set({foo:'bar', key2:'value2'}, callback);`
 *
 * @param {string} key
 * @param {string} value
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Cache.prototype.set = function (key, value, expiry, callback) {
    callback = callback || function () {};
    if (typeof expiry === 'function') {
        callback = expiry;
        this.client.set(this.getKey(key), value, callback);
    } else if (typeof value === 'function') {
        callback = value;
        var i, set = [];
        for (i in key) {
            set.push(this.getKey(i));
            set.push(key[i]);
        }
        set.push(callback);
        this.client.mset.apply(this.client, set);
    } else {
        this.client.setex(this.getKey(key), expiry, value, callback);
    }
    return this;
}
/**
 * Add one or more values to the cache, but only if the cache
 * key(s) do not already exist.
 *
 * @param {string|Object} key
 * @param {string} value (optional)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Cache.prototype.add = function (key, value, callback) {
    callback = callback || function () {};
    if (typeof value === 'function') {
        callback = value;
        var i, set = [];
        for (i in key) {
            set.push(this.getKey(i));
            set.push(key[i]);
        }
        set.push(callback);
        this.client.msetnx.apply(this.client, set);
    } else {
        this.client.setnx(this.getKey(key), value, callback);
    }
    return this;
}
/**
 * Get one or more values from the cache.
 *
 * To get a single cached value by key:
 *    `cache.get('foo', callback);`
 *
 * To get multiple cached values by key:
 *    `cache.get(['foo','bar'], callback);`
 *
 * To get all cached values:
 *    `cache.get(callback);`
 *
 * @param {string} key
 * @param {string} value
 * @param {Function} callback
 * @return this
 * @api public
 */
Cache.prototype.get = function (key, callback) {
    var namespace_len = this.namespace.length + 1,
        self = this;
    var multi_get = function (keys) {
        var get_args = [];
        keys.forEach(function (key) {
            get_args.push(key);
        })
        get_args.push(function (err, values) {
            if (err) return callback(err, null);
            var i, l, ret = {};
            for (i = 0, l = keys.length; i < l; i++) {
                ret[keys[i].substr(namespace_len)] = values[i];
            }
            callback(null, ret);
        });
        self.client.mget.apply(self.client, get_args);
    }
    if (typeof key === 'function') {
        callback = key;
        this.keys('*', true, function (err, keys) {
            if (err) callback(err, null);
            multi_get(keys);
        });
    } else if (Array.isArray(key)) {
        if (!key.length) callback(null, null);
        for (var get = [], i = 0, l = key.length; i < l; i++) {
            key[i] = this.getKey(key[i]);
        }
        multi_get(key);
    } else {
        this.client.get(this.getKey(key), callback);
    }
    return this;
}
/**
 * Set a cache key and return the current value.
 *
 * @param {string} key
 * @param {string} value
 * @param {Function} callback
 * @return this
 * @api public
 */
Cache.prototype.getSet = function (key, value, callback) {
    this.client.getset(this.getKey(key), value, callback);
    return this;
}
/**
 * Check whether a cache key exists.
 *
 * @param {string} key
 * @param {Function} callback
 * @return this
 * @api public
 */
Cache.prototype.exists = function (key, callback) {
    this.client.exists(this.getKey(key), callback);
    return this;
}
/**
 * Increment the specified cache value.
 *
 * @param {string} key
 * @param {int} amount (optional - default is 1)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Cache.prototype.increment =
Cache.prototype.incrBy = function (key, amount, callback) {
    callback = callback || function () {};
    if (typeof amount === 'function') {
        callback = amount;
        amount = 1;
    }
    this.client.incrby(this.getKey(key), amount, callback);
    return this;
}
/**
 * Decrement the specified cache value.
 *
 * @param {string} key
 * @param {int} amount (optional - default is 1)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Cache.prototype.decrement =
Cache.prototype.decrBy = function (key, amount, callback) {
    callback = callback || function () {};
    if (typeof amount === 'function') {
        callback = amount;
        amount = 1;
    }
    this.client.decrby(this.getKey(key), amount, callback);
    return this;
}
/**
 * Get all cache keys matching the pattern.
 *
 * @param {string} pattern (optional - default is *)
 * @param {bool} keep_namespace (optional - default is false)
 * @param {Function} callback
 * @return this
 * @api public
 */
Cache.prototype.keys = function (pattern, keep_namespace, callback) {
    if (typeof pattern === 'function') {
        keep_namespace = false;
        callback = pattern;
        pattern = '*';
    } else if (typeof keep_namespace === 'function') {
        callback = keep_namespace;
        keep_namespace = false;
    }
    var self = this;
    if (keep_namespace) {
        this.client.keys(this.namespace + ':' + pattern, function (err, keys) {
            if (err) return callback(err, null);
            if (!keys) return callback(null, []);
            callback(null, keys);
        });
    } else {
        var namespace_len = this.namespace.length + 1;
        this.client.keys(this.namespace + ':' + pattern, function (err, keys) {
            if (err) return callback(err, null);
            if (!keys) return callback(null, []);
            if (null == keys) return callback(null, []);
            for (var i = 0, l = keys.length; i < l; i++) {
                keys[i] = keys[i].substr(namespace_len);
            }
            callback(null, keys);
        });
    }
}
/**
 * Flush all cache keys matching the pattern.
 *
 * @param {string} pattern (optional - default is *)
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Cache.prototype.flush = function (pattern, callback) {
    callback = callback || function () {};
    if (typeof pattern === 'function') {
        callback = pattern;
        pattern = '*';
    }
    var self = this;
    this.keys(pattern, true, function (err, keys) {
        if (err) return callback(err, null);
        if (!keys) return callback(err, []);
        var error = false, remaining = keys.length, del_count = 0;
        keys.forEach(function (key) {
            self.client.del(key, function (err, deleted) {
                if (error) {
                    return;
                } else if (err) {
                    error = true;
                    return callback(err, null);
                }
                del_count++;
                if (!--remaining) callback(err, del_count);
            });
        });
    });
}
/**
 * Expire the cache key after a certain number of seconds.
 *
 * @param {int} ttl
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Cache.prototype.expire = function (key, ttl, callback) {
    callback = callback || function () {};
    this.client.expire(this.getKey(key), ttl, callback);
    return this;
}
/**
 * Expire the cache key at a certain date.
 *
 * @param {string} key
 * @param {Date} when
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Cache.prototype.expireAt = function (key, when, callback) {
    callback = callback || function () {};
    if (typeof when.getTime === 'function') {
        when = Math.round(when.getTime() / 1000); //ms => s
    }
    this.client.expireat(this.getKey(key), when, callback);
    return this;
}
/**
 * Get the number of seconds before the cache key expires.
 *
 * @param {string} key
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Cache.prototype.ttl = function (key, callback) {
    callback = callback || function () {};
    this.client.ttl(this.getKey(key), callback);
    return this;
}
/**
 * Checks whether a cache key has an expiry.
 *
 * @param {string} key
 * @param {Function} callback
 * @return this
 * @api public
 */
Cache.prototype.isVolatile = function (key, callback) {
    this.client.ttl(this.getKey(key), function (err, ttl) {
        if (err) return callback(err, null);
        callback(null, ttl != -1);
    });
    return this;
}
/**
 * Remove the cache key's associated expiry.
 *
 * @param {string} key
 * @param {Function} callback (optional)
 * @return this
 * @api public
 */
Cache.prototype.persist = function (key, callback) {
    callback = callback || function () {};
    this.client.persist(this.getKey(key), callback);
    return this;
}
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'lib/Utils',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      /*
===============================================================================
Crc32 is a JavaScript function for computing the CRC32 of a string
...............................................................................
Version: 1.2 - 2006/11 - http://noteslog.com/category/javascript/
-------------------------------------------------------------------------------
Copyright (c) 2006 Andrea Ercolino
http://www.opensource.org/licenses/mit-license.php
===============================================================================
*/
exports.crc32 = function(str, crc) {
  if(crc == undefined) crc = 0;
  var n = 0; //a number between 0 and 255
  var x = 0; //an hex number
  crc = crc ^ (-1);
  for( var i = 0, iTop = str.length; i < iTop; i++ ) {
    n = ( crc ^ str.charCodeAt( i ) ) & 0xFF;
    x = "0x" + table.substr( n * 9, 8 );
    crc = ( crc >>> 8 ) ^ x;
  }
  return Math.abs(crc ^ (-1));
};
var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
    }
  };
});
horseDatastore.module(18, function(onejsModParent){
  return {
    'id':'index',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      module.exports = require('./lib/Redback');
    }
  };
});
horseDatastore.pkg(1, function(parent){
  return {
    'id':19,
    'name':'freebase',
    'main':undefined,
    'mainModuleId':'freebase',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(19, function(onejsModParent){
  return {
    'id':'freebase',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      var request = require('request');
    
  
  ////disambiguates query term
  function queryterm(term, query){
    if(term.match(/\/.{2,5}\/.{4}/)){//looks like an id
      query[0].id=term;
    }
    else{
    query[0].id=null;
    query[0].search={"query": term, "id": null, "score": null};
    }
    return query;
  }
exports.search=function(q, callback, query){
    var add=[{
       "search":{"query": q, "score": null},
       "name": null,
       "id":null,
       "limit": 10,
       "sort": "-search.score"
    }];
   
   if(!query){query=[{}];}
   for(var i in add[0]){
     query[0][i]=add[0][i];   
   }
   
   return exports.query_freebase(query, function(response){
     if(response.result && response.result[0]){
       callback(response.result);
     }
   }, {extended:true});
}
exports.get_description=function(q, callback, query){
    var add=[{
       "/common/topic/article": [{"text": {"chars": null, "maxlength": 500}}],
       "name": null,
       "id":null,
       "limit": 1
    }];
    add=queryterm(q, add);
   
   if(!query){query=[{}];}
   for(var i in add[0]){
     query[0][i]=add[0][i];   
   }
   
   return exports.query_freebase(query, function(response){
     if(response.result && response.result[0] && response.result[0]['/common/topic/article'][0] && response.result[0]['/common/topic/article'][0].text.chars){
       callback(response.result[0]['/common/topic/article'][0].text.chars);
     }
   }, {extended:true});
}
exports.get_image=function(q, callback, query, options){
    var add=[{
       "/common/topic/image": [{"id":null , "optional": "required"}],
       "name": null,
       "id":null,
       "limit": 1
    }];   
    add=queryterm(q, add);
    
   if(!query){query=[{}];}
   for(var i in add[0]){
     query[0][i]=add[0][i];   
   }
   
   return exports.query_freebase(query, function(response){
     if(response && response.result && response.result[0] && response.result[0]['/common/topic/image'] && response.result[0]['/common/topic/image'][0] ){
     var id=response.result[0]['/common/topic/image'][0].id;
     var image='http://www.freebase.com/api/trans/image_thumb'+id+'?errorid=/m/0djw4wd'
     if(options){
     if(options.height){
       image+='&maxheight='+options.height;
       } 
       if(options.width){
       image+='&maxwidth='+options.width;
       }
     }
     callback(image);
     }
   }, {extended:true});
}
exports.get_geolocation=function(q, callback, query){
    var add=[{
       "name": null,
       "id":null,
       "/location/location/geolocation": [{
        "/location/geocode/latitude":null,
        "/location/geocode/longitude":null
        }],
       "type":"/location/location",
       "limit": 1
    }];    
    add=queryterm(q, add);
   
   if(!query){query=[{}];}
   for(var i in add[0]){
     query[0][i]=add[0][i];   
   }
   
   return exports.query_freebase(query, function(response){
     if(response.result && response.result[0] && response.result[0] ){
     var geo=response.result[0]["/location/location/geolocation"];
     callback(geo);
     }
   }, {extended:true});
}
exports.get_wikipedia=function(q, callback, query){
    var add=[{
       "key":{"namespace":"/wikipedia/en_id", "value":null},
       "name": null,
       "id":null,
       "limit": 1
    }];    
    add=queryterm(q, add);
   
   if(!query){query=[{}];}
   for(var i in add[0]){
     query[0][i]=add[0][i];   
   }
   
   return exports.query_freebase(query, function(response){
     if(response.result && response.result[0] && response.result[0].key ){
     var id=response.result[0].key.value;
     var image='http://en.wikipedia.org/wiki/index.html?curid='+id;
     callback(image);
     }
   }, {extended:true});
}
exports.get_weblinks=function(q, callback, query){
    var add=[{
       "/common/topic/weblink":[{"url":null}],
       "name": null,
       "id":null,
       "limit": 1
    }];    
    add=queryterm(q, add);   
   if(!query){query=[{}];}
   for(var i in add[0]){
     query[0][i]=add[0][i];   
   }   
   return exports.query_freebase(query, function(response){
     if(response.result && response.result[0] && response.result[0]["/common/topic/weblink"] ){
     var weblinks=response.result[0]["/common/topic/weblink"];
     return callback(weblinks);
     }
     else{return callback=null;}
   }, {extended:true});
}
//automatically do mql pagination to complete the query
exports.paginate=function(query, callback, envelope, results) {
    if (!results){results=[];}
    if(!envelope){envelope={"cursor":true};}   
    if(query[0] && query[0].limit==null){query[0].limit=100;} 
    exports.query_freebase(query,  function(response){//returned the query    
          //get results
          for(var i in response.result){
            results.push(response.result[i]);
          }  
        if(response.cursor){//do it again
          envelope.cursor=response.cursor;
          return exports.paginate(query, callback, envelope, results);//recursive
        }
        else{//alldone
          return callback(results);        
        }
  }, envelope);
}
exports.query_freebase=function(query, callback, envelope) {
    var results=[];   
     if(!envelope){envelope={};} 
    envelope.query=query;
    var query=JSON.stringify(envelope);
    var fburl = 'http://www.freebase.com/api/service/mqlread?query='+encodeURI(query);
    request({
        uri: fburl
    }, function(error, response, body) {        
        if (!error && response.statusCode == 200 ) {
            var fb = JSON.parse(body); 
              return callback(fb);
              }
          else{
           console.log('----error----');
           console.log(body);
           return callback(null);
          }          
    });
}
//tests
//exports.get_description("london",  console.log, [{"type":"/film/film"}]);
//exports.query_freebase([{'name': null, 'type': '/astronomy/planet'}], console.log);
//exports.get_weblinks("david bowie",  console.log);
//exports.search("meatloaf",  console.log);
//exports.get_geolocation("cheddar",  console.log);
//exports.paginate([{"type":"/event/disaster","id":null}], console.log);
//exports.get_description("toronto",  console.log);
//exports.get_description("/authority/imdb/title/tt0099892",  console.log);
//exports.get_image("tom hanks",  console.log);
//exports.get_wikipedia("tom hanks",  console.log);
//exports.get_image("mike myers",  console.log, [{"key":{"namespace":"/wikipedia/en_title", "value":null, "optional":"required"}}], {width:200} );
    }
  };
});
horseDatastore.pkg(19, function(parent){
  return {
    'id':20,
    'name':'request',
    'main':undefined,
    'mainModuleId':'main',
    'dependencies':[],
    'modules':[],
    'parent':parent
  };
});
horseDatastore.module(20, function(onejsModParent){
  return {
    'id':'main',
    'pkg':onejsModParent,
    'wrapper':function(module, exports, global, Buffer,  process, require, undefined){
      // Copyright 2010-2011 Mikeal Rogers
// 
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
// 
//        http://www.apache.org/licenses/LICENSE-2.0
// 
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
var http = require('http')
  , https = false
  , tls = false
  , url = require('url')
  , util = require('util')
  , stream = require('stream')
  , qs = require('querystring')
  ;
try {
    https = require('https');
} catch (e) {}
try {
    tls = require('tls');
} catch (e) {}
var toBase64 = function(str) {
  return (new Buffer(str || "", "ascii")).toString("base64");
};
// Hacky fix for pre-0.4.4 https
if (https && !https.Agent) {
  https.Agent = function (options) {
    http.Agent.call(this, options);
  }
  util.inherits(https.Agent, http.Agent);
  https.Agent.prototype._getConnection = function(host, port, cb) {
    var s = tls.connect(port, host, this.options, function() {
      // do other checks here?
      if (cb) cb();
    });
    return s;
  };
}
var isUrl = /^https?:/;
var globalPool = {};
var Request = function (options) {
  stream.Stream.call(this);
  this.readable = true;
  this.writable = true;
  
  for (i in options) {
    this[i] = options[i];
  }
  if (!this.pool) this.pool = globalPool;
  this.dests = [];
}
util.inherits(Request, stream.Stream);
Request.prototype.getAgent = function (host, port) {
  if (!this.pool[host+':'+port]) {
    this.pool[host+':'+port] = new this.httpModule.Agent({host:host, port:port});
  }
  return this.pool[host+':'+port];
}
Request.prototype.request = function () {  
  var options = this;
  if (options.url) {
    // People use this property instead all the time so why not just support it.
    options.uri = options.url;
    delete options.url;
  }
  if (!options.uri) {
    throw new Error("options.uri is a required argument");
  } else {
    if (typeof options.uri == "string") options.uri = url.parse(options.uri);
  }
  if (options.proxy) {
    if (typeof options.proxy == 'string') options.proxy = url.parse(options.proxy);
  }
  options._redirectsFollowed = options._redirectsFollowed || 0;
  options.maxRedirects = (options.maxRedirects !== undefined) ? options.maxRedirects : 10;
  options.followRedirect = (options.followRedirect !== undefined) ? options.followRedirect : true;
  options.method = options.method || 'GET';
  options.headers = options.headers || {};
  var setHost = false;
  if (!options.headers.host) {
    options.headers.host = options.uri.hostname;
    if (options.uri.port) {
      if ( !(options.uri.port === 80 && options.uri.protocol === 'http:') &&
           !(options.uri.port === 443 && options.uri.protocol === 'https:') )
      options.headers.host += (':'+options.uri.port);
    }
    setHost = true;
  }
  if (!options.uri.pathname) {options.uri.pathname = '/';}
  if (!options.uri.port) {
    if (options.uri.protocol == 'http:') {options.uri.port = 80;}
    else if (options.uri.protocol == 'https:') {options.uri.port = 443;}
  }
  if (options.bodyStream || options.responseBodyStream) {
    console.error('options.bodyStream and options.responseBodyStream is deprecated. You should now send the request object to stream.pipe()');
    this.pipe(options.responseBodyStream || options.bodyStream)
  }
  
  if (options.proxy) {
    options.port = options.proxy.port;
    options.host = options.proxy.hostname;
  } else {
    options.port = options.uri.port;
    options.host = options.uri.hostname;
  }
  
  if (options.onResponse === true) {
    options.onResponse = options.callback;
    delete options.callback;
  }
  
  var clientErrorHandler = function (error) {
    if (setHost) delete options.headers.host;
    options.emit('error', error);
  };
  if (options.onResponse) options.on('error', function (e) {options.onResponse(e)}); 
  if (options.callback) options.on('error', function (e) {options.callback(e)});
  
  if (options.uri.auth && !options.headers.authorization) {
    options.headers.authorization = "Basic " + toBase64(options.uri.auth.split(':').map(qs.unescape).join(':'));
  }
  if (options.proxy && options.proxy.auth && !options.headers['proxy-authorization']) {
    options.headers['proxy-authorization'] = "Basic " + toBase64(options.proxy.auth.split(':').map(qs.unescape).join(':'));
  }
  options.path = options.uri.href.replace(options.uri.protocol + '//' + options.uri.host, '');
  if (options.path.length === 0) options.path = '/';
  if (options.proxy) options.path = (options.uri.protocol + '//' + options.uri.host + options.path);
  if (options.json) {
    options.headers['content-type'] = 'application/json';
    options.body = JSON.stringify(options.json);
  } else if (options.multipart) {
    options.body = '';
    options.headers['content-type'] = 'multipart/related;boundary="frontier"';
    if (!options.multipart.forEach) throw new Error('Argument error, options.multipart.');
    options.multipart.forEach(function (part) {
      var body = part.body;
      if(!body) throw Error('Body attribute missing in multipart.');
      delete part.body;
      options.body += '--frontier\r\n'; 
      Object.keys(part).forEach(function(key){
        options.body += key + ': ' + part[key] + '\r\n'
      })
      options.body += '\r\n' + body + '\r\n';
    })
    options.body += '--frontier--'
  }
  if (options.body) {
    if (!Buffer.isBuffer(options.body)) {
      options.body = new Buffer(options.body);
    }
    if (options.body.length) {
      options.headers['content-length'] = options.body.length;
    } else {
      throw new Error('Argument error, options.body.');
    }
  }
  
  options.httpModule = 
    {"http:":http, "https:":https}[options.proxy ? options.proxy.protocol : options.uri.protocol]
  if (!options.httpModule) throw new Error("Invalid protocol");
  
  if (options.pool === false) {
    options.agent = false;
  } else {
    if (options.maxSockets) {
      options.agent = options.getAgent(options.host, options.port);
      options.agent.maxSockets = options.maxSockets;
    }
    if (options.pool.maxSockets) {
      options.agent = options.getAgent(options.host, options.port);
      options.agent.maxSockets = options.pool.maxSockets;
    }
  }
  options.req = options.httpModule.request(options, function (response) {
    options.response = response;
    if (setHost) delete options.headers.host;
    
    if (response.statusCode >= 300 && 
        response.statusCode < 400  && 
        options.followRedirect     && 
        options.method !== 'PUT' && 
        options.method !== 'POST' &&
        response.headers.location) {
      if (options._redirectsFollowed >= options.maxRedirects) {
        options.emit('error', new Error("Exceeded maxRedirects. Probably stuck in a redirect loop."));
      }
      options._redirectsFollowed += 1;
      if (!isUrl.test(response.headers.location)) {
        response.headers.location = url.resolve(options.uri.href, response.headers.location);
      }
      options.uri = response.headers.location;
      delete options.req;
      delete options.agent;
      if (options.headers) {
        delete options.headers.host;
      }
      request(options, options.callback);
      return; // Ignore the rest of the response
    } else {
      options._redirectsFollowed = 0;
      // Be a good stream and emit end when the response is finished.
      // Hack to emit end on close becuase of a core bug that never fires end
      response.on('close', function () {options.emit('end')})
      
      if (options.encoding) {
        if (options.dests.length !== 0) {
          console.error("Ingoring encoding parameter as this stream is being piped to another stream which makes the encoding option invalid.");
        } else {
          response.setEncoding(options.encoding);
        }
      }
      
      if (options.dests.length !== 0) {
        options.dests.forEach(function (dest) {
          response.pipe(dest);
        })
        if (options.onResponse) options.onResponse(null, response);
        if (options.callback) options.callback(null, response, options.responseBodyStream);
        
      } else {
        if (options.onResponse) {
          options.onResponse(null, response);
        }
        if (options.callback) {
          var buffer = '';
          response.on("data", function (chunk) { 
            buffer += chunk; 
          })
          response.on("end", function () { 
            options.callback(null, response, buffer); 
          })
          ;
        }
      }
    }
  })
  
  options.req.on('error', clientErrorHandler);
    
  options.once('pipe', function (src) {
    if (options.ntick) throw new Error("You cannot pipe to this stream after the first nextTick() after creation of the request stream.")
    options.src = src;
    options.on('pipe', function () {
      console.error("You have already piped to this stream. Pipeing twice is likely to break the request.")
    })
  })
  
  process.nextTick(function () {
    if (options.body) {
      options.req.write(options.body);
      options.req.end();
    } else if (options.requestBodyStream) {
      console.warn("options.requestBodyStream is deprecated, please pass the request object to stream.pipe.")
      options.requestBodyStream.pipe(options);
    } else if (!options.src) {
      options.req.end();
    }
    options.ntick = true;
  })
}
Request.prototype.pipe = function (dest) {
  if (this.response) throw new Error("You cannot pipe after the response event.")
  this.dests.push(dest);
}
Request.prototype.write = function () {
  if (!this.req) throw new Error("This request has been piped before http.request() was called.");
  this.req.write.apply(this.req, arguments);
}
Request.prototype.end = function () {
  if (!this.req) throw new Error("This request has been piped before http.request() was called.");
  this.req.end.apply(this.req, arguments);
}
Request.prototype.pause = function () {
  if (!this.req) throw new Error("This request has been piped before http.request() was called.");
  this.req.pause.apply(this.req, arguments);
}
Request.prototype.resume = function () {
  if (!this.req) throw new Error("This request has been piped before http.request() was called.");
  this.req.resume.apply(this.req, arguments);
}
function request (options, callback) {
  if (callback) options.callback = callback;
  var r = new Request(options);
  r.request();
  return r;
}
module.exports = request;
request.defaults = function (options) {
  var def = function (method) {
    var d = function (opts, callback) {
      for (i in options) {
        if (!opts[i]) opts[i] = options[i];
        return method(opts, callback);
      }
    }
    return d;
  }
  de = def(request);
  de.get = def(request.get);
  de.post = def(request.post);
  de.put = def(request.put);
  de.head = def(request.head);
  de.del = def(request.del);
  return d;
}
request.get = request;
request.post = function (options, callback) {
  options.method = 'POST';
  return request(options, callback);
};
request.put = function (options, callback) {
  options.method = 'PUT';
  return request(options, callback);
};
request.head = function (options, callback) {
  options.method = 'HEAD';
  if (options.body || options.requestBodyStream || options.json || options.multipart) {
    throw new Error("HTTP HEAD requests MUST NOT include a request body.");
  }
  return request(options, callback);
};
request.del = function (options, callback) {
  options.method = 'DELETE';
  return request(options, callback);
}
    }
  };
});
if(typeof module != 'undefined' && module.exports ){
  module.exports = horseDatastore;
  if( !module.parent ){
    horseDatastore.main();
  }
};