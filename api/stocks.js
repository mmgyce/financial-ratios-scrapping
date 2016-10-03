/* global Sector */
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var _ = require('underscore');
var moment = require("moment");
var mongoose = require('mongoose');

var Reuters = require('./reuters');
console.log("cheerio: "+cheerio);


module.exports = function (dbModel) {

	var Sector = dbModel.model('Sector');
	var Market = dbModel.model('Market');
	var Company = dbModel.model('Company');

	var my = {};
	my.loadMarkets = function (cb) {
		var markets = [{
			name: "NASDAQ",
			country: "usa",
			currency: "USD",
			url: "http://www.nasdaq.com/screening/companies-by-industry.aspx?exchange=NASDAQ&region=North+America",
			last_track: new Date()
		}];
		Market.find().count(function (err, count) {
			if (count == 0) {
				async.map(markets, function (market, done) {
					new Market(market).save(function (err, market) {
						if (!err && market) {
							done();
						} else {
							throw "Error al guardar el market";
						}
					})
				}, function () {
					cb();
				})
			} else {
				console.log("Los markets ya estaban introducidos");
				cb();
			}
		});
	}
	my.loadSectors = function (cb) {
		var sectors = [{
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

		Sector.find().count(function (err, count) {
			if (count == 0) {
				async.map(sectors, function (sector, done) {
					new Sector(sector).save(function (err, sector) {
						if (!err && sector) {
							done();
						} else {
							throw "Error al guardar el sector";
						}
					})
				}, function () {
					cb();
				})
			} else {
				console.log("Los sectores ya estaban introducidos");
				cb();
			}
		});
	}
	my.loadCompanyByTicker = function (market, page, cb) {
		request(market.url + "&page=" + page, function (err, response, html) {
			if (!err && response.statusCode == 200) {
				var $ = cheerio.load(html);
				var end = parseInt($("small.marginR10px").find("b").eq(0).text().trim().split("-")[1]);
				var items = parseInt($("small.marginR10px").find("b").eq(1).text().trim());
				var companies = [];
				var condition = end == items;
				$("div#main-content-div").find("table#CompanylistResults").children("tr").each(function (index, ele) {
					if ($(ele).find("img").html() == null) {
						var ticker = $(ele).children().eq(1).find("a").text().trim();
						var name = $(ele).children().eq(0).find("a").text().trim();
						companies.push({
							name: name,
							date: new Date(),
							ticker: ticker,
							market: market._id
						});
					}
				});
				cb(null, companies, condition);
			} else {
				throw "Fallos request loadNASDAQTicker";
			}
		});
	}
	my.loadNASDAQByTicker = function (cb) {
		Market.findOne({ name: "NASDAQ" }).exec(function (err, market) {
			var page = 1;
			var companies = [];
			var condition;
			async.doWhilst(function (done) {
				process.stdout.write("\rPágina " + page + " del NASDAQ");
				my.loadCompanyByTicker(market, page, function (err, companiesRes, conditionRes) {
					condition = conditionRes;
					companies = _.union(companies, companiesRes);
					done();
				})
			}, function () {
				page++;
				return !condition;
			}, function () {
				cb(null, companies);
			})
		})
	}
	my.loadSectorByTicker = function (ticker, cb) {
		var url = "https://www.google.com/finance?q=" + ticker;
		request(url, function (err, response, html) {
			if (!err && response.statusCode == 200) {
				var $ = cheerio.load(html);
				var sector = $("a#sector").text();
				cb(null, sector);
			} else {
				console.log("Ha fallado loadSectorByTicker");
				console.log("Url : " + url);
				cb(null, "");
			}
		})
	}

	my.updateRatiosByCompany = function (company, cb) {
		var url = "http://www.reuters.com/finance/stocks/financialHighlights?symbol=" + company.ticker;
		request(url, function (err, response, html) {
			if (!err && response.statusCode == 200) {
				var $ = cheerio.load(html);
				var results;
				var quarterNum,
					revenue,
					earnings_per_share,
					price_earnings_ratio,
					price_to_sales,
					price_to_book,
					price_to_cashflow,
					current_ratio,
					total_debt_to_equity,
					return_on_assets,
					net_profit_margin,
					beta,
					dividend_yield,
					payout_ratio;

				$("div.sectionContent").find("div.module").each(function (index, ele) {
					var moduleName = $(ele).find("h3").text().trim();
					if (moduleName == "Revenue & Earnings Per Share") {
						results = Reuters.revenueModule($, ele);
						quarterNum = results[0];
						revenue = results[1];
						earnings_per_share = results[2];


						/*console.log("Quarter: "+quarterNum);
						console.log("Revenue : "+revenue);
						console.log("Earnings per share : "+earnings_per_share);
						*/
					} else if (moduleName == "Valuation Ratios") {
						results = Reuters.valuationRationsModule($, ele);
						price_earnings_ratio = results[0];
						beta = results[1];
						price_to_sales = results[2];
						price_to_book = results[3];
						price_to_cashflow = results[4];

						/*console.log("price_earnings_ratio: "+price_earnings_ratio);
						console.log("beta: "+beta);
						console.log("price_to_sales: "+price_to_sales);
						console.log("price_to_book: "+price_to_book);
						console.log("price_to_cashflow: "+price_to_cashflow);*/

					} else if (moduleName == "Dividends") {
						results = Reuters.dividendsModule($, ele);
						dividend_yield = results[0];
						payout_ratio = results[1];
						/*console.log("dividend_yield: "+dividend_yield);
						console.log("payout_ratio: "+payout_ratio);*/
					} else if (moduleName == "Financial Strength") {
						results = Reuters.finalcialStrengthModule($, ele);
						current_ratio = results[0];
						total_debt_to_equity = results[1];
						/*console.log("current_ratio: "+current_ratio);
						console.log("total_debt_to_equity: "+total_debt_to_equity);*/
					} else if (moduleName == "Profitability Ratios") {
						results = Reuters.profitabilityModule($, ele);
						net_profit_margin = results[0];
						/*console.log("net_profit_margin: "+net_profit_margin);*/
					} else if (moduleName == "Management Effectiveness") {
						results = Reuters.managementModule($, ele);
						return_on_assets = results[0];
						/*console.log("return_on_assets: "+return_on_assets);*/
					}
				});
				if (quarterNum == null) {
					cb(null, false);
				} else {
					var exists = _.find(company.quarter, function (quarter) {
						return quarter.year == moment().year() && quarter.quarterNum == quarterNum;
					})

					if (!exists) {
						var quarter = {
							year: moment().year(),
							date: new Date(),
							quarterNum: quarterNum,
							revenue: revenue,
							earnings_per_share: earnings_per_share,
							price_earnings_ratio: price_earnings_ratio,
							beta: beta,
							price_to_sales: price_to_sales,
							price_to_book: price_to_book,
							price_to_cashflow: price_to_cashflow,
							current_ratio: current_ratio,
							total_debt_to_equity: total_debt_to_equity,
							return_on_assets: return_on_assets,
							net_profit_margin: net_profit_margin,
							dividend_yeld: dividend_yield,
							payout_ratio: payout_ratio
						};
						company.quarter.push(quarter);
						Company.update({ _id: company._id }, {
							$set: {
								quarter: company.quarter
							}
						}).exec(function (err, results) {
							if (err || results.nModified != 1) {
								throw "Algo ha ido mal";
							} else {
								cb(null, true);
							}
						})
					} else {
						/*
							Este snipet recolecta la cotización de la empresa una vez al día.
						*/
						my.getQuote($,company, function(){
							cb(null,false);
						})
					}
				}
			} else {
				console.log("Ha fallado! getRatiosByTicker");
				console.log("url : " + url);
				cb(null, false);
			}
		})
	}
	my.getQuote = function ($, company, cb) {

		var value = parseFloat($("span.valueContent").children().eq(0).text().trim().replace("$",""));
		var change = parseFloat($("span.valueContent").children().eq(1).children().eq(0).text().trim().replace("%","").replace("(","").replace(")",""));


		var historical = {
			date: moment().utc().toDate(),
			change: change,
			value: value
		}
		if (_.isNumber(value) && _.isNumber(change)) {
			company.historical.push(historical);
			Company.update({ _id: company._id }, {
				$set: {
					historical: company.historical
				}
			}).exec(function (err, results) {
				if (err || results.nModified != 1) {
					throw err + " o error en updateRatios Cotizacion";
				} else {
					cb(null, false);
				}
			});
		} else {
			cb(null,false);
		}
	}
	my.loadNASDAQ = function (cb) {
		var companyExists = 0;
		var companyNew = 0;
		var ignore = 0;
		my.loadNASDAQByTicker(function (err, companies) {
			console.log("\n" + companies.length + " companies");
			async.mapSeries(companies, function (company, done) {
				process.stdout.write("\rCompany : " + companies.indexOf(company) + " -> Existentes: " + companyExists + ", Nuevas: " + companyNew + ", Ignoradas (No sector): " + ignore);
				Company.findOne({ ticker: company.ticker }).exec(function (err, companyAux) {
					if (companyAux) {
						companyExists++;
						done();
					} else {
						my.loadSectorByTicker(company.ticker, function (err, sector) {
							if (_.isEmpty(sector)) {
								ignore++;
								done();
							} else {
								Sector.findOne({ name: sector }).exec(function (err, sector) {
									new Company({
										name: company.name,
										ticker: company.ticker,
										sector: sector._id,
										market: company.market
									}).save(function (err, company) {
										if (!err && company) {
											companyNew++;
											done();
										} else {
											throw "Error al guardar company";
										}
									})
								})
							}

						})
					}
				});
			}, function () {
				cb();
			})
		})
	}

	my.load = function (cb) {
		async.waterfall([
			function (done) {
				my.loadMarkets(function () {
					done();
				})
			},
			function (done) {
				my.loadSectors(function () {
					done();
				});
			},
			function (done) {
				my.loadNASDAQ(function () {
					done();
				});
			},
			function (done) {
				var updatedCompanies = 0;
				Company.find().exec(function (err, companies) {
					console.log("companies: " + companies.length);
					async.mapSeries(companies, function (company, callback) {
						process.stdout.write("\rCompany : " + companies.indexOf(company) + " -> Actualizadas: " + updatedCompanies + ", sin cambios: " + (companies.indexOf(company) - updatedCompanies));
						my.updateRatiosByCompany(company, function (err, updated) {
							if (updated == true) {
								updatedCompanies++;
							}
							callback();
						})
					}, function () {
						done();
					});
				});
			}
		], function () {
			cb();
		})
	}

	return my;
};
