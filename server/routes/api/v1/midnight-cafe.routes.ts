import { Router } from 'express';
import { midnightCafeController } from '../../../controllers/midnight-cafe.controller';
import { requireAuth } from '../../../middleware/auth.middleware';

const router = Router();

router.get('/', midnightCafeController.getAll);
router.get('/:id', midnightCafeController.getById);
router.post('/', requireAuth, midnightCafeController.create);
router.delete('/:id', requireAuth, midnightCafeController.delete);

router.get('/:id/replies', midnightCafeController.getReplies);
router.post('/:id/replies', requireAuth, midnightCafeController.addReply);

export default router;
