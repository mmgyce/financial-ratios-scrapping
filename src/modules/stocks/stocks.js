/// <reference path = "../../../typings/tsd.d.ts" />
require('typescript-require')({
    nodeLib: false,
    targetES5: true,
    exitOnError: true
});
var Uuid = require('cassandra-driver').types.Uuid;
var TimeUuid = require('cassandra-driver').types.TimeUuid;
var Cheerio = require('cheerio');
require('source-map-support/register');
var request = require('request');
var async = require('async');
var _ = require('underscore');
var moment = require('moment');
var company_1 = require('../../db/models/company/company');
var market_1 = require('../../db/models/market/market');
var sector_1 = require('../../db/models/sector/sector');
var historical_1 = require('../../db/models/historical/historical');
var historical_sector_1 = require('../../db/models/historical_sector/historical_sector');
var quarter_1 = require('../../db/models/quarter/quarter');
var reuters_1 = require('../reuters/reuters');
var Stocks = (function () {
    function Stocks(db) {
        this.dbSector = new sector_1.Sector(db);
        this.dbMarket = new market_1.Market(db);
        this.dbCompany = new company_1.Company(db);
        this.dbHistorical = new historical_1.Historical(db);
        this.dbHistoricalSector = new historical_sector_1.HistoricalSector(db);
        this.dbQuarter = new quarter_1.Quarter(db);
        this.cheerioLoad = Cheerio.load;
    }
    /**
    *	Carga todos los componentes del NASDAQ
    */
    Stocks.prototype.loadNumNASDAQItems = function (cb) {
        var _this = this;
        this.dbMarket.getMarketByName("NASDAQ", function (err, nasdaq) {
            request(nasdaq.url + "&page=1", function (err, response, html) {
                if (!err && response.statusCode == 200) {
                    var $ = _this.cheerioLoad(html);
                    cb(null, parseInt($("small.marginR10px").find("b").eq(1).text().trim()));
                }
                else {
                    cb(err, null);
                }
            });
        });
    };
    Stocks.prototype.insertNASDAQCompanies = function (companies, cb) {
        var _this = this;
        var newCompanies = 0;
        async.mapSeries(companies, function (company, done) {
            _this.dbCompany.getCompanyByTicker(company.ticker, function (err, companyAux) {
                if (companyAux) {
                    done();
                }
                else {
                    newCompanies++;
                    _this.dbCompany.setCompany(company, function (err) {
                        done(err);
                    });
                }
            });
        }, function (err) {
            cb(err, newCompanies);
        });
    };
    Stocks.prototype.loadNASDAQByPage = function (page, cb) {
        var _this = this;
        this.dbMarket.getMarketByName("NASDAQ", function (err, market) {
            _this.dbMarket.getMarket(market.market_id, function (err, market) {
                var companies = [];
                var counter = 0;
                request(market.url + "&page=" + page, function (err, response, html) {
                    if (!err && response.statusCode == 200) {
                        var $ = _this.cheerioLoad(html);
                        $("div#main-content-div").find("table#CompanylistResults").children("tr").each(function (index, ele) {
                            if ($(ele).find("img").html() == null) {
                                counter++;
                                var ticker = $(ele).children().eq(1).find("a").text().trim();
                                var name = $(ele).children().eq(0).find("a").text().trim();
                                companies.push({
                                    name: name.replace("'", ""),
                                    ticker: ticker,
                                    market_id: market.market_id
                                });
                            }
                            ;
                        });
                        cb(null, companies);
                    }
                    else {
                        cb("Fallo request loadNasdaq", null);
                    }
                });
            });
        });
    };
    ;
    Stocks.prototype.getNASDAQCompanies = function (cb) {
        var _this = this;
        this.dbMarket.getMarketByName("NASDAQ", function (err, market) {
            _this.dbCompany.getCompanyByMarket(market.market_id, function (err, companies) {
                cb(err, companies);
            });
        });
    };
    /**
    *	Rellena para compañia su sector.
    */
    Stocks.prototype.loadSectorByCompany = function (company, market_id, cb) {
        var _this = this;
        var self = this;
        var url = "https://www.google.com/finance?q=" + company.ticker;
        request(url, function (err, response, html) {
            if (!err && response.statusCode == 200) {
                var $ = self.cheerioLoad(html);
                var sector = $("a#sector").text();
                if (_.isEmpty(sector)) {
                    cb(null);
                }
                else {
                    _this.dbSector.getSectorByName(sector, function (err, sector) {
                        _this.dbCompany.updateSector(company.company_id, market_id, company.ticker, sector.sector_id, function (err) {
                            cb(err);
                        });
                    });
                }
            }
            else {
                console.log("Ha fallado loadSectorByTicker");
                console.log("Url : " + url);
                cb(err);
            }
        });
    };
    ;
    /**
    *	Cron en que almacena datos nuevos publicados cada trimestre y las cotizaciones diarias de cada empresa
    */
    Stocks.prototype.insertRatiosByCompany = function (company, quarter, cb) {
        var _this = this;
        this.dbQuarter.getQuarterByCompanyByYearByQuarternum(company.company_id, quarter.year, quarter.quarterNum, function (err, exists) {
            if (!exists) {
                _this.dbQuarter.setQuarterByCompany(quarter, company.company_id, function (err) {
                    cb(err, true);
                });
            }
            else {
                cb(null, false);
            }
        });
    };
    Stocks.prototype.loadRatiosByCompany = function ($, company, cb) {
        var _this = this;
        var url = "http://www.reuters.com/finance/stocks/financialHighlights?symbol=";
        var quaterResults = {};
        var results;
        //console.log("company.ticker: " + company.ticker);
        if ($("div.sectionContent") == undefined || $("div.sectionContent").find("div.module").length == 0) {
            console.log("company ERR: " + company.ticker);
            cb(null, null, true);
        }
        else {
            $("div.sectionContent").find("div.module").each(function (index, ele) {
                _this.Reuters = new reuters_1.Reuters($, ele);
                var moduleName = $(ele).find("h3").text().trim();
                if (moduleName == "Revenue & Earnings Per Share") {
                    results = _this.Reuters.revenue();
                    quaterResults.year = moment().year();
                    quaterResults.quarterNum = results[0];
                    //console.log("quaterResults.quarterNum: "+quaterResults.quarterNum);
                    quaterResults.revenue = results[1];
                    quaterResults.earnings_per_share = results[2];
                }
                else if (moduleName == "Valuation Ratios") {
                    results = _this.Reuters.valuationRations();
                    quaterResults.price_earnings_ratio = results[0];
                    quaterResults.beta = results[1];
                    quaterResults.price_to_sales = results[2];
                    quaterResults.price_to_book = results[3];
                    quaterResults.price_to_cashflow = results[4];
                }
                else if (moduleName == "Dividends") {
                    results = _this.Reuters.dividends();
                    quaterResults.dividend_yield = results[0];
                    quaterResults.payout_ratio = results[1];
                }
                else if (moduleName == "Financial Strength") {
                    results = _this.Reuters.finalcialStrength();
                    quaterResults.current_ratio = results[0];
                    quaterResults.total_debt_to_equity = results[1];
                }
                else if (moduleName == "Profitability Ratios") {
                    results = _this.Reuters.profitability();
                    quaterResults.net_profit_margin = results[0];
                }
                else if (moduleName == "Management Effectiveness") {
                    results = _this.Reuters.management();
                    quaterResults.return_on_assets = results[0];
                }
            });
            if (quaterResults.quarterNum == null) {
                console.log("La empresa con ticker : " + company.ticker + " tiene quearternum null");
                cb(null, null, true);
            }
            else {
                cb(null, quaterResults, false);
            }
        }
    };
    ;
    /**
    *	Dada una compañia, extrae la cotización.
    */
    Stocks.prototype.loadQuote = function ($, company, cb) {
        var self = this;
        var value = parseFloat($("span.valueContent").children().eq(0).text().trim().replace("$", ""));
        var change = parseFloat($("span.valueContent").children().eq(1).children().eq(0).text().trim().replace("%", "").replace("(", "").replace(")", ""));
        var historical = {
            change: change,
            value: value
        };
        if (!isNaN(historical.value) && !isNaN(historical.change)) {
            cb(null, historical, false);
        }
        else {
            cb(null, false, true);
        }
    };
    ;
    Stocks.prototype.insertQuote = function (company, historical, cb) {
        this.dbHistorical.setHistoricalByCompany(historical, company.company_id, function (err) {
            cb(err);
        });
    };
    return Stocks;
})();
exports.Stocks = Stocks;
//# sourceMappingURL=stocks.js.map