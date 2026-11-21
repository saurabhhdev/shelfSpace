import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { connectDB, disconnectDB } from '../config/db';
import { db } from '../db';
import { users, resources, projects, collections, sessions } from '../db/schema';
import { ilike, eq } from 'drizzle-orm';
import { validateSafeUrl, isPrivateIP } from '../utils/ssrf';
import { normalizeUrl } from '../modules/resources/metadata.service';
import { ClassificationService } from '../modules/resources/classification.service';

async function cleanupTestData() {
  await db.delete(users).where(ilike(users.email, '%@test-shelfspace.dev'));
  await db.delete(resources).where(ilike(resources.title, 'TEST_%'));
  await db.delete(projects).where(ilike(projects.name, 'TEST_%'));
  await db.delete(collections).where(ilike(collections.name, 'TEST_%'));
}

describe('Shelfspace Backend Core Integration Tests', { timeout: 30000 }, () => {
  beforeAll(async () => {
    await connectDB();
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await disconnectDB();
  });

  it('Health Check returns status healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  describe('SSRF Protection & URL Normalization', () => {
    it('blocks localhost, loopback, and private IPv4 addresses', () => {
      expect(isPrivateIP('127.0.0.1')).toBe(true);
      expect(isPrivateIP('10.0.0.1')).toBe(true);
      expect(isPrivateIP('192.168.1.1')).toBe(true);
      expect(isPrivateIP('172.16.0.1')).toBe(true);
      expect(isPrivateIP('169.254.169.254')).toBe(true);
      expect(isPrivateIP('8.8.8.8')).toBe(false);
      expect(isPrivateIP('1.1.1.1')).toBe(false);
    });

    it('rejects SSRF on private URLs', async () => {
      const check = await validateSafeUrl('http://127.0.0.1:8080/admin');
      expect(check.safe).toBe(false);

      const checkLocal = await validateSafeUrl('http://localhost:5000/api/health');
      expect(checkLocal.safe).toBe(false);
    });

    it('normalizes URLs and strips tracking parameters', () => {
      const raw = 'https://Example.COM/page/?utm_source=twitter&utm_medium=social&ref=producthunt#hash';
      const normalized = normalizeUrl(raw);
      expect(normalized).toBe('https://example.com/page');
    });
  });

  describe('Authentication & Session Flow', () => {
    const testUser = {
      name: 'Test Developer',
      email: `dev-${Date.now()}@test-shelfspace.dev`,
      password: 'Password123!',
    };

    let authCookie: string;
    let userId: string;

    it('registers a new user and sets HTTP-only cookies', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      userId = res.body.data.user._id;

      const rawCookies = res.headers['set-cookie'];
      const cookies: string[] = Array.isArray(rawCookies) ? rawCookies : [rawCookies].filter(Boolean) as string[];
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.includes('access_token='))).toBe(true);
      expect(cookies.some((c: string) => c.includes('refresh_token='))).toBe(true);
      authCookie = cookies.join('; ');
    });

    it('fetches current user profile with me endpoint', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe(testUser.name);
    });

    it('lists active sessions for user', async () => {
      const res = await request(app)
        .get('/api/auth/sessions')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.sessions.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Resources & Ownership Isolation', () => {
    let authCookieUserA: string;
    let authCookieUserB: string;

    beforeAll(async () => {
      const userA = await request(app).post('/api/auth/register').send({
        name: 'User A',
        email: `usera-${Date.now()}@test-shelfspace.dev`,
        password: 'Password123!',
      });
      const cA = userA.headers['set-cookie'];
      authCookieUserA = Array.isArray(cA) ? cA.join('; ') : String(cA || '');

      const userB = await request(app).post('/api/auth/register').send({
        name: 'User B',
        email: `userb-${Date.now()}@test-shelfspace.dev`,
        password: 'Password123!',
      });
      const cB = userB.headers['set-cookie'];
      authCookieUserB = Array.isArray(cB) ? cB.join('; ') : String(cB || '');
    });

    it('creates a resource and enforces per-user duplicate detection', async () => {
      const res1 = await request(app)
        .post('/api/resources')
        .set('Cookie', authCookieUserA)
        .send({
          type: 'development',
          title: 'TEST_Resource_1',
          url: 'https://github.com/facebook/react',
          tags: ['react', 'ui'],
        });

      expect(res1.status).toBe(201);
      expect(res1.body.data.title).toBe('TEST_Resource_1');

      // Duplicate URL attempt by User A should be rejected with 409
      const resDuplicate = await request(app)
        .post('/api/resources')
        .set('Cookie', authCookieUserA)
        .send({
          type: 'development',
          title: 'TEST_Resource_Duplicate',
          url: 'https://github.com/facebook/react?utm_source=test',
        });

      expect(resDuplicate.status).toBe(409);

      // But User B is allowed to save the same URL (ownership isolation)
      const resUserB = await request(app)
        .post('/api/resources')
        .set('Cookie', authCookieUserB)
        .send({
          type: 'development',
          title: 'TEST_UserB_React',
          url: 'https://github.com/facebook/react',
        });

      expect(resUserB.status).toBe(201);
    });

    it('enforces that User B cannot access or modify User A resource', async () => {
      const resCreate = await request(app)
        .post('/api/resources')
        .set('Cookie', authCookieUserA)
        .send({
          type: 'design',
          title: 'TEST_Private_Design',
          description: 'Top secret design inspiration',
        });

      const resourceId = resCreate.body.data._id;

      // User B tries to get it -> 404
      const resGet = await request(app)
        .get(`/api/resources/${resourceId}`)
        .set('Cookie', authCookieUserB);

      expect(resGet.status).toBe(404);

      // User B tries to delete it -> 400 or 404
      const resDelete = await request(app)
        .delete(`/api/resources/${resourceId}`)
        .set('Cookie', authCookieUserB);

      expect(resDelete.status).toBe(400);
    });

    it('supports trashing and restoring resources', async () => {
      const resCreate = await request(app)
        .post('/api/resources')
        .set('Cookie', authCookieUserA)
        .send({
          type: 'learning',
          title: 'TEST_Trash_Flow',
        });

      const id = resCreate.body.data._id;

      // Trash it
      const resTrash = await request(app)
        .delete(`/api/resources/${id}`)
        .set('Cookie', authCookieUserA);
      expect(resTrash.status).toBe(200);
      expect(resTrash.body.data.status).toBe('trashed');

      // Check it appears in /api/resources/trash
      const resListTrash = await request(app)
        .get('/api/resources/trash')
        .set('Cookie', authCookieUserA);
      expect(resListTrash.body.data.some((r: any) => r._id === id)).toBe(true);

      // Restore it
      const resRestore = await request(app)
        .patch(`/api/resources/${id}/restore`)
        .set('Cookie', authCookieUserA);
      expect(resRestore.status).toBe(200);
      expect(resRestore.body.data.status).toBe('active');
    });

    it('project deletion retains associated resources', async () => {
      // 1. Create a project
      const projRes = await request(app)
        .post('/api/projects')
        .set('Cookie', authCookieUserA)
        .send({
          name: 'TEST_Retention_Project',
          description: 'Testing project deletion retention',
        });
      const projectId = projRes.body.data._id;

      // 2. Create resource associated with project
      const resCreate = await request(app)
        .post('/api/resources')
        .set('Cookie', authCookieUserA)
        .send({
          type: 'ui',
          title: 'TEST_Associated_UI',
          projectIds: [projectId],
        });
      const resourceId = resCreate.body.data._id;
      expect(resCreate.body.data.projectIds).toContain(projectId);

      // 3. Delete the project
      const deleteProj = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Cookie', authCookieUserA);
      expect(deleteProj.status).toBe(200);

      // 4. Verify resource still exists and projectId was safely pulled
      const checkResource = await request(app)
        .get(`/api/resources/${resourceId}`)
        .set('Cookie', authCookieUserA);
      expect(checkResource.status).toBe(200);
      expect(checkResource.body.data.projectIds.length).toBe(0);
    });

    it('supports archiving, adding existing resources, and removing resources from a project', async () => {
      // 1. Create a project
      const projRes = await request(app)
        .post('/api/projects')
        .set('Cookie', authCookieUserA)
        .send({
          name: 'TEST_Workflow_Project',
          description: 'Testing add/remove/archive endpoints',
        });
      expect(projRes.status).toBe(201);
      const projectId = projRes.body.data._id;
      expect(projRes.body.data.isArchived).toBe(false);

      // 2. Create standalone global resource
      const resCreate = await request(app)
        .post('/api/resources')
        .set('Cookie', authCookieUserA)
        .send({
          type: 'tools',
          title: 'TEST_Standalone_Tool',
          url: 'https://example-test-tool.com',
        });
      expect(resCreate.status).toBe(201);
      const resourceId = resCreate.body.data._id;

      // 3. Add existing resource to project
      const addRes = await request(app)
        .post(`/api/projects/${projectId}/resources`)
        .set('Cookie', authCookieUserA)
        .send({
          resourceIds: [resourceId],
        });
      expect(addRes.status).toBe(200);

      // 4. Verify resource is now in project
      const projectDetails = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Cookie', authCookieUserA);
      expect(projectDetails.status).toBe(200);
      expect(projectDetails.body.data.resourceCount).toBe(1);
      expect(projectDetails.body.data.resources[0]._id).toBe(resourceId);

      // 5. Toggle archive
      const archiveRes = await request(app)
        .patch(`/api/projects/${projectId}/archive`)
        .set('Cookie', authCookieUserA);
      expect(archiveRes.status).toBe(200);
      expect(archiveRes.body.data.isArchived).toBe(true);

      // 6. Remove resource from project without deleting original resource
      const removeRes = await request(app)
        .delete(`/api/projects/${projectId}/resources/${resourceId}`)
        .set('Cookie', authCookieUserA);
      expect(removeRes.status).toBe(200);

      // 7. Verify project has 0 resources now
      const projCheck = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Cookie', authCookieUserA);
      expect(projCheck.body.data.resourceCount).toBe(0);

      // 8. Verify the resource itself still exists in library
      const globalResourceCheck = await request(app)
        .get(`/api/resources/${resourceId}`)
        .set('Cookie', authCookieUserA);
      expect(globalResourceCheck.status).toBe(200);
      expect(globalResourceCheck.body.data.title).toBe('TEST_Standalone_Tool');
    });

    it('supports profile update and password change', async () => {
      // 1. Update display name
      const resName = await request(app)
        .patch('/api/auth/me')
        .set('Cookie', authCookieUserA)
        .send({ name: 'User A Updated' });
      expect(resName.status).toBe(200);
      expect(resName.body.data.user.name).toBe('User A Updated');

      // 2. Reject password change if current password is wrong
      const resWrongPass = await request(app)
        .patch('/api/auth/me')
        .set('Cookie', authCookieUserA)
        .send({ currentPassword: 'WrongPassword!', newPassword: 'NewPassword123!' });
      expect(resWrongPass.status).toBe(400);

      // 3. Update password successfully
      const resPass = await request(app)
        .patch('/api/auth/me')
        .set('Cookie', authCookieUserA)
        .send({ currentPassword: 'Password123!', newPassword: 'NewPassword123!' });
      expect(resPass.status).toBe(200);
    });

    it('enforces unique category names and retains resources on category deletion', async () => {
      // 1. Create a category
      const catRes = await request(app)
        .post('/api/categories')
        .set('Cookie', authCookieUserA)
        .send({
          name: 'TEST_Category_Original',
          color: '#09AE5B',
        });
      expect(catRes.status).toBe(201);
      const catId = catRes.body.data._id;

      // 2. Attempt duplicate category name (case-insensitive) -> should reject with 409
      const dupRes = await request(app)
        .post('/api/categories')
        .set('Cookie', authCookieUserA)
        .send({
          name: 'test_category_original',
        });
      expect(dupRes.status).toBe(409);

      // 3. Create resource associated with category
      const resCreate = await request(app)
        .post('/api/resources')
        .set('Cookie', authCookieUserA)
        .send({
          type: 'tools',
          title: 'TEST_Categorized_Resource',
          collectionIds: [catId],
        });
      expect(resCreate.status).toBe(201);
      const resourceId = resCreate.body.data._id;

      // 4. Delete the category
      const deleteCat = await request(app)
        .delete(`/api/categories/${catId}`)
        .set('Cookie', authCookieUserA);
      expect(deleteCat.status).toBe(200);

      // 5. Verify the resource still exists in library with collectionIds cleared
      const checkRes = await request(app)
        .get(`/api/resources/${resourceId}`)
        .set('Cookie', authCookieUserA);
      expect(checkRes.status).toBe(200);
      expect(checkRes.body.data.collectionIds.length).toBe(0);
    });

    it('returns aggregated stats and supports searching across categories', async () => {
      // 1. Create a category for search test
      const catSearch = await request(app)
        .post('/api/categories')
        .set('Cookie', authCookieUserA)
        .send({
          name: 'TEST_DevOps_Special',
          color: '#3b82f6',
        });
      const catId = catSearch.body.data._id;

      // 2. Create resource in this category
      const resCreate = await request(app)
        .post('/api/resources')
        .set('Cookie', authCookieUserA)
        .send({
          type: 'tools',
          title: 'TEST_Unrelated_Title_Tool',
          description: 'A tool for continuous integration',
          collectionIds: [catId],
        });
      const resourceId = resCreate.body.data._id;

      // 3. Search resources using category keyword "DevOps_Special"
      const searchRes = await request(app)
        .get('/api/resources')
        .set('Cookie', authCookieUserA)
        .query({ search: 'DevOps_Special' });
      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.some((r: any) => r._id === resourceId)).toBe(true);

      // 4. Retrieve resource stats
      const statsRes = await request(app)
        .get('/api/resources/stats')
        .set('Cookie', authCookieUserA);
      expect(statsRes.status).toBe(200);
      expect(statsRes.body.data.total).toBeGreaterThanOrEqual(1);
      expect(statsRes.body.data.byType).toBeDefined();
      expect(statsRes.body.data.byType.tools).toBeGreaterThanOrEqual(1);
    });

    it('classifies resources into the 6 types and generates relevant auto tags', () => {
      // Test 1: Component library with user category matching
      const userCategories = [
        { _id: 'cat-1', name: 'UI & Components' },
        { _id: 'cat-2', name: 'Backend Tools' },
      ];
      const parsedComp = new URL('https://ui.shadcn.com/docs/components/button');
      const compResult = ClassificationService.classify(
        'https://ui.shadcn.com/docs/components/button',
        parsedComp,
        'Shadcn UI - Accessible and customizable components',
        'Radix UI and Tailwind CSS components for React apps',
        ['react', 'components', 'tailwind', 'ui'],
        null,
        { userCategories, userExistingTags: ['react', 'ui'] }
      );

      expect(compResult.type).toBe('components');
      expect(compResult.typeConfidence).toBe('high');
      expect(compResult.suggestedTags).toContain('components');
      expect(compResult.suggestedTags).toContain('ui');
      expect(compResult.suggestedCategory?.isExisting).toBe(true);
      expect(compResult.suggestedCategory?.categoryId).toBe('cat-1');

      // Test 2: Documentation / Reference
      const parsedDocs = new URL('https://developer.mozilla.org/en-US/docs/Web/JavaScript');
      const docsResult = ClassificationService.classify(
        'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        parsedDocs,
        'JavaScript Reference - MDN Web Docs',
        'Standard JavaScript language documentation and guides',
        ['javascript', 'reference', 'documentation'],
        null,
        { userCategories: [] }
      );

      expect(docsResult.type).toBe('references');
      expect(docsResult.suggestedTags).toContain('docs');
      expect(docsResult.suggestedTags).toContain('javascript');
      expect(docsResult.suggestedCategory?.name).toBe('Documentation');
      expect(docsResult.suggestedCategory?.isExisting).toBe(false);

      // Test 3: Design resource
      const parsedDesign = new URL('https://www.figma.com/community/file/12345');
      const designResult = ClassificationService.classify(
        'https://www.figma.com/community/file/12345',
        parsedDesign,
        'Mobile Design System & Typography Kit',
        'Color palettes, typography scales, and UI assets',
        ['figma', 'design', 'typography'],
        null,
        { userCategories: [] }
      );

      expect(designResult.type).toBe('design');
      expect(designResult.suggestedTags).toContain('figma');
      expect(designResult.suggestedCategory?.name).toBe('Design Resources');
    });
  });

  describe('Security & Regression Bug Fixes Verification', () => {
    let authCookieUserX: string;
    let authCookieUserY: string;
    let userXProjectId: string;

    beforeAll(async () => {
      // Create User X
      const resX = await request(app).post('/api/auth/register').send({
        name: 'User X Sec',
        email: `userx-${Date.now()}@test-shelfspace.dev`,
        password: 'Password123!',
      });
      const cX = resX.headers['set-cookie'];
      authCookieUserX = Array.isArray(cX) ? cX.join('; ') : String(cX || '');

      // Create Project for User X
      const projX = await request(app)
        .post('/api/projects')
        .set('Cookie', authCookieUserX)
        .send({ name: 'TEST_UserX_Project', description: 'User X Private Project' });
      userXProjectId = projX.body.data._id;

      // Create User Y
      const resY = await request(app).post('/api/auth/register').send({
        name: 'User Y Sec',
        email: `usery-${Date.now()}@test-shelfspace.dev`,
        password: 'Password123!',
      });
      const cY = resY.headers['set-cookie'];
      authCookieUserY = Array.isArray(cY) ? cY.join('; ') : String(cY || '');
    });

    it('rejects cross-user association of project IDs during resource creation', async () => {
      const res = await request(app)
        .post('/api/resources')
        .set('Cookie', authCookieUserY)
        .send({
          type: 'tools',
          title: 'TEST_Cross_User_Resource',
          projectIds: [userXProjectId],
        });

      // Should be rejected because userXProjectId does not belong to User Y
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/belong to another user/i);
    });

    it('rejects access when session expiresAt is in the past', async () => {
      // 1. Create a dedicated session for testing expiration
      const resTemp = await request(app).post('/api/auth/register').send({
        name: 'Temp Expire User',
        email: `expire-${Date.now()}@test-shelfspace.dev`,
        password: 'Password123!',
      });
      const cTemp = resTemp.headers['set-cookie'];
      const tempCookie = Array.isArray(cTemp) ? cTemp.join('; ') : String(cTemp || '');

      // Verify it can access /api/auth/me initially
      const meBefore = await request(app).get('/api/auth/me').set('Cookie', tempCookie);
      expect(meBefore.status).toBe(200);

      // 2. Fetch the session ID from /api/auth/sessions
      const sessionsRes = await request(app).get('/api/auth/sessions').set('Cookie', tempCookie);
      const activeSessionId = sessionsRes.body.data.sessions[0]._id;

      // 3. Artificially set expiresAt in the database to 1 hour ago
      await db
        .update(sessions)
        .set({ expiresAt: new Date(Date.now() - 3600 * 1000) })
        .where(eq(sessions.id, activeSessionId));

      // 4. Request /api/auth/me again -> should fail with 401 Session expired
      const meAfter = await request(app).get('/api/auth/me').set('Cookie', tempCookie);
      expect(meAfter.status).toBe(401);
      expect(meAfter.body.success).toBe(false);
      expect(meAfter.body.message).toMatch(/expired or was revoked/i);
    });

    it('successfully executes importFromUrl without variable reference errors', async () => {
      const res = await request(app)
        .post('/api/resources/import')
        .set('Cookie', authCookieUserX)
        .send({
          url: 'https://example.com',
          projectIds: [userXProjectId],
          tags: ['test-import', 'example'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toBe('https://example.com');
      expect(res.body.data.projectIds).toContain(userXProjectId);
      expect(res.body.data.tags).toContain('test-import');
    });
  });
});
