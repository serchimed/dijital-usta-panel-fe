let API = "https://api.dijitalusta.net/";
let ERROR_MESSAGE_DEFAULT = "İşlem başarısız oldu, lütfen tekrar deneyiniz.";
let SUCCESS_UPDATE_MESSAGE = "Güncelleme başarılı.";
let LOADING_MESSAGE = "İşlem yapılıyor...";
let LOADING_MESSAGE_WAIT = "İşlem yapılıyor, lütfen bekleyiniz.";


function isRetryableStatus(status) {
  return status >= 500 || status === 408 || status === 429;
}

function isRetryableError(error) {
  return error.name === 'AbortError'
    || error.name === 'TypeError'
    || error.message.includes('fetch')
    || error.message.includes('network');
}

function getRetryDelay(retries, baseDelay = 1000) {
  return baseDelay * Math.pow(2, retries);
}

async function performRetry(callName, data, retries, timeout, maxRetries, userMessage) {
  let delay = getRetryDelay(retries);
  showHeaderMsg(`${userMessage} (${retries + 1}/${maxRetries})`);
  await new Promise(resolve => setTimeout(resolve, delay));
  return api(callName, data, retries + 1, timeout);
}

async function api(callName, data = {}, retries = 0, timeout = 10000) {
  let url = `${API}${callName}`;
  let maxRetries = 3;

  try {
    let controller = new AbortController();
    let timeoutId = setTimeout(() => controller.abort(), timeout);

    let response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (isRetryableStatus(response.status)) {
      console.error("API call failed:", callName, "Status:", response.status);

      if (retries < maxRetries) {
        return performRetry(callName, data, retries, timeout, maxRetries, "Bağlantı sorunları yaşanıyor, tekrar deneniyor...");
      }

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

    if (retries < maxRetries && isRetryableError(error)) {
      if (error.name === 'AbortError') {
        console.error("Request timeout for:", callName);
      }

      return performRetry(callName, data, retries, timeout, maxRetries, "Ağ bağlantısı kurulamadı, tekrar deneniyor...");
    }

    return {
      error: true,
      message: error.message,
      isNetworkError: true
    };
  }
}

async function apiBtn(btn, endpoint, data, successMsg, errorMsg, redirectUrl, $msgElement) {
  btn.disabled = true;
  let $msg = $msgElement;
  if (!$msg) {
    $msg = btn.nextElementSibling;
    if (!$msg || $msg.tagName !== "P") {
      $msg = document.createElement("p");
      btn.after($msg);
    }
  }

  $msg.textContent = LOADING_MESSAGE_WAIT;

  let result = await api(endpoint, data);

  if (!result || result.error || !result.isSuccess) {
    let errText = errorMsg || ERROR_MESSAGE_DEFAULT;
    if (result && Array.isArray(result.errors) && result.errors.length) {
      errText = result.errors.map(e => `• ${e}`).join("\n");
    }
    $msg.textContent = errText;
  } else {
    $msg.textContent = successMsg;
    if (result.data && result.data.redirectUrl) { redirectUrl = result.data.redirectUrl; }
    if (redirectUrl) { setTimeout(() => { location.href = redirectUrl; }, DELAY_1); }
  }

  btn.disabled = false;
  return result;
}

async function downloadCsv(endpoint, data = {}, defaultFilename = "export.csv", $msgElement = null, timeout = 60000) {
  if ($msgElement && $msgElement.tagName === "P") {
    $msgElement.textContent = "CSV hazırlanıyor...";
  }

  try {
    let controller = new AbortController();
    let timeoutId = setTimeout(() => controller.abort(), timeout);

    let response = await fetch(`${API}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if ($msgElement) {
        $msgElement.textContent = "CSV oluşturulamadı.";
      }
      return false;
    }

    let contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      let result = await response.json();
      if ($msgElement) {
        if (result.isSuccess) {
          $msgElement.textContent = result.data || "İşlem başarılı.";
        } else {
          $msgElement.textContent = result.data || "CSV oluşturulamadı.";
        }
      }
      return result.isSuccess;
    }

    let blob = await response.blob();
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.href = url;

    let filename = defaultFilename;
    let contentDisposition = response.headers.get("Content-Disposition");
    if (contentDisposition) {
      let match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, '');
      }
    }
    link.download = filename;

    document.body.append(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if ($msgElement) {
      $msgElement.textContent = "CSV indirildi.";
      setTimeout(() => {
        $msgElement.textContent = "";
      }, DELAY_2);
    }

    return true;
  } catch (error) {
    console.error("CSV download error:", error);
    if ($msgElement) {
      $msgElement.textContent = "Bir hata oluştu.";
    }
    return false;
  }
}


function logErr(result) {
  let errText = "Bir hata oluştu.";
  if (result && Array.isArray(result.errors) && result.errors.length) { errText = result.errors.join(", "); }
  console.error(errText);
}
