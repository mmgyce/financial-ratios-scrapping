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

interface IMarket{
  getMarket(market_id : any, cb:(err:any, market : any)=>any):void;
  getMarketByName(name : string, cb:(err:any, market : any)=>any):void;
  setMarket(market:any, cb:(err:any)=>any):void;
}

export class Market implements IMarket{
  
  db:any;
  constructor(db:any){
    this.db = db;
  }
	
  getMarket(market_id : any, cb:(err:any, company : any)=>any){
    let query = `SELECT * FROM market WHERE market_id = ${market_id}`;
    
    this.db.execute(query, (err, results)=>{
      if(err){
        throw err;
         process.exit(1);
      }else{
         cb(err, results.rows[0]); 
      }
     
    })
  }
  getMarketByName(name : string, cb:(err:any, market : any)=>any){
    let query = `SELECT * FROM market_by_name WHERE name = '${name}'`;
    
    this.db.execute(query, (err, results)=>{
      if(err){
        throw err;
         process.exit(1);
      }else{
         cb(err, results.rows[0]); 
      }
    })
  }

  setMarket(market: any, cb:(err:any)=>any){
    let query = `INSERT INTO market (market_id, name, country, currency, url, created_at)
      VALUES (${Uuid.random()}, '${market.name}', '${market.country}','${market.currency}','${market.url}', ${TimeUuid.now()})`;
      
    this.db.execute(query, (err, results) => {
       if(err){
        throw err;
         process.exit(1);
      }else{
         cb(err); 
      }
    })
  }
}