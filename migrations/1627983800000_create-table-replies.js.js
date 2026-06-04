export const up = (pgm) => {
  pgm.createTable('replies', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    comment_id: { type: 'VARCHAR(50)', notNull: true },
    owner: { type: 'VARCHAR(50)', notNull: true },
    content: { type: 'TEXT', notNull: true },
    is_delete: { type: 'BOOLEAN', notNull: true, default: false },
    date: { type: 'TIMESTAMP', notNull: true, default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('replies', 'fk_replies_comment_id', 'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE');
  pgm.addConstraint('replies', 'fk_replies_owner', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

export const down = (pgm) => {
  pgm.dropTable('replies');
};
