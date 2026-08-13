/* Seeker Strike dans la preview Noah — version qui diagnostique ses echecs.
 *
 * Le probleme d'une iframe muette : quand elle reste noire, on ne sait pas si
 * c'est le reseau, une restriction d'imbrication, ou le jeu lui-meme.
 * Ce composant recupere le jeu par fetch (GitHub Pages autorise le CORS), le
 * sert depuis un Blob — donc en MEME ORIGINE, ce qui leve la restriction sur
 * l'ouverture du wallet — et affiche l'erreur exacte s'il echoue.
 */
import { useEffect, useState } from "react";

const JEU = "https://azumizeus.github.io/seeker-strike/";

export default function App() {
  const [src, setSrc] = useState<string | null>(null);
  const [etat, setEtat] = useState("Chargement du jeu…");
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;
    (async () => {
      try {
        setEtat("Téléchargement (11 Mo)…");
        const r = await fetch(JEU, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
        const html = await r.text();
        if (html.length < 100000) {
          throw new Error(
            `Réponse trop courte : ${html.length} octets. ` +
            `Attendu ~11 Mo. Contenu reçu : ${html.slice(0, 200)}`
          );
        }
        setEtat("Préparation…");
        url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
        setSrc(url);
      } catch (e: any) {
        /* Le fetch a echoue : on retombe sur l'iframe directe. Le wallet sera
           restreint (origine differente) mais le jeu reste jouable. */
        setErreur(String(e?.message || e));
        setSrc(JEU);
      }
    })();
    return () => { if (url) URL.revokeObjectURL(url); };
  }, []);

  if (!src) {
    return (
      <div style={ecran}>
        <div style={{ fontSize: 22, letterSpacing: 3, marginBottom: 12 }}>
          SEEKER STRIKE
        </div>
        <div style={{ opacity: 0.7 }}>{etat}</div>
      </div>
    );
  }

  return (
    <>
      <iframe
        src={src}
        title="Seeker Strike — Genesis Protocol"
        allow="fullscreen; clipboard-write; accelerometer; gyroscope"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          border: 0,
          background: "#05050a",
        }}
      />
      {erreur && (
        <div style={bandeau}>
          Mode dégradé — wallet restreint. Cause : {erreur}
        </div>
      )}
    </>
  );
}

const ecran: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "#05050a",
  color: "#14F195",
  fontFamily: "system-ui, sans-serif",
  fontSize: 13,
  textAlign: "center",
  padding: 24,
};

const bandeau: React.CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  background: "rgba(0,0,0,.85)",
  color: "#fbbf24",
  font: "11px system-ui, sans-serif",
  padding: "6px 10px",
  zIndex: 9999,
};
