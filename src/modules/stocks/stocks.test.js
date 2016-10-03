/// <reference path = "../../../typings/tsd.d.ts" />
require('typescript-require')({
    nodeLib: false,
    targetES5: true,
    exitOnError: true
});
var Cheerio = require('cheerio');
var cheerioLoad = Cheerio.load;
require('source-map-support/register');
var request = require('request');
var async = require('async');
var chai = require('chai');
var Chance = require('chance');
var assert = chai.assert;
var should = chai.should();
var chance = new Chance();
var db = require('../../db/db');
var dbCompany = db.connections.cloudStocksTestConnection.model('Company');
var stocks_1 = require('./stocks');
var Stocks = new stocks_1.Stocks(db.connections.cloudStocksTestConnection);
describe('Stocks module Test', function () {
    this.timeout(15000);
    before(function (done) {
        async.waterfall([
            function (cb) {
                dbCompany.remove({}).exec(function (err, resutls) {
                    cb(err);
                });
            }
        ], function () {
            done();
        });
    });
    describe('loadMarkets', function () {
        it("Test 1", function (done) {
            Stocks.loadMarkets(function (err) {
                assert.isNull(err);
                done();
            });
        });
    });
    describe('loadSectors', function () {
        it("Test 1", function (done) {
            Stocks.loadSectors(function (err) {
                assert.isNull(err);
                done();
            });
        });
    });
    describe('loadNumNASDAQItems', function () {
        it("Test 1", function (done) {
            Stocks.loadNumNASDAQItems(function (err, num) {
                assert.isNull(err, "test 1.1");
                assert.isNumber(num, "test 1.2");
                assert.isTrue(num > 0, "test 1.3");
                done();
            });
        });
    });
    describe("loadNASDAQByPage", function () {
        it("Test 1", function (done) {
            Stocks.loadNumNASDAQItems(function (err, num) {
                Stocks.loadNASDAQByPage(chance.integer({ min: 0, max: Math.ceil(num / 50) }), function (err, companies) {
                    assert.isNull(err, "test 1.1");
                    assert.isArray(companies, "test 1.2");
                    assert.isTrue(companies.length > 0, "test 1.3");
                    done();
                });
            });
        });
    });
    describe("insertNASDAQCompanies", function () {
        it("Test 2", function (done) {
            Stocks.loadNumNASDAQItems(function (err, num) {
                Stocks.loadNASDAQByPage(chance.integer({ min: 0, max: Math.ceil(num / 50) }), function (err, companies) {
                    Stocks.insertNASDAQCompanies(companies, function (err, newCompanies) {
                        assert.isNull(err);
                        assert.isNumber(newCompanies);
                        assert.isTrue(newCompanies > 0);
                        done();
                    });
                });
            });
        });
    });
    describe("loadSectorByCompany", function () {
        it("Test 1", function (done) {
            var self = this;
            dbCompany.find({}).count(function (err, count) {
                assert.isNull(err);
                assert.isTrue(count > 0);
                dbCompany.find({})
                    .skip(chance.integer({ min: 0, max: (count - 1) }))
                    .limit(1)
                    .exec(function (err, companies) {
                    assert.isNull(err, "tes 1.1");
                    assert.isTrue(companies.length == 1, "test 1.2");
                    Stocks.loadSectorByCompany(companies[0], function (err, sector) {
                        assert.isNull(err, "test 1.3");
                        done();
                    });
                });
            });
        });
    });
    describe("updateRatiosByCompany", function () {
        it("Test 1", function (done) {
            var self = this;
            var company = {
                ticker: 'AAPL.O'
            };
            var url = "http://www.reuters.com/finance/stocks/financialHighlights?symbol=";
            request(url + company.ticker, function (err, response, html) {
                if (!err && response.statusCode == 200) {
                    var $ = cheerioLoad(html);
                    Stocks.loadRatiosByCompany($, company, function (err, quarter, noTables) {
                        assert.isNull(err);
                        assert.isObject(quarter);
                        assert.deepProperty(quarter, "quarterNum");
                        assert.deepProperty(quarter, "year");
                        assert.deepProperty(quarter, "revenue");
                        assert.isBoolean(noTables);
                        assert.isFalse(noTables);
                        done();
                    });
                }
                else {
                    throw "bad request";
                }
            });
        });
    });
});
//# sourceMappingURL=stocks.test.js.map