/* Seeker Strike dans un projet React / Vite.
 *
 * Le jeu est un Canvas 2D en fichier unique, deja deploye et servi en HTTPS.
 * On ne le porte pas en React : on l'affiche. Une iframe plein ecran suffit,
 * et evite d'avoir a resoudre 2,4 Mo de script inline dans un bundler.
 *
 * Remplacer le contenu de src/App.jsx par ce fichier. Rien d'autre a faire :
 * aucune dependance, aucun asset a copier, aucune configuration.
 */
export default function App() {
  return (
    <iframe
      src="https://azumizeus.github.io/seeker-strike/"
      title="Seeker Strike — Genesis Protocol"
      allow="fullscreen; clipboard-write; accelerometer; gyroscope"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 0,
        background: '#05050a',
      }}
    />
  );
}
