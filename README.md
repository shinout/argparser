argparser v0.0.3
==================
[Node.js] parse commandline-args and options

Change Log

----------------
* [0.0.1]: Release
* [0.0.2]: modify getter methods
* [0.0.3]: enable method chaining

Overview
----------------
### Installation ###
    git clone git://github.com/shinout/argparser.git

    OR

    npm install argparser

### Usage ###
    const ArgParser = require('argparser');

    /* the simplest use */
    /* node hoge.js --long-var -s foo bar  */
    var parser = new ArgParser().parse();
    parser.getArgs(); // [foo, var]
    parser.getOptions(); // {long-var: true, s: true}


    /* set options with value */
    /* node hoge.js piyo foo -h --var-with-val 392 bar  */
    var parser = new ArgParser();
    parser.addValueOptions(['var-with-val']);
    parser.parse();
    parser.getArgs(); // [piyo, foo, var]
    parser.getOptions(); // {h: true, var-with-val: 392}


    /* parse array */
    var parser = new ArgParser();
    parser.addValueOptions(['encoding', 'm', 'aaa']);
    parser.parse(['-m', 110, '--encoding', 'utf-8', 'index.html']);
    parser.getArgs(); // [index.html]
    parser.getOptions(); // {encoding: utf-8, m: 100, aaa: false}


    /* set non-value options */
    parser.addOptions(['-h', '-t']);
    parser.addValueOptions(['encoding', 'm']);
    parser.parse(['-h', 'hoge', '--encoding', 'utf-8', 'index.html']);
    parser.getArgs(); // [hoge, index.html]
    parser.getOptions(); // {h: true, encoding: true, m: false}
