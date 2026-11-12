export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
    {
    name: 'strapi::body',
    config: {
      formLimit: '30mb',
      jsonLimit: '10mb',
      textLimit: '10mb',
      formidable: {
        maxFileSize: 5 * 1024 * 1024,
        maxTotalFileSize: 30 * 1024 * 1024,
        maxFiles: 5,
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
