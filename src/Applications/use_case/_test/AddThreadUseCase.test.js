import { describe, it, expect, vi } from 'vitest';
import AddThreadUseCase from '../AddThreadUseCase.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('AddThreadUseCase', () => {
  it('should orchestrate add thread correctly', async () => {
    const payload = { title: 'judul', body: 'isi', owner: 'user-1' };

    const mockReturn = new AddedThread({ id: 'thread-123', title: 'judul', owner: 'user-1' });
    const expectedResult = new AddedThread({ id: 'thread-123', title: 'judul', owner: 'user-1' });

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = vi.fn().mockResolvedValue(mockReturn);

    const useCase = new AddThreadUseCase({ threadRepository: mockThreadRepository });
    const result = await useCase.execute(payload);

    expect(result).toStrictEqual(expectedResult);
    expect(mockThreadRepository.addThread).toBeCalledWith(
      expect.objectContaining({ title: 'judul', body: 'isi', owner: 'user-1' })
    );
  });
});