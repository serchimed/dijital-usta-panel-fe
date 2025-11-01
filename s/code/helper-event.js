let AUTH_READY_EVENT = "authReady";
let CLICK_EVENT = "click";

function dispatchAuthReady() { document.dispatchEvent(new Event(AUTH_READY_EVENT)); }
function onAuthReady(callback) {
  if (window.USER) { callback(); }
  else { document.addEventListener(AUTH_READY_EVENT, callback, { once: true }); }
}
function onReady(callback) {
  if (document.readyState !== "loading") { callback(); }
  else { document.addEventListener("DOMContentLoaded", callback, { once: true }); }
}
