/// <reference path="../../../typings/tsd.d.ts" />
require('source-map-support/register');
/**
* Extrae los datos trimestrales de las empresas, Reuters
*/
var Reuters = (function () {
    function Reuters($, ele) {
        this.$ = $;
        this.ele = ele;
    }
    Reuters.prototype.revenue = function () {
        var i = 1;
        var quarter = 1;
        var revenue;
        var earnings_per_share;
        if (this.$(this.ele).find("div.moduleBody").children().length == 0 || this.$(this.ele).find("div.moduleBody").find("tr").length == 0) {
            quarter = null;
            revenue = null;
            earnings_per_share = null;
        }
        else {
            revenue = parseFloat(this.$(this.ele).find("tr").eq(1).children().eq(2).text().replace(",", "").trim());
            earnings_per_share = parseFloat(this.$(this.ele).find("tr").eq(1).children().eq(3).text().replace(",", "").trim());
            quarter = parseInt(this.$(this.ele).find("tr").eq(i).children().eq(0).attr("rowspan"));
        }
        return [quarter, revenue, earnings_per_share];
    };
    ;
    Reuters.prototype.valuationRations = function () {
        var price_earnings_ratio = parseFloat(this.$(this.ele).find("tr").eq(1).children().eq(1).text().replace(",", "").trim());
        var beta = parseFloat(this.$(this.ele).find("tr").eq(5).children().eq(1).text().replace(",", "").trim());
        var price_to_sales = parseFloat(this.$(this.ele).find("tr").eq(7).children().eq(1).text().replace(",", "").trim());
        var price_to_book = parseFloat(this.$(this.ele).find("tr").eq(8).children().eq(1).text().replace(",", "").trim());
        var price_to_cashflow = parseFloat(this.$(this.ele).find("tr").eq(10).children().eq(1).text().replace(",", "").trim());
        return [price_earnings_ratio, beta, price_to_sales, price_to_book, price_to_cashflow];
    };
    ;
    Reuters.prototype.dividends = function () {
        var dividend_yield = parseFloat(this.$(this.ele).find("tr").eq(1).children().eq(1).text().replace(",", "").trim());
        var payout_ratio = parseFloat(this.$(this.ele).find("tr").eq(5).children().eq(1).text().replace(",", "").trim());
        return [dividend_yield, payout_ratio];
    };
    Reuters.prototype.finalcialStrength = function () {
        var current_ratio = parseFloat(this.$(this.ele).find("tr").eq(2).children().eq(1).text().replace(",", "").trim());
        var total_debt_to_equity = parseFloat(this.$(this.ele).find("tr").eq(4).children().eq(1).text().replace(",", "").trim());
        return [current_ratio, total_debt_to_equity];
    };
    ;
    Reuters.prototype.profitability = function () {
        var net_profit_margin = parseFloat(this.$(this.ele).find("tr").eq(13).children().eq(1).text().replace(",", "").trim());
        return [net_profit_margin];
    };
    Reuters.prototype.management = function () {
        var return_on_assets = parseFloat(this.$(this.ele).find("tr").eq(1).children().eq(1).text().replace(",", "").trim());
        return [return_on_assets];
    };
    return Reuters;
})();
exports.Reuters = Reuters;
//# sourceMappingURL=reuters.js.map