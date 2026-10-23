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
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [accountEmail, setAccountEmail] = useState('');
  const [accountNotice, setAccountNotice] = useState('');
  const [paymentNotice, setPaymentNotice] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [trialConsent, setTrialConsent] = useState(false);
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

  async function generateRoomPhoto() {
    const response = await fetch('/api/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, style, description })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'La photo n’a pas pu être générée.');
    }
    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) throw new Error('Le service n’a pas renvoyé une image.');
    return URL.createObjectURL(blob);
  }

  async function submitIdea(e) {
    e.preventDefault();
    setIsGenerating(true);
    setNotice('Préparation de votre projet…');
    const fallback = {
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
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room, style, budget, description })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Le serveur IA a refusé la demande.');
      if (!data || !data.advice) throw new Error('Réponse IA incomplète');
      let photoUrl = '';
      let photoError = '';
      try { photoUrl = await generateRoomPhoto(); }
      catch (imageError) { photoError = imageError?.message || 'La photo n’a pas pu être générée.'; }
      setProject({ room, style, budget, description, advice: data.advice, budgetAdvice: data.budgetAdvice || budgets[budget], palette: data.palette || '', layoutTips: data.layoutTips || '', shoppingList: data.shoppingList || '', generatedByAI: true, photoUrl });
      setNotice(photoUrl
        ? 'Votre fiche et votre photo IA sont prêtes. Vérifiez toujours les mesures et la faisabilité avant tout achat.'
        : 'La fiche texte est prête, mais la photo a échoué : ' + photoError);
    } catch (error) {
      let photoUrl = '';
      let photoError = '';
      try { photoUrl = await generateRoomPhoto(); }
      catch (imageError) { photoError = imageError?.message || 'la photo a échoué'; }
      setProject({ room, style, budget, description, advice: fallback[style], budgetAdvice: budgets[budget], palette: '', layoutTips: '', shoppingList: '', generatedByAI: false, photoUrl });
      setNotice('La génération du texte IA a échoué : ' + (error?.message || 'erreur inconnue') + '. ' +
        (photoUrl ? 'Une photo IA a tout de même été créée.' : 'La photo a aussi échoué : ' + photoError) +
        ' La fiche texte affichée est une démonstration.');
    } finally {
      setIsGenerating(false);
    }
  }

  return <div className="app">
    <header className="nav">
      <a className="brand" href="#accueil"><span className="brand-mark">D</span><span>DécoIA <em>Studio</em></span></a>
      <nav><a href="#fonctionnement">Découvrir</a><a href="#studio">Créer un projet</a><a href="#tarifs">Tarifs</a><a href="#publicite">Publicité</a></nav>
      <button className="button button-outline" onClick={() => { setShowLogin(!showLogin); setAccountNotice(""); }}>Créer un compte</button>
    </header>
    {showLogin && <div className="account-panel" id="compte"><button className="account-close" type="button" onClick={() => setShowLogin(false)} aria-label="Fermer">×</button><div className="eyebrow">ESPACE CLIENT</div><h2>Créez votre compte DécoIA</h2><p>Préparez votre espace personnel pour retrouver vos projets et vos inspirations.</p><form onSubmit={e => { e.preventDefault(); setAccountNotice("L’inscription n’est pas encore activée : aucun compte n’a été créé et aucune donnée n’a été envoyée. La connexion sécurisée doit être raccordée avant ouverture."); }}><label htmlFor="account-email">Adresse e-mail</label><input id="account-email" type="email" required value={accountEmail} onChange={e => setAccountEmail(e.target.value)} placeholder="vous@exemple.fr"/><button className="button button-primary submit" type="submit">Continuer</button></form><small>Formulaire de démonstration — ne saisis pas de mot de passe ni d’information sensible.</small>{accountNotice && <div className="notice" role="status">{accountNotice}</div>}</div>}
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
          <button className="button button-primary submit" type="submit" disabled={isGenerating}>{isGenerating ? "Génération en cours…" : "Générer ma fiche déco ↗"}</button>
          <small className="hero-form-foot">Conseils personnalisés · Sans paiement</small>
        </form>
      </section>
      <section className="benefits" id="fonctionnement">
        <div><span className="benefit-icon">✳</span><strong>Explorez des styles</strong><p>Du Japandi au bohème, trouvez votre univers.</p></div>
        <div><span className="benefit-icon">⌂</span><strong>Pensez chaque pièce</strong><p>Salon, chambre, cuisine et plus encore.</p></div>
        <div><span className="benefit-icon">✧</span><strong>Faites mûrir vos idées</strong><p>Des pistes pour imaginer un espace à votre image.</p></div>
      </section>
      <section className="ad-slot" id="publicite" aria-label="Emplacement publicitaire"><div className="ad-slot-tag">PUBLICITÉ</div><div><strong>Emplacement publicitaire</strong><p>Zone réservée aux annonces partenaires. Les publicités sont désactivées pour le moment.</p></div><span className="ad-slot-size">Bannière · 970 × 90</span></section>
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
        <div className="section-heading"><div className="eyebrow">LE STUDIO CRÉATIF</div><h2>Votre prochaine idée<br/><i>commence ici.</i></h2><p>Décrivez votre pièce et recevez des conseils ainsi qu’une photo d’inspiration générée par l’IA.</p></div>
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
          <button className="button button-primary submit" type="submit" disabled={isGenerating}>{isGenerating ? "Génération en cours…" : "Générer avec l’IA"} <span>↗</span></button>
          {notice && <div className="notice" role="status">{notice}</div>}
          {project && <div className="project-result" aria-live="polite">
            <div className="eyebrow">VOTRE FICHE D’INSPIRATION {project.generatedByAI ? "· IA" : "· DÉMO"}</div>
            <h3>{project.room} · style {project.style}</h3>
            {project.photoUrl && <div className="generated-photo-wrap"><img className="generated-photo" src={project.photoUrl} alt={'Photo d’inspiration IA pour ' + project.room + ', style ' + project.style} /><a className="button button-outline photo-download" href={project.photoUrl} download={'decoia-' + project.room.toLowerCase().replaceAll(' ', '-') + '.jpg'}>Télécharger la photo</a></div>}
            <p><strong>Direction déco</strong><br/>{project.advice}</p>
            <p><strong>Conseil budget — {project.budget}</strong><br/>{project.budgetAdvice}</p>
            {project.palette && <p><strong>Palette de couleurs suggérée</strong><br/>{project.palette}</p>}{project.layoutTips && <p><strong>Agencement conseillé</strong><br/>{project.layoutTips}</p>}{project.shoppingList && <p><strong>Liste d’idées à prévoir</strong><br/>{project.shoppingList}</p>}{project.description && <p><strong>Vos envies</strong><br/>{project.description}</p>}
            <div className="result-actions"><button className="button button-primary" type="button" onClick={saveProject}>Enregistrer ce projet</button><button className="button button-outline" type="button" onClick={() => window.print()}>Imprimer / enregistrer en PDF</button></div>
          </div>}
          {savedProjects.length > 0 && <div className="saved-projects"><div className="eyebrow">MES PROJETS ENREGISTRÉS</div><p className="saved-note">Enregistrés uniquement dans ce navigateur, sur cet appareil.</p>{savedProjects.map(item => <div className="saved-project" key={item.id}><div><strong>{item.room} · {item.style}</strong><small>{item.budget} · enregistré le {item.savedAt}</small></div><button className="text-button" type="button" onClick={() => { setProject(item); setRoom(item.room); setStyle(item.style); setBudget(item.budget); setDescription(item.description || ''); setNotice('Fiche enregistrée rechargée.'); }}>Ouvrir</button><button className="text-button" type="button" onClick={() => deleteSavedProject(item.id)}>Supprimer</button></div>)}</div>}
          <p className="privacy">Prototype en cours : si le service IA est activé, les choix de pièce, de style, de budget et votre description sont envoyés au serveur puis au fournisseur IA pour générer la fiche. Évitez d’y saisir des informations personnelles sensibles. Les projets enregistrés restent dans ce navigateur.</p>
        </form>
      </section>
      <section className="pricing-section" id="tarifs">
        <div className="pricing-heading"><div className="eyebrow">DES OFFRES SIMPLES</div><h2>Choisissez votre formule.</h2><p>Choisissez votre formule et confirmez votre essai. Aucun paiement pendant les 3 jours offerts ; si vous ne résiliez pas à temps, la formule choisie sera facturée à la fin de l’essai.</p><div className="trial-pill">✦ Formule à choisir et à valider avant l’essai</div></div>
        <div className="pricing-grid">
          {[{id:'week',duration:'1 semaine',price:'9,99 €'},{id:'month',duration:'1 mois',price:'19,99 €',featured:true},{id:'quarter',duration:'3 mois',price:'39,99 €'},{id:'year',duration:'1 an',price:'59,99 €'}].map(plan => <article className={`price-card ${plan.featured?'price-featured':''} ${selectedPlan?.id===plan.id?'price-selected':''}`} key={plan.id}>{plan.featured && <span className="price-badge">POPULAIRE</span>}<span className="price-duration">{plan.duration}</span><h3>{plan.price}</h3><p>3 jours offerts, puis {plan.price} si vous ne résiliez pas avant la fin de l’essai.</p><button className={selectedPlan?.id===plan.id?'button button-primary':'button button-outline'} type="button" onClick={() => { setSelectedPlan(plan); setTrialConsent(false); setPaymentNotice(''); }}>Choisir cette offre</button></article>)}
        </div>
        {selectedPlan && <div className="trial-confirmation">
          <div className="eyebrow">ÉTAPE SUIVANTE · VOTRE CHOIX</div>
          <h3>Formule sélectionnée : {selectedPlan.duration}</h3>
          <p>Vous bénéficiez de 3 jours d’essai. À la fin de l’essai, le prix prévu est de <strong>{selectedPlan.price}</strong> si vous n’avez pas résilié à temps. Aucun paiement n’est effectué sur cette démonstration.</p>
          <label className="trial-consent"><input type="checkbox" checked={trialConsent} onChange={e=>setTrialConsent(e.target.checked)}/> Je comprends la durée de l’essai, le prix de ma formule et la nécessité de résilier avant la fin des 3 jours pour éviter la facturation.</label>
          <button className="button button-primary submit" type="button" disabled={!trialConsent} onClick={() => setPaymentNotice("Démonstration uniquement : votre choix et votre consentement ont été testés à l’écran, mais aucun essai, compte, abonnement ou paiement n’a été créé. Le système sécurisé doit être connecté avant de proposer cette offre à de vrais clients.")}>Valider mon choix (démo)</button>
          <small>Cette étape simule le parcours. Elle ne démarre pas réellement les 3 jours et ne collecte aucune carte bancaire.</small>
        </div>}
        {paymentNotice && <div className="notice pricing-notice" role="status">{paymentNotice}</div>}
        <p className="pricing-footnote">Le fonctionnement prévu est : choisir une formule, accepter les conditions et valider l’essai de 3 jours. Sans résiliation avant la fin de l’essai, le tarif de la formule choisie sera facturé. Le paiement récurrent sécurisé, les rappels et la résiliation en ligne doivent être configurés et testés avant l’ouverture des abonnements.</p>
      </section>
      <section className="ad-slot ad-slot-bottom" aria-label="Emplacement publicitaire secondaire"><div className="ad-slot-tag">PUBLICITÉ</div><div><strong>Emplacement publicitaire secondaire</strong><p>Zone réservée à un futur format annonce. Aucun suivi publicitaire n’est actif.</p></div><span className="ad-slot-size">Rectangle · 300 × 250</span></section>
      <section className="cta"><div><div className="eyebrow">DÉCOIA STUDIO</div><h2>Faites place à l’inspiration.</h2><p>Une maison qui vous ressemble commence par une idée.</p></div><a className="button button-light" href="#studio">Imaginer mon projet ↗</a></section>
    </main>
    <footer><a className="brand" href="#accueil"><span className="brand-mark">D</span><span>DécoIA <em>Studio</em></span></a><span>Prototype en cours · Paiement et publicités non activés</span><span>© 2026 DécoIA Studio</span></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);