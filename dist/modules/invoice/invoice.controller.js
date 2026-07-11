"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceController = exports.InvoiceController = void 0;
const invoice_service_1 = require("./invoice.service");
const api_error_1 = require("../../utils/api-error");
const validator_1 = require("../../utils/validator");
const audit_1 = require("../../middleware/audit");
const invoice_types_1 = require("./invoice.types");
class InvoiceController {
    async generate(req, res) {
        const result = await invoice_service_1.invoiceService.generate(req.user, req.body);
        for (const inv of result.invoices) {
            await (0, audit_1.recordAudit)({ userId: req.user.id, schoolId: inv.schoolId, action: 'INVOICE_GENERATED', tableName: 'Invoice', recordId: inv.id, newValues: { invoiceNumber: inv.invoiceNumber, amount: inv.amount.toString() } }).catch(() => { });
        }
        (0, api_error_1.created)(res, result, `Generated ${result.generated} invoice(s)`);
    }
    async list(req, res) {
        const q = invoice_types_1.listInvoiceQuery.parse(req.query);
        const { data, meta } = await invoice_service_1.invoiceService.list(req.user, q);
        (0, api_error_1.ok)(res, data, undefined, meta);
    }
    async get(req, res) {
        (0, api_error_1.ok)(res, await invoice_service_1.invoiceService.getById(req.user, (0, validator_1.param)(req, 'id')));
    }
    async adjust(req, res) {
        const inv = await invoice_service_1.invoiceService.adjust(req.user, (0, validator_1.param)(req, 'id'), req.body);
        await (0, audit_1.recordAudit)({ userId: req.user.id, schoolId: inv.schoolId, action: 'INVOICE_ADJUSTED', tableName: 'Invoice', recordId: inv.id });
        (0, api_error_1.ok)(res, inv, 'Invoice adjusted');
    }
    async waive(req, res) {
        const inv = await invoice_service_1.invoiceService.waive(req.user, (0, validator_1.param)(req, 'id'), req.body);
        await (0, audit_1.recordAudit)({ userId: req.user.id, schoolId: inv.schoolId, action: 'INVOICE_ADJUSTED', tableName: 'Invoice', recordId: inv.id });
        (0, api_error_1.ok)(res, inv, 'Invoice waived');
    }
    async overdue(req, res) {
        (0, api_error_1.ok)(res, await invoice_service_1.invoiceService.overdue(req.user, req.query.schoolId));
    }
    async summary(req, res) {
        (0, api_error_1.ok)(res, await invoice_service_1.invoiceService.summary(req.user, req.query.schoolId));
    }
    async print(req, res) {
        const html = await invoice_service_1.invoiceService.print(req.user, (0, validator_1.param)(req, 'id'));
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    }
    async download(req, res) {
        const pdf = await invoice_service_1.invoiceService.generatePdf(req.user, (0, validator_1.param)(req, 'id'));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${(0, validator_1.param)(req, 'id').slice(0, 12)}.pdf"`);
        res.send(pdf);
    }
}
exports.InvoiceController = InvoiceController;
exports.invoiceController = new InvoiceController();
//# sourceMappingURL=invoice.controller.js.map