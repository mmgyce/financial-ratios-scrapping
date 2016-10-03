///<reference path="../../../../typings/tsd.d.ts" />

require('typescript-require')({
  nodeLib: false,
  targetES5: true,
  exitOnError: true
});


let Uuid = require('cassandra-driver').types.Uuid;
let TimeUuid = require('cassandra-driver').types.TimeUuid;

import 'source-map-support/register';

import * as async from 'async';
import * as moment from 'moment';

interface ICompany {
  getCompany(company_id: any, cb: (err: any, company: any) => any): void;
  getCompanyByMarket(market_id: any, cb: (err: any, companies: any) => any): void;
  getCompanyByMarketBySector(market_id: any, sector_id: any, cb: (err: any, companies: any) => any): void;
  setCompany(company: any, cb: (err: any) => any): void;
  updateSector(company_id: any, market_id: any, ticker: any, sector_id: any, cb: (err: any) => any): void;
}

export class Company implements ICompany {

  db: any;
  constructor(db: any) {
    this.db = db;
  }

  getCompany(company_id: any, cb: (err: any, company: any) => any) {
    let query = `SELECT * FROM company WHERE company_id = ${company_id}`;

    this.db.execute(query, (err, results) => {
      cb(err, results.rows[0]);
    })
  }
  getCompanyByMarket(market_id: any, cb: (err: any, companies: any) => any) {
    let query = `SELECT * FROM company_by_market WHERE market_id = ${market_id}`;

    this.db.execute(query, (err, results) => {
      if(err){
        throw err;
        process.exit(1);
      }else{
        cb(err, results.rows);
      }
    })
  }
  getCompanyByTicker(ticker: string, cb: (err: any, company: any) => any) {

    let query = `SELECT * FROM company_by_ticker WHERE ticker = '${ticker}'`;

    this.db.execute(query, (err, results) => {
      if (err) {
        throw err;
         process.exit(1);
      } else {
        cb(null, results.rows[0]);
      }

    })
  }
  getCompanyByMarketBySector(market_id: any, sector_id: any, cb: (err: any, companies: any) => any) {
    let query = `SELECT * FROM company_by_market WHERE market_id = ${market_id} AND sector_id = ${sector_id}`;

    this.db.execute(query, (err, results) => {
      if (err) {
        throw err;
         process.exit(1);
      } else {
        cb(null, results.rows);
      }
    })
  }
  setCompany(company: any, cb: (err: any) => any) {
    let query = `INSERT INTO company (market_id, company_id, name, ticker, created_at)
      VALUES (${company.market_id}, ${Uuid.random() }, '${company.name}', '${company.ticker}', ${TimeUuid.now() })`;
    this.db.execute(query, (err, results) => {
      if (err) {
        throw err;
         process.exit(1);
      } else {
        cb(null);
      }
    })
  }
  updateSector(company_id: any, market_id: any, ticker: any, sector_id: any, cb: (err: any) => any) {
    let query = `UPDATE company SET sector_id = ${sector_id} WHERE company_id = ${company_id} AND market_id=${market_id} AND ticker = '${ticker}'`
    this.db.execute(query, (err, results) => {
      if (err) {
        throw err;
         process.exit(1);
      } else {
        cb(null);
      }
    })
  }
}