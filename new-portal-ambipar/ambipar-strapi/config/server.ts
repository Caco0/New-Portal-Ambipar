export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  // Produção: porta padrão 1337
  // Dev: você sobrescreve com PORT=1338 antes do npm run develop
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS', ['keyDevA', 'keyDevB']),
  },
});
