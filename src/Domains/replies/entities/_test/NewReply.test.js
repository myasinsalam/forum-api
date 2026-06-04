import { describe, it, expect } from 'vitest';
import NewReply from '../NewReply.js';

describe('NewReply entity', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new NewReply({ content: 'abc', commentId: 'comment-1' }))
      .toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload wrong data type', () => {
    expect(() => new NewReply({ content: 123, commentId: 'comment-1', owner: 'user-1' }))
      .toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewReply correctly', () => {
    const reply = new NewReply({ content: 'balasan', commentId: 'comment-1', owner: 'user-1' });
    expect(reply.content).toBe('balasan');
    expect(reply.commentId).toBe('comment-1');
    expect(reply.owner).toBe('user-1');
  });
});
