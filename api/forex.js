var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var _ = require('underscore');
var moment = require("moment");
var mongoose = require('mongoose');

var phantom = require('phantom');

module.exports = (function () {

	var my = {};
	
	my.getCalendar = function (cb) {
		phantom.create(function (ph) {
			ph.createPage(function (page) {
				page.open("http://www.fxstreet.es/calendario-economico/", function (status) {
					page.evaluate(function(){
						return document.querySelector("#fxst_grid");
					},function(cal){
						ph.exit();
						cb(null, cal.innerHTML);
					})
				});
			});
		});
	}
	
	my.parseCalendar = function(cb){
		my.getCalendar(function(err, html){
			var $ = cheerio.load(html);
			
			var item = $('tr[data-eventdateid=d8579a57-de75-44a5-8249-7e8f04550d55]');
			console.log("item: "+item.html());
			cb();
		});
	}

	

	return my;
} ());