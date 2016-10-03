/// <reference path="../../typings/tsd.d.ts" />
require('typescript-require')({
    nodeLib: false,
    targetES5: true,
    exitOnError: true
});
var Cheerio = require('cheerio');
require('source-map-support/register');
var async = require('async');
var _ = require('underscore');
var nodemailer = require('nodemailer');
var request = require('request');
var stocks_1 = require('../modules/stocks/stocks');

var Recollect = (function () {
    function Recollect(db) {
        this.Stocks = new stocks_1.Stocks(db);
        this.cheerioLoad = Cheerio.load;
    }
    /**
    * Recolecta información relativa a Mercados bursátiles
    */
    Recollect.prototype.spiderMarkets = function (cb) {
        var _this = this;
        async.waterfall([
            function (callback) {
                _this.Stocks.loadNumNASDAQItems(function (err, num) {
                    if (num == null) {
                        throw "Num dasqr es null, problemas de red";
                        process.exit(1);
                    }
                    else {
                        callback(err, num);
                    }
                });
            },
            function (num, callback) {
                var totalPages = Math.ceil(num / 50);
                var currentPage = 1;
                var companies = [];
                console.log("totalPages: " + totalPages);
                async.doWhilst(function (done) {
                    process.stdout.write("\rPágina " + currentPage);
                    _this.Stocks.loadNASDAQByPage(currentPage, function (err, companiesAux) {
                        if (!err) {
                            companies = _.union(companies, companiesAux);
                            done(null);
                        }
                        else {
                            done(err);
                        }
                    });
                }, function () {
                    currentPage++;
                    return currentPage <= totalPages;
                }, function (err) {
                    callback(err, companies);
                });
            },
            function (companies, callback) {
                console.log("\ncompanies trackeadas y disponibles a insertar: " + companies.length);
                _this.Stocks.insertNASDAQCompanies(companies, function (err, newCompanies) {
                    console.log("\nNuevas companies : " + newCompanies);
                    callback(err, newCompanies);
                });
            },
            function (newCompanies, callback) {
                _this.Stocks.getNASDAQCompanies(function (err, companies) {
                    async.mapSeries(companies, function (company, done) {
                        _this.Stocks.loadSectorByCompany(company, company.market_id, function (err) {
                            callback(null, newCompanies);
                        });
                    });
                });
            },
            function (newCompanies, callback) {
                var update_quote = 0;
                var update_ratio = 0;
                var noTables_counter = 0;
                var exists_ratio = 0;
                var exists_quote = 0;
                var noHistorical_counter = 0;
                var badRequest_counter = 0;
                _this.Stocks.getNASDAQCompanies(function (err, companies) {
                    async.mapSeries(companies, function (company, done) {
                        var url = "http://www.reuters.com/finance/stocks/financialHighlights?symbol=";
                        async.waterfall([
                            //Hago request y obtengo html
                            //Hago request y obtengo html
                            function (doneFn) {
                                request(url + company.ticker, function (err, response, html) {
                                    if (!err && response.statusCode == 200) {
                                        var $ = _this.cheerioLoad(html);
                                        doneFn(null, $);
                                    }
                                    else {
                                        doneFn(null, null);
                                    }
                                });
                            },
                            //get Ratios
                            //get Ratios
                            function ($, doneFn) {
                                if ($) {
                                    _this.Stocks.loadRatiosByCompany($, company, function (err, quarter, noTables) {
                                        if (!noTables) {
                                            _this.Stocks.insertRatiosByCompany(company, quarter, function (err, updated_ratio) {
                                                //console.log("quarter : "+JSON.stringify(quarter,null,2));
                                                //console.log("company : "+JSON.stringify(company,null,2));
                                                if (updated_ratio) {
                                                    update_ratio++;
                                                }
                                                doneFn(null, $);
                                            });
                                        }
                                        else {
                                            noTables_counter++;
                                            doneFn(null, "Notable");
                                        }
                                    });
                                }
                                else {
                                    badRequest_counter++;
                                    doneFn(null, "badRequest");
                                }
                            },
                            //get quote
                            //get quote
                            function ($, doneFn) {
                                if ($ != "Notable" && $ != "badRequest") {
                                    _this.Stocks.loadQuote($, company, function (err, historical, noHistorical) {
                                        if (!noHistorical) {
                                            _this.Stocks.insertQuote(company, historical, function (err) {
                                                update_quote++;
                                                doneFn(err);
                                            });
                                        }
                                        else {
                                            noHistorical_counter++;
                                            doneFn(err);
                                        }
                                    });
                                }
                                else {
                                    doneFn(null);
                                }
                            }
                        ], function (err) {
                            process.stdout.write("\rTotal : " + companies.length + ", Quote updated: " + update_quote + ", Ratio updated: " + update_ratio + ", NoTables : " + noTables_counter + ", badRquest: " + badRequest_counter);
                            done(err, null);
                        });
                    }, function () {
                        callback(null, [newCompanies, update_quote, update_ratio]);
                    });
                });
            }
        ], function (err, results) {
            cb(err, results);
        });
    };
    ;
    return Recollect;
})();
exports.Recollect = Recollect;
//# sourceMappingURL=recollect.js.map