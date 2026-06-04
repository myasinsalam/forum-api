import { describe, it, expect, vi } from 'vitest';
import AddReplyUseCase from '../AddReplyUseCase.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('AddReplyUseCase', () => {
  it('should orchestrate add reply correctly', async () => {
    const payload = { content: 'balasan', commentId: 'comment-1', threadId: 'thread-1', owner: 'user-1' };

    const mockReturn = new AddedReply({ id: 'reply-123', content: 'balasan', owner: 'user-1' });
    const expectedResult = new AddedReply({ id: 'reply-123', content: 'balasan', owner: 'user-1' });

    const mockReplyRepo = new ReplyRepository();
    const mockCommentRepo = new CommentRepository();
    const mockThreadRepo = new ThreadRepository();
    mockThreadRepo.verifyThreadExists = vi.fn().mockResolvedValue(undefined);
    mockCommentRepo.verifyCommentExists = vi.fn().mockResolvedValue(undefined);
    mockReplyRepo.addReply = vi.fn().mockResolvedValue(mockReturn);

    const useCase = new AddReplyUseCase({
      replyRepository: mockReplyRepo,
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });
    const result = await useCase.execute(payload);

    expect(result).toStrictEqual(expectedResult);
    expect(mockThreadRepo.verifyThreadExists).toBeCalledWith('thread-1');
    expect(mockCommentRepo.verifyCommentExists).toBeCalledWith('comment-1');
    expect(mockReplyRepo.addReply).toBeCalledWith(
      expect.objectContaining({ content: 'balasan', commentId: 'comment-1', owner: 'user-1' })
    );
  });
});