exports.up = (pgm) => {
  pgm.createTable('umkms_categories', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
      unique: true,
    },
    umkms_id: {
      type: 'varchar(50)',
      references: '"umkms"',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('umkms_categories');
};
