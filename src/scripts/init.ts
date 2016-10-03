///<reference path="../../typings/tsd.d.ts" />



require('typescript-require')({
	nodeLib: false,
	targetES5: true,
	exitOnError: true
});

import { connections } from '../db/db';
let db = connections.cloudStocksConnection;
import * as async from 'async';


let Uuid = require('cassandra-driver').types.Uuid;
let TimeUuid = require('cassandra-driver').types.TimeUuid;

import { Market } from '../db/models/market/market';
import { Sector } from '../db/models/sector/sector';

let dbMarket = new Market(db);
let dbSector = new Sector(db);

async.waterfall([
	function(done){
		truncateTable('market', (err)=>{
			done(err);
		})
	},
	function(done) {
		loadMarkets((err) => {
			done(err);
		})
	},
	function(done){
		truncateTable('sector', (err)=>{
			done(err);
		})	
	},
	function(done){
		loadSectors((err)=>{
			done(err);
		})
	}
], (err) => {
	if (err) {
		throw err;
	} else {
		console.log("Done Init Script");
		process.exit(0); 
	}

});
function truncateTable(name:string, cb:(err:any)=>any):void{
	let query = `TRUNCATE TABLE ${name}`;
	db.execute(query, (err)=>{
		cb(err);
	})
}
function loadMarkets(cb: (err: string) => any) {
	let markets: any = [{
		name: "NASDAQ",
		country: "usa",
		currency: "USD",
		url: "http://www.nasdaq.com/screening/companies-by-industry.aspx?exchange=NASDAQ&region=North+America",
	}];
	async.map(markets, (market: any, done: any) => {
		dbMarket.setMarket(market, (err) => {
			if (!err && market) {
				done(null, null);
			} else {
				cb("Error al guardar el market err : " + err);
			}
		})
	}, function(err: any) {
		cb(err);
	})
};

function loadSectors(cb: (err: string) => any): void {

	let sectors = [{
		name: "Energy"
	}, {
            name: "Basic Materials"
		}, {
            name: "Industrials"
		}, {
            name: "Financials"
		}, {
            name: "Cyclical Consumer Goods & Services"
		}, {
            name: "Non-Cyclical Consumer Goods & Services"
		}, {
            name: "Healthcare"
		}, {
            name: "Technology"
		}, {
            name: "Telecommunications Services"
		}, {
            name: "Utilities"
		}];

	async.mapSeries(sectors, function(sector, done) {
		dbSector.setSector(sector, (err)=>{
           done(err, null);
		})
	}, function(err:any) {
		cb(err);
	})

};