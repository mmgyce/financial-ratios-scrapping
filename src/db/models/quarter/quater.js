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
            cb(err, results.rows);
        });
    };
    Quarter.prototype.setQuarterByCompany = function (quarter, cb) {
        var query = "INSERT INTO quarter (company_id, year, quarter_num, earnings_per_share, price_earnings_ratio, beta, price_to_sales, price_to_book, price_to_cashflow, current_ratio, total_debt_to_equity, return_on_assets, dividend_yeld, payout_ratio, created_at)\n      VALUES (" + quarter.company_id + ", " + quarter.year + ", " + quarter.quarter_num + ", " + quarter.earnings_per_share + ", " + quarter.price_earnings_ratio + ", " + quarter.beta + ", " + quarter.price_to_sales + " , " + quarter.price_to_book + ", " + quarter.price_to_cashflow + ", " + quarter.current_ratio + ", " + quarter.total_debt_to_equity + " , " + quarter.return_on_assets + ", " + quarter.dividend_yeld + ", " + quarter.payout_ratio + ", " + quarter.create_at + ")";
        this.db.execute(query, function (err, results) {
            cb(err);
        });
    };
    return Quarter;
})();
exports.Quarter = Quarter;
//# sourceMappingURL=quater.js.map