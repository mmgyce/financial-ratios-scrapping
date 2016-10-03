///<reference path="../../../../typings/tsd.d.ts" />
require('typescript-require')({
    nodeLib: false,
    targetES5: true,
    exitOnError: true
});
var Uuid = require('cassandra-driver').types.Uuid;
var TimeUuid = require('cassandra-driver').types.TimeUuid;
require('source-map-support/register');
var Market = (function () {
    function Market(db) {
        this.db = db;
    }
    Market.prototype.getMarket = function (market_id, cb) {
        var query = "SELECT * FROM market WHERE market_id = " + market_id;
        this.db.execute(query, function (err, results) {
            if (err) {
                throw err;
                process.exit(1);
            }
            else {
                cb(err, results.rows[0]);
            }
        });
    };
    Market.prototype.getMarketByName = function (name, cb) {
        var query = "SELECT * FROM market_by_name WHERE name = '" + name + "'";
        this.db.execute(query, function (err, results) {
            if (err) {
                throw err;
                process.exit(1);
            }
            else {
                cb(err, results.rows[0]);
            }
        });
    };
    Market.prototype.setMarket = function (market, cb) {
        var query = "INSERT INTO market (market_id, name, country, currency, url, created_at)\n      VALUES (" + Uuid.random() + ", '" + market.name + "', '" + market.country + "','" + market.currency + "','" + market.url + "', " + TimeUuid.now() + ")";
        this.db.execute(query, function (err, results) {
            if (err) {
                throw err;
                process.exit(1);
            }
            else {
                cb(err);
            }
        });
    };
    return Market;
})();
exports.Market = Market;
//# sourceMappingURL=market.js.map