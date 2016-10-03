/// <reference path="../typings/tsd.d.ts"/>
require('typescript-require')({
    nodeLib: false,
    targetES5: true,
    exitOnError: true
});
var Cheerio = require('cheerio');
require('source-map-support/register');
var db = require('./db/db');
var recollect_1 = require('./api/recollect');
console.log("db: " + Object.keys(db.connections));
var Recollect = new recollect_1.Recollect(db.connections.cloudStocksConnection);
var cheerioLoad = Cheerio.load;
Recollect.spiderMarkets(function (err, results) {
    console.log("Termine!");
    process.exit(0);
});
//# sourceMappingURL=finance.js.map