///<reference path="../../../../typings/tsd.d.ts" />
require('typescript-require')({
    nodeLib: false,
    targetES5: true,
    exitOnError: true
});
var Uuid = require('cassandra-driver').types.Uuid;
var TimeUuid = require('cassandra-driver').types.TimeUuid;
require('source-map-support/register');
var Quarter = (function () {
    function Quarter(db) {
        this.db = db;
    }
    Quarter.prototype.getQuarterByCompany = function (company_id, cb) {
        var query = "SELECT * FROM quarter WHERE company_id = " + company_id;
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
    Quarter.prototype.getQuarterByCompanyByYearByQuarternum = function (company_id, year, quarternum, cb) {
        var query = "SELECT * FROM quarter WHERE company_id = " + company_id + " AND year=" + year + " AND quarter_num=" + quarternum;
        this.db.execute(query, function (err, results) {
            if (err) {
                throw err;
                process.exit(1);
            }
            else if (results.rows.length == 1) {
                cb(null, results.rows[0]);
            }
            else if (results.rows.length > 1) {
                throw "No puede haber mas de un quater igual";
                process.exit(1);
            }
            else {
                cb(null, null);
            }
        });
    };
    Quarter.prototype.setQuarterByCompany = function (quarter, company_id, cb) {
        var query = "INSERT INTO quarter (\n      company_id, \n      year, \n      quarter_num, \n      earnings_per_share, \n      price_earnings_ratio, \n      beta, price_to_sales, \n      price_to_book, \n      price_to_cashflow, \n      current_ratio, \n      total_debt_to_equity, \n      return_on_assets, \n      dividend_yield, \n      payout_ratio, \n      net_profit_margin,\n      created_at)\n      VALUES (\n        " + company_id + ", \n        " + quarter.year + ", \n        " + quarter.quarterNum + ", \n        " + quarter.earnings_per_share + ", \n        " + quarter.price_earnings_ratio + ",\n        " + quarter.beta + ", \n        " + quarter.price_to_sales + " , \n        " + quarter.price_to_book + ", \n        " + quarter.price_to_cashflow + ", \n        " + quarter.current_ratio + ", \n        " + quarter.total_debt_to_equity + " , \n        " + quarter.return_on_assets + ", \n        " + quarter.dividend_yield + ", \n        " + quarter.payout_ratio + ", \n        " + quarter.net_profit_margin + ",\n        " + TimeUuid.now() + ")";
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
    return Quarter;
})();
exports.Quarter = Quarter;
//# sourceMappingURL=quarter.js.map