import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/prisma.js';

describe('ExamReady API & Database Test Suite', () => {
  let createdExamId;
  let createdTaskId;
  const testSubject = 'Test Automated Exam ' + Date.now();
  const futureExamDate = new Date();
  futureExamDate.setDate(futureExamDate.getDate() + 10);
  const futureExamDateIso = futureExamDate.toISOString();

  afterAll(async () => {
    // Clean up test records
    if (createdExamId) {
      await prisma.exam.deleteMany({ where: { id: createdExamId } });
    }
    await prisma.$disconnect();
  });

  describe('Health Check API', () => {
    it('GET /api/health should return status healthy', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('Exam Management CRUD & Validation', () => {
    it('POST /api/exams - should reject empty subject', async () => {
      const res = await request(app)
        .post('/api/exams')
        .send({ subject: '', examDate: futureExamDateIso });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Validation failed');
    });

    it('POST /api/exams - should reject past exam date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      const res = await request(app)
        .post('/api/exams')
        .send({ subject: 'Past Exam', examDate: pastDate.toISOString() });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toContain('Exam date must not be in the past');
    });

    it('POST /api/exams - should create a valid new exam', async () => {
      const res = await request(app)
        .post('/api/exams')
        .send({ subject: testSubject, examDate: futureExamDateIso });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subject).toBe(testSubject);
      expect(res.body.data.progress).toBe(0);
      createdExamId = res.body.data.id;
    });

    it('POST /api/exams - should prevent duplicate exam (subject + examDate)', async () => {
      const res = await request(app)
        .post('/api/exams')
        .send({ subject: testSubject, examDate: futureExamDateIso });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('GET /api/exams - should list all exams with task counts and progress', async () => {
      const res = await request(app).get('/api/exams');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((e) => e.id === createdExamId);
      expect(found).toBeDefined();
      expect(found.totalTasks).toBe(0);
      expect(found.progress).toBe(0);
    });

    it('GET /api/exams/:id - should get single exam details', async () => {
      const res = await request(app).get(`/api/exams/${createdExamId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdExamId);
      expect(res.body.data.subject).toBe(testSubject);
    });

    it('GET /api/exams/:id - should return 404 for nonexistent exam', async () => {
      const res = await request(app).get('/api/exams/999999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('PUT /api/exams/:id - should update an exam', async () => {
      const updatedSubject = testSubject + ' Updated';
      const res = await request(app)
        .put(`/api/exams/${createdExamId}`)
        .send({ subject: updatedSubject });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subject).toBe(updatedSubject);
    });
  });

  describe('Study Task CRUD & Validation', () => {
    it('POST /api/exams/:id/tasks - should reject task duration under 15 minutes', async () => {
      const planned = new Date();
      planned.setDate(planned.getDate() + 2);
      const res = await request(app)
        .post(`/api/exams/${createdExamId}/tasks`)
        .send({
          title: 'Too short task',
          plannedDate: planned.toISOString(),
          minutes: 10,
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toContain('Study duration must be between 15 and 480 minutes');
    });

    it('POST /api/exams/:id/tasks - should reject task duration over 480 minutes', async () => {
      const planned = new Date();
      planned.setDate(planned.getDate() + 2);
      const res = await request(app)
        .post(`/api/exams/${createdExamId}/tasks`)
        .send({
          title: 'Too long task',
          plannedDate: planned.toISOString(),
          minutes: 500,
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/exams/:id/tasks - should reject plannedDate after examDate', async () => {
      const afterExamDate = new Date(futureExamDate);
      afterExamDate.setDate(afterExamDate.getDate() + 5);
      const res = await request(app)
        .post(`/api/exams/${createdExamId}/tasks`)
        .send({
          title: 'Late task',
          plannedDate: afterExamDate.toISOString(),
          minutes: 60,
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toContain('Planned task date cannot be after its exam date');
    });

    it('POST /api/exams/:id/tasks - should create a valid study task', async () => {
      const validPlannedDate = new Date();
      validPlannedDate.setDate(validPlannedDate.getDate() + 1);
      const res = await request(app)
        .post(`/api/exams/${createdExamId}/tasks`)
        .send({
          title: 'Test Chapter 1',
          plannedDate: validPlannedDate.toISOString(),
          minutes: 60,
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Chapter 1');
      expect(res.body.data.done).toBe(false);
      createdTaskId = res.body.data.id;
    });

    it('POST /api/exams/:id/tasks - should prevent duplicate task title within same exam', async () => {
      const validPlannedDate = new Date();
      validPlannedDate.setDate(validPlannedDate.getDate() + 1);
      const res = await request(app)
        .post(`/api/exams/${createdExamId}/tasks`)
        .send({
          title: 'Test Chapter 1',
          plannedDate: validPlannedDate.toISOString(),
          minutes: 90,
        });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists for this exam');
    });

    it('PATCH /api/tasks/:id - should mark task as completed', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${createdTaskId}`)
        .send({ done: true });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.done).toBe(true);
    });

    it('GET /api/exams/:id - should verify updated progress (100% when 1/1 completed)', async () => {
      const res = await request(app).get(`/api/exams/${createdExamId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.totalTasks).toBe(1);
      expect(res.body.data.completedTasks).toBe(1);
      expect(res.body.data.progress).toBe(100);
    });

    it('DELETE /api/tasks/:id - should delete individual study task', async () => {
      const res = await request(app).delete(`/api/tasks/${createdTaskId}`);
      expect(res.status).toBe(204);
    });
  });

  describe('PostgreSQL Cascading Delete & Database Constraints', () => {
    it('Cascading Delete - deleting exam automatically cascades to its tasks', async () => {
      // Create new exam with task
      const examDate = new Date();
      examDate.setDate(examDate.getDate() + 15);
      const examRes = await request(app)
        .post('/api/exams')
        .send({ subject: 'Cascade Test Subject ' + Date.now(), examDate: examDate.toISOString() });
      const cascadeExamId = examRes.body.data.id;

      const taskRes = await request(app)
        .post(`/api/exams/${cascadeExamId}/tasks`)
        .send({
          title: 'Task To Be Cascaded',
          plannedDate: new Date().toISOString(),
          minutes: 45,
        });
      const cascadeTaskId = taskRes.body.data.id;

      // Delete the exam
      const deleteRes = await request(app).delete(`/api/exams/${cascadeExamId}`);
      expect(deleteRes.status).toBe(204);

      // Verify task was deleted in database
      const checkTask = await prisma.studyTask.findUnique({ where: { id: cascadeTaskId } });
      expect(checkTask).toBeNull();
    });

    it('PostgreSQL CHECK constraint - direct DB query violation is rejected', async () => {
      // Bypassing express validation to test PostgreSQL native CHECK constraint
      let checkFailed = false;
      try {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "study_tasks" ("examId", "title", "plannedDate", "minutes", "done", "updatedAt") 
           VALUES (${createdExamId}, 'Bypass Test', NOW(), 10, false, NOW())`
        );
      } catch (err) {
        checkFailed = true;
        expect(err.message).toMatch(/check_study_duration|violates check constraint/i);
      }
      expect(checkFailed).toBe(true);
    });
  });

  describe('Dashboard Analytics Endpoint', () => {
    it('GET /api/dashboard - returns calculated statistics from database', async () => {
      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalExams');
      expect(res.body.data).toHaveProperty('totalTasks');
      expect(res.body.data).toHaveProperty('completedTasks');
      expect(res.body.data).toHaveProperty('overallPreparationPercentage');
      expect(res.body.data).toHaveProperty('subjectProgress');
      expect(res.body.data).toHaveProperty('todayTasks');
    });
  });
});
