# Scan & Saisie — OCR local (Chèques & Déclarations)

Projet de stage ENSIAS — automatisation de la saisie par OCR, 100% côté client.

## Stack
- React + Vite
- Tesseract.js (OCR, réseau de neurones pré-entraîné exécuté en local via WASM)
- Extraction de champs par règles/regex (voir `src/lib/fieldExtractor.js`)
- Aucune API externe, aucune donnée envoyée à un serveur

## Démarrer

```bash
npm install
npm run dev
```

Ouvre l'URL affichée (ex: `http://localhost:5173`).

### Tester sur mobile (caméra arrière)
Le serveur dev écoute sur le réseau local (`host: true` dans vite.config.js).
1. Connecte ton téléphone au même Wi-Fi que ton ordinateur.
2. Récupère l'IP locale de ta machine (`ifconfig` / `ipconfig`).
3. Ouvre `http://<IP_LOCALE>:5173` depuis le navigateur du téléphone.
4. Autorise l'accès à la caméra.

> Note : `getUserMedia` (accès caméra) nécessite HTTPS en production, sauf sur `localhost`.
> Pour un déploiement réel, pense à héberger sur un domaine avec certificat SSL (Netlify/Vercel s'en chargent automatiquement).

## Structure du projet

```
src/
  App.jsx                 -> orchestration du flux (capture -> OCR -> validation -> confirmation)
  lib/fieldExtractor.js    -> extraction des champs (regex, à enrichir plus tard avec Transformers.js)
  components/
    CaptureZone.jsx        -> caméra arrière (mobile) + upload fichier (desktop)
    OcrProcessor.jsx        -> lance Tesseract.js et affiche la progression
    FieldReview.jsx        -> formulaire pré-rempli, éditable, avec indicateurs de confiance
    Confirmation.jsx        -> écran de validation finale
```

## Prochaines étapes possibles
- Prétraitement d'image avant OCR (recadrage, binarisation) avec OpenCV.js pour améliorer la précision
- Remplacer/enrichir l'extraction regex par un modèle NER local via Transformers.js
- Templates différents selon le type de document (structure fixe -> extraction par zone)
- Persistance locale (IndexedDB) pour retrouver l'historique des documents traités
