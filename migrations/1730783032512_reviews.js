exports.up = (pgm) => {
  pgm.createTable('reviews', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    review: {
      type: 'TEXT',
      notNull: true,
    },
    user_rating: {
      type: 'INTEGER',
      notNull: true,
    },
    date: {
      type: 'TIMESTAMP',
      notNull: true,
    },
    user_id: {
      type: 'varchar(50)',
      references: '"users"',
      onDelete: 'CASCADE',
    },
    umkms_id: {
      type: 'varchar(50)',
      references: '"umkms"',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('reviews');
};
