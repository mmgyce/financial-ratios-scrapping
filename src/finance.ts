
/// <reference path="../typings/tsd.d.ts"/>

require('typescript-require')({
  nodeLib: false,
  targetES5: true,
  exitOnError: true
});

let Cheerio = require('cheerio');
import 'source-map-support/register';
import * as async from 'async';
import * as moment from 'moment';
import * as email from 'nodemailer';
import * as cron from 'cron';
import * as nodemailer from 'nodemailer';

import * as db from './db/db';
import { Stocks as StockClass } from './modules/stocks/stocks';

import { Recollect as RecollectClass } from './api/recollect';


console.log("db: " + Object.keys(db.connections));

let Recollect = new RecollectClass(db.connections.cloudStocksConnection);

let cheerioLoad = Cheerio.load;


Recollect.spiderMarkets((err, results) => {
  console.log("Termine!");
  process.exit(0);
});