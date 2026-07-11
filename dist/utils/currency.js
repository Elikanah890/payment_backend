"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.money = money;
exports.add = add;
exports.sub = sub;
exports.isPositive = isPositive;
exports.gte = gte;
const client_1 = require("@prisma/client");
function money(v) {
    return new client_1.Prisma.Decimal(v).toDecimalPlaces(2);
}
function add(a, b) {
    return money(a).plus(money(b));
}
function sub(a, b) {
    return money(a).minus(money(b));
}
function isPositive(v) {
    return money(v).greaterThan(0);
}
function gte(a, b) {
    return money(a).greaterThanOrEqualTo(money(b));
}
//# sourceMappingURL=currency.js.map