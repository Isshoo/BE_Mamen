const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UmkmsService {
  constructor() {
    this._pool = new Pool();
  }

  async addUmkm({
    name, description, subdistrict, address, year, rating, coverUrl, credentialId,
  }) {
    const id = `umkm-${nanoid(16)}`;
    const created_at = new Date().toISOString();
    const updated_at = created_at;

    const query = {
      text: 'INSERT INTO umkms VALUES($1, $2, $3, $4, $5, $6, ) RETURNING id',
      values: [
        id,
        name,
        description,
        subdistrict,
        address,
        year,
        rating,
        coverUrl,
        credentialId,
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

  async getUmkmById(id) {
    const query = {
      text: 'SELECT * FROM umkms WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Umkm tidak ditemukan');
    }

    const listSongs = await this._pool.query({
      text: 'SELECT id, title, performer FROM songs WHERE umkm_id = $1',
      values: [id],
    });

    return {
      ...result.rows[0],
      songs: listSongs.rows,
    };
  }

  async editUmkmById(id, {
    name, year,
  }) {
    const query = {
      text: 'UPDATE umkms SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
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
}

module.exports = UmkmsService;
