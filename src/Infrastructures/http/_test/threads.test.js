import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import supertest from 'supertest';
import createServer from '../createServer.js';
import container from '../../container.js';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';

describe('Threads & Comments & Replies Endpoints', () => {
  let app;
  let accessToken;
  let userId;

beforeAll(async () => {
    app = await createServer(container);

    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();

    // Register and login user
    await supertest(app).post('/users').send({ username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia' });
    const loginRes = await supertest(app).post('/authentications').send({ username: 'dicoding', password: 'secret_password' });
    accessToken = loginRes.body.data.accessToken;

    // Get user id
    const userRes = await pool.query("SELECT id FROM users WHERE username = 'dicoding'");
    userId = userRes.rows[0].id;
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.query('DELETE FROM authentications WHERE 1=1');
  });

  // ── THREADS ──────────────────────────────────────────────────────────────────
  describe('POST /threads', () => {
    it('should respond 201 and return addedThread', async () => {
      const res = await supertest(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi thread' });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.addedThread).toHaveProperty('id');
      expect(res.body.data.addedThread.title).toBe('sebuah thread');
    });

    it('should respond 400 when missing payload', async () => {
      const res = await supertest(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'judul' });

      expect(res.status).toBe(400);
    });

    it('should respond 401 when no token', async () => {
      const res = await supertest(app)
        .post('/threads')
        .send({ title: 'judul', body: 'isi' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /threads/:threadId', () => {
    it('should respond 200 and return thread detail with comments and replies', async () => {
      // Arrange: create thread, comment, reply via DB helpers
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: userId });

      const res = await supertest(app).get('/threads/thread-123');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.thread.id).toBe('thread-123');
      expect(res.body.data.thread.comments).toHaveLength(1);
      expect(res.body.data.thread.comments[0].replies).toHaveLength(1);
    });

    it('should show **komentar telah dihapus** for deleted comments', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId, isDelete: true });

      const res = await supertest(app).get('/threads/thread-123');

      expect(res.status).toBe(200);
      expect(res.body.data.thread.comments[0].content).toBe('**komentar telah dihapus**');
    });

    it('should respond 404 when thread not found', async () => {
      const res = await supertest(app).get('/threads/thread-xxx');
      expect(res.status).toBe(404);
    });
  });

  // ── COMMENTS ─────────────────────────────────────────────────────────────────
  describe('POST /threads/:threadId/comments', () => {
    it('should respond 201 and return addedComment', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });

      const res = await supertest(app)
        .post('/threads/thread-123/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });

      expect(res.status).toBe(201);
      expect(res.body.data.addedComment).toHaveProperty('id');
      expect(res.body.data.addedComment.content).toBe('sebuah komentar');
    });

    it('should respond 404 when thread not found', async () => {
      const res = await supertest(app)
        .post('/threads/thread-xxx/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'komentar' });

      expect(res.status).toBe(404);
    });

    it('should respond 400 when missing content', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });

      const res = await supertest(app)
        .post('/threads/thread-123/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should respond 401 when no token', async () => {
      const res = await supertest(app)
        .post('/threads/thread-123/comments')
        .send({ content: 'komentar' });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /threads/:threadId/comments/:commentId', () => {
    it('should respond 200 when successfully deleted', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });

      const res = await supertest(app)
        .delete('/threads/thread-123/comments/comment-123')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });

    it('should respond 403 when not owner', async () => {
      // Create another user
      await supertest(app).post('/users').send({ username: 'johndoe', password: 'secret', fullname: 'John Doe' });
      const loginRes = await supertest(app).post('/authentications').send({ username: 'johndoe', password: 'secret' });
      const otherToken = loginRes.body.data.accessToken;

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });

      const res = await supertest(app)
        .delete('/threads/thread-123/comments/comment-123')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);

      // cleanup extra user
      await pool.query("DELETE FROM users WHERE username = 'johndoe'");
    });

    it('should respond 404 when comment not found', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });

      const res = await supertest(app)
        .delete('/threads/thread-123/comments/comment-xxx')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ── REPLIES ───────────────────────────────────────────────────────────────────
  describe('POST /threads/:threadId/comments/:commentId/replies', () => {
    it('should respond 201 and return addedReply', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });

      const res = await supertest(app)
        .post('/threads/thread-123/comments/comment-123/replies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });

      expect(res.status).toBe(201);
      expect(res.body.data.addedReply).toHaveProperty('id');
      expect(res.body.data.addedReply.content).toBe('sebuah balasan');
    });

    it('should respond 404 when thread not found', async () => {
      const res = await supertest(app)
        .post('/threads/thread-xxx/comments/comment-123/replies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'balasan' });

      expect(res.status).toBe(404);
    });

    it('should respond 404 when comment not found', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });

      const res = await supertest(app)
        .post('/threads/thread-123/comments/comment-xxx/replies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'balasan' });

      expect(res.status).toBe(404);
    });

    it('should respond 400 when missing content', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });

      const res = await supertest(app)
        .post('/threads/thread-123/comments/comment-123/replies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /threads/:threadId/comments/:commentId/replies/:replyId', () => {
    it('should respond 200 when successfully deleted', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: userId });

      const res = await supertest(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });

    it('should respond 403 when not owner', async () => {
      await supertest(app).post('/users').send({ username: 'johndoe2', password: 'secret', fullname: 'John Doe' });
      const loginRes = await supertest(app).post('/authentications').send({ username: 'johndoe2', password: 'secret' });
      const otherToken = loginRes.body.data.accessToken;

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: userId });

      const res = await supertest(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);

      await pool.query("DELETE FROM users WHERE username = 'johndoe2'");
    });

    it('should respond 404 when reply not found', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });

      const res = await supertest(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-xxx')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });
  });
});
