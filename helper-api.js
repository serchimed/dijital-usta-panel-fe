let API = "https://api.dijitalusta.net/";
let ERROR_MESSAGE_DEFAULT = "İşlem başarısız oldu, lütfen tekrar deneyiniz.";
let LOADING_MESSAGE = "İşlem yapılıyor...";
let LOADING_MESSAGE_WAIT = "İşlem yapılıyor, lütfen bekleyiniz.";

async function api(callName, data = {}) {
  let url = `${API}${callName}`;

  try {
    let response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (response.status >= 500) {
      console.error("API call failed:", callName, response.text());
      return { error: true, status: response.status, message: "Server error" };
    }

    if (!response.ok) {
      let text = await response.text();
      console.error(`HTTP ${response.status} from ${url}: ${text}`);
      return { error: true, status: response.status, message: text };
    }

    let result = await response.json();
    console.debug("API response:", callName, result);
    return result;
  } catch (error) {
    console.error("API call failed:", callName, error);
    return { error: true, message: error.message };
  }
}

async function apiBtn(btn, endpoint, data, successMsg, errorMsg, redirectUrl) {
  btn.disabled = true;
  let $msg = btn.nextElementSibling;
  $msg.textContent = LOADING_MESSAGE_WAIT;

  let result = await api(endpoint, data);

  if (!result || result.error || !result.isSuccess) {
    let errText = errorMsg || ERROR_MESSAGE_DEFAULT;
    if (result && Array.isArray(result.errors) && result.errors.length) {
      errText = result.errors.join(", ");
    }
    $msg.textContent = errText;
    btn.disabled = false;
  } else {
    $msg.textContent = successMsg;
    if (redirectUrl) { setTimeout(() => { location.href = redirectUrl; }, 1234); }
  }

  return result;
}
