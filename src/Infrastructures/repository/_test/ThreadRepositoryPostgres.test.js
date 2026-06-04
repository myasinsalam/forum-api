import { describe, it, expect, afterEach, afterAll } from 'vitest';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import pool from '../../database/postgres/pool.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';
import NewThread from '../../../Domains/threads/entities/NewThread.js';

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread', () => {
    it('should persist thread and return AddedThread correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const newThread = new NewThread({ title: 'judul', body: 'isi', owner: 'user-123' });
      const repo = new ThreadRepositoryPostgres(pool, () => '123');

      const result = await repo.addThread(newThread);

      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
      expect(result.id).toBe('thread-123');
      expect(result.title).toBe('judul');
      expect(result.owner).toBe('user-123');
    });
  });

  describe('verifyThreadExists', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const repo = new ThreadRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyThreadExists('thread-xyz')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw when thread exists', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const repo = new ThreadRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyThreadExists('thread-123')).resolves.not.toThrow();
    });
  });

  describe('getThreadById', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const repo = new ThreadRepositoryPostgres(pool, () => '123');
      await expect(repo.getThreadById('thread-xyz')).rejects.toThrowError(NotFoundError);
    });

    it('should return thread detail correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const repo = new ThreadRepositoryPostgres(pool, () => '123');

      const result = await repo.getThreadById('thread-123');

      expect(result.id).toBe('thread-123');
      expect(result.username).toBe('dicoding');
    });
  });
});
