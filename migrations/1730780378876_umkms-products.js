exports.up = (pgm) => {
  pgm.createTable('umkms_products', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
      unique: true,
    },
    description: {
      type: 'TEXT',
      notNull: true,
    },
    price: {
      type: 'INTEGER',
      notNull: true,
    },
    cover_url: {
      type: 'TEXT',
    },
    umkms_id: {
      type: 'varchar(50)',
      references: '"umkms"',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('umkms_products');
};
