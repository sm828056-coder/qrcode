const form = document.querySelector("#qr-form");
const input = document.querySelector("#website-url");
const inputWrap = document.querySelector("#input-wrap");
const errorMessage = document.querySelector("#url-error");
const qrOutput = document.querySelector("#qrcode");
const emptyState = document.querySelector("#empty-state");
const resultActions = document.querySelector("#result-actions");
const resultCaption = document.querySelector("#result-caption");
const copyButton = document.querySelector("#copy-button");
const downloadButton = document.querySelector("#download-button");

let generatedUrl = "";

function normalizeUrl(value) {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    throw new Error("Enter a website address to get started.");
  }

  const withProtocol = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  let url;
  try {
    url = new URL(withProtocol);
  } catch {
    throw new Error("That link doesn’t look quite right. Check it and try again.");
  }

  if (!["http:", "https:"].includes(url.protocol) || !url.hostname) {
    throw new Error("Enter a full website address, like example.com.");
  }

  return url.href;
}

function showError(message) {
  inputWrap.classList.add("has-error");
  input.setAttribute("aria-invalid", "true");
  errorMessage.textContent = message;
}

function clearError() {
  inputWrap.classList.remove("has-error");
  input.removeAttribute("aria-invalid");
  errorMessage.textContent = "";
}

function getQrImage() {
  return qrOutput.querySelector("img") || qrOutput.querySelector("canvas");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  let url;
  try {
    url = normalizeUrl(input.value);
  } catch (error) {
    showError(error.message);
    input.focus();
    return;
  }

  if (typeof QRCode === "undefined") {
    showError("QR code generator couldn’t load. Check your connection and try again.");
    return;
  }

  qrOutput.replaceChildren();
  try {
    new QRCode(qrOutput, {
      text: url,
      width: 216,
      height: 216,
      colorDark: "#1d2925",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  } catch (error) {
    showError("We couldn’t make a QR code for that link. Try a shorter URL.");
    return;
  }

  generatedUrl = url;
  qrOutput.classList.add("is-visible");
  emptyState.hidden = true;
  resultActions.hidden = false;
  resultCaption.textContent = url;
});

input.addEventListener("input", clearError);

copyButton.addEventListener("click", async () => {
  if (!generatedUrl) return;

  try {
    await navigator.clipboard.writeText(generatedUrl);
    copyButton.innerHTML = '<span aria-hidden="true">✓</span> Copied!';
    window.setTimeout(() => {
      copyButton.innerHTML = '<span aria-hidden="true">⧉</span> Copy link';
    }, 1600);
  } catch {
    showError("Couldn’t copy the link. You can select and copy it below the QR code.");
  }
});

downloadButton.addEventListener("click", () => {
  if (!generatedUrl) return;

  const qrImage = getQrImage();
  if (!qrImage) {
    showError("The QR code image isn’t ready yet. Please try again.");
    return;
  }

  const link = document.createElement("a");
  link.download = "website-qr-code.png";
  link.href = qrImage instanceof HTMLCanvasElement
    ? qrImage.toDataURL("image/png")
    : qrImage.src;
  link.click();
});
