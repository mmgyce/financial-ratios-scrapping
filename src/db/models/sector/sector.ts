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

interface ISector{
  getSector(sector_id : any, cb:(err:any, sector : any)=>any):void;
  getSectorByName(name : string, cb:(err:any, sector : any)=>any):void;
  setSector(sector:any, cb:(err:any)=>any):void;
}

export class Sector implements ISector{
  
  db:any;
  constructor(db:any){
    this.db = db;
  }
	
  getSector(sector_id : any, cb:(err:any, sector : any)=>any){
    let query = `SELECT * FROM sector WHERE sector_id = ${sector_id}`;
    
    this.db.execute(query, (err, results)=>{
      if(err){
        throw err;
        process.exit(1);
      }else{
         cb(null, results.rows[0]);
      }
      
    })
  }
  getSectorByName(name : string, cb:(err:any, sector : any)=>any){
    let query = `SELECT * FROM sector_by_name WHERE name = '${name}'`;
    
    this.db.execute(query, (err, results)=>{
       if(err){
        throw err;
        process.exit(1);
      }else{
         cb(null, results.rows[0]);
      }
    })
  }

  setSector(sector: any, cb:(err:any)=>any){
    let query = `INSERT INTO sector (sector_id, name, created_at)
      VALUES (${Uuid.random()}, '${sector.name}', ${TimeUuid.now()})`;
      
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