export const environment = {
  production: false,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost/tskmgr_dev',

  postgres: {},

  typeorm: {
    synchronize: true,
  },
};
