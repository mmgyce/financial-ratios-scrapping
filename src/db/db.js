///<reference path="../../typings/tsd.d.ts" />
require('typescript-require')({
    nodeLib: false,
    targetES5: true,
    exitOnError: true
});
var cassandra = require('cassandra-driver');
exports.connections = {
    "cloudStocksConnection": new cassandra.Client({ contactPoints: ['127.0.0.1'], keyspace: 'cloud_stocks', queryOptions: { consistency: cassandra.types.consistencies.one } }),
    "cloudStocksTestConnection": new cassandra.Client({ contactPoints: ['127.0.0.1'], keyspace: 'cloud_stocks_test', queryOptions: { consistency: cassandra.types.consistencies.one } })
};
//# sourceMappingURL=db.js.map