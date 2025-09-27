# Note de Dette Technique – `chat.js` refactorisation du chat .js 27/09/2025 (on garde les window (déjà présents mais ils seront à remplacer)

## Action réalisée
- **Suppression des doublons** : 
  - `const query`
  - `const format`
  - `const uuid`
  - `const message_id`
  - `function getYouTubeID`
  - `function getScrollY`
  - `function h2a`
  - `const getDynamicWarning`
- **Remplacement par** : 
  - `window.query`
  - `window.format`
  - `window.uuid`
  - `window.message_id`
  - `window.getYouTubeID`
  - `window.getScrollY`
  - `window.h2a`
  - `window.getDynamicWarning`
- **Conservation** : Toute la logique métier reste intacte

## Impact / Risques
- Exposition globale via `window`, pouvant créer des conflits ou réduire la modularité
- Tests unitaires plus compliqués et évolutivité limitée

## Recommandation future
- Migrer ces fonctions/constantes vers un **module utilitaire** ou **namespace dédié** pour limiter l’exposition globale et améliorer la maintenabilité

## Priorité
Moyenne
