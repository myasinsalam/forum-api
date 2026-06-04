import { describe, it, expect } from 'vitest';
import NewThread from '../NewThread.js';

describe('NewThread entity', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new NewThread({ title: 'abc', body: 'abc' }))
      .toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload wrong data type', () => {
    expect(() => new NewThread({ title: 123, body: 'abc', owner: 'user-1' }))
      .toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewThread correctly', () => {
    const thread = new NewThread({ title: 'judul', body: 'isi', owner: 'user-1' });
    expect(thread.title).toBe('judul');
    expect(thread.body).toBe('isi');
    expect(thread.owner).toBe('user-1');
  });
});
