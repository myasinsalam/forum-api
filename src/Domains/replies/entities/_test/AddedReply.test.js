import { describe, it, expect } from 'vitest';
import AddedReply from '../AddedReply.js';

describe('AddedReply entity', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new AddedReply({ id: 'reply-1', content: 'balasan' }))
      .toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload wrong data type', () => {
    expect(() => new AddedReply({ id: 123, content: 'balasan', owner: 'user-1' }))
      .toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedReply correctly', () => {
    const reply = new AddedReply({ id: 'reply-1', content: 'balasan', owner: 'user-1' });
    expect(reply.id).toBe('reply-1');
    expect(reply.content).toBe('balasan');
    expect(reply.owner).toBe('user-1');
  });
});
