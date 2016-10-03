///<reference path="../../typings/tsd.d.ts" />
var db_1 = require('../db/db');
var db = db_1.connections.cloudStocksConnection;
var async = require('async');
async.waterfall([
    function (done) {
        companyTable(function () {
            done();
        });
    },
    function (done) {
        companyByMarketMaterializedView(function () {
            done();
        });
    },
    function (done) {
        companyByTickerMaterializedView(function () {
            done();
        });
    },
    function (done) {
        marketTable(function () {
            done();
        });
    },
    function (done) {
        marketByNameMaterializedView(function () {
            done();
        });
    },
    function (done) {
        sectorTable(function () {
            done();
        });
    },
    function (done) {
        sectorByNameMaterializedView(function () {
            done();
        });
    },
    function (done) {
        historicalSectorTable(function () {
            done();
        });
    },
    function (done) {
        quarterTable(function () {
            done();
        });
    },
    function (done) {
        historicalTable(function () {
            done();
        });
    }
], function () {
    console.log("Terminado!");
    process.exit(0);
});
function dropTable(name, cb) {
    var query = "\n    DROP TABLE IF EXISTS " + name + "\n  ";
    db.execute(query, function (err, results) {
        if (err) {
            throw err;
        }
        else {
            cb(null);
        }
    });
}
function dropMaterializedView(name, cb) {
    var query = "\n    DROP MATERIALIZED VIEW IF EXISTS " + name + "\n  ";
    db.execute(query, function (err, results) {
        if (err) {
            throw err;
        }
        else {
            cb(null);
        }
    });
}
function companyTable(cb) {
    async.waterfall([
        function (done) {
            dropMaterializedView('company_by_market', function () {
                done(null);
            });
        },
        function (done) {
            dropMaterializedView('company_by_ticker', function () {
                done(null);
            });
        },
        function (done) {
            dropTable('company', function () {
                done(null);
            });
        },
        function (done) {
            var query = "\n        CREATE TABLE company(\n          market_id uuid,\n          company_id uuid,\n          name text,\n\t\t      ticker  text,\n\t\t      sector_id  uuid,\n          created_at timeuuid,\n          PRIMARY KEY (company_id, market_id, ticker)\n        )\n      ";
            db.execute(query, function (err, results) {
                if (err) {
                    throw err;
                }
                else {
                    done(null);
                }
            });
        }], function () {
        cb();
    });
}
function companyByMarketMaterializedView(cb) {
    var query = "\n    CREATE MATERIALIZED VIEW company_by_market AS\n    SELECT * from company WHERE company_id IS NOT NULL AND market_id IS NOT NULL AND sector_id IS NOT NULL AND ticker IS NOT NULL\n    PRIMARY KEY(market_id, sector_id, company_id, ticker)\n  ";
    db.execute(query, function (err, results) {
        if (err) {
            throw err;
        }
        else {
            cb();
        }
    });
}
function companyByTickerMaterializedView(cb) {
    var query = "\n    CREATE MATERIALIZED VIEW company_by_ticker AS\n    SELECT * from company WHERE company_id IS NOT NULL AND market_id IS NOT NULL AND sector_id IS NOT NULL AND ticker IS NOT NULL\n    PRIMARY KEY(ticker, market_id, sector_id, company_id)\n  ";
    db.execute(query, function (err, results) {
        if (err) {
            throw err;
        }
        else {
            cb();
        }
    });
}
function marketTable(cb) {
    async.waterfall([
        function (done) {
            dropMaterializedView('market_by_name', function () {
                done(null);
            });
        },
        function (done) {
            dropTable('market', function () {
                done(null);
            });
        },
        function (done) {
            var query = "\n        CREATE TABLE market(\n          market_id uuid,\n          country text,\n          currency text,\n          url text,\n          name text,\n          created_at timeuuid,\n          PRIMARY KEY (market_id)\n        )\n      ";
            db.execute(query, function (err, results) {
                if (err) {
                    throw err;
                }
                else {
                    done(null);
                }
            });
        }], function () {
        cb();
    });
}
function marketByNameMaterializedView(cb) {
    var query = "\n    CREATE MATERIALIZED VIEW market_by_name AS\n    SELECT * from market WHERE market_id IS NOT NULL AND name IS NOT NULL\n    PRIMARY KEY(name, market_id)\n  ";
    db.execute(query, function (err, results) {
        if (err) {
            throw err;
        }
        else {
            cb();
        }
    });
}
function sectorTable(cb) {
    async.waterfall([
        function (done) {
            dropMaterializedView('sector_by_name', function () {
                done(null);
            });
        },
        function (done) {
            dropTable('sector', function () {
                done(null);
            });
        },
        function (done) {
            var query = "\n        CREATE TABLE sector(\n          sector_id uuid,\n          name text,\n          created_at timeuuid,\n          PRIMARY KEY (sector_id)\n        )\n      ";
            db.execute(query, function (err, results) {
                if (err) {
                    throw err;
                }
                else {
                    done(null);
                }
            });
        }], function () {
        cb();
    });
}
function sectorByNameMaterializedView(cb) {
    var query = "\n    CREATE MATERIALIZED VIEW sector_by_name AS\n    SELECT * from sector WHERE sector_id IS NOT NULL AND name IS NOT NULL\n    PRIMARY KEY(name, sector_id)\n  ";
    db.execute(query, function (err, results) {
        if (err) {
            throw err;
        }
        else {
            cb();
        }
    });
}
function historicalSectorTable(cb) {
    async.waterfall([
        function (done) {
            dropTable('historical_sector', function () {
                done(null);
            });
        },
        function (done) {
            var query = "\n        CREATE TABLE historical_sector(\n          sector_id uuid,\n          change float,\n\t\t      value float,\n\t\t      up_to_0 float,\n\t\t      down_to_0 float,\n\t\t      up_to_2 float,\n\t\t      down_to_2 float,\n          created_at timeuuid,\n          PRIMARY KEY (sector_id, created_at)\n        )\n        WITH CLUSTERING ORDER BY (created_at DESC)\n      ";
            db.execute(query, function (err, results) {
                if (err) {
                    throw err;
                }
                else {
                    done(null);
                }
            });
        }], function () {
        cb();
    });
}
function historicalTable(cb) {
    async.waterfall([
        function (done) {
            dropTable('historical', function () {
                done(null);
            });
        },
        function (done) {
            var query = "\n        CREATE TABLE historical(\n          company_id uuid,\n\t\t      change float,\n\t\t      value float,\n          created_at timeuuid,\n          PRIMARY KEY (company_id, created_at)\n        )\n        WITH CLUSTERING ORDER BY(created_at DESC)\n      ";
            db.execute(query, function (err, results) {
                if (err) {
                    throw err;
                }
                else {
                    done(null);
                }
            });
        }], function () {
        cb();
    });
}
function quarterTable(cb) {
    async.waterfall([
        function (done) {
            dropTable('quarter', function () {
                done(null);
            });
        },
        function (done) {
            var query = "\n        CREATE TABLE quarter(\n\t\t  company_id uuid,\n          year int,\n\t\t  quarter_num int,\n\t\t  earnings_per_share float,\n\t\t  price_earnings_ratio float,\n\t\t  beta float,\n\t\t  price_to_sales float,\n\t\t  price_to_book float,\n\t\t  price_to_cashflow float,\n\t\t  current_ratio float,\n\t\t  total_debt_to_equity float,\n\t\t  return_on_assets float,\n\t\t  net_profit_margin float,\n\t\t  dividend_yield float,\n\t\t  payout_ratio float,\n          created_at timeuuid,\n          PRIMARY KEY (company_id, year, quarter_num)\n          )\n      ";
            db.execute(query, function (err, results) {
                if (err) {
                    throw err;
                }
                else {
                    done(null);
                }
            });
        }], function () {
        cb();
    });
}
//# sourceMappingURL=reset_db.js.map