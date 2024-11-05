const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UmkmsService {
  constructor() {
    this._pool = new Pool();
  }

  async addUmkm({
    name, description, subdistrict, address, year, rating, cover_url, owner,
  }) {
    const id = `umkm-${nanoid(16)}`;
    const created_at = new Date().toISOString();
    const updated_at = created_at;

    const query = {
      text: 'INSERT INTO umkms VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id',
      values: [
        id,
        name,
        description,
        subdistrict,
        address,
        year,
        rating,
        cover_url,
        owner,
        created_at,
        updated_at,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Umkm gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAllUmkms() {
    const query = {
      text: 'SELECT * FROM umkms',
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async getUmkmById(id) {
    const query = {
      text: 'SELECT * FROM umkms WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Umkm tidak ditemukan');
    }

    // const listProducts = await this._pool.query({
    //   text: 'SELECT id, name, description, price, cover_url FROM products WHERE umkm_id = $1',
    //   values: [id],
    // });

    return {
      ...result.rows[0],
      // products: listProducts.rows,
    };
  }

  async editUmkmById(id, {
    name, description, subdistrict, address, year, rating, cover_url,
  }) {
    const query = {
      text: 'UPDATE umkms SET name = $1, description = $2, subdistrict = $3, address = $4, year = $5, rating = $6, cover_url = $7 WHERE id = $8 RETURNING id',
      values: [
        name,
        description,
        subdistrict,
        address,
        year,
        rating,
        cover_url,
        id,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui umkm. Id tidak ditemukan');
    }
  }

  async deleteUmkmById(id) {
    const query = {
      text: 'DELETE FROM umkms WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Umkm gagal dihapus. Id tidak ditemukan');
    }
  }

  async updateUmkmCover(umkmId, { path }) {
    const updated_at = new Date().toISOString();
    const query = {
      text: 'UPDATE umkms SET cover_url = $1, updated_at = $2 WHERE id = $3 RETURNING id',
      values: [path, updated_at, umkmId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui cover umkm. Id tidak ditemukan');
    }

    return result.rows[0].id;
  }
}

module.exports = UmkmsService;
