# Dette Technique - Navigation Inter-Pages

## Problème identifié
Navigation brutale entre `/chat/` et `/workspace/` avec rechargement complet de page.

## Impact technique
- **Performance** : Rechargement complet vs navigation fluide
- **UX** : Flash/saut visuel entre pages  
- **État** : Perte potentielle de contexte utilisateur
- **Memory** : Event listeners non nettoyés

## Code concerné

### chat.js - lignes ~130-140
```javascript
function switchToDiscussions() {
  if (window.workspaceManager && window.workspaceManager.activeCardChat) {
    window.workspaceManager.disconnectFromMainChat();
  }
  setActiveNavItem('discussions'); // ← Inutile avant navigation
  window.location.href = '/chat/'; // ← Navigation brutale
}

function switchToWorkspace() {
  setActiveNavItem('workspace');   // ← Inutile avant navigation  
  window.location.href = '/workspace/'; // ← Navigation brutale
}
```

## Solutions possibles

### Option 1: Router SPA (recommandée)
- Implémenter client-side routing
- Charger contenu via fetch + DOM manipulation
- Maintenir état entre vues

### Option 2: Navigation améliorée
- Cleanup des event listeners avant navigation
- Préservation état dans sessionStorage
- Transition CSS pour UX fluide

### Option 3: Architecture unifiée  
- Page unique avec sections show/hide
- Gestion state centralisée
- Navigation instantanée

## Dépendances
- Refactorisation `event-manager.js` (en cours)
- `conversation-manager.js` (étape suivante)
- Architecture storage finalisée

## Priorité et timing
- **Priorité** : MOYENNE (après event-manager et conversation-manager)
- **Complexité** : 3-4 jours développement
- **Impact breaking** : Possible sur URLs et bookmarks

## Validation requise
- [ ] Navigation fluide sans flash
- [ ] État conversations préservé  
- [ ] Bookmarks fonctionnels
- [ ] Back/Forward browser
- [ ] Performance mobile

## Notes
**Reporter après étapes 3-4 de la refactorisation principale**
Cette navigation mérite une approche architecturale réfléchie.
