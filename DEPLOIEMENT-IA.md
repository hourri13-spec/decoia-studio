# Activer le générateur IA de DécoIA Studio

Le site actuellement hébergé sur GitHub Pages est statique : il ne peut pas exécuter directement le fichier serveur `api/generate.js`. Le formulaire reste donc en mode démonstration sur cette adresse jusqu'au déploiement du backend.

## Déploiement du backend sur Vercel

1. Importer le dépôt GitHub `hourri13-spec/decoia-studio` dans un projet Vercel.
2. Dans les paramètres du projet, ajouter la variable d'environnement `POLLINATIONS_API_KEY`.
3. La valeur doit être une clé secrète créée dans le compte du fournisseur IA. **Ne jamais la mettre dans le code, dans un fichier public, ni dans une variable `VITE_...`.**
4. Redéployer le projet après avoir ajouté la variable.
5. Tester le formulaire sur le domaine Vercel. Une réponse réussie est marquée « IA » ; si le serveur ou la clé n'est pas configuré, le site affiche des conseils de démonstration et précise que l'IA n'a pas répondu.

## À savoir

- Le backend envoie les choix de pièce, style, budget et description au fournisseur IA.
- Ne demande pas aux visiteurs de saisir des informations personnelles sensibles.
- Vérifie les conditions, les tarifs et les limites du fournisseur avant une utilisation publique. Une offre gratuite ou un quota peut changer.
- L'API ne traite aucun paiement et ne crée aucun compte utilisateur.
- Le site GitHub Pages peut rester en ligne comme aperçu, mais pour un vrai générateur IA, il faut publier l'application sur un hébergeur qui exécute aussi les fonctions serveur.
