# Event-Manager.js - Documentation

## Description du Module
Le fichier `event-manager.js` est un module centralisé de gestion des événements UI pour l'application N.O.G. Il sert de couche d'orchestration entre les interactions utilisateur et la logique métier, en séparant clairement les responsabilités : l'event-manager capture et traite les événements DOM, puis délègue l'exécution des actions à des fonctions métier définies dans `chat.js`.

## Fonctionnalités Principales

### Gestion des Événements Chat
- Capture des clics sur le bouton d'envoi et des pressions de la touche Entrée
- Délégation vers `window.handle_ask()` pour le traitement des messages

### Gestion de la Sidebar
- Contrôle des boutons hamburger (interne et externe)
- Gestion des clics overlay pour fermeture mobile
- Restauration de l'état depuis localStorage

### Navigation Utilisateur
- Événements de navigation entre sections (Discussions/Workspace/Agents)
- Gestion du menu utilisateur avec ouverture/fermeture
- Fermeture automatique lors de clics extérieurs

### Paramètres et Thèmes
- Gestion des changements de thème via sélecteurs
- Sauvegarde automatique des préférences utilisateur
- Gestion du sélecteur de modèle

### Fonctionnalités Mobiles
- Adaptation responsive de la sidebar
- Gestion spécifique des interactions tactiles

## Architecture
L'event-manager utilise une approche modulaire avec des fonctions d'initialisation spécialisées (`initChatEvents`, `initSidebar`, `initNavigation`, etc.) qui s'exécutent au chargement du DOM. Chaque fonction configure les event listeners appropriés et maintient une séparation stricte entre la capture d'événements et l'exécution de la logique métier.
