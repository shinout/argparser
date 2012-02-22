function ArgParser() {
  this.valopts    = {s: [], l: []};
  this.opts = {s: [], l: []};
  this.options    = {};
  this.args       = [];
  this.invalids   = [];
  this._defaults = {};

  this.emptyValue = false;
  this._files = [];
  this._dirs  = [];
  this._nums  = [];
}

ArgParser.create = function() {
  return new ArgParser().addValueOptions(Array.prototype.slice.call(arguments));
};

// get options ( getOptions("s") ...
ArgParser.prototype.getOptions  = function() {
  if (arguments.length == 0) {
    return this.options;
  }
  var ret = null;
  const that = this;
  Array.prototype.forEach.call(arguments, function(arg) {
    ret = ret || that.options[arg];
  });
  return ret;
};

// get arguments getArgs(0), getArgs(1) ...
ArgParser.prototype.getArgs = function(n) {
  return (n == null) ? this.args: this.args[n];
};

// stringify current options
ArgParser.prototype.stringifyOptions = function() {
  var that = this;
  return ['opts', 'valopts'].map(function(opts) {
    return Object.keys(that[opts]).map(function(sl) {
      return that[opts][sl]
      .filter(function(k) {
        return (that.options[k] !== false);
      })
      .map(function(k) {
        return (( (sl == 's') ? '-'+k : '--'+k ) + ( (opts == 'opts') ? '' : (' ' + that.options[k]))).replace(/ +$/, '');
      }).join(' ');
    }).join(' ').replace(/ +$/, '');
  }).join(' ').replace(/ +$/, '');
};

// stringify current options and args
ArgParser.prototype.stringify = function() {
  return this.stringifyOptions() + ' ' + this.args.join(' ');
};

// get invalid options given
ArgParser.prototype.getInvalids = function(n) {
  return (n == null) ? this.invalids : this.invalids[n];
};


// set options which requires a value
ArgParser.prototype.addValueOptions = function() {
  var arr = (Array.isArray(arguments[0])) ? arguments[0] : Array.prototype.slice.call(arguments);
  arr.forEach(function(opt) {
    this.valopts[(opt.length == 1) ? 's' : 'l'].push(opt);
  }, this);
  return this;
};


// set args | options which requires (a file | a directory | a number)
['files', 'dirs', 'nums'].forEach(function(name) {
  var _name = "_" + name;
  // register required file nums
  ArgParser.prototype[name] = function() {
    var valueOptions = [];
    var arr = (Array.isArray(arguments[0])) ? arguments[0] : Array.prototype.slice.call(arguments);
    arr.forEach(function(v) {
      this[_name].push(v);
      if (typeof v == "string") valueOptions.push(v);
    }, this);
    return valueOptions.length ? this.addValueOptions(valueOptions) : this;
  };
});


// set defaults
ArgParser.prototype.defaults = function(obj, noSetNums) {
  var keys = Object.keys(obj);
  var nums = [];
  keys.forEach(function(k) {
    var val = obj[k];
    if (typeof val == "number") nums.push(k);
    this._defaults[k] = val;
  }, this);
  if (!noSetNums && nums.length) {
    this.nums(nums);
  }
  return this.addValueOptions(keys);
};


// set options which requires no values
ArgParser.prototype.addOptions = function() {
  var arr = (Array.isArray(arguments[0])) ? arguments[0] : Array.prototype.slice.call(arguments);
  arr.forEach(function(opt) {
    this.opts[(opt.length == 1) ? 's' : 'l'].push(opt);
  }, this);
  return this;
};

// parse argv
ArgParser.prototype.parse = function(arr) {
  /* clear past data */
  this.options  = {};
  this.args     = [];
  this.invalids = [];

  /* check arguments */
  if (! (arr instanceof Array)) {
    arr = [];
    process.argv.forEach(function(v, k) {
      if (k >= 2) arr.push(v);
    });
  }

  /* set default values */
  var that = this; // for shortcut access to this
  ['opts', 'valopts'].forEach(function(opts) {
    ['s', 'l'].forEach(function(sl) {
      that[opts][sl].forEach(function(opt) {
        that.options[opt] = (that._defaults[opt] != undefined) ? that._defaults[opt] : that.emptyValue;
      });
    });
  });


  /* parse arguments */
  var vopt;
  arr.forEach(function(val) {
    /* if option with value is set */
    if (vopt) {
      that.options[vopt] = val;
      vopt = null;
      return;
    }

    /* short option parsing */
    if (val.match(/^-[a-zA-Z0-9_]$/)) {
      var optname = val.charAt(1);
      if (that.valopts.s.indexOf(optname) >= 0) {
        vopt = optname;
        return;
      }
      else if (that.opts.s.indexOf(optname) >= 0) {
        that.options[optname] = true;
        return;
      }
      else { // invalid option
        that.options[optname] = true;
        that.invalids.push(optname);
        return;
      }
    }

    /* long option parsing */
    if (val.match(/^--[a-zA-Z0-9_-]+$/)) {
      var optname = val.slice(2);
      if (that.valopts.l.indexOf(optname) >= 0) {
        vopt = optname;
        return;
      }
      else if (that.opts.l.indexOf(optname) >= 0) {
        that.options[optname] = true;
        return;
      }
      else {
        that.options[optname] = true;
        that.invalids.push(optname);
        return;
      }
    }

    /* arguments */
    that.args.push(val);
  });

  var path = require('path'), fs = require('fs');

  // check file existence
  this._files.forEach(function(v) {
    if (typeof v == "string" && this.getOptions(v) === this.emptyValue) return;
    var f = (typeof v == "number") ? this.getArgs(v) : this.getOptions(v);
    if (f == '-') return;
    try{if(!fs.statSync(f).isFile()){throw 1}}catch(e){throw new Error(f + ": no such file or directory (in args " + v + ')');}
  }, this);
  
  // check dir existence
  this._dirs.forEach(function(v) {
    if (typeof v == "string" && this.getOptions(v) === this.emptyValue) return;
    var d = (typeof v == "number") ? this.getArgs(v) : this.getOptions(v);
    try{if(!fs.statSync(d).isDirectory()){throw 1}}catch(e){throw new Error(d + ": no such file or directory (in args " + v + ')');}
  }, this);

  // Numberize
  this._nums.forEach(function(v) {
    if (typeof v == "string" && this.getOptions(v) === this.emptyValue) return;
    var num = Number( (typeof v == "number") ? this.getArgs(v) : this.getOptions(v) );
    if (isNaN(num)) throw new Error('the arg ' + v +' must be a number.');
    if (typeof v == "number") this.args[v] = num;
    else                      this.options[v] = num;
  }, this);
  return this;
};

ArgParser.getOptionString = function(obj) {
  var ret = [];
  Object.keys(obj).forEach(function(opt) {
    if (obj[opt] === null || obj[opt] === false) return;
    ret.push( ((opt.length == 1) ? '-' : '--') + opt + ' ' + obj[opt]);
  });
  return ret.join(' ');
};

/**
 * register shortcut
 **/
Object.keys(ArgParser.prototype).forEach(function(methodName) {
  if (ArgParser[methodName]) return;
  ArgParser[methodName] = function() {
    var ap = new ArgParser();
    ap[methodName].apply(ap, arguments);
    return ap;
  };
});

/* version */
ArgParser.version = '0.1.3';

module.exports = ArgParser;
