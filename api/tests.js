/// <reference path="../typings/mocha/mocha.d.ts"/>
/// <reference path="../typings/chai/chai.d.ts"/>

var Chance = require('chance');
var chance = new Chance();
var assert = require('chai').assert;
var _ = require('underscore');
var mongoose = require('mongoose');
var request = require('request');
var moment = require('moment');
var cheerio = require('cheerio');
var async = require('async');

var dbs = require('../models');
var dbModel = dbs["cloudStocksTestConnection"];

var Stocks = require('./stocks')(dbModel);

var Sector = dbModel.model('Sector');
var Market = dbModel.model('Market');
var Currency = dbModel.model('Currency');
var Company = dbModel.model('Company');
 

describe('STOCKS', function () {
	this.slow(0);
	this.timeout(500000);

	before(function (done) {
		async.waterfall([
			function (cb) {
				Sector.remove({}).exec(function (err, results) {
					cb();
				});
			},
			function (cb) {
				Market.remove({}).exec(function (err, results) {
					cb();
				});
			},
			function (cb) {
				Currency.remove({}).exec(function (err, results) {
					cb();
				});
			},
			function (cb) {
				Company.remove({}).exec(function (err, results) {
					cb();
				});
			}
		], function () {
			done();
		})
	});

	describe('loadMarkets', function () {
		it('test 1', function (done) {
			Stocks.loadMarkets(function () {
				Market.findOne({ name: "NASDAQ" }).exec(function (err, market) {
					assert.deepPropertyVal(market, "currency", "USD", "test 1.1");
					done();
				})
			});
		});
	});
	describe('loadSectors', function () {
		it('test 1', function (done) {
			Stocks.loadSectors(function () {
				Sector.find().count(function (err, count) {
					assert.isTrue(count == 10, "test 1.1");
					done();
				});
			});
		});
	});
	describe('loadCompanyByTicker', function () {
		it('test 1', function (done) {
			Market.findOne({ name: "NASDAQ" }).exec(function (err, market) {
				request('http://www.nasdaq.com/screening/companies-by-industry.aspx?exchange=NASDAQ&region=North+America', function (err, response, html) {
					if (!err && response.statusCode == 200) {
						var $ = cheerio.load(html);
						var items = parseInt($("small.marginR10px").find("b").eq(1).text().trim());
						var maxPages = items / 50;
						assert.isNumber(maxPages);
						Stocks.loadCompanyByTicker(market, chance.integer({ min: 0, max: (maxPages - 1) }), function (err, companiesRes, conditionRes) {
							assert.isTrue(companiesRes.length > 0, "test 1.1");
							async.map(companiesRes, function (company, callback) {
								new Company(company).save(function (err, company) {
									assert.isNotNull(company);
									callback();
								});
							}, function () {
								assert.isFalse(conditionRes, "test 1.2");
								done();
							})
						});
					} else {
						done();
						throw "No ha ido bien";
					}
				});
			});
		})
	});
	describe('loadSectorByTicker', function () {
		it("test 1", function (done) {
			Stocks.loadSectorByTicker("CSCO", function (err, sector) {
				assert.isTrue(sector == "Technology", "test 1");
				done();
			});
		})
	});
	describe('updateRatiosByCompany', function () {
		it("test 1", function (done) {
			Company.find().count(function (err, count) {
				var num = chance.integer({ min: 0, max: (count - 1) });
				Company.find()
					.skip(num)
					.limit(1)
					.exec(function (err, company) {
						Stocks.updateRatiosByCompany(company, function (err, updated) {
							if (updated == true) {
								Company.findOne({ _id: company._id }, function (err, company) {
									assert.lengthOf(company.quarter, 1, "test 1.1");
									assert.isTrue(company.quarter[0].quarterNum > 0 && company.quarter[0].quarterNum < 5, "test 1.2");
									done();
								});
							} else {
								done();
							}

						});
					});
			});
		});
	});
	describe("getQuote",function(){
		var url = "http://www.reuters.com/finance/stocks/financialHighlights?symbol=";
		it("test 1",function(done){
			Company.find().count(function(err,count){
				var skip = chance.integer({min: 0, max: count-1});
				Company.find()
				.skip(skip)
				.limit(1)
				.exec(function(err,companies){
					if(!companies[0]){
						throw "Tiene que haber una compania";
					}else{
						request(url+companies[0].ticker,function(err,response,html){
							if(!err && response.statusCode == 200){
								var $ = cheerio.load(html);
								Stocks.getQuote($, companies[0], function(){
									Company.findOne({_id : companies[0]._id})
									.exec(function(err,company){
										assert.isNotNull(company, "test 1.1");
										assert.lengthOf(company.historical, 1, "test 1.2");
										done();
									})
								});
							}else{
								throw "Bad requesT";
							}
						})
					}
				});
			});
		})
	})
})