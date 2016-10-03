
/// <reference path="../../../typings/tsd.d.ts" />

import 'source-map-support/register';

interface IReuters {
  revenue(): number[];
  valuationRations(): number[];
  dividends(): number[];
  finalcialStrength(): number[];
  profitability(): number[];
  management(): number[];
}

/**
* Extrae los datos trimestrales de las empresas, Reuters
*/
export class Reuters implements IReuters {
  $: any;
  ele: any;

  constructor($: any, ele: any) {
    this.$ = $;
    this.ele = ele;
  }

  revenue(): number[] {
    let i: number = 1;
    let quarter: number = 1;
    let revenue: number;
    var earnings_per_share: number;

    if (this.$(this.ele).find("div.moduleBody").children().length == 0 || this.$(this.ele).find("div.moduleBody").find("tr").length == 0) {
      quarter = null;
      revenue = null;
      earnings_per_share = null;
    } else {
      revenue = parseFloat(this.$(this.ele).find("tr").eq(1).children().eq(2).text().replace(",", "").trim());
      earnings_per_share = parseFloat(this.$(this.ele).find("tr").eq(1).children().eq(3).text().replace(",", "").trim());
      quarter = parseInt(this.$(this.ele).find("tr").eq(i).children().eq(0).attr("rowspan"));
    }

    return [quarter, revenue, earnings_per_share];
  };

  valuationRations(): number[] {
    let price_earnings_ratio = parseFloat(this.$(this.ele).find("tr").eq(1).children().eq(1).text().replace(",", "").trim());
    let beta = parseFloat(this.$(this.ele).find("tr").eq(5).children().eq(1).text().replace(",", "").trim());
    let price_to_sales = parseFloat(this.$(this.ele).find("tr").eq(7).children().eq(1).text().replace(",", "").trim());
    let price_to_book = parseFloat(this.$(this.ele).find("tr").eq(8).children().eq(1).text().replace(",", "").trim());
    var price_to_cashflow = parseFloat(this.$(this.ele).find("tr").eq(10).children().eq(1).text().replace(",", "").trim());

    return [price_earnings_ratio, beta, price_to_sales, price_to_book, price_to_cashflow];
  };

  dividends(): number[] {
    let dividend_yield = parseFloat(this.$(this.ele).find("tr").eq(1).children().eq(1).text().replace(",", "").trim());
    let payout_ratio = parseFloat(this.$(this.ele).find("tr").eq(5).children().eq(1).text().replace(",", "").trim());
    return [dividend_yield, payout_ratio];
  }

  finalcialStrength(): number[] {
    let current_ratio = parseFloat(this.$(this.ele).find("tr").eq(2).children().eq(1).text().replace(",", "").trim());
    let total_debt_to_equity = parseFloat(this.$(this.ele).find("tr").eq(4).children().eq(1).text().replace(",", "").trim());

    return [current_ratio, total_debt_to_equity];
  };

  profitability(): number[] {
    
    var net_profit_margin = parseFloat(this.$(this.ele).find("tr").eq(13).children().eq(1).text().replace(",", "").trim());
    
    return [net_profit_margin];
  }
  management(): number[] {
    var return_on_assets = parseFloat(this.$(this.ele).find("tr").eq(1).children().eq(1).text().replace(",", "").trim());

    return [return_on_assets];
  }
}
