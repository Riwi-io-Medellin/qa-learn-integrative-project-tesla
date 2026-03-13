import { Router } from 'express';
import { authRoutes } from '../../modules/auth/auth.routes.js';
import { usersRoutes } from '../../modules/users/users.routes.js';
import { coursesRoutes } from '../../modules/courses/courses.routes.js';
import { modulesRoutes } from '../../modules/course-modules/modules.routes.js';
import { executionsRoutes } from '../../modules/executions/executions.routes.js';
import { evidencesRoutes } from '../../modules/evidences/evidences.routes.js';
import { libraryRoutes } from '../../modules/library/library.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/courses', coursesRoutes);
router.use('/courses/:id_course/modules', modulesRoutes);
router.use('/executions', executionsRoutes)
router.use('/executions/:id_execution/evidences', evidencesRoutes);
router.use('/library', libraryRoutes);

export default router;