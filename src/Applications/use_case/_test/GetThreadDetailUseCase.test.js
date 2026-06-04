import { describe, it, expect, vi } from 'vitest';
import GetThreadDetailUseCase from '../GetThreadDetailUseCase.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate get thread detail correctly', async () => {
    const mockThread = {
      id: 'thread-1',
      title: 'judul',
      body: 'isi',
      date: new Date('2021-08-08'),
      username: 'dicoding',
    };
    const mockComments = [
      { id: 'comment-1', username: 'johndoe', date: new Date('2021-08-08'), content: 'isi', is_delete: false },
      { id: 'comment-2', username: 'dicoding', date: new Date('2021-08-09'), content: 'deleted', is_delete: true },
    ];
    const mockReplies = [
      { id: 'reply-1', comment_id: 'comment-1', username: 'dicoding', date: new Date('2021-08-08'), content: 'balasan', is_delete: false },
      { id: 'reply-2', comment_id: 'comment-1', username: 'johndoe', date: new Date('2021-08-09'), content: 'deleted reply', is_delete: true },
    ];

    const mockThreadRepo = new ThreadRepository();
    const mockCommentRepo = new CommentRepository();
    const mockReplyRepo = new ReplyRepository();
    mockThreadRepo.getThreadById = vi.fn().mockResolvedValue(mockThread);
    mockCommentRepo.getCommentsByThreadId = vi.fn().mockResolvedValue(mockComments);
    mockReplyRepo.getRepliesByCommentIds = vi.fn().mockResolvedValue(mockReplies);

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepo,
      commentRepository: mockCommentRepo,
      replyRepository: mockReplyRepo,
    });
    const result = await useCase.execute('thread-1');

    expect(result.id).toBe('thread-1');
    expect(result.comments).toHaveLength(2);
    expect(result.comments[0].content).toBe('isi');
    expect(result.comments[1].content).toBe('**komentar telah dihapus**');
    expect(result.comments[0].replies[0].content).toBe('balasan');
    expect(result.comments[0].replies[1].content).toBe('**balasan telah dihapus**');
  });

  it('should handle empty replies correctly', async () => {
    const mockThread = { id: 'thread-1', title: 'judul', body: 'isi', date: new Date(), username: 'dicoding' };
    const mockComments = [];

    const mockThreadRepo = new ThreadRepository();
    const mockCommentRepo = new CommentRepository();
    const mockReplyRepo = new ReplyRepository();
    mockThreadRepo.getThreadById = vi.fn().mockResolvedValue(mockThread);
    mockCommentRepo.getCommentsByThreadId = vi.fn().mockResolvedValue(mockComments);
    mockReplyRepo.getRepliesByCommentIds = vi.fn().mockResolvedValue([]);

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepo,
      commentRepository: mockCommentRepo,
      replyRepository: mockReplyRepo,
    });
    const result = await useCase.execute('thread-1');

    expect(result.comments).toHaveLength(0);
    expect(mockReplyRepo.getRepliesByCommentIds).toBeCalledWith([]);
  });
});
