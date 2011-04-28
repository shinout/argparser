function ArgParser() {
  this.valopts    = {s: [], l: []};
  this.opts = {s: [], l: []};
  this.options    = {}; // in future, this will be [Getter/Setter]
  this.args       = []; // in future, this will be [Getter/Setter]
  this.invalids   = []; // in future, this will be [Getter/Setter]
}

/* getters ( in future, these will be deprecated... ) */
ArgParser.prototype.getOptions  = function(k) { 
  return (k == null) ? this.options : this.options[k];
}

ArgParser.prototype.getArgs     = function(n) {
  return (n == null) ? this.args: this.args[n];
}

ArgParser.prototype.getInvalids = function(n) {
  return (n == null) ? this.invalids : this.invalids[n];
}


ArgParser.prototype.addValueOptions = function(arr) {
  arr.forEach(function(opt) {
    this.valopts[(opt.length == 1) ? 's' : 'l'].push(opt);
  }, this);
  return this;
}

ArgParser.prototype.addOptions = function(arr) {
  arr.forEach(function(opt) {
    this.opts[(opt.length == 1) ? 's' : 'l'].push(opt);
  }, this);
  return this;
}

ArgParser.prototype.parse = function(arr) {
  /* clear past data */
  this.options = {};
  this.args    = [];
  this.invalid = [];

  /* check arguments */
  if (! (arr instanceof Array)) arr = process.argv;
  if (arr[0] === process.argv[0]) arr.shift();
  if (arr[1] === process.argv[1]) arr.shift();

  /* set default values */
  var that = this; // for shortcut access to this
  ['opts', 'valopts'].forEach(function(opts) {
    ['s', 'l'].forEach(function(sl) {
      that[opts][sl].forEach(function(opt) {
        that.options[opt] = false;
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
  return this;
}

/* version */
ArgParser.version = '0.0.3';

module.exports = ArgParser;
