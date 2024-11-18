const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UmkmsService {
  constructor() {
    this._pool = new Pool();
  }

  async addUmkm({
    name, description, subdistrict, address, contact, year, cover_url, owner,
  }) {
    const id = `umkm-${nanoid(16)}`;
    const created_at = new Date().toISOString();
    const updated_at = created_at;

    const ratingQuery = {
      text: 'SELECT AVG(user_rating) AS avg_rating FROM reviews WHERE umkms_id = $1',
      values: [id],
    };
    const ratingResult = await this._pool.query(ratingQuery);
    const rating = ratingResult.rows[0].avg_rating || 0;

    const query = {
      text: 'INSERT INTO umkms VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id',
      values: [
        id,
        name,
        description,
        subdistrict,
        address,
        contact,
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
      text: `
      SELECT 
          u.id, 
          u.name, 
          u.description, 
          u.subdistrict, 
          u.address, 
          u.contact, 
          u.year, 
          ROUND(COALESCE(AVG(r.user_rating), 0), 2) AS rating, 
          u.cover_url, 
          u.owner,
          ARRAY_AGG(DISTINCT c.name) AS categories 
      FROM 
          umkms u
      LEFT JOIN 
          reviews r ON u.id = r.umkms_id 
      LEFT JOIN 
          categories c ON u.id = c.umkms_id 
      GROUP BY 
          u.id, u.name, u.description, u.subdistrict, u.address, u.contact, u.year, u.cover_url
      `,
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async getUmkmById(id) {
    const query = {
      text: `
      SELECT 
        u.name, 
        u.description, 
        u.subdistrict, 
        u.address,
        u.contact,  
        u.year, 
        ROUND(COALESCE(AVG(r.user_rating), 0), 2) AS rating,  
        u.cover_url, 
        u.owner 
      FROM 
          umkms u 
      LEFT JOIN 
          reviews r ON u.id = r.umkms_id 
      WHERE 
          u.id = $1 
      GROUP BY 
      u.id, u.name, u.description, u.subdistrict, u.address, u.contact, u.year, u.cover_url
      `,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Umkm tidak ditemukan');
    }

    const categoriesQuery = {
      text: 'SELECT name FROM categories WHERE umkms_id = $1',
      values: [id],
    };
    const listCategories = await this._pool.query(categoriesQuery);

    const productsQuery = {
      text: 'SELECT name, product_type, description, price, cover_url FROM products WHERE umkms_id = $1',
      values: [id],
    };
    const listProducts = await this._pool.query(productsQuery);

    const reviewsQuery = {
      text: 'SELECT name, review, user_rating FROM reviews WHERE umkms_id = $1',
      values: [id],
    };
    const listReviews = await this._pool.query(reviewsQuery);

    return {
      ...result.rows[0],
      categories: listCategories.rows,
      products: listProducts.rows,
      reviews: listReviews.rows,
    };
  }

  async getUmkmByUser(id) {
    const query = {
      text: 'SELECT * FROM umkms WHERE owner = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async editUmkmById(id, {
    name, description, subdistrict, address, contact, year,
  }) {
    const ratingQuery = {
      text: 'SELECT AVG(user_rating) AS avg_rating FROM reviews WHERE umkms_id = $1',
      values: [id],
    };
    const ratingResult = await this._pool.query(ratingQuery);
    const rating = ratingResult.rows[0].avg_rating || 0;

    // update umkm
    const updated_at = new Date().toISOString();
    const query = {
      text: 'UPDATE umkms SET name = $1, description = $2, subdistrict = $3, address = $4, contact = $5, year = $6, rating = $7, updated_at = $8 WHERE id = $9 RETURNING id',
      values: [
        name,
        description,
        subdistrict,
        address,
        contact,
        year,
        rating,
        updated_at,
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

  async verifyUmkmOwner(umkm_id, owner) {
    const query = {
      text: 'SELECT id FROM umkms WHERE id = $1 AND owner = $2',
      values: [umkm_id, owner],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Id Umkm atau owner salah');
    }

    return result.rows[0].id;
  }

  // search

  async searchUmkms(searchQuery) {
    const query = {
      text: `
      SELECT 
          u.id, 
          u.name, 
          u.description, 
          u.subdistrict, 
          u.address,
          u.contact,  
          u.year, 
          u.rating, 
          u.cover_url,
          ARRAY_AGG(c.name) AS categories
      FROM 
          umkms u
      LEFT JOIN 
          categories c ON u.id = c.umkms_id
      WHERE 
          LOWER(u.name) LIKE $1
          OR LOWER(u.description) LIKE $1
          OR LOWER(u.subdistrict) LIKE $1
          OR LOWER(u.address) LIKE $1
          OR LOWER(u.contact) LIKE $1 
          OR CAST(u.year AS TEXT) LIKE $1
          OR LOWER(c.name) LIKE $1
      GROUP BY 
          u.id
      `,
      values: [`%${searchQuery.toLowerCase()}%`],
    };

    const result = await this._pool.query(query);
    return result.rows.map((row) => ({ ...row }));
  }

  async searchCategories(searchQuery) {
    const query = {
      text: `
      SELECT 
          c.name, 
          ARRAY_AGG(u.name) AS umkms
      FROM 
          categories c
      JOIN 
          umkms u ON c.umkms_id = u.id
      WHERE 
          LOWER(c.name) LIKE $1
      GROUP BY 
          c.id
      `,
      values: [`%${searchQuery.toLowerCase()}%`],
    };

    const result = await this._pool.query(query);
    return result.rows.map((row) => ({ ...row }));
  }

  async searchProducts(searchQuery) {
    const query = {
      text: `
      SELECT 
          p.name, 
          p.product_type, 
          p.description, 
          p.price, 
          p.cover_url, 
          u.name AS umkm 
      FROM 
          products p
      JOIN
          umkms u ON p.umkms_id = u.id
      WHERE 
          LOWER(p.name) LIKE $1
          OR LOWER(p.product_type) LIKE $1
          OR LOWER(p.description) LIKE $1
      `,
      values: [`%${searchQuery.toLowerCase()}%`],
    };

    const result = await this._pool.query(query);
    return result.rows.map((row) => ({ ...row }));
  }

  async searchAll(searchQuery) {
    // Panggil fungsi pencarian untuk setiap tabel
    const umkmsResults = await this.searchUmkms(searchQuery);
    const categoriesResults = await this.searchCategories(searchQuery);
    const productsResults = await this.searchProducts(searchQuery);

    // Gabungkan hasil pencarian dalam objek terstruktur
    return {
      umkms: umkmsResults,
      categories: categoriesResults,
      products: productsResults,
    };
  }
}

module.exports = UmkmsService;
