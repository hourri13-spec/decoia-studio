import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const styles = ['Japandi', 'Scandinave', 'Contemporain', 'Bohème', 'Industriel', 'Nature'];
function App() {
  const [room, setRoom] = useState('Salon');
  const [style, setStyle] = useState('Japandi');
  const [budget, setBudget] = useState('Modéré');
  const [description, setDescription] = useState('');
  const [notice, setNotice] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  function submitIdea(e) {
    e.preventDefault();
    setNotice('Maquette prête : la génération d’images IA n’est pas encore connectée. Aucune image n’a été générée.');
  }

  return <div className="app">
    <header className="nav">
      <a className="brand" href="#accueil"><span className="brand-mark">D</span><span>DécoIA <em>Studio</em></span></a>
      <nav><a href="#fonctionnement">Fonctionnement</a><a href="#studio">Le studio</a></nav>
      <button className="button button-outline" onClick={() => setShowLogin(!showLogin)}>Espace client</button>
    </header>
    {showLogin && <div className="login-note"><strong>Espace client — démonstration</strong><p>La connexion sécurisée sera ajoutée lors de la configuration du service d’authentification. Ce prototype ne collecte aucun mot de passe.</p><button className="text-button" onClick={() => setShowLogin(false)}>Fermer</button></div>}
    <main id="accueil">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span></span> VOTRE INTÉRIEUR, VOTRE INSPIRATION</div>
          <h1>Un nouvel intérieur.<br/><i>Mille possibilités.</i></h1>
          <p className="lead">Imaginez des ambiances qui vous ressemblent et explorez de nouvelles idées pour chaque pièce de votre maison.</p>
          <div className="hero-actions"><a className="button button-primary" href="#studio">Découvrir le studio <span>↗</span></a><a className="quiet-link" href="#fonctionnement">Comment ça marche ?</a></div>
          <div className="trust-row"><span className="check">✓</span> Une inspiration adaptée à vos envies <span className="dot">·</span> Démonstration sans paiement</div>
        </div>
        <div className="hero-art" role="img" aria-label="Illustration stylisée d'un salon chaleureux">
          <div className="sun"></div><div className="window"><div></div><div></div><div></div><div></div></div>
          <div className="plant"><i></i><i></i><i></i><i></i><b></b></div>
          <div className="wall-frame"><span></span><span></span><span></span></div>
          <div className="sofa"><div className="sofa-back"></div><div className="cushion one"></div><div className="cushion two"></div><div className="seat"></div><div className="sofa-leg l"></div><div className="sofa-leg r"></div></div>
          <div className="table"><div></div></div><div className="rug"></div>
          <div className="art-label"><span className="sparkle">✳</span><div><strong>Une ambiance qui vous ressemble</strong><small>Inspiration · Harmonie · Idées</small></div></div>
        </div>
      </section>
      <section className="benefits" id="fonctionnement">
        <div><span className="benefit-icon">✳</span><strong>Explorez des styles</strong><p>Du Japandi au bohème, trouvez votre univers.</p></div>
        <div><span className="benefit-icon">⌂</span><strong>Pensez chaque pièce</strong><p>Salon, chambre, cuisine et plus encore.</p></div>
        <div><span className="benefit-icon">✧</span><strong>Faites mûrir vos idées</strong><p>Des pistes pour imaginer un espace à votre image.</p></div>
      </section>
      <section className="studio-section" id="studio">
        <div className="section-heading"><div className="eyebrow">LE STUDIO CRÉATIF</div><h2>Votre prochaine idée<br/><i>commence ici.</i></h2><p>Décrivez votre pièce et vos envies. Ce formulaire est une maquette : la génération d’images sera connectée dans une prochaine étape.</p></div>
        <form className="studio-card" onSubmit={submitIdea}>
          <div className="form-title"><span className="number">01</span><div><h3>Personnalisons votre projet</h3><p>Quelques détails pour définir votre ambiance.</p></div></div>
          <label>Quelle pièce souhaitez-vous aménager ?</label>
          <div className="room-options">{['Salon','Chambre','Cuisine','Salle de bain','Extérieur'].map(x=><button type="button" key={x} onClick={()=>setRoom(x)} className={room===x?'choice selected':'choice'}>{x}</button>)}</div>
          <label>Quel style vous inspire ?</label>
          <div className="style-options">{styles.map(x=><button type="button" key={x} onClick={()=>setStyle(x)} className={style===x?'style-choice selected':'style-choice'}>{x}</button>)}</div>
          <label htmlFor="budget">Budget envisagé</label>
          <select id="budget" value={budget} onChange={e=>setBudget(e.target.value)}><option>Petit budget</option><option>Modéré</option><option>Confortable</option><option>Je ne sais pas encore</option></select>
          <label htmlFor="description">Décrivez votre pièce et vos envies <span className="optional">Facultatif</span></label>
          <textarea id="description" rows="3" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Ex. : salon lumineux, bois clair, rangements discrets, ambiance apaisante…"/>
          <button className="button button-primary submit" type="submit">Préparer mon idée <span>↗</span></button>
          {notice && <div className="notice" role="status">{notice}</div>}
          <p className="privacy">Prototype de démonstration : vos informations ne sont pas envoyées à un serveur.</p>
        </form>
      </section>
      <section className="cta"><div><div className="eyebrow">DÉCOIA STUDIO</div><h2>Faites place à l’inspiration.</h2><p>Une maison qui vous ressemble commence par une idée.</p></div><a className="button button-light" href="#studio">Imaginer mon projet ↗</a></section>
    </main>
    <footer><a className="brand" href="#accueil"><span className="brand-mark">D</span><span>DécoIA <em>Studio</em></span></a><span>Prototype de travail · Paiements et publicités désactivés</span><span>© 2026 DécoIA Studio</span></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);