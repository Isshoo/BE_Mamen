const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CategoriesService {
  constructor() {
    this._pool = new Pool();
  }

  async addCategory({ name, umkms_id }) {
    const id = `category-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO categories VALUES($1, $2, $3) RETURNING id',
      values: [
        id,
        name,
        umkms_id,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Category gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAllCategories() {
    const query = {
      text: 'SELECT * FROM categories',
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async getCategoriesByUmkm(umkmId) {
    const query = {
      text: 'SELECT * FROM categories WHERE umkms_id = $1',
      values: [umkmId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getCategoryById(id) {
    const query = {
      text: 'SELECT * FROM categories WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Category tidak ditemukan');
    }

    return {
      ...result.rows[0],
    };
  }

  async deleteCategoryById(id) {
    const query = {
      text: 'DELETE FROM categories WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Category gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyUmkmOwner(umkms_id, owner) {
    const query = {
      text: 'SELECT id FROM umkms WHERE id = $1 AND owner = $2',
      values: [umkms_id, owner],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Id Umkm atau owner salah');
    }

    return result.rows[0].id;
  }
}

module.exports = CategoriesService;
