// Si l'environnement impose Vite, cette configuration suffit.
// index.html est autonome : aucun asset a resoudre, aucun import a traiter.
export default {
  root: '.',
  server: { port: 3000, host: true },
  build: { outDir: 'dist', assetsInlineLimit: 100000000 }
};
