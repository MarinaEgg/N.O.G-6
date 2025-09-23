// ========== STEP 1 - utils.js (EXTRACTION SÉCURISÉE) ==========
// Prompt pour Kiro : Extraire ces fonctions utilitaires de chat.js
/**
 * Fonctions purement utilitaires - SANS dépendances DOM/globales
 * Peuvent être extraites en premier car aucun risque de régression
 */

// UUID Generator
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

// Message ID Generator  
const generateMessageId = () => {
  random_bytes = (Math.floor(Math.random() * 1338377565) + 2956589730).toString(2);
  unix = Math.floor(Date.now() / 1000).toString(2);
  return BigInt(`0b${unix}${random_bytes}`).toString();
};

// Hex to ASCII
const hexToAscii = (str1) => {
  var hex = str1.toString();
  var str = "";
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
};

// Text Formatter
const formatText = (text) => {
  return text.replace(/(?:\r\n|\r|\n)/g, "<br>");
};

// Query String Builder
const buildQueryString = (obj) =>
  Object.keys(obj)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]))
    .join("&");

// Dynamic Warning Generator
const getDynamicWarning = () => {
  const language = navigator.language.startsWith('fr') ? 'fr' : 'en';
  const warnings = {
    fr: "N.O.G peut faire des erreurs, assurez-vous de vérifier ses réponses",
    en: "N.O.G can make mistakes, make sure to verify its responses"
  };
  return `<span class="dynamic-warning">${warnings[language]}</span>`;
};

// YouTube ID Extractor
const extractYouTubeId = (url) => {
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Scroll Position Utilities
const getScrollY = (element) => {
  const messageBox = document.getElementById('messages');
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
window.uuid = generateUUID;
window.message_id = generateMessageId;
window.h2a = hexToAscii;
window.format = formatText;
window.query = buildQueryString;
window.getYouTubeID = extractYouTubeId;
window.getScrollY = getScrollY;

// Export module
export default ChatUtils;
