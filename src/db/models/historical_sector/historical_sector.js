///<reference path="../../../../typings/tsd.d.ts" />
require('typescript-require')({
    nodeLib: false,
    targetES5: true,
    exitOnError: true
});
var Uuid = require('cassandra-driver').types.Uuid;
var TimeUuid = require('cassandra-driver').types.TimeUuid;
require('source-map-support/register');
var HistoricalSector = (function () {
    function HistoricalSector(db) {
        this.db = db;
    }
    HistoricalSector.prototype.getHistoricalSectorBySector = function (sector_id, cb) {
        var query = "SELECT * FROM historical_sector WHERE sector_id = " + sector_id;
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
    HistoricalSector.prototype.setHistoricalSector = function (historicalSector, cb) {
        var query = "INSERT INTO sector (sector_id, change, value, up_to_0, down_to_0, up_to_2, down_to_2 , created_at)\n      VALUES (" + historicalSector.sector_id + ", " + historicalSector.change + "," + historicalSector.value + ", " + historicalSector.up_to_0 + ", " + historicalSector.down_to_0 + ", " + historicalSector.up_to_2 + ", " + historicalSector.down_to_2 + ", " + historicalSector.create_at + ")";
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
    return HistoricalSector;
})();
exports.HistoricalSector = HistoricalSector;
//# sourceMappingURL=historical_sector.js.map