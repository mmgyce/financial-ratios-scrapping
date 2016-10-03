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

interface IQuarter {
  getQuarterByCompany(company_id: any, cb: (err: any, quarter: any) => any): void;
  setQuarterByCompany(quarter: any, company_id: any, cb: (err: any) => any): void;
}

export class Quarter implements IQuarter {

  db: any;
  constructor(db: any) {
    this.db = db;
  }

  getQuarterByCompany(company_id: any, cb: (err: any, quarter: any) => any) {
    let query = `SELECT * FROM quarter WHERE company_id = ${company_id}`;
    this.db.execute(query, (err, results) => {
      if(err){
        throw err;
        process.exit(1);
      }else{
        cb(err, results.rows);
      }
    })
  }
  getQuarterByCompanyByYearByQuarternum(company_id: any, year:number, quarternum:number, cb: (err: any, quarter: any) => any) {
    let query = `SELECT * FROM quarter WHERE company_id = ${company_id} AND year=${year} AND quarter_num=${quarternum}`;

    this.db.execute(query, (err, results) => {
      if(err){
        throw err;
        process.exit(1);
      }else if(results.rows.length==1){
        cb(null, results.rows[0]);
      }else if(results.rows.length > 1){
        throw "No puede haber mas de un quater igual";
        process.exit(1);
      }else{
        cb(null,null);
      }
      
    })
  }

  setQuarterByCompany(quarter: any, company_id:any,cb: (err: any) => any) {
    let query = `INSERT INTO quarter (
      company_id, 
      year, 
      quarter_num, 
      earnings_per_share, 
      price_earnings_ratio, 
      beta, price_to_sales, 
      price_to_book, 
      price_to_cashflow, 
      current_ratio, 
      total_debt_to_equity, 
      return_on_assets, 
      dividend_yield, 
      payout_ratio, 
      net_profit_margin,
      created_at)
      VALUES (
        ${company_id}, 
        ${quarter.year}, 
        ${quarter.quarterNum}, 
        ${quarter.earnings_per_share}, 
        ${quarter.price_earnings_ratio},
        ${quarter.beta}, 
        ${quarter.price_to_sales} , 
        ${quarter.price_to_book}, 
        ${quarter.price_to_cashflow}, 
        ${quarter.current_ratio}, 
        ${quarter.total_debt_to_equity} , 
        ${quarter.return_on_assets}, 
        ${quarter.dividend_yield}, 
        ${quarter.payout_ratio}, 
        ${quarter.net_profit_margin},
        ${TimeUuid.now()})`;
    this.db.execute(query, (err, results) => {
      if(err){
        throw err;
        process.exit(1);
      }else{
        cb(null);
      }
    })
  }
}