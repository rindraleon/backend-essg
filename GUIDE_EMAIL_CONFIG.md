# Guide de Configuration du Service Email

Ce guide explique comment configurer le service d'envoi d'emails pour les notifications de création de compte utilisateur.

## 📋 Prérequis

- Un compte email (Gmail, Outlook, ou autre service SMTP)
- Pour Gmail : un mot de passe d'application (App Password)
- Le backend ESSG doit être en cours d'exécution

## 🔧 Configuration SMTP

### Option 1 : Gmail (Recommandé pour les tests)

1. **Activer l'authentification à 2 facteurs** sur votre compte Gmail
2. **Générer un mot de passe d'application** :
   - Aller sur https://myaccount.google.com/security
   - Chercher "Mots de passe des applications"
   - Sélectionner "Autre" et nommer-le "ESSG Backend"
   - Copier le mot de passe généré (16 caractères)

3. **Configurer le fichier `.env`** :

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application-16-caracteres
SMTP_FROM=votre-email@gmail.com

# Application URL (pour les liens dans l'email)
APP_URL=http://localhost:3000
```

### Option 2 : Outlook / Hotmail

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@outlook.com
SMTP_PASS=votre-mot-de-passe
SMTP_FROM=votre-email@outlook.com
```

### Option 3 : Serveur SMTP personnalisé

```env
SMTP_HOST=smtp.votre-domaine.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=utilisateur@votre-domaine.com
SMTP_PASS=mot-de-passe
SMTP_FROM=noreply@votre-domaine.com
```

## 🚀 Test de la Configuration

### 1. Démarrer le backend

```bash
cd backend-essg
npm run start:dev
```

### 2. Vérifier les logs

Au démarrage, vous devriez voir :
```
[Nest] LOG [MailService] Email sent to user@example.com
```

### 3. Tester la création d'un utilisateur

Utilisez Postman, curl ou le frontend pour créer un utilisateur :

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_ADMIN" \
  -d '{
    "email": "test@example.com",
    "motDePasse": "MotDePasse123!",
    "prenom": "Jean",
    "nom": "Dupont",
    "role": "editeur"
  }'
```

### 4. Vérifier l'email

L'utilisateur devrait recevoir un email avec :
- ✅ Ses identifiants de connexion (email et mot de passe)
- ✅ Un bouton pour accéder à la plateforme
- ✅ Un avertissement de sécurité pour changer le mot de passe

## 📧 Template d'Email

Le template d'email est défini dans `backend-essg/src/mail/mail.service.ts` dans la méthode `sendWelcomeEmail()`.

**Personnalisation possible :**
- Couleurs (modifier les codes hexadécimaux dans le CSS)
- Logo ESSG (ajouter une image dans le header)
- Texte du message
- Lien vers la plateforme

## ⚠️ Sécurité

### Bonnes pratiques :

1. **Ne jamais commiter le fichier `.env`** dans Git
2. **Utiliser des mots de passe d'application** plutôt que des vrais mots de passe
3. **Utiliser HTTPS en production** pour APP_URL
4. **Limiter le taux d'envoi** pour éviter le spam
5. **Logger tous les envois** pour audit et debugging

### En production :

```env
SMTP_SECURE=true
SMTP_PORT=465
APP_URL=https://essg.com
```

## 🐛 Dépannage

### Erreur : "Invalid login"

- Vérifiez que vous utilisez un mot de passe d'application (Gmail)
- Vérifiez que l'authentification à 2 facteurs est activée
- Vérifiez que SMTP_USER et SMTP_PASS sont corrects

### Erreur : "Connection timeout"

- Vérifiez que le port SMTP n'est pas bloqué par votre firewall
- Essayez un port différent (465 au lieu de 587)
- Vérifiez votre connexion internet

### Email non reçu

- Vérifiez le dossier spam/courrier indésirable
- Vérifiez les logs du backend
- Vérifiez que SMTP_FROM est un email valide

## 📊 Monitoring

Les envois d'emails sont loggés avec :
- ✅ Succès : `Email sent to user@example.com`
- ❌ Échec : `Failed to send email to user@example.com` + erreur détaillée

## 🔄 Modifications futures

Pour modifier le template d'email, éditez la méthode `sendWelcomeEmail()` dans :
```
backend-essg/src/mail/mail.service.ts
```

Pour changer le comportement lors de la création d'utilisateur, éditez :
```
backend-essg/src/users/users.service.ts
```

## 📝 Notes

- L'envoi d'email est **asynchrone** et ne bloque pas la création de l'utilisateur
- Si l'email échoue, l'utilisateur est quand même créé (erreur loggée mais non bloquante)
- Le mot de passe est envoyé en clair dans l'email (l'utilisateur devra le changer à la première connexion)