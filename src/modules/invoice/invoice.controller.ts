import { Request, Response } from 'express';
import { invoiceService } from './invoice.service';
import { ok, created } from '../../utils/api-error';
import { param } from '../../utils/validator';
import { recordAudit } from '../../middleware/audit';
import { listInvoiceQuery, GenerateInvoiceDto, AdjustInvoiceDto, WaiveInvoiceDto } from './invoice.types';

export class InvoiceController {
  async generate(req: Request, res: Response) {
    const result = await invoiceService.generate(req.user!, req.body as GenerateInvoiceDto);
    for (const inv of result.invoices) {
      await recordAudit({ userId: req.user!.id, schoolId: inv.schoolId, action: 'INVOICE_GENERATED', tableName: 'Invoice', recordId: inv.id, newValues: { invoiceNumber: inv.invoiceNumber, amount: inv.amount.toString() } }).catch(() => {});
    }
    created(res, result, `Generated ${result.generated} invoice(s)`);
  }

  async list(req: Request, res: Response) {
    const q = listInvoiceQuery.parse(req.query);
    const { data, meta } = await invoiceService.list(req.user!, q);
    ok(res, data, undefined, meta);
  }

  async get(req: Request, res: Response) {
    ok(res, await invoiceService.getById(req.user!, param(req, 'id')));
  }

  async adjust(req: Request, res: Response) {
    const inv = await invoiceService.adjust(req.user!, param(req, 'id'), req.body as AdjustInvoiceDto);
    await recordAudit({ userId: req.user!.id, schoolId: inv.schoolId, action: 'INVOICE_ADJUSTED', tableName: 'Invoice', recordId: inv.id });
    ok(res, inv, 'Invoice adjusted');
  }

  async waive(req: Request, res: Response) {
    const inv = await invoiceService.waive(req.user!, param(req, 'id'), req.body as WaiveInvoiceDto);
    await recordAudit({ userId: req.user!.id, schoolId: inv.schoolId, action: 'INVOICE_ADJUSTED', tableName: 'Invoice', recordId: inv.id });
    ok(res, inv, 'Invoice waived');
  }

  async overdue(req: Request, res: Response) {
    ok(res, await invoiceService.overdue(req.user!, req.query.schoolId as string | undefined));
  }

  async summary(req: Request, res: Response) {
    ok(res, await invoiceService.summary(req.user!, req.query.schoolId as string | undefined));
  }

  async print(req: Request, res: Response) {
    const html = await invoiceService.print(req.user!, param(req, 'id'));
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  async download(req: Request, res: Response) {
    const pdf = await invoiceService.generatePdf(req.user!, param(req, 'id'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${param(req, 'id').slice(0, 12)}.pdf"`);
    res.send(pdf);
  }
}

export const invoiceController = new InvoiceController();
