const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const textOutput = document.getElementById("textOutput");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const statusText = document.getElementById("status");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  statusText.textContent =
    "Speech recognition is not supported. Please use Google Chrome.";
  startBtn.disabled = true;
} else {

  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-IN";

  let savedText = "";

  // START SPEAKING
  startBtn.addEventListener("click", () => {

    saved
