/// <reference path = "../../../typings/tsd.d.ts" />

require('typescript-require')({
  nodeLib: false,
  targetES5: true,
  exitOnError: true
});

let Uuid = require('cassandra-driver').types.Uuid;
let TimeUuid = require('cassandra-driver').types.TimeUuid;

let Cheerio = require('cheerio');

import 'source-map-support/register';
import * as request from 'request';
import * as async from 'async';
import * as _ from 'underscore';
import * as moment from 'moment';


import { Company } from '../../db/models/company/company';
import { Market } from '../../db/models/market/market';
import { Sector } from '../../db/models/sector/sector';
import { Historical } from '../../db/models/historical/historical';
import { HistoricalSector } from '../../db/models/historical_sector/historical_sector';
import { Quarter } from '../../db/models/quarter/quarter';

import {Reuters as ReuterClass} from '../reuters/reuters';

interface ISctocks {
 
}       

export class Stocks implements ISctocks {
  private Reuters: ReuterClass;

  private dbSector: Sector;
  private dbMarket: Market;
  private dbCompany: Company;
  private dbHistorical: Historical;
  private dbHistoricalSector: HistoricalSector;
  private dbQuarter: Quarter;

  private cheerioLoad: any;

  constructor(db: any) {
    this.dbSector = new Sector(db);
    this.dbMarket = new Market(db);
    this.dbCompany = new Company(db);
    this.dbHistorical = new Historical(db);
    this.dbHistoricalSector = new HistoricalSector(db);
    this.dbQuarter = new Quarter(db);

    this.cheerioLoad = Cheerio.load;
  }


	/**
	*	Carga todos los componentes del NASDAQ
	*/

  loadNumNASDAQItems(cb: (err: any, num: number) => any): void {

    this.dbMarket.getMarketByName("NASDAQ", (err, nasdaq) => {
      request(nasdaq.url + "&page=1", (err: string, response: any, html: string) => {
        if (!err && response.statusCode == 200) {
          let $ = this.cheerioLoad(html);
          cb(null, parseInt($("small.marginR10px").find("b").eq(1).text().trim()));
        } else {
          cb(err, null);
        }
      });
    });
  }

  insertNASDAQCompanies(companies: any, cb: (err: any, newCompanies: number) => any): void {
    let newCompanies: number = 0;
    async.mapSeries(companies, (company: any, done: any) => {
      this.dbCompany.getCompanyByTicker(company.ticker, (err, companyAux) => {
        if (companyAux) {
          done();
        } else {
          newCompanies++;
          this.dbCompany.setCompany(company, (err) => {
            done(err);
          })
        }
      })
    }, function(err) {
      cb(err, newCompanies);
    });

  }

  loadNASDAQByPage(page: number, cb: (err: any, companies: any) => any): void {
    this.dbMarket.getMarketByName("NASDAQ", (err, market) => {
      this.dbMarket.getMarket(market.market_id, (err, market) => {
        let companies: any = [];
        let counter: number = 0;
        request(market.url + "&page=" + page, (err: string, response: any, html: string) => {
          if (!err && response.statusCode == 200) {
            let $ = this.cheerioLoad(html);

            $("div#main-content-div").find("table#CompanylistResults").children("tr").each(function(index: number, ele: any) {
              if ($(ele).find("img").html() == null) {
                counter++;
                var ticker = $(ele).children().eq(1).find("a").text().trim();
                var name = $(ele).children().eq(0).find("a").text().trim();
                companies.push({
                  name: name.replace("'", ""),
                  ticker: ticker,
                  market_id: market.market_id
                });
              };
            });

            cb(null, companies);
          } else {
            cb("Fallo request loadNasdaq", null);
          }
        });
      })
    });
  };

  getNASDAQCompanies(cb: (err: any, companies: any) => any) {
    this.dbMarket.getMarketByName("NASDAQ", (err, market) => {
      this.dbCompany.getCompanyByMarket(market.market_id, (err, companies) => {
        cb(err, companies);
      });
    })
  }

  /**
  *	Rellena para compañia su sector.
  */


