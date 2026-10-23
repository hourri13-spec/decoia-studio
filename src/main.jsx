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
  const [project, setProject] = useState(null);
  const [savedProjects, setSavedProjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem('decoia-saved-projects') || '[]'); } catch { return []; }
  });

  function saveProject() {
    if (!project) return;
    const item = { ...project, id: Date.now(), savedAt: new Date().toLocaleDateString('fr-FR') };
    const next = [item, ...savedProjects].slice(0, 12);
    setSavedProjects(next);
    try { localStorage.setItem('decoia-saved-projects', JSON.stringify(next)); setNotice('Projet enregistré sur cet appareil.'); }
    catch { setNotice('Le navigateur n’a pas permis l’enregistrement. Vous pouvez imprimer la fiche en PDF.'); }
  }

  function deleteSavedProject(id) {
    const next = savedProjects.filter(item => item.id !== id);
    setSavedProjects(next);
    try { localStorage.setItem('decoia-saved-projects', JSON.stringify(next)); } catch {}
  }

  function submitIdea(e) {
    e.preventDefault();
    const suggestions = {
      Japandi: 'Associez bois clair, lignes simples, textiles naturels et quelques objets artisanaux. Gardez des surfaces dégagées pour une ambiance calme.',
      Scandinave: 'Privilégiez des tons lumineux, du bois naturel, des textiles doux et un éclairage chaleureux. Ajoutez quelques touches végétales.',
      Contemporain: 'Misez sur une palette de deux ou trois couleurs, des meubles aux formes nettes et un éclairage en plusieurs points.',
      Bohème: 'Superposez des matières naturelles, des coussins texturés, des fibres tressées et quelques plantes, en gardant une palette cohérente.',
      Industriel: 'Combinez bois, métal noir et tons minéraux. Adoucissez l’ensemble avec un tapis, des rideaux et une lumière chaude.',
      Nature: 'Construisez une palette inspirée de la nature : vert doux, beige et bois. Ajoutez des matières naturelles et des plantes adaptées à la luminosité.'
    };
    const budgets = {
      'Petit budget': 'Commencez par réorganiser les meubles existants, puis changez les textiles et ajoutez quelques accessoires abordables.',
      'Modéré': 'Répartissez le budget entre un élément central, un éclairage agréable et quelques textiles coordonnés.',
      'Confortable': 'Vous pouvez envisager une pièce maîtresse de qualité, un éclairage travaillé et des rangements mieux adaptés.',
      'Je ne sais pas encore': 'Avancez par étapes : définissez les priorités, mesurez la pièce et comparez les options avant tout achat.'
    };
    setProject({ room, style, budget, description, advice: suggestions[style], budgetAdvice: budgets[budget] });
    setNotice('Votre fiche d’inspiration est prête. Ces conseils sont préparés dans le navigateur, pas générés par une IA.');
  }

  return <div className="app">
    <header className="nav">
      <a className="brand" href="#accueil"><span className="brand-mark">D</span><span>DécoIA <em>Studio</em></span></a>
      <nav><a href="#fonctionnement">Fonctionnement</a><a href="#studio">Le studio</a></nav>
      <button className="button button-outline" onClick={() => setShowLogin(!showLogin)}>Espace client</button>
    </header>
    {showLogin && <div className="login-note"><strong>Espace client — démonstration</strong><p>La connexion sécurisée sera ajoutée lors de la configuration du service d’authentification. Ce prototype ne collecte aucun mot de passe.</p><button className="text-button" onClick={() => setShowLogin(false)}>Fermer</button></div>}
    <main id="accueil">
      <section className="hero hero-photo">
        <div className="hero-photo-bg" role="img" aria-label="Salon lumineux aux tons naturels, canapé beige et plantes vertes"></div>
        <div className="hero-copy hero-photo-copy">
          <div className="eyebrow"><span></span> VOTRE INTÉRIEUR, VOTRE INSPIRATION</div>
          <h1>Un intérieur qui<br/><i>vous ressemble.</i></h1>
          <p className="lead">Explorez des ambiances chaleureuses, trouvez votre style et préparez votre projet pièce par pièce.</p>
          <div className="hero-actions"><a className="button button-primary" href="#studio">Créer mon projet <span>↗</span></a><a className="quiet-link" href="#inspirations">Voir les inspirations</a></div>
          <div className="trust-row"><span className="check">✓</span> Conseils déco personnalisés <span className="dot">·</span> Démonstration sans paiement</div>
        </div>
        <form className="hero-quick-form" onSubmit={submitIdea}>
          <h3>Créez votre projet déco</h3><p>Quelques informations pour préparer votre fiche personnalisée.</p>
          <label htmlFor="quick-room">Pièce</label><select id="quick-room" value={room} onChange={e=>setRoom(e.target.value)}>{['Salon','Chambre','Cuisine','Salle de bain','Extérieur'].map(x=><option key={x}>{x}</option>)}</select>
          <label htmlFor="quick-style">Style</label><select id="quick-style" value={style} onChange={e=>setStyle(e.target.value)}>{styles.map(x=><option key={x}>{x}</option>)}</select>
          <label htmlFor="quick-budget">Budget</label><select id="quick-budget" value={budget} onChange={e=>setBudget(e.target.value)}><option>Petit budget</option><option>Modéré</option><option>Confortable</option><option>Je ne sais pas encore</option></select>
          <label htmlFor="quick-description">Vos envies</label><textarea id="quick-description" rows="2" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Couleurs, matières, besoins…"/>
          <button className="button button-primary submit" type="submit">Générer ma fiche déco ↗</button>
          <small className="hero-form-foot">Conseils personnalisés · Sans paiement</small>
        </form>
      </section>
      <section className="benefits" id="fonctionnement">
        <div><span className="benefit-icon">✳</span><strong>Explorez des styles</strong><p>Du Japandi au bohème, trouvez votre univers.</p></div>
        <div><span className="benefit-icon">⌂</span><strong>Pensez chaque pièce</strong><p>Salon, chambre, cuisine et plus encore.</p></div>
        <div><span className="benefit-icon">✧</span><strong>Faites mûrir vos idées</strong><p>Des pistes pour imaginer un espace à votre image.</p></div>
      </section>
      <section className="inspiration-gallery" id="inspirations">
        <div className="gallery-heading"><div><div className="eyebrow">TROUVEZ VOTRE AMBIANCE</div><h2>Des idées pour chaque pièce.</h2><p>Quelques univers pour vous aider à imaginer votre intérieur.</p></div><a className="quiet-link" href="#studio">Personnaliser mon projet ↗</a></div>
        <div className="gallery-grid">
          <a className="gallery-card" href="#studio" onClick={() => setRoom('Salon')}><img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85" alt="Salon contemporain chaleureux aux tons naturels" loading="lazy"/><span className="gallery-card-label"><strong>Salon</strong><small>Convivial & apaisant</small></span></a>
          <a className="gallery-card" href="#studio" onClick={() => setRoom('Chambre')}><img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85" alt="Chambre élégante avec matières douces" loading="lazy"/><span className="gallery-card-label"><strong>Chambre</strong><small>Douceur & repos</small></span></a>
          <a className="gallery-card" href="#studio" onClick={() => setRoom('Cuisine')}><img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85" alt="Cuisine moderne aux finitions naturelles" loading="lazy"/><span className="gallery-card-label"><strong>Cuisine</strong><small>Fonctionnelle & lumineuse</small></span></a>
          <a className="gallery-card" href="#studio" onClick={() => setRoom('Salle de bain')}><img src="https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=900&q=85" alt="Salle de bain moderne aux tons pierre" loading="lazy"/><span className="gallery-card-label"><strong>Salle de bain</strong><small>Simple & sereine</small></span></a>
          <a className="gallery-card" href="#studio" onClick={() => setRoom('Extérieur')}><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85" alt="Espace de vie ouvert sur un extérieur verdoyant" loading="lazy"/><span className="gallery-card-label"><strong>Nature & extérieur</strong><small>Dedans-dehors</small></span></a>
        </div>
      </section>
      <section className="studio-section" id="studio">
        <div className="section-heading"><div className="eyebrow">LE STUDIO CRÉATIF</div><h2>Votre prochaine idée<br/><i>commence ici.</i></h2><p>Décrivez votre pièce et recevez une première fiche de conseils personnalisés. La génération d’images IA sera ajoutée séparément.</p></div>
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
          {project && <div className="project-result" aria-live="polite">
            <div className="eyebrow">VOTRE FICHE D’INSPIRATION</div>
            <h3>{project.room} · style {project.style}</h3>
            <p><strong>Direction déco</strong><br/>{project.advice}</p>
            <p><strong>Conseil budget — {project.budget}</strong><br/>{project.budgetAdvice}</p>
            {project.description && <p><strong>Vos envies</strong><br/>{project.description}</p>}
            <div className="result-actions"><button className="button button-primary" type="button" onClick={saveProject}>Enregistrer ce projet</button><button className="button button-outline" type="button" onClick={() => window.print()}>Imprimer / enregistrer en PDF</button></div>
          </div>}
          {savedProjects.length > 0 && <div className="saved-projects"><div className="eyebrow">MES PROJETS ENREGISTRÉS</div><p className="saved-note">Enregistrés uniquement dans ce navigateur, sur cet appareil.</p>{savedProjects.map(item => <div className="saved-project" key={item.id}><div><strong>{item.room} · {item.style}</strong><small>{item.budget} · enregistré le {item.savedAt}</small></div><button className="text-button" type="button" onClick={() => { setProject(item); setRoom(item.room); setStyle(item.style); setBudget(item.budget); setDescription(item.description || ''); setNotice('Fiche enregistrée rechargée.'); }}>Ouvrir</button><button className="text-button" type="button" onClick={() => deleteSavedProject(item.id)}>Supprimer</button></div>)}</div>}
          <p className="privacy">Prototype de démonstration : vos informations ne sont pas envoyées à un serveur.</p>
        </form>
      </section>
      <section className="cta"><div><div className="eyebrow">DÉCOIA STUDIO</div><h2>Faites place à l’inspiration.</h2><p>Une maison qui vous ressemble commence par une idée.</p></div><a className="button button-light" href="#studio">Imaginer mon projet ↗</a></section>
    </main>
    <footer><a className="brand" href="#accueil"><span className="brand-mark">D</span><span>DécoIA <em>Studio</em></span></a><span>Prototype de travail · Paiements et publicités désactivés</span><span>© 2026 DécoIA Studio</span></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);