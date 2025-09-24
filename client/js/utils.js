// ========== UTILS.JS - VERSION FINALE COMPATIBLE ==========

/**
 * Fonctions utilitaires pour le chat
 * Version 100% compatible sans ES6 modules
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
  const random_bytes = (Math.floor(Math.random() * 1338377565) + 2956589730).toString(2);
  const unix = Math.floor(Date.now() / 1000).toString(2);
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
  if (!messageBox) return 0;
  return Math.floor(messageBox.scrollTop + element.getBoundingClientRect().bottom);
};

// Object principal
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

// ========== EXPORTS GLOBAUX UNIQUEMENT ==========
window.ChatUtils = ChatUtils;
window.uuid = generateUUID;
window.message_id = generateMessageId;
window.h2a = hexToAscii;
window.format = formatText;
window.query = buildQueryString;
window.getYouTubeID = extractYouTubeId;
window.getScrollY = getScrollY;

// Debug log
console.log('✅ Utils.js loaded - Global functions:', {
  uuid: typeof window.uuid,
  message_id: typeof window.message_id,
  format: typeof window.format,
  getYouTubeID: typeof window.getYouTubeID,
  getScrollY: typeof window.getScrollY
});

// ========== PAS D'EXPORTS ES6 - SUPPRIMÉ COMPLÈTEMENT ==========