  loadSectorByCompany(company: any, market_id: any, cb: (err: any) => any): void {
    let self = this;
    var url = "https://www.google.com/finance?q=" + company.ticker;
    request(url, (err: any, response: any, html: string) => {
      if (!err && response.statusCode == 200) {
        let $ = self.cheerioLoad(html);
        let sector = $("a#sector").text();
        if (_.isEmpty(sector)) {
          cb(null);
        } else {
          this.dbSector.getSectorByName(sector, (err, sector) => {
            this.dbCompany.updateSector(company.company_id, market_id, company.ticker, sector.sector_id, (err) => {
              cb(err);
            });
          });

        }
      } else {
        console.log("Ha fallado loadSectorByTicker");
        console.log("Url : " + url);
        cb(err);
      }
    })
  };
  /**
  *	Cron en que almacena datos nuevos publicados cada trimestre y las cotizaciones diarias de cada empresa
  */

  insertRatiosByCompany(company: any, quarter: any, cb: (err: any, updated_ratio: boolean) => any): void {
    this.dbQuarter.getQuarterByCompanyByYearByQuarternum(company.company_id, quarter.year, quarter.quarterNum, (err, exists) => {
      if (!exists) {
        this.dbQuarter.setQuarterByCompany(quarter, company.company_id, (err) => {
          cb(err, true);
        })
      } else {
        cb(null, false);
      }
    })
  }
  loadRatiosByCompany($: any, company: any, cb: (err: any, quarter: any, noTables: boolean) => any): void {
    let url: string = "http://www.reuters.com/finance/stocks/financialHighlights?symbol=";

    let quaterResults: any = {};
    let results: any;
    //console.log("company.ticker: " + company.ticker);
    if ($("div.sectionContent") == undefined || $("div.sectionContent").find("div.module").length == 0) {
      console.log("company ERR: " + company.ticker);
      cb(null, null, true);
    } else { 
      $("div.sectionContent").find("div.module").each((index: number, ele: any) => {
        this.Reuters = new ReuterClass($, ele);
        var moduleName = $(ele).find("h3").text().trim();
        if (moduleName == "Revenue & Earnings Per Share") {
          results = this.Reuters.revenue();
          quaterResults.year = moment().year();
          quaterResults.quarterNum = results[0];
          //console.log("quaterResults.quarterNum: "+quaterResults.quarterNum);
          quaterResults.revenue = results[1];
          quaterResults.earnings_per_share = results[2];

        } else if (moduleName == "Valuation Ratios") {
          results = this.Reuters.valuationRations();
          quaterResults.price_earnings_ratio = results[0];
          quaterResults.beta = results[1];
          quaterResults.price_to_sales = results[2];
          quaterResults.price_to_book = results[3];
          quaterResults.price_to_cashflow = results[4];

        } else if (moduleName == "Dividends") {
          results = this.Reuters.dividends();
          quaterResults.dividend_yield = results[0];
          quaterResults.payout_ratio = results[1];

        } else if (moduleName == "Financial Strength") {
          results = this.Reuters.finalcialStrength();
          quaterResults.current_ratio = results[0];
          quaterResults.total_debt_to_equity = results[1];

        } else if (moduleName == "Profitability Ratios") {
          results = this.Reuters.profitability();
          quaterResults.net_profit_margin = results[0];
        } else if (moduleName == "Management Effectiveness") {
          results = this.Reuters.management();
          quaterResults.return_on_assets = results[0];
        }
      });

      if (quaterResults.quarterNum == null) {
        console.log("La empresa con ticker : "+company.ticker+" tiene quearternum null"); 
        cb(null, null, true); 
      } else {
        cb(null, quaterResults, false);
      }
    }


  };



  /**
  *	Dada una compañia, extrae la cotización.
  */
  loadQuote($: any, company: any, cb: (err: string, historical: any, noHistorical: boolean) => any): void {
    let self = this;

    let value = parseFloat($("span.valueContent").children().eq(0).text().trim().replace("$", ""));
    let change = parseFloat($("span.valueContent").children().eq(1).children().eq(0).text().trim().replace("%", "").replace("(", "").replace(")", ""));

    let historical = {
      change: change,
      value: value
    }

    if (!isNaN(historical.value) && !isNaN(historical.change)) {
      cb(null, historical, false);
    } else {
      cb(null, false, true);
    }
  };

  insertQuote(company: any, historical: any, cb: (err: any) => any): void {

    this.dbHistorical.setHistoricalByCompany(historical, company.company_id, (err) => {
      cb(err);
    })
  }
}
