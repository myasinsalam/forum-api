import { describe, it, expect, afterEach, afterAll } from 'vitest';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';
import pool from '../../database/postgres/pool.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';
import NewComment from '../../../Domains/comments/entities/NewComment.js';

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment', () => {
    it('should persist comment and return AddedComment correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const newComment = new NewComment({ content: 'isi', threadId: 'thread-123', owner: 'user-123' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');

      const result = await repo.addComment(newComment);

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
      expect(result.id).toBe('comment-123');
      expect(result.content).toBe('isi');
      expect(result.owner).toBe('user-123');
    });
  });

  describe('verifyCommentExists', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyCommentExists('comment-xyz')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw when comment exists', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyCommentExists('comment-123')).resolves.not.toThrow();
    });
  });

  describe('verifyCommentOwner', () => {
    it('should throw AuthorizationError when owner does not match', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyCommentOwner('comment-123', 'user-lain')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw when owner matches', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrow();
    });
  });

  describe('deleteComment', () => {
    it('should set is_delete to true', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');

      await repo.deleteComment('comment-123');

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments[0].is_delete).toBe(true);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return comments ordered by date', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', threadId: 'thread-123', owner: 'user-123', date: new Date('2021-08-08') });
      await CommentsTableTestHelper.addComment({ id: 'comment-2', threadId: 'thread-123', owner: 'user-123', date: new Date('2021-08-09') });
      const repo = new CommentRepositoryPostgres(pool, () => '123');

      const result = await repo.getCommentsByThreadId('thread-123');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('comment-1');
      expect(result[0].username).toBe('dicoding');
    });
  });
});
