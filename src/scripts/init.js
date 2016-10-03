///<reference path="../../typings/tsd.d.ts" />
require('typescript-require')({
    nodeLib: false,
    targetES5: true,
    exitOnError: true
});
var db_1 = require('../db/db');
var db = db_1.connections.cloudStocksConnection;
var async = require('async');
var Uuid = require('cassandra-driver').types.Uuid;
var TimeUuid = require('cassandra-driver').types.TimeUuid;
var market_1 = require('../db/models/market/market');
var sector_1 = require('../db/models/sector/sector');
var dbMarket = new market_1.Market(db);
var dbSector = new sector_1.Sector(db);
async.waterfall([
    function (done) {
        truncateTable('market', function (err) {
            done(err);
        });
    },
    function (done) {
        loadMarkets(function (err) {
            done(err);
        });
    },
    function (done) {
        truncateTable('sector', function (err) {
            done(err);
        });
    },
    function (done) {
        loadSectors(function (err) {
            done(err);
        });
    }
], function (err) {
    if (err) {
        throw err;
    }
    else {
        console.log("Done Init Script");
        process.exit(0);
    }
});
function truncateTable(name, cb) {
    var query = "TRUNCATE TABLE " + name;
    db.execute(query, function (err) {
        cb(err);
    });
}
function loadMarkets(cb) {
    var markets = [{
            name: "NASDAQ",
            country: "usa",
            currency: "USD",
            url: "http://www.nasdaq.com/screening/companies-by-industry.aspx?exchange=NASDAQ&region=North+America",
        }];
    async.map(markets, function (market, done) {
        dbMarket.setMarket(market, function (err) {
            if (!err && market) {
                done(null, null);
            }
            else {
                cb("Error al guardar el market err : " + err);
            }
        });
    }, function (err) {
        cb(err);
    });
}
;
function loadSectors(cb) {
    var sectors = [{
            name: "Energy"
        }, {
            name: "Basic Materials"
        }, {
            name: "Industrials"
        }, {
            name: "Financials"
        }, {
            name: "Cyclical Consumer Goods & Services"
        }, {
            name: "Non-Cyclical Consumer Goods & Services"
        }, {
            name: "Healthcare"
        }, {
            name: "Technology"
        }, {
            name: "Telecommunications Services"
        }, {
            name: "Utilities"
        }];
    async.mapSeries(sectors, function (sector, done) {
        dbSector.setSector(sector, function (err) {
            done(err, null);
        });
    }, function (err) {
        cb(err);
    });
}
;
//# sourceMappingURL=init.js.map