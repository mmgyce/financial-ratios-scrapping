///<reference path="../../../../typings/tsd.d.ts" />
require('typescript-require')({
    nodeLib: false,
    targetES5: true,
    exitOnError: true
});
var Uuid = require('cassandra-driver').types.Uuid;
var TimeUuid = require('cassandra-driver').types.TimeUuid;
require('source-map-support/register');
var Company = (function () {
    function Company(db) {
        this.db = db;
    }
    Company.prototype.getCompany = function (company_id, cb) {
        var query = "SELECT * FROM company WHERE company_id = " + company_id;
        this.db.execute(query, function (err, results) {
            cb(err, results.rows[0]);
        });
    };
    Company.prototype.getCompanyByMarket = function (market_id, cb) {
        var query = "SELECT * FROM company_by_market WHERE market_id = " + market_id;
        this.db.execute(query, function (err, results) {
            if (err) {
                throw err;
                process.exit(1);
            }
            else {
                cb(err, results.rows);
            }
        });
    };
    Company.prototype.getCompanyByTicker = function (ticker, cb) {
        var query = "SELECT * FROM company_by_ticker WHERE ticker = '" + ticker + "'";
        this.db.execute(query, function (err, results) {
            if (err) {
                throw err;
                process.exit(1);
            }
            else {
                cb(null, results.rows[0]);
            }
        });
    };
    Company.prototype.getCompanyByMarketBySector = function (market_id, sector_id, cb) {
        var query = "SELECT * FROM company_by_market WHERE market_id = " + market_id + " AND sector_id = " + sector_id;
        this.db.execute(query, function (err, results) {
            if (err) {
                throw err;
                process.exit(1);
            }
            else {
                cb(null, results.rows);
            }
        });
    };
    Company.prototype.setCompany = function (company, cb) {
        var query = "INSERT INTO company (market_id, company_id, name, ticker, created_at)\n      VALUES (" + company.market_id + ", " + Uuid.random() + ", '" + company.name + "', '" + company.ticker + "', " + TimeUuid.now() + ")";
        this.db.execute(query, function (err, results) {
            if (err) {
                throw err;
                process.exit(1);
            }
            else {
                cb(null);
            }
        });
    };
    Company.prototype.updateSector = function (company_id, market_id, ticker, sector_id, cb) {
        var query = "UPDATE company SET sector_id = " + sector_id + " WHERE company_id = " + company_id + " AND market_id=" + market_id + " AND ticker = '" + ticker + "'";
        this.db.execute(query, function (err, results) {
            if (err) {
                throw err;
                process.exit(1);
            }
            else {
                cb(null);
            }
        });
    };
    return Company;
})();
exports.Company = Company;
//# sourceMappingURL=company.js.map