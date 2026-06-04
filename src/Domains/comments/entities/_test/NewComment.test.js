import { describe, it, expect } from 'vitest';
import NewComment from '../NewComment.js';

describe('NewComment entity', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new NewComment({ content: 'abc', threadId: 'thread-1' }))
      .toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload wrong data type', () => {
    expect(() => new NewComment({ content: 123, threadId: 'thread-1', owner: 'user-1' }))
      .toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewComment correctly', () => {
    const comment = new NewComment({ content: 'isi', threadId: 'thread-1', owner: 'user-1' });
    expect(comment.content).toBe('isi');
    expect(comment.threadId).toBe('thread-1');
    expect(comment.owner).toBe('user-1');
  });
});
