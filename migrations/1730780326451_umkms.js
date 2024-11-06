exports.up = (pgm) => {
  pgm.createTable('umkms', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    description: {
      type: 'TEXT',
      notNull: true,
    },
    subdistrict: {
      type: 'TEXT',
      notNull: true,
    },
    address: {
      type: 'TEXT',
      notNull: true,
    },
    contact: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
    rating: {
      type: 'DECIMAL(3, 2)',
      notNull: true,
    },
    cover_url: {
      type: 'TEXT',
    },
    owner: {
      type: 'varchar(50)',
      references: '"users"',
    },
    created_at: {
      type: 'TIMESTAMP',
    },
    updated_at: {
      type: 'TIMESTAMP',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('umkms');
};
