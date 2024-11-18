const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class ReviewsService {
  constructor() {
    this._pool = new Pool();
  }

  async addReview({
    name, review, user_rating, user_id, umkms_id,
  }) {
    const id = `review-${nanoid(16)}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO reviews VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [
        id,
        name,
        review,
        user_rating,
        date,
        user_id,
        umkms_id,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Review gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAllReviews() {
    const query = {
      text: `
        SELECT 
          r.id, 
          r.name, 
          r.review, 
          r.user_rating, 
          r.date, 
          r.umkms_id, 
          u.name AS umkm_name
        FROM 
          reviews r
        JOIN 
          umkms u ON r.umkms_id = u.id
      `,
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async getReviewsByUmkm(umkmId) {
    const query = {
      text: 'SELECT id, name, review, user_rating, date, user_id FROM reviews WHERE umkms_id = $1',
      values: [umkmId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getReviewById(id) {
    const query = {
      text: 'SELECT * FROM reviews WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Review tidak ditemukan');
    }

    return {
      ...result.rows[0],
    };
  }

  async deleteReviewById(id) {
    const query = {
      text: 'DELETE FROM reviews WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Review gagal dihapus. Id tidak ditemukan');
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

module.exports = ReviewsService;
