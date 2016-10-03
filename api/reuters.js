

module.exports = (function () {
	var my = {};

	my.revenueModule = function ($, ele) {
		var i = 1;
		var quarter = 1;
		var revenue;
		var earnings_per_share;

		if ($(ele).find("div.moduleBody").children().length == 0 || $(ele).find("div.moduleBody").find("tr").length == 0) {
			quarter = null;
			revenue = null;
			earnings_per_share = null;
		} else {
			revenue = parseFloat($(ele).find("tr").eq(1).children().eq(2).text().replace(",", "").trim());
			earnings_per_share = parseFloat($(ele).find("tr").eq(1).children().eq(3).text().replace(",", "").trim());
			 quarter = parseInt($(ele).find("tr").eq(i).children().eq(0).attr("rowspan"));
			 console.log("Quarter : "+parseInt($(ele).find("tr").eq(i).children().eq(0).attr("rowspan")));
		}
		console.log("Res quarter : "+quarter);
		return [quarter, revenue, earnings_per_share]
	}

	my.valuationRationsModule = function ($, ele) {
		var price_earnings_ratio = parseFloat($(ele).find("tr").eq(1).children().eq(1).text().replace(",", "").trim());
		var beta = parseFloat($(ele).find("tr").eq(5).children().eq(1).text().replace(",", "").trim());
		var price_to_sales = parseFloat($(ele).find("tr").eq(7).children().eq(1).text().replace(",", "").trim());
		var price_to_book = parseFloat($(ele).find("tr").eq(8).children().eq(1).text().replace(",", "").trim());
		var price_to_cashflow = parseFloat($(ele).find("tr").eq(10).children().eq(1).text().replace(",", "").trim());

		return [price_earnings_ratio, beta, price_to_sales, price_to_book, price_to_cashflow];
	}

	my.dividendsModule = function ($, ele) {
		var dividend_yield = parseFloat($(ele).find("tr").eq(1).children().eq(1).text().replace(",", "").trim());
		var payout_ratio = parseFloat($(ele).find("tr").eq(5).children().eq(1).text().replace(",", "").trim());
		return [dividend_yield, payout_ratio];
	}

	my.finalcialStrengthModule = function ($, ele) {
		var current_ratio = parseFloat($(ele).find("tr").eq(2).children().eq(1).text().replace(",", "").trim());
		var total_debt_to_equity = parseFloat($(ele).find("tr").eq(4).children().eq(1).text().replace(",", "").trim());

		return [current_ratio, total_debt_to_equity];
	}

	my.profitabilityModule = function ($, ele) {
		var net_profit_margin = parseFloat($(ele).find("tr").eq(13).children().eq(1).text().replace(",", "").trim());

		return [net_profit_margin];
	}
	my.managementModule = function ($, ele) {
		var return_on_assets = parseFloat($(ele).find("tr").eq(1).children().eq(1).text().replace(",", "").trim());

		return [return_on_assets];
	}


	return my;
} ())
