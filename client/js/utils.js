// ========== CHAT UTILITIES MODULE ==========
// Fonctions purement utilitaires - SANS dépendances DOM/globales
// Peuvent être extraites en premier car aucun risque de régression

/**
 * UUID Generator
 * Génère un UUID unique basé sur le timestamp
 */
const generateUUID = () => {
  return `xxxxxxxx-xxxx-4xxx-yxxx-${Date.now().toString(16)}`.replace(
    /[xy]/g,
    function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }
  );
};

/**
 * Message ID Generator
 * Génère un ID unique pour les messages basé sur timestamp Unix et bytes aléatoires
 */
const generateMessageId = () => {
  const random_bytes = (Math.floor(Math.random() * 1338377565) + 2956589730).toString(2);
  const unix = Math.floor(Date.now() / 1000).toString(2);
  return BigInt(`0b${unix}${random_bytes}`).toString();
};

/**
 * Hex to ASCII Converter
 * Convertit une chaîne hexadécimale en ASCII
 */
const hexToAscii = (str1) => {
  var hex = str1.toString();
  var str = "";
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
};

/**
 * Text Formatter
 * Remplace les retours à la ligne par des balises <br>
 */
const formatText = (text) => {
  return text.replace(/(?:\r\n|\r|\n)/g, "<br>");
};

/**
 * Query String Builder
 * Construit une chaîne de requête URL à partir d'un objet
 */
const buildQueryString = (obj) =>
  Object.keys(obj)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]))
    .join("&");

/**
 * Dynamic Warning Generator
 * Génère un avertissement dynamique basé sur la langue du navigateur
 */
const getDynamicWarning = () => {
  const language = navigator.language.startsWith('fr') ? 'fr' : 'en';
  const warnings = {
    fr: "N.O.G peut faire des erreurs, assurez-vous de vérifier ses réponses",
    en: "N.O.G can make mistakes, make sure to verify its responses"
  };
  return `<span class="dynamic-warning">${warnings[language]}</span>`;
};

/**
 * YouTube ID Extractor
 * Extrait l'ID d'une vidéo YouTube à partir d'une URL
 */
const extractYouTubeId = (url) => {
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

/**
 * Scroll Position Utilities
 * Calcule la position de scroll Y d'un élément
 */
const getScrollY = (element) => {
  const messageBox = document.getElementById('messages');
  if (!messageBox) return 0;
  return Math.floor(messageBox.scrollTop + element.getBoundingClientRect().bottom);
};

// Export pour compatibility + modules
const ChatUtils = {
  generateUUID,
  generateMessageId,
  hexToAscii,
  formatText,
  buildQueryString,
  getDynamicWarning,
  extractYouTubeId,
  getScrollY
};

// Compatibility globale (maintenir pendant transition)
if (typeof window !== 'undefined') {
  window.uuid = generateUUID;
  window.message_id = generateMessageId;
  window.h2a = hexToAscii;
  window.format = formatText;
  window.query = buildQueryString;
  window.getYouTubeID = extractYouTubeId;
  window.getScrollY = getScrollY;
  
  // Export global pour autres modules
  window.ChatUtils = ChatUtils;
}

// Export module (pour usage futur)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatUtils;
}

console.log('✅ ChatUtils module loaded successfully');
