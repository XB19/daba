# DABA – Site vitrine, boutique en ligne et administration

- **frontend/** : React 19 + Vite + Tailwind CSS 4 + Framer Motion (animations) + Recharts (graphiques admin)
- **backend/** : Spring Boot 4 (Java 17) + Spring Security (JWT) + JPA + PostgreSQL

## Démarrage

### 1. Base de données
Créer la base `daba` dans PostgreSQL (déjà faite sur cette machine).

Le mot de passe PostgreSQL n'est **jamais** dans le code : il est lu depuis
`backend/config/application.properties` (fichier local, ignoré par git) :

```
spring.datasource.password=VOTRE_MOT_DE_PASSE
```
ou depuis la variable d'environnement `DB_PASSWORD`.

### 2. Backend (port 8080)
```bash
cd backend
./mvnw spring-boot:run        # Windows : mvnw.cmd spring-boot:run
```
Au premier démarrage, la base est remplie : 5 catégories, 22 produits, services, textes du site et un compte admin.

### 3. Frontend (port 5173)
```bash
cd frontend
npm install
npm run dev
```
Ouvrir http://localhost:5173 — l'administration est sur http://localhost:5173/admin

## Compte administrateur par défaut
- Email : `admin@daba.tg`
- Mot de passe : `Admin@2026`

À changer dès la première connexion (Admin → Utilisateurs), ou à définir avant le premier démarrage via
les variables `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Administration
Tableau de bord (CA, commandes, graphiques), commandes (statuts, détail, export CSV), produits (prix, stock,
disponibilité, mise en avant, images), catégories, services, témoignages, messages de contact, abonnés
newsletter (export), utilisateurs et rôles, et **tous les textes/images/coordonnées du site**.

Les images peuvent être téléversées (stockées dans `backend/uploads/`) ou indiquées par URL.

## Production
- Définir `JWT_SECRET` (chaîne longue et aléatoire), `DB_PASSWORD`, `CORS_ORIGINS`.
- `npm run build` génère `frontend/dist/` à servir derrière un proxy qui redirige `/api` et `/uploads` vers le backend.

## Docker (tout le projet en une commande)

```bash
cp .env.example .env      # puis remplir DB_PASSWORD, JWT_SECRET, ADMIN_PASSWORD
docker compose up -d --build
```

- Site : http://localhost (port modifiable avec `APP_PORT`)
- Administration : http://localhost/admin
- Services : `db` (PostgreSQL 17), `backend` (Spring Boot), `frontend` (Nginx qui sert React et redirige `/api` et `/uploads` vers le backend)
- Les données (base et images téléversées) sont conservées dans les volumes `db-data` et `uploads`.
