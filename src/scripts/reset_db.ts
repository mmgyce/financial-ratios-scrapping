///<reference path="../../typings/tsd.d.ts" />

import { connections } from '../db/db';
let db = connections.cloudStocksConnection;
import * as async from 'async';

async.waterfall([
  (done) => {
    companyTable(() => {
      done();
    })
  },
  (done) => {
    companyByMarketMaterializedView(() => {
      done();
    })
  },
  (done) => {
    companyByTickerMaterializedView(() => {
      done();
    })
  },
  (done) => {
    marketTable(() => {
      done();
    })
  },
  (done) => {
    marketByNameMaterializedView(() => {
      done();
    })
  },
  (done) => {
    sectorTable(() => {
      done();
    })
  },
  (done) => {
    sectorByNameMaterializedView(() => {
      done();
    })
  },
  (done) => {
    historicalSectorTable(() => {
      done();
    })
  },

  (done) => {
    quarterTable(() => {
      done();
    })
  },
  (done) => {
    historicalTable(() => {
      done();
    })
  }
], () => {
  console.log("Terminado!");
  process.exit(0); 
});


function dropTable(name, cb) {
  let query = `
    DROP TABLE IF EXISTS ${name}
  `;

  db.execute(query, function(err, results) {
    if (err) {
      throw err;
    } else {
      cb(null);
    }
  });
}
function dropMaterializedView(name, cb) {
  let query = `
    DROP MATERIALIZED VIEW IF EXISTS ${name}
  `;

  db.execute(query, function(err, results) {
    if (err) {
      throw err;
    } else {
      cb(null);
    }
  });
}

function companyTable(cb) {
  async.waterfall([
    function(done) {
      dropMaterializedView('company_by_market', function() {
        done(null);
      })
    },
    function(done) {
      dropMaterializedView('company_by_ticker', function() {
        done(null);
      })
    },
    function(done) {
      dropTable('company', function() {
        done(null);
      })
    },
    function(done) {
      let query = `
        CREATE TABLE company(
          market_id uuid,
          company_id uuid,
          name text,
		      ticker  text,
		      sector_id  uuid,
          created_at timeuuid,
          PRIMARY KEY (company_id, market_id, ticker)
        )
      `;
      db.execute(query, function(err, results) {
        if (err) {
          throw err;
        } else {
          done(null);
        }
      })
    }], function() {
      cb();
    })
}
function companyByMarketMaterializedView(cb) {
  let query = `
    CREATE MATERIALIZED VIEW company_by_market AS
    SELECT * from company WHERE company_id IS NOT NULL AND market_id IS NOT NULL AND sector_id IS NOT NULL AND ticker IS NOT NULL
    PRIMARY KEY(market_id, sector_id, company_id, ticker)
  `;
  db.execute(query, function(err, results) {
    if (err) {
      throw err;
    } else {
      cb();
    }
  })
}
function companyByTickerMaterializedView(cb) {
  let query = `
    CREATE MATERIALIZED VIEW company_by_ticker AS
    SELECT * from company WHERE company_id IS NOT NULL AND market_id IS NOT NULL AND sector_id IS NOT NULL AND ticker IS NOT NULL
    PRIMARY KEY(ticker, market_id, sector_id, company_id)
  `;
  db.execute(query, function(err, results) {
    if (err) {
      throw err;
    } else {
      cb();
    }
  })
}

function marketTable(cb) {
  async.waterfall([
    function(done) {
      dropMaterializedView('market_by_name', function() {
        done(null);
      })
    },
    function(done) {
      dropTable('market', function() {
        done(null);
      })
    },
    function(done) {
      let query = `
        CREATE TABLE market(
          market_id uuid,
          country text,
          currency text,
          url text,
          name text,
          created_at timeuuid,
          PRIMARY KEY (market_id)
        )
      `;
      db.execute(query, function(err, results) {
        if (err) {
          throw err;
        } else {
          done(null);
        }
      })
    }], function() {
      cb();
    })
}
function marketByNameMaterializedView(cb) {
  let query = `
    CREATE MATERIALIZED VIEW market_by_name AS
    SELECT * from market WHERE market_id IS NOT NULL AND name IS NOT NULL
    PRIMARY KEY(name, market_id)
  `;
  db.execute(query, function(err, results) {
    if (err) {
      throw err;
    } else {
      cb();
    }
  })
}

function sectorTable(cb) {
  async.waterfall([
    function(done) {
      dropMaterializedView('sector_by_name', function() {
        done(null);
      })
    },
    function(done) {
      dropTable('sector', function() {
        done(null);
      })
    },
    function(done) {
      let query = `
        CREATE TABLE sector(
          sector_id uuid,
          name text,
          created_at timeuuid,
          PRIMARY KEY (sector_id)
        )
      `;
      db.execute(query, function(err, results) {
        if (err) {
          throw err;
        } else {
          done(null);
        }
      })
    }], function() {
      cb();
    })
}
function sectorByNameMaterializedView(cb) {
  let query = `
    CREATE MATERIALIZED VIEW sector_by_name AS
    SELECT * from sector WHERE sector_id IS NOT NULL AND name IS NOT NULL
    PRIMARY KEY(name, sector_id)
  `;
  db.execute(query, function(err, results) {
    if (err) {
      throw err;
    } else {
      cb();
    }
  })
}
function historicalSectorTable(cb) {
  async.waterfall([
    function(done) {
      dropTable('historical_sector', function() {
        done(null);
      })
    },
    function(done) {
      let query = `
        CREATE TABLE historical_sector(
          sector_id uuid,
          change float,
		      value float,
		      up_to_0 float,
		      down_to_0 float,
		      up_to_2 float,
		      down_to_2 float,
          created_at timeuuid,
          PRIMARY KEY (sector_id, created_at)
        )
        WITH CLUSTERING ORDER BY (created_at DESC)
      `;
      db.execute(query, function(err, results) {
        if (err) {
          throw err;
        } else {
          done(null);
        }
      })
    }], function() {
      cb();
    })
}

function historicalTable(cb) {
  async.waterfall([
    function(done) {
      dropTable('historical', function() {
        done(null);
      })
    },
    function(done) {
      let query = `
        CREATE TABLE historical(
          company_id uuid,
		      change float,
		      value float,
          created_at timeuuid,
          PRIMARY KEY (company_id, created_at)
        )
        WITH CLUSTERING ORDER BY(created_at DESC)
      `;
      db.execute(query, function(err, results) {
        if (err) {
          throw err;
        } else {
          done(null);
        }
      })
    }], function() {
      cb();
    })
}

function quarterTable(cb) {
  async.waterfall([
    function(done) {
      dropTable('quarter', function() {
        done(null);
      })
    },
    function(done) {
      let query = `
        CREATE TABLE quarter(
		  company_id uuid,
          year int,
		  quarter_num int,
		  earnings_per_share float,
		  price_earnings_ratio float,
		  beta float,
		  price_to_sales float,
		  price_to_book float,
		  price_to_cashflow float,
		  current_ratio float,
		  total_debt_to_equity float,
		  return_on_assets float,
		  net_profit_margin float,
		  dividend_yield float,
		  payout_ratio float,
          created_at timeuuid,
          PRIMARY KEY (company_id, year, quarter_num)
          )
      `;
      db.execute(query, function(err, results) {
        if (err) {
          throw err;
        } else {
          done(null);
        }
      })
    }], function() {
      cb();
    })
}
