/// <reference path = "../../../typings/tsd.d.ts" />


require('typescript-require')({
  nodeLib: false,
  targetES5: true,
  exitOnError: true
});

let Cheerio = require('cheerio');
let cheerioLoad = Cheerio.load;
import 'source-map-support/register';
import * as request from 'request';
import * as mongoose from 'mongoose';
import * as _ from 'underscore';
import * as async from 'async';
import * as moment from 'moment';
import * as chai from 'chai';
import * as Chance from 'chance';


let assert = chai.assert;
let should = chai.should();
let chance = new Chance();

import * as db from '../../db/db';

let dbCompany = db.connections.cloudStocksTestConnection.model('Company');

import { Stocks as StocksClass } from './stocks';
import { Reuters as ReutersClass } from '../reuters/reuters';

import { ICompany } from '../../db/models/company/company.mongodb';

let Stocks = new StocksClass(db.connections.cloudStocksTestConnection);

describe('Stocks module Test', function() {
  this.timeout(15000);

  before(function(done) {
    async.waterfall([
      function(cb: any) {
        dbCompany.remove({}).exec(function(err, resutls) {
          cb(err);
        })
      }
    ], function() {
        done();
      })

  });

  describe('loadMarkets', function() {
    it("Test 1", function(done) {
      Stocks.loadMarkets(function(err) {
        assert.isNull(err);
        done();
      });
    });
  });

  describe('loadSectors', function() {
    it("Test 1", function(done) {
      Stocks.loadSectors(function(err) {
        assert.isNull(err);
        done();
      });
    });
  });

  describe('loadNumNASDAQItems', function() {
    it("Test 1", function(done) {
      Stocks.loadNumNASDAQItems(function(err, num) {
        assert.isNull(err, "test 1.1");
        assert.isNumber(num, "test 1.2");
        assert.isTrue(num > 0, "test 1.3");
        done();
      })
    })
  })
  describe("loadNASDAQByPage", function() {
    it("Test 1", function(done) {
      Stocks.loadNumNASDAQItems(function(err, num) {
        Stocks.loadNASDAQByPage(chance.integer({ min: 0, max: Math.ceil(num / 50) }), function(err, companies) {
          assert.isNull(err, "test 1.1");
          assert.isArray(companies, "test 1.2");
          assert.isTrue(companies.length > 0, "test 1.3");
          done();
        });
      });
    });
  });
  describe("insertNASDAQCompanies", function() {
    it("Test 2", function(done) {
      Stocks.loadNumNASDAQItems(function(err, num) {
        Stocks.loadNASDAQByPage(chance.integer({ min: 0, max: Math.ceil(num / 50) }), function(err, companies) {
          Stocks.insertNASDAQCompanies(companies, function(err, newCompanies) {
            assert.isNull(err);
            assert.isNumber(newCompanies);
            assert.isTrue(newCompanies > 0);
            done();
          });
        });
      });
    });
  });
  describe("loadSectorByCompany", function() {
    it("Test 1", function(done) {
      let self = this;
      dbCompany.find({}).count(function(err: any, count: number) {
        assert.isNull(err);
        assert.isTrue(count > 0);
        dbCompany.find({})
          .skip(chance.integer({ min: 0, max: (count - 1) }))
          .limit(1)
          .exec(function(err: any, companies: ICompany[]) {
          assert.isNull(err, "tes 1.1");
          assert.isTrue(companies.length == 1, "test 1.2");
          Stocks.loadSectorByCompany(companies[0], function(err, sector) {
            assert.isNull(err, "test 1.3");
            done();
          });
        });
      });
    });
  });
  describe("updateRatiosByCompany", function() {
    it("Test 1", function(done) {
      let self = this;
      let company: ICompany = {
        ticker: 'AAPL.O'
      }
      let url: string = "http://www.reuters.com/finance/stocks/financialHighlights?symbol=";
      request(url + company.ticker, function(err, response, html) {
        if (!err && response.statusCode == 200) {
          let $ = cheerioLoad(html);
          Stocks.loadRatiosByCompany($, company, function(err, quarter, noTables) {
            assert.isNull(err);
            assert.isObject(quarter);
            assert.deepProperty(quarter, "quarterNum");
            assert.deepProperty(quarter, "year");
            assert.deepProperty(quarter, "revenue");
            assert.isBoolean(noTables);
            assert.isFalse(noTables);
            done();
          });
        } else {
          throw "bad request";
        }
      });
    })
  });
})
