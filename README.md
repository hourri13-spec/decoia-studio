# DécoIA Studio — prototype indépendant

Ce dépôt contient le prototype de l’interface de DécoIA Studio. Il ne dépend pas de Systeme.io.

## État actuel
- Le site vitrine et le formulaire sont une maquette interactive.
- L’espace client n’est pas une authentification réelle.
- La génération d’images IA n’est pas connectée.
- Aucun paiement, abonnement, essai gratuit, publicité ou suivi publicitaire n’est activé.
- Le formulaire n’envoie aucune donnée à un serveur.
- Ce prototype n’est pas prêt à être vendu comme service commercial.

## Démarrer sur Windows
1. Installer Node.js LTS depuis https://nodejs.org/.
2. Ouvrir ce dossier dans VS Code.
3. Dans le terminal, exécuter `npm install` puis `npm run dev`.
4. Ouvrir l’adresse locale affichée (généralement http://localhost:5173).

## Étapes suivantes
1. Déployer le frontend.
2. Ajouter Supabase Auth, PostgreSQL et des règles d’accès RLS.
3. Ajouter une API serveur sécurisée pour l’IA et les quotas.
4. Tester un prestataire de paiement en mode test avant tout lancement.
5. Préparer mentions légales, confidentialité et conditions de vente.

Ne jamais exposer de clé API, de secret de paiement ou de clé `service_role` dans le frontend.