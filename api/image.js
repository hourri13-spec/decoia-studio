export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Le service d’images n’est pas configuré sur le serveur.' });
  }

  const { room, style, description } = req.body || {};
  const allowedRooms = ['Salon', 'Chambre', 'Cuisine', 'Salle de bain', 'Extérieur'];
  const allowedStyles = ['Japandi', 'Scandinave', 'Contemporain', 'Bohème', 'Industriel', 'Nature'];
  if (!allowedRooms.includes(room) || !allowedStyles.includes(style)) {
    return res.status(400).json({ error: 'Les choix de pièce ou de style sont invalides.' });
  }

  const safeDescription = typeof description === 'string'
    ? description.slice(0, 350).replace(/[\x00-\x1F]/g, ' ')
    : '';
  const prompt = [
    'Photorealistic professional interior design photography, realistic room, natural daylight, tasteful styling, high detail, wide angle, no people, no text, no watermark.',
    'Room: ' + room + '. Interior design style: ' + style + '.',
    safeDescription ? 'Client preferences: ' + safeDescription : '',
    'Create a beautiful but plausible interior, coherent materials and natural proportions.'
  ].filter(Boolean).join(' ');

  try {
    const imageUrl = 'https://gen.pollinations.ai/image/' + encodeURIComponent(prompt)
      + '?model=black-forest-labs/flux.1-schnell&width=1024&height=1024&nologo=true';
    const upstream = await fetch(imageUrl, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + apiKey },
      signal: AbortSignal.timeout(60000)
    });

    if (!upstream.ok) {
      console.error('[DécoIA] Échec génération image, HTTP', upstream.status);
      const messages = {
        400: 'La demande d’image a été rejetée. Essaie une description plus simple.',
        401: 'La clé API a été refusée par le service d’images.',
        402: 'Le compte Pollinations ne dispose pas de crédits suffisants pour créer une image.',
        403: 'La clé API ne possède pas l’autorisation de créer des images.',
        429: 'La limite de génération d’images est atteinte. Réessaie plus tard.'
      };
      return res.status(502).json({ error: messages[upstream.status] || 'Le service de génération d’images est temporairement indisponible.' });
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      console.error('[DécoIA] Le fournisseur n’a pas retourné une image.');
      return res.status(502).json({ error: 'Le fournisseur n’a pas retourné de fichier image.' });
    }

    const bytes = Buffer.from(await upstream.arrayBuffer());
    if (!bytes.length || bytes.length > 12 * 1024 * 1024) {
      return res.status(502).json({ error: 'Le fichier image reçu est vide ou trop volumineux.' });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', String(bytes.length));
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Disposition', 'inline; filename="decoia-inspiration.jpg"');
    return res.status(200).send(bytes);
  } catch (error) {
    console.error('[DécoIA] Échec image :', error?.name || 'Erreur');
    return res.status(502).json({ error: 'La création de la photo a échoué. Vérifie les crédits du service IA puis réessaie.' });
  }
}
