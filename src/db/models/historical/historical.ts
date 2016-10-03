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

interface IHistorical{
  getHistoricalByCompany(company_id : any, cb:(err:any, historical : any)=>any):void;
  setHistoricalByCompany(historical:any, company_id:any, cb:(err:any)=>any):void;
}

export class Historical implements IHistorical{
  
  db:any;
  constructor(db:any){
    this.db = db;
  }
	
  getHistoricalByCompany(company_id : any, cb:(err:any, historical : any)=>any){
    let query = `SELECT * FROM historical WHERE company_id = ${company_id}`;
    
    this.db.execute(query, (err, results)=>{
      if(err){
        throw err;
         process.exit(1);
      }else{
        cb(null, results.rows); 
      }
      
    })
  }

  setHistoricalByCompany(historical: any, company_id : any, cb:(err:any)=>any){
    let query = `INSERT INTO historical (company_id, change, value, created_at)
      VALUES (${company_id}, ${historical.change},${historical.value},  ${TimeUuid.now()})`;
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