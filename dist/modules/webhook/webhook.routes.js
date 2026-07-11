"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = require("../../config/logger");
const api_error_1 = require("../../utils/api-error");
const selcom_provider_1 = require("../transaction/selcom.provider");
const transaction_service_1 = require("../transaction/transaction.service");
const router = (0, express_1.Router)();
router.post('/selcom', (0, api_error_1.asyncHandler)(async (req, res) => {
    const signature = req.headers['x-webhook-signature'] || req.headers['x-selcom-signature'] || '';
    const raw = req.rawBody || JSON.stringify(req.body ?? {});
    if (!selcom_provider_1.selcomProvider.verifyWebhookSignature(raw, signature)) {
        logger_1.logger.warn('Rejected webhook: invalid signature');
        res.status(401).json({ success: false, message: 'Invalid signature' });
        return;
    }
    const payload = req.body || {};
    const providerRef = (payload.reference || payload.transaction_id || payload.providerRef || payload.order_id);
    if (!providerRef) {
        res.status(400).json({ success: false, message: 'Missing provider reference' });
        return;
    }
    const result = await transaction_service_1.transactionService.processWebhook(providerRef, payload);
    res.json({ success: true, message: 'Webhook processed', data: result });
}));
exports.default = router;
//# sourceMappingURL=webhook.routes.js.map