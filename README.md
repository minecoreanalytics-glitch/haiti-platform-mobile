# Plateforme Civique Haïti — App mobile (Expo)

App iOS/Android (React Native + expo-router) : fil style réseau social, stories des dernières 24 h, carte native des communes, profils candidats vérifiés, publication citoyenne. FR par défaut, Kreyòl en option.

**Statut : prototype / démo.**

## Lancer
```bash
npm install
npx expo start
```

Nécessite le backend du repo `haiti-platform-web` en local (par défaut `http://localhost:3600` — voir `constants/theme.ts`, `API_URL`). Sur un appareil physique, remplacer par l'IP LAN du Mac.
