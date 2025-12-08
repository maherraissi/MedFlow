# MedFlow — SaaS pour Cliniques & Médecins

MedFlow est une application SaaS destinée aux cliniques et médecins pour gérer les patients, rendez-vous, consultations, facturation et paiements en ligne.

Tech stack:

Next.js (App Router) + Prisma + Auth.js + Tailwind + Stripe.

## Prérequis
- Node.js 18+ et npm
- PostgreSQL (local ou hébergé)
- Compte Stripe (mode test)

## Installation
1) Cloner et installer
```bash
npm install
```

2) Variables d’environnement
```bash
cp .env.example .env
# Éditer .env et renseigner:
# DATABASE_URL, AUTH_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL,
# NEXT_PUBLIC_APP_URL, STRIPE_SECRET_KEY,
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
# RESEND_API_KEY (Optionnel, pour les emails)
```

3) Base de données (Prisma)
```bash
npm run prisma:push       # créer les tables
npm run prisma:generate   # générer le client
npm run db:seed           # seed (tenant par défaut)
```

4) Démarrer
```bash
npm run dev
# http://localhost:3000
```

## Stripe (paiement)
- Définir `STRIPE_SECRET_KEY` et `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- Définir `NEXT_PUBLIC_APP_URL` (ex: http://localhost:3000).
- Webhook local (Stripe CLI):
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copier la valeur de signing secret dans STRIPE_WEBHOOK_SECRET
```

## Déploiement
- Front: Vercel (NEXT_PUBLIC_APP_URL = URL Vercel)
- DB/API: Railway/Render (PostgreSQL) + STRIPE_WEBHOOK_SECRET via dashboard provider
- Régler les variables `.env` dans chaque plateforme

## Pousser sur GitHub
```bash
git init
git add .
git commit -m "feat: MedFlow MVP (Auth, Patients, RDV, Consultations, Factures, Stripe)"
git branch -M main
git remote add origin https://github.com/<votre-user>/<repo>.git
git push -u origin main
```

## Documentation projet
- docs/EXPLICATION_FR.md — structure et fichiers

## Roadmap (sprints)
- S1: Auth + Onboarding + Dashboard
- S2: CRUD Patients/Services + Rendez-vous
- S3: Consultations + Ordonnances PDF
- S4: Facturation + Paiement + Portail Patient
- S5: Bonus (analytics, calendrier avancé, emails)
