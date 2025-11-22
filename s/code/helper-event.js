let AUTH_READY_EVENT = "authReady";
let CLICK_EVENT = "click";
let AUTH_READY_DISPATCHED = false;

function dispatchAuthReady() {
  AUTH_READY_DISPATCHED = true;
  document.dispatchEvent(new Event(AUTH_READY_EVENT));
}

function onAuthReady(callback) {
  if (window.USER && AUTH_READY_DISPATCHED) {
    try {
      callback();
    } catch (err) {
      console.error("onAuthReady callback error (immediate):", err);
    }
  } else {
    let executed = false;

    let wrappedCallback = async function () {
      if (!executed) {
        executed = true;
        try {
          await callback();
        } catch (err) {
          console.error("onAuthReady callback error:", err);
        }
      }
    };
    document.addEventListener(AUTH_READY_EVENT, wrappedCallback, { once: true });

    setTimeout(() => {
      if (window.USER && AUTH_READY_DISPATCHED) {
        console.warn("onAuthReady: Event missed, executing callback via timeout");
        wrappedCallback();
      }
    }, DELAY_2);
  }
}
function onReady(callback) {
  if (document.readyState !== "loading") { callback(); }
  else { document.addEventListener("DOMContentLoaded", callback, { once: true }); }
}
