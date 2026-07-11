"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startOfDay = startOfDay;
exports.endOfDay = endOfDay;
exports.daysBetween = daysBetween;
exports.addMonths = addMonths;
function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}
function endOfDay(d) {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
}
function daysBetween(a, b) {
    return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}
function addMonths(d, months) {
    const x = new Date(d);
    x.setMonth(x.getMonth() + months);
    return x;
}
//# sourceMappingURL=date-utils.js.map