///<reference path="../../../../typings/tsd.d.ts" />
require('typescript-require')({
    nodeLib: false,
    targetES5: true,
    exitOnError: true
});
var Uuid = require('cassandra-driver').types.Uuid;
var TimeUuid = require('cassandra-driver').types.TimeUuid;
require('source-map-support/register');
var Historical = (function () {
    function Historical(db) {
        this.db = db;
    }
    Historical.prototype.getHistoricalByCompany = function (company_id, cb) {
        var query = "SELECT * FROM historical WHERE company_id = " + company_id;
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
    Historical.prototype.setHistoricalByCompany = function (historical, company_id, cb) {
        var query = "INSERT INTO historical (company_id, change, value, created_at)\n      VALUES (" + company_id + ", " + historical.change + "," + historical.value + ",  " + TimeUuid.now() + ")";
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
    return Historical;
})();
exports.Historical = Historical;
//# sourceMappingURL=historical.js.map