import { describe, it, expect, vi } from 'vitest';
import AddCommentUseCase from '../AddCommentUseCase.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('AddCommentUseCase', () => {
  it('should orchestrate add comment correctly', async () => {
    const payload = { content: 'isi komentar', threadId: 'thread-1', owner: 'user-1' };

    const mockReturn = new AddedComment({ id: 'comment-123', content: 'isi komentar', owner: 'user-1' });
    const expectedResult = new AddedComment({ id: 'comment-123', content: 'isi komentar', owner: 'user-1' });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadExists = vi.fn().mockResolvedValue(undefined);
    mockCommentRepository.addComment = vi.fn().mockResolvedValue(mockReturn);

    const useCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });
    const result = await useCase.execute(payload);

    expect(result).toStrictEqual(expectedResult);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith('thread-1');
    expect(mockCommentRepository.addComment).toBeCalledWith(
      expect.objectContaining({ content: 'isi komentar', threadId: 'thread-1', owner: 'user-1' })
    );
  });
});