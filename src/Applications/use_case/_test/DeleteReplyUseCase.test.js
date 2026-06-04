import { describe, it, expect, vi } from 'vitest';
import DeleteReplyUseCase from '../DeleteReplyUseCase.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('DeleteReplyUseCase', () => {
  it('should orchestrate delete reply correctly', async () => {
    const payload = { threadId: 'thread-1', commentId: 'comment-1', replyId: 'reply-1', owner: 'user-1' };

    const mockReplyRepo = new ReplyRepository();
    const mockCommentRepo = new CommentRepository();
    const mockThreadRepo = new ThreadRepository();
    mockThreadRepo.verifyThreadExists = vi.fn().mockResolvedValue(undefined);
    mockCommentRepo.verifyCommentExists = vi.fn().mockResolvedValue(undefined);
    mockReplyRepo.verifyReplyExists = vi.fn().mockResolvedValue(undefined);
    mockReplyRepo.verifyReplyOwner = vi.fn().mockResolvedValue(undefined);
    mockReplyRepo.deleteReply = vi.fn().mockResolvedValue(undefined);

    const useCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepo,
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });
    await useCase.execute(payload);

    expect(mockThreadRepo.verifyThreadExists).toBeCalledWith('thread-1');
    expect(mockCommentRepo.verifyCommentExists).toBeCalledWith('comment-1');
    expect(mockReplyRepo.verifyReplyExists).toBeCalledWith('reply-1');
    expect(mockReplyRepo.verifyReplyOwner).toBeCalledWith('reply-1', 'user-1');
    expect(mockReplyRepo.deleteReply).toBeCalledWith('reply-1');
  });
});
