const loginPage = document.getElementById("loginPage");
const scannerPage = document.getElementById("scannerPage");
const loginForm = document.getElementById("loginForm");

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const restartBtn = document.getElementById("restartBtn");
const resultEl = document.getElementById("result");

let stream = null;
let scanning = false;
let rafId = null;

// Handle login
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("regId").value.trim();
  const pw = document.getElementById("password").value.trim();
  if (!id || !pw) {
    alert("Please enter ID and Password");
    return;
  }
  // Switch to scanner page
  loginPage.remove(); // completely remove registration page
  scannerPage.classList.remove("hidden");
});

// Camera controls
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = stream;
    scanning = true;
    resultEl.textContent = "Scanning...";
    startBtn.disabled = true;
    stopBtn.disabled = false;
    restartBtn.disabled = true;
    scanLoop();
  } catch (err) {
    alert("Error accessing camera: " + err.message);
  }
}

function stopCamera() {
  scanning = false;
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (stream) {
    video.srcObject = null;
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  video.pause();
  startBtn.disabled = false;
  stopBtn.disabled = true;
  restartBtn.disabled = false;
}

function restartCamera() {
  stopCamera();
  startCamera();
}

function scanLoop() {
  if (!scanning) return;

  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      const text = code.data;
      resultEl.innerHTML = "QR Code: " + text;

      // If it's a link, show button
      if (/^https?:\/\//i.test(text)) {
        lastLink = text;
        resultEl.innerHTML += `<br><button id="openLinkBtn">Open Link</button>`;
        document.getElementById("openLinkBtn").addEventListener("click", () => {
          window.open(lastLink, "_blank");
        });
      }

      // ✅ Popup alert to simulate police dashboard notification
      alert("✅ Details have been sent to the Police Dashboard for access.");

      stopCamera();
      return;
    }
  }
  rafId = requestAnimationFrame(scanLoop);
}


startBtn.addEventListener("click", startCamera);
stopBtn.addEventListener("click", stopCamera);
restartBtn.addEventListener("click", restartCamera);

// Handle login
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("regId").value.trim();
  const pw = document.getElementById("password").value.trim();

  if (id === VALID_ID && pw === VALID_PW) {
    // Hide login page
    loginPage.classList.add("hidden");
    loginPage.classList.remove("visible");

    // Show scanner page
    scannerPage.classList.remove("hidden");
    scannerPage.classList.add("visible");
  } else {
    loginError.textContent = "❌ Invalid Registration ID or Password";
  }
});