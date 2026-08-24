import { API_SIGNATURE } from '../constants/api.constants';

export const SWAGGER_DESCRIPTION = `
API REST du site et du Back-Office de l'**ESSG**, éditée et signée par **${API_SIGNATURE}**.

---

## Signature ${API_SIGNATURE}

Chaque réponse de cette API — succès **comme** erreur — porte la signature de l'éditeur :

* dans le corps JSON : champ \`signature\` (valeur constante \`${API_SIGNATURE}\`) ;
* dans les en-têtes HTTP : \`X-Api-Signature: ${API_SIGNATURE}\` et \`X-Api-Version\`.

## Enveloppe de réponse standard

Toutes les routes renvoient la même structure :

\`\`\`json
{
  "statusCode": 200,
  "message": "Données récupérées avec succès",
  "data": { },
  "meta": { "total": 42, "page": 1, "limit": 10, "totalPages": 5 },
  "signature": "${API_SIGNATURE}",
  "timestamp": "2026-08-21T09:30:00.000Z",
  "path": "/formations?page=1"
}
\`\`\`

| Champ | Présence | Description |
| --- | --- | --- |
| \`statusCode\` | toujours | Code HTTP dupliqué dans le corps |
| \`message\` | toujours | Message fonctionnel en français |
| \`data\` | toujours | Charge utile (objet, tableau ou \`null\`) |
| \`meta\` | listes paginées | \`total\`, \`page\`, \`limit\`, \`totalPages\` |
| \`signature\` | toujours | Signature de l'éditeur : \`${API_SIGNATURE}\` |
| \`timestamp\` | toujours | Date ISO 8601 de la réponse |
| \`path\` | toujours | Chemin de la requête |

En cas d'erreur, \`data\` vaut \`null\` et \`message\` contient un libellé déjà traduit :

\`\`\`json
{
  "statusCode": 404,
  "message": "Utilisateur non trouvé",
  "data": null,
  "signature": "${API_SIGNATURE}",
  "timestamp": "2026-08-21T09:30:00.000Z",
  "path": "/users/999"
}
\`\`\`

Seules les routes binaires (\`GET /media/...\`, téléchargement de documents d'admission) échappent à
l'enveloppe : elles renvoient le flux du fichier, tout en conservant l'en-tête \`X-Api-Signature\`.

## Authentification

1. \`POST /auth/login\` avec \`{ "email": "...", "password": "..." }\` ;
2. récupérer \`data.accessToken\` ;
3. cliquer sur **Authorize** (cadenas, en haut à droite) et coller le jeton ;
4. les routes protégées acceptent alors l'en-tête \`Authorization: Bearer <token>\`.

Rôles disponibles : \`admin\`, \`editeur\`, \`lecteur\`. Un \`403\` signale un rôle insuffisant,
un \`401\` un jeton absent ou expiré.

## Pagination, tri et recherche

Les endpoints de liste acceptent \`?page=1&limit=10&sortBy=creeLe&sortOrder=DESC\`.
Les endpoints \`/search\` acceptent \`?q=<terme>\` en plus des paramètres de pagination.

## Pipeline d'images (Sharp → WebP)

Toutes les images envoyées depuis le Back-Office traversent un pipeline unique :

\`\`\`text
Back-Office → Multer (mémoire) → validation MIME + signature binaire
  → Sharp (rotation EXIF, redimensionnement, WebP) → MinIO
  → vérification de l'objet stocké → URL /media/<dossier>/<uuid>.webp → base de données
\`\`\`

* Les URL enregistrées se terminent **toujours** par \`.webp\` : ne reconstruisez jamais un chemin
  à partir de l'extension d'origine (\`.jpg\`, \`.png\`).
* Une image déjà optimisée (WebP, bonnes dimensions, poids raisonnable) n'est pas ré-encodée.
* Aucune URL n'est enregistrée en base tant que l'objet n'est pas confirmé dans le stockage.
* Limites : 5 Mo par image, formats acceptés JPG, JPEG, PNG, GIF et WebP.

Dossiers (\`folder\`) et presets associés : \`avatars\` (512 px, q82), \`partners\` (800 px, q86),
\`staff\` (900×1200, q82), \`news\` / \`projects\` / \`formations\` (1920×1080, q80),
\`images\` (générique, 1920 px, q80).

## Supervision

* \`GET /health\` — rapport complet (PostgreSQL, MinIO, mémoire) ;
* \`GET /health/live\` — le process répond ;
* \`GET /health/ready\` — \`503\` si la base de données est injoignable.

## Codes d'erreur

| Code | Signification |
| --- | --- |
| 400 | Données invalides, fichier refusé, image corrompue |
| 401 | Jeton absent, expiré ou invalide |
| 403 | Rôle insuffisant |
| 404 | Ressource introuvable |
| 409 | Doublon (email, slug…) |
| 503 | Stockage objet ou base de données indisponible |
`;

export const SWAGGER_TAGS: Array<{ name: string; description: string }> = [
  {
    name: 'Santé & supervision',
    description: 'Identité de l’API et sondes de santé (base de données, stockage, mémoire).',
  },
  {
    name: 'Authentification',
    description: 'Connexion au Back-Office et vérification de session (JWT).',
  },
  {
    name: 'Utilisateurs',
    description:
      'Comptes du Back-Office, rôles et photo de profil (upload converti en WebP dans `avatars/`).',
  },
  { name: 'Formations', description: 'Catalogue des formations de l’ESSG.' },
  { name: 'Projets', description: 'Projets institutionnels et leurs galeries d’images.' },
  { name: 'Actualités', description: 'Publications et communiqués du site vitrine.' },
  { name: 'Partenaires', description: 'Partenaires institutionnels et leurs logos.' },
  { name: 'Ressources humaines', description: 'Équipe et personnel présentés sur le site.' },
  { name: 'Admissions', description: 'Candidatures en ligne et pièces jointes privées.' },
  { name: 'Messages de contact', description: 'Formulaire de contact et réponses par email.' },
  { name: 'Tableau de bord', description: 'Statistiques et activités récentes.' },
  { name: 'Journal d’activité', description: 'Traçabilité des actions du Back-Office.' },
  { name: 'Paramètres', description: 'Configuration du site et coordonnées publiques.' },
  {
    name: 'Upload & médias',
    description:
      'Téléversement d’images (pipeline Sharp → WebP) et service des fichiers publics `/media/...`.',
  },
];
