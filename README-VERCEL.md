# 🚀 Déploiement Djulah Backend sur Vercel

## 📋 Prérequis

- Compte Vercel (gratuit)
- Repository GitHub du projet
- Base de données MongoDB Atlas

## 🔧 Configuration Vercel

### 1. Connexion du Repository

1. Connectez-vous sur [vercel.com](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez votre repository GitHub
4. Vercel détectera automatiquement le projet Node.js

### 2. Variables d'Environnement

Dans le dashboard Vercel, ajoutez ces variables d'environnement :

#### 🗄️ Base de données

```
MONGODB_URI=mongodb+srv://cesaristos5:D5NfqTbJGXpybjqL@k2ngrouptest.8xgdo.mongodb.net/djulah?retryWrites=true&w=majority&appName=k2ngrouptest
```

#### 🔐 Authentification

```
JWT_SECRET=votre-secret-jet-unique-et-securise
JWT_EXPIRES_IN=7d
```

#### 📧 Email (Gmail SMTP)

```
EMAIL_USER=cesaristos85@gmail.com
EMAIL_PASSWORD=ybfm tkhc pyaa bmuy
EMAIL_FROM=cesaristos85@gmail.com
```

#### 🖼️ Cloudinary

```
CLOUDINARY_CLOUD_NAME=dvtmnepbx
CLOUDINARY_API_KEY=254785473634652
CLOUDINARY_API_SECRET=B9OInOlWjPB1r-U1PUhlmzr8sF0
```

#### 🌐 Client URL

```
CLIENT_URL=https://votre-frontend.vercel.app
```

### 3. Configuration du Build

Vercel utilisera automatiquement la configuration du fichier `vercel.json` :

- **Build Command**: `npm run build`
- **Output Directory**: `.`
- **Install Command**: `npm install`

## 🚀 Déploiement

### Déploiement Automatique

1. **Push sur GitHub** → Vercel déploie automatiquement
2. **Preview Deployments** → Chaque PR crée un preview
3. **Production** → Push sur `main` déploie en production

### Déploiement Manuel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

## 📊 Monitoring

### Logs et Métriques

- **Dashboard Vercel**: Logs en temps réel
- **Functions**: Performance des endpoints
- **Analytics**: Statistiques d'utilisation

### Health Check

Votre API sera accessible à :

- **Production**: `https://votre-app.vercel.app/health`
- **API Docs**: `https://votre-app.vercel.app/api-docs`

## 🔧 Dépannage

### Problèmes Communs

#### 1. Timeout de fonction

```json
// vercel.json
"functions": {
  "backend/server.js": {
    "maxDuration": 30
  }
}
```

#### 2. Variables d'environnement

- Vérifiez le dashboard Vercel
- Redéployez après modification

#### 3. Connexion MongoDB

- Assurez-vous que l'IP est autorisée sur MongoDB Atlas
- Vérifiez la chaîne de connexion

### Debug Local

```bash
# Tester localement avec les variables Vercel
vercel env pull .env.local
vercel dev
```

## 🎯 Avantages Vercel

✅ **Gratuit** pour les petits projets  
✅ **Déploiement automatique** depuis GitHub  
✅ **CDN mondial** intégré  
✅ **HTTPS** automatique  
✅ **Preview deployments** pour chaque PR  
✅ **Monitoring** inclus  
✅ **Serverless** scaling

## 📝 Notes importantes

- **Durée max**: 10 secondes par fonction (configurable)
- **Taille**: 50MB max par fonction
- **Concurrency**: Gérée automatiquement
- **Region**: Automatique ou configurable

## 🔄 Migration depuis Render

✅ Configuration supprimée (`render.yaml`)  
✅ Fichiers Vercel créés (`vercel.json`, `.vercelignore`)  
✅ Variables d'environnement à migrer  
✅ URL de l'API changera

---

**Votre backend Djulah est maintenant prêt pour Vercel ! 🚀**
