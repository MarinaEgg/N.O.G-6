Voici un récapitulatif de l'architecture que nous avons mise en place :

🏗️ Architecture des Managers - Récapitulatif
📁 utils.js - Fonctions Utilitaires
Rôle : Boîte à outils commune pour toute l'application

window.format() - Formatage de texte/markdown
window.uuid() - Génération d'identifiants uniques
window.message_id() - IDs pour les messages
window.getYouTubeID() - Extraction d'IDs YouTube
window.getScrollY() - Gestion du scroll
window.getDynamicWarning() - Messages d'alerte
Principe : Fonctions pures, réutilisables partout

💾 storage.js - Gestionnaire de Stockage
Rôle : Centralise TOUT le stockage (localStorage + gestion des données)

window.storageManager.addConversation() - Créer conversations
window.storageManager.getConversation() - Récupérer conversations
window.storageManager.addMessage() - Ajouter messages
window.storageManager.saveSetting() - Paramètres utilisateur
window.storageManager.loadSetting() - Charger paramètres
Principe : Une seule source de vérité pour les données

💬 conversation-manager.js - Gestionnaire de Conversations
Rôle : Gère le streaming et la logique des messages

window.conversationManager.sendMessage() - Envoi + streaming complet
window.conversationManager.createNewConversation() - Nouvelles conversations
window.conversationManager.loadConversation() - Chargement conversations
État : isStreaming, currentController pour gérer les flux
Principe : Toute la logique métier des conversations centralisée

🎯 action-manager.js - Gestionnaire d'Actions
Rôle : Actions utilisateur et logique métier UI

window.actionManager.handleMessageSubmit() - Soumission messages
window.actionManager.toggleSidebar() - Gestion sidebar
window.actionManager.setConversation() - Changement conversation
window.actionManager.deleteConversation() - Suppression conversation
Principe : Pont entre les événements UI et la logique métier

⚡ event-manager.js - Gestionnaire d'Événements
Rôle : Gestion pure des événements DOM (click, keydown, etc.)

Délégation d'événements sécurisée
Gestion des listeners (ajout/suppression propre)
Délègue les actions à actionManager
Gestion spécialisée par page (chat/workspace)
Principe : Capture les événements, délègue les actions

🔄 Flux d'Exécution Typique

1. Utilisateur clique "Envoyer" 
   ↓
2. event-manager.js capture l'événement
   ↓  
3. Appelle window.actionManager.handleMessageSubmit()
   ↓
4. action-manager.js appelle window.conversationManager.sendMessage()
   ↓
5. conversation-manager.js fait le streaming + utilise storageManager
   ↓
6. storage.js sauvegarde en localStorage
