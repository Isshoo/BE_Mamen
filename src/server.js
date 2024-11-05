require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const users = require('./api/users');
const authentications = require('./api/authentications');
const _exports = require('./api/exports');
const umkms = require('./api/umkms');
const products = require('./api/products');
const categories = require('./api/categories');
const reviews = require('./api/reviews');

const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const ProducerService = require('./services/rabbitmq/ProducerService');
const StorageService = require('./services/storage/StorageService');
const UmkmsService = require('./services/postgres/UmkmsService');
const ProductsService = require('./services/postgres/ProductsService');
const CategoriesService = require('./services/postgres/CategoriesService');
const ReviewsService = require('./services/postgres/ReviewsService');

const UsersValidator = require('./validator/users');
const AuthenticationsValidator = require('./validator/authentications');
const ExportsValidator = require('./validator/exports');
const UmkmsValidator = require('./validator/umkms');
const ProductsValidator = require('./validator/products');
const CategoriesValidator = require('./validator/categories');
const ReviewsValidator = require('./validator/reviews');

const ClientError = require('./exceptions/ClientError');
const TokenManager = require('./tokenize/TokenManager');

const init = async () => {
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const umkmsService = new UmkmsService();
  const productsService = new ProductsService();
  const categoriesService = new CategoriesService();
  const reviewsService = new ReviewsService();
  const storageServiceUmkms = new StorageService(path.resolve(__dirname, 'src/api/umkms/file/images'));
  const storageServiceProducts = new StorageService(path.resolve(__dirname, 'src/api/products/file/images'));

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('mamen_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: umkms,
      options: {
        service: umkmsService,
        storageService: storageServiceUmkms,
        validator: UmkmsValidator,
      },
    },
    {
      plugin: products,
      options: {
        service: productsService,
        storageService: storageServiceProducts,
        validator: ProductsValidator,
      },
    },
    {
      plugin: categories,
      options: {
        service: categoriesService,
        validator: CategoriesValidator,
      },
    },
    {
      plugin: reviews,
      options: {
        service: reviewsService,
        validator: ReviewsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    if (response instanceof Error) {
      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue;
      }

      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
