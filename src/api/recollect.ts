/// <reference path="../../typings/tsd.d.ts" />

require('typescript-require')({
  nodeLib: false,
  targetES5: true,
  exitOnError: true
});

let Cheerio = require('cheerio');

import 'source-map-support/register';
import * as async from 'async';
import * as db from '../db/db';
import * as mongoose from 'mongoose';
import * as _ from 'underscore';
import * as nodemailer from 'nodemailer';
import * as moment from 'moment';
import *as request from 'request';

import { Stocks as StocksClass } from '../modules/stocks/stocks';



interface IRecollect {
  spiderMarkets(cb: (err: any) => any): void;
}

export class Recollect implements IRecollect {

  Stocks: StocksClass;
  private cheerioLoad: any;

  constructor(db: any) {
    this.Stocks = new StocksClass(db);
    this.cheerioLoad = Cheerio.load;
  }
  /**
  * Recolecta información relativa a Mercados bursátiles
  */
  spiderMarkets(cb: (err: any, results: any) => any): void {
    async.waterfall([
      (callback: any) => {
        this.Stocks.loadNumNASDAQItems(function(err, num) {
          if(num == null){
            throw "Num dasqr es null, problemas de red";
            process.exit(1);
          }else{
            callback(err, num);
          }
          
        })
      },
      (num: number, callback: any) => {
        let totalPages: number = Math.ceil(num / 50);
        let currentPage: number = 1;
        let companies: any = [];
        console.log("totalPages: " + totalPages);
        async.doWhilst((done) => {
          process.stdout.write("\rPágina " + currentPage);
          this.Stocks.loadNASDAQByPage(currentPage, (err, companiesAux) => {
            if (!err) {
              companies = _.union(companies, companiesAux);
              done(null);
            } else {
              done(err);
            } 
          }); 
        }, () => {
          currentPage++;   
          return currentPage  <= totalPages;
        }, (err) => { 
          callback(err, companies)
        });
      },    
      (companies: any, callback: any) => {
        console.log("\ncompanies trackeadas y disponibles a insertar: " + companies.length);
        this.Stocks.insertNASDAQCompanies(companies, (err, newCompanies) => {
          console.log("\nNuevas companies : " + newCompanies);
          callback(err, newCompanies);
        });
      },
      (newCompanies: number, callback: any) => {
        this.Stocks.getNASDAQCompanies((err, companies) => {
          async.mapSeries(companies, (company: any, done) => {
            this.Stocks.loadSectorByCompany(company, company.market_id, (err) => {
              callback(null, newCompanies);
            });
          });
        });

      },
      (newCompanies: number, callback: any) => {
        let update_quote: number = 0;
        let update_ratio: number = 0;
        let noTables_counter: number = 0;
        let exists_ratio: number = 0;
        let exists_quote: number = 0;
        let noHistorical_counter: number = 0;
        let badRequest_counter: number = 0;


        this.Stocks.getNASDAQCompanies((err, companies) => {
          async.mapSeries(companies, (company: any, done) => {
            let url: string = "http://www.reuters.com/finance/stocks/financialHighlights?symbol=";
            async.waterfall([
              //Hago request y obtengo html
              (doneFn: any) => {
                request(url + company.ticker, (err, response, html) => {
                  if (!err && response.statusCode == 200) {
                    let $ = this.cheerioLoad(html);
                    doneFn(null, $);
                  } else {
                    doneFn(null, null);
                  }
                });
              },
              //get Ratios
              ($: any, doneFn: any) => {
                if ($) {
                  this.Stocks.loadRatiosByCompany($, company, (err, quarter, noTables) => {
                    if (!noTables) {
                      this.Stocks.insertRatiosByCompany(company, quarter, (err, updated_ratio) => {
                        //console.log("quarter : "+JSON.stringify(quarter,null,2));
                        //console.log("company : "+JSON.stringify(company,null,2));
                        if (updated_ratio) {
                          update_ratio++;
                        }
                        doneFn(null, $);
                      })
                    } else {
                      noTables_counter++;
                      doneFn(null, "Notable");
                    }

                  })
                } else {
                  badRequest_counter++;
                  doneFn(null, "badRequest");
                }
              },
              //get quote
              ($: any, doneFn: any) => {
                if ($ != "Notable" && $ != "badRequest") {
                  this.Stocks.loadQuote($, company, (err, historical, noHistorical) => {
                    if (!noHistorical) {
                      this.Stocks.insertQuote(company, historical, (err) => {
                        update_quote++;
                        doneFn(err);
                      })
                    } else {
                      noHistorical_counter++;
                      doneFn(err);
                    }
                  });
                } else {
                  doneFn(null);
                }
              }
            ], (err) => {
              process.stdout.write("\rTotal : " + companies.length + ", Quote updated: " + update_quote + ", Ratio updated: " + update_ratio + ", NoTables : " + noTables_counter + ", badRquest: " + badRequest_counter);
              done(err, null);
            })
          }, () => {
            callback(null, [newCompanies, update_quote, update_ratio]);
          });
        });
      }
    ], (err, results) => {
      cb(err, results);
    });
  };

  /*
    stocksReport(cb: (err: any, results: any) => any): void {
      let self = this;
  
      self.StocksAnalysis.getReport(5, function(err, results) {
            console.log(`
              Análisis terminada el ${moment().format("LLL") }
      
              Mejor rentabilidad mensual
              ${results[0]}
      
              Peor rentabilidad mensual
              ${results[1]}
      
              Mejor rentabilidad del día ${moment().format("L")}
              ${results[2]}
      
              Peor rentabilidad mendel día ${moment().format("L")}sual
              ${results[3]}
            `);
        cb(null, results);
      })
    }*/
}
