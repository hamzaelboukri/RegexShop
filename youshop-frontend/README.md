# YouShop Frontend

Application frontend e-commerce moderne construite avec Next.js 15, React 19, TypeScript et Tailwind CSS.

## 🚀 Technologies

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS, Shadcn/UI
- **État**: Zustand (panier, auth)
- **Data Fetching**: TanStack Query v5
- **HTTP Client**: Axios
- **WebSocket**: Socket.io-client
- **Validation**: Zod
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Paiement**: Stripe

## 📁 Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── (auth)/            # Pages d'authentification
│   ├── account/           # Espace client
│   ├── admin/             # Dashboard admin
│   ├── cart/              # Panier
│   ├── checkout/          # Paiement
│   └── products/          # Catalogue
├── components/            # Composants React
│   ├── cart/              # Composants panier
│   ├── layout/            # Header, Footer
│   ├── products/          # Composants produits
│   └── ui/                # Composants UI (Shadcn)
├── hooks/                 # Custom hooks React Query
├── lib/                   # Utilitaires
├── providers/             # Context providers
├── services/              # Services API
├── stores/                # Stores Zustand
└── types/                 # Types TypeScript
```

## 🛠️ Installation

```bash
# Cloner le projet
git clone <repo-url>
cd youshop-frontend

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local

# Lancer en développement
npm run dev
```

## ⚙️ Configuration

Créez un fichier `.env.local` avec les variables suivantes :

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxx
```

## 📜 Scripts

```bash
npm run dev          # Démarrer en mode développement
npm run build        # Build de production
npm run start        # Démarrer en production
npm run lint         # Linter ESLint
npm run type-check   # Vérification TypeScript
```

## 🐳 Docker

```bash
# Build l'image
docker build -t youshop-frontend .

# Lancer le conteneur
docker run -p 3001:3001 youshop-frontend
```

## 🎨 Fonctionnalités

### Client (B2C)
- ✅ Catalogue produits avec filtres
- ✅ Recherche instantanée
- ✅ Panier persistant (localStorage)
- ✅ Checkout multi-étapes
- ✅ Paiement Stripe
- ✅ Espace client (commandes, profil)
- ✅ Authentification JWT

### Admin (B2B)
- ✅ Dashboard avec KPIs
- ✅ Gestion des produits (CRUD)
- ✅ Gestion des commandes
- ✅ Graphiques de revenus (Recharts)
- ✅ Alertes de stock

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- Mobile (< 640px)
- Tablette (640px - 1024px)
- Desktop (> 1024px)

## 🔒 Sécurité

- Validation des formulaires avec Zod
- Protection des routes admin
- Tokens JWT avec refresh automatique
- Sanitization des entrées utilisateur

## 📄 Licence

MIT
