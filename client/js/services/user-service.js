/**
 * Gestion userId temporaire
 * Dette : remplacer par Azure AD
 */
(function() {
  class UserService {
    getUserId() {
      let userId = localStorage.getItem('temp_user_id');
      if (!userId) {
        userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('temp_user_id', userId);
      }
      return userId;
    }

    getCurrentConversationId() {
      return localStorage.getItem('current_conversation_id');
    }

    setCurrentConversationId(id) {
      localStorage.setItem('current_conversation_id', id);
    }
  }

  window.userService = new UserService();
  console.log('✅ UserService loaded');
})();
