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

interface IHistoricalSector{
  getHistoricalSectorBySector(sector_id : any, cb:(err:any, historicalSector : any)=>any):void;
  setHistoricalSector(historicalSector:any, cb:(err:any)=>any):void;
}

export class HistoricalSector implements IHistoricalSector{
  
  db:any;
  constructor(db:any){
    this.db = db;
  }
	
  getHistoricalSectorBySector(sector_id : any, cb:(err:any, historicalSector : any)=>any){
    let query = `SELECT * FROM historical_sector WHERE sector_id = ${sector_id}`;
    
    this.db.execute(query, (err, results)=>{
       if(err){
        throw err;
         process.exit(1);
      }else{
        cb(null, results.rows); 
      }
    })
  }

  setHistoricalSector(historicalSector: any, cb:(err:any)=>any){
    let query = `INSERT INTO sector (sector_id, change, value, up_to_0, down_to_0, up_to_2, down_to_2 , created_at)
      VALUES (${historicalSector.sector_id}, ${historicalSector.change},${historicalSector.value}, ${historicalSector.up_to_0}, ${historicalSector.down_to_0}, ${historicalSector.up_to_2}, ${historicalSector.down_to_2}, ${historicalSector.create_at})`;
      
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