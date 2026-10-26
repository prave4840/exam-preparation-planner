import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';

const router = Router();

router.get('/', dashboardController.getDashboard);
router.post('/seed', dashboardController.seedDatabaseHandler);
router.get('/seed', dashboardController.seedDatabaseHandler); // Also allow GET for convenience in browser!


export default router;
