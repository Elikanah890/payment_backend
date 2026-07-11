import { Router } from 'express';
import { studentController } from './student.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { asyncHandler } from '../../utils/api-error';
import { idParam } from '../../utils/validator';
import { createStudentSchema, updateStudentSchema, withdrawSchema, bulkImportSchema } from './student.types';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(studentController.list.bind(studentController)));
router.get('/search', asyncHandler(studentController.search.bind(studentController)));
router.post('/', validate({ body: createStudentSchema }), asyncHandler(studentController.create.bind(studentController)));
router.post('/bulk', validate({ body: bulkImportSchema }), asyncHandler(studentController.bulk.bind(studentController)));
router.get('/:id', validate({ params: idParam }), asyncHandler(studentController.get.bind(studentController)));
router.put('/:id', validate({ params: idParam, body: updateStudentSchema }), asyncHandler(studentController.update.bind(studentController)));
router.delete('/:id', validate({ params: idParam, body: withdrawSchema }), asyncHandler(studentController.withdraw.bind(studentController)));
router.delete('/:id/permanent', validate({ params: idParam }), asyncHandler(studentController.permanentDelete.bind(studentController)));

export default router;
