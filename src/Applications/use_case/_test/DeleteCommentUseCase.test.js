import { describe, it, expect, vi } from 'vitest';
import DeleteCommentUseCase from '../DeleteCommentUseCase.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('DeleteCommentUseCase', () => {
  it('should orchestrate delete comment correctly', async () => {
    const payload = { threadId: 'thread-1', commentId: 'comment-1', owner: 'user-1' };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadExists = vi.fn().mockResolvedValue(undefined);
    mockCommentRepository.verifyCommentExists = vi.fn().mockResolvedValue(undefined);
    mockCommentRepository.verifyCommentOwner = vi.fn().mockResolvedValue(undefined);
    mockCommentRepository.deleteComment = vi.fn().mockResolvedValue(undefined);

    const useCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });
    await useCase.execute(payload);

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith('thread-1');
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith('comment-1');
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith('comment-1', 'user-1');
    expect(mockCommentRepository.deleteComment).toBeCalledWith('comment-1');
  });
});
