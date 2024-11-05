require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const users = require('./api/users');
const authentications = require('./api/authentications');
const _exports = require('./api/exports');
const uploads = require('./api/uploads');
const umkms = require('./api/umkms');

const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const ProducerService = require('./services/rabbitmq/ProducerService');
const StorageService = require('./services/storage/StorageService');
const UmkmsService = require('./services/postgres/UmkmsService');

const UsersValidator = require('./validator/users');
const AuthenticationsValidator = require('./validator/authentications');
const ExportsValidator = require('./validator/exports');
const UploadsValidator = require('./validator/uploads');
const UmkmsValidator = require('./validator/umkms');

const ClientError = require('./exceptions/ClientError');
const TokenManager = require('./tokenize/TokenManager');

const init = async () => {
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const umkmsService = new UmkmsService();
  const storageService = new StorageService(path.resolve(__dirname, 'src/api/umkms/file/images'));

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
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
      },
    },
    {
      plugin: umkms,
      options: {
        service: umkmsService,
        storageService,
        validator: UmkmsValidator,
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
