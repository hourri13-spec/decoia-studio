export default async function handler(req, res) {
  // Diagnostic public minimal : ne révèle jamais la clé ni aucune donnée du compte.
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      service: 'DécoIA Studio',
      endpoint: 'api/generate',
      methodForGeneration: 'POST',
      apiKeyConfigured: Boolean(process.env.POLLINATIONS_API_KEY)
    });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (!apiKey) {
    console.error('[DécoIA] POLLINATIONS_API_KEY absente dans l’environnement Vercel.');
    return res.status(503).json({ error: 'Le service IA n’est pas configuré sur le serveur.' });
  }

  const { room, style, budget, description } = req.body || {};
  const allowedRooms = ['Salon', 'Chambre', 'Cuisine', 'Salle de bain', 'Extérieur'];
  const allowedStyles = ['Japandi', 'Scandinave', 'Contemporain', 'Bohème', 'Industriel', 'Nature'];
  const allowedBudgets = ['Petit budget', 'Modéré', 'Confortable', 'Je ne sais pas encore'];
  if (!allowedRooms.includes(room) || !allowedStyles.includes(style) || !allowedBudgets.includes(budget)) {
    return res.status(400).json({ error: 'Les choix du projet sont invalides.' });
  }

  const safeDescription = typeof description === 'string' ? description.slice(0, 700).replace(/[\u0000-\u001F]/g, ' ') : '';
  const prompt = [
    'Tu es un conseiller en décoration intérieure prudent et créatif. Réponds en français.',
    'Propose des idées réalistes, sans inventer de dimensions, de prix précis ni de garanties.',
    'Ne donne pas de conseils de travaux dangereux. Pour salle de bain, électricité ou travaux structurels, recommande un professionnel qualifié.',
    'Retourne uniquement un objet JSON valide avec les clés advice, budgetAdvice, palette, layoutTips, shoppingList.',
    'Chaque valeur doit être une chaîne concise de 1 à 3 phrases. shoppingList doit être une liste courte séparée par des virgules.',
    'Pièce : ' + room,
    'Style : ' + style,
    'Budget : ' + budget,
    'Demandes du client : ' + (safeDescription || 'Aucune précision supplémentaire.')
  ].join('\n');

  try {
    const upstream = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-nano',
        messages: [
          { role: 'system', content: 'Tu produis des recommandations de décoration en français au format JSON strict.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 700
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (!upstream.ok) {
      // Journaliser uniquement le statut HTTP : ne jamais journaliser la clé API ni les en-têtes.
      console.error('[DécoIA] Le fournisseur IA a répondu avec HTTP', upstream.status);
      const statusMessages = {
        401: 'La clé API a été refusée. Vérifie la clé enregistrée dans Vercel.',
        403: 'Le fournisseur refuse cette clé ou ce modèle. Vérifie les autorisations et l’accès au modèle.',
        404: 'Le modèle ou le point d’accès demandé est introuvable.',
        429: 'La limite d’utilisation ou de crédits du fournisseur a été atteinte.',
        500: 'Le fournisseur IA rencontre une erreur temporaire.',
        502: 'Le fournisseur IA est temporairement indisponible.',
        503: 'Le fournisseur IA est temporairement indisponible.'
      };
      const message = statusMessages[upstream.status] || 'Le fournisseur IA a refusé la demande (HTTP ' + upstream.status + ').';
      return res.status(502).json({ error: message, providerStatus: upstream.status });
    }

    const payload = await upstream.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      return res.status(502).json({ error: 'La réponse IA est incomplète.' });
    }

    const cleaned = content.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace < 0 || lastBrace <= firstBrace) {
      return res.status(502).json({ error: 'La réponse IA n’a pas le format attendu.' });
    }

    const result = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    const fields = ['advice', 'budgetAdvice', 'palette', 'layoutTips', 'shoppingList'];
    const normalized = {};
    for (const field of fields) {
      normalized[field] = typeof result[field] === 'string' ? result[field].slice(0, 900) : '';
    }
    if (!normalized.advice) return res.status(502).json({ error: 'La réponse IA ne contient pas de conseil.' });

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(normalized);
  } catch (error) {
    console.error('[DécoIA] Échec de l’appel IA :', error?.name || 'Erreur', error?.message || 'aucun détail');
    return res.status(502).json({ error: 'Impossible de joindre le service IA pour le moment.' });
  }
}
