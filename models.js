var mongoose = require('mongoose');
var async = require('async');
var _ = require('underscore');



module.exports = (function () {

	var currencySchema = mongoose.Schema({
		
	});
	var pairSchema = mongoose.Schema({
		base: String,
		contraria : String,
		series: [{
			date: Date,
			value: Number
		}],
		buy_threshold : Number,
		sell_threshold : Number
	});
	var sectorSchema = mongoose.Schema({
		name: String,
		historical: [{
			date: Date,
			change: Number,
			value: Number,
			up_to_0: Number,
			down_to_0: Number,
			up_to_2: Number,
			down_to_2: Number
		}]
	});

	sectorSchema.index({
		name: 1
	});

	var marketSchema = mongoose.Schema({
		name: String,
		country: String,
		currency: String,
		url: String,
		last_track: Date,
		change: [{
			change: Number,
			value: Number
		}],
		companies: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Company"
		}]
	})


	var companySchema = mongoose.Schema({
		name: String,
		ticker: String,
		date: Date,
		market: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Market"
		},
		sector: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Sector"
		},
		historical: [{
			date: Date,
			change: Number,
			value: Number
		}],
		quarter: [{
			year: Number,
			date: Date,
			quarterNum: Number, //1, 2, 3, 4
			revenue: Number,
			earnings_per_share: Number,
			price_earnings_ratio: Number,
			beta: Number,
			price_to_sales: Number,
			price_to_book: Number,
			price_to_cashflow: Number,
			current_ratio: Number,
			total_debt_to_equity: Number,
			return_on_assets: Number,
			net_profit_margin: Number,
			dividend_yield: Number,
			payout_ratio: Number
		}]

	});

	var cloudStocksConnection = mongoose.createConnection('mongodb://localhost/cloud-stocks');
	var cloudStocksTestConnection = mongoose.createConnection('localhost', 'cloud-stocks-test');

	cloudStocksTestConnection.model('Sector', sectorSchema);
	cloudStocksTestConnection.model('Market', marketSchema);
	cloudStocksTestConnection.model('Currency', currencySchema);
	cloudStocksTestConnection.model('Company', companySchema);

	cloudStocksConnection.model('Sector', sectorSchema);
	cloudStocksConnection.model('Market', marketSchema);
	cloudStocksConnection.model('Currency', currencySchema);
	cloudStocksConnection.model('Company', companySchema);

	return {
		"cloudStocksConnection": cloudStocksConnection,
		"cloudStocksTestConnection": cloudStocksTestConnection
	}
} ());