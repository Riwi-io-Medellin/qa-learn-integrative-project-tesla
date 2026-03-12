import { Router } from 'express';
import { authRoutes } from '../../modules/auth/auth.routes.js';
import { coursesRoutes } from '../../modules/courses/courses.routes.js';
import { modulesRoutes } from '../../modules/course-modules/modules.routes.js';
import { executionsRoutes } from '../../modules/executions/executions.routes.js';
import { evidencesRoutes } from '../../modules/evidences/evidences.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courses', coursesRoutes);
router.use('/courses/:id_course/modules', modulesRoutes);
router.use('/executions', executionsRoutes)
router.use('/executions/:id_execution/evidences', evidencesRoutes);

export default router;