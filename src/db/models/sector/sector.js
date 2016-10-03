///<reference path="../../../../typings/tsd.d.ts" />
require('typescript-require')({
    nodeLib: false,
    targetES5: true,
    exitOnError: true
});
var Uuid = require('cassandra-driver').types.Uuid;
var TimeUuid = require('cassandra-driver').types.TimeUuid;
require('source-map-support/register');
var Sector = (function () {
    function Sector(db) {
        this.db = db;
    }
    Sector.prototype.getSector = function (sector_id, cb) {
        var query = "SELECT * FROM sector WHERE sector_id = " + sector_id;
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
    Sector.prototype.getSectorByName = function (name, cb) {
        var query = "SELECT * FROM sector_by_name WHERE name = '" + name + "'";
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
    Sector.prototype.setSector = function (sector, cb) {
        var query = "INSERT INTO sector (sector_id, name, created_at)\n      VALUES (" + Uuid.random() + ", '" + sector.name + "', " + TimeUuid.now() + ")";
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
    return Sector;
})();
exports.Sector = Sector;
//# sourceMappingURL=sector.js.map