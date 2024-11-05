const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class ProductsService {
  constructor() {
    this._pool = new Pool();
  }

  async addProduct({
    name, product_type, description, price, cover_url, umkms_id,
  }) {
    const id = `product-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO products VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [
        id,
        name,
        product_type,
        description,
        price,
        cover_url,
        umkms_id,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Product gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAllProducts() {
    const query = {
      text: 'SELECT * FROM products',
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async getProductsByUmkm(umkmId) {
    const query = {
      text: 'SELECT * FROM products WHERE umkms_id = $1',
      values: [umkmId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getProductById(id) {
    const query = {
      text: 'SELECT * FROM products WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Product tidak ditemukan');
    }

    return {
      ...result.rows[0],
    };
  }

  async editProductById(id, {
    name, product_type, description, price, cover_url,
  }) {
    const query = {
      text: 'UPDATE products SET name = $1, product_type = $2, description = $3, price = $4, cover_url = $5 WHERE id = $6 RETURNING id',
      values: [
        name,
        product_type,
        description,
        price,
        cover_url,
        id,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui product. Id tidak ditemukan');
    }
  }

  async deleteProductById(id) {
    const query = {
      text: 'DELETE FROM products WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Product gagal dihapus. Id tidak ditemukan');
    }
  }

  async updateProductCover(productId, { path }) {
    const updated_at = new Date().toISOString();
    const query = {
      text: 'UPDATE products SET cover_url = $1, updated_at = $2 WHERE id = $3 RETURNING id',
      values: [path, updated_at, productId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui cover product. Id tidak ditemukan');
    }

    return result.rows[0].id;
  }

  async verifyUmkmOwner(umkms_id, owner) {
    const query = {
      text: 'SELECT id FROM umkms WHERE id = $1 AND owner = $2',
      values: [umkms_id, owner],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Umkm gagal dihapus. Id Umkm atau owner salah');
    }

    return result.rows[0].id;
  }
}

module.exports = ProductsService;
