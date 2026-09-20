const micButton = document.getElementById("micButton");
const micIcon = document.getElementById("micIcon");
const micText = document.getElementById("micText");
const statusText = document.getElementById("status");
const result = document.getElementById("result");
const copyButton = document.getElementById("copyButton");
const clearButton = document.getElementById("clearButton");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;
let oldText = "";      // text that was in the box before this session
let lastMessage = "";  // keeps error messages on screen

function joinText(a, b) {
  return [a, b].filter(Boolean).join(" ").trim();
}

// Builds ONE sentence from the results and never repeats words.
function getSessionText(results) {
  let text = "";

  for (let i = 0; i < results.length; i++) {
    const t = results[i][0].transcript.trim();
    if (!t) continue;

    const a = text.toLowerCase();
    const b = t.toLowerCase();

    if (!text) {
      text = t;
    } else if (b.startsWith(a)) {
      text = t;            // longer copy of the same sentence: replace
    } else if (a.startsWith(b)) {
      // shorter copy: ignore
    } else {
      text += " " + t;     // really new words
    }
  }

  return text;
}

if (!SpeechRecognition) {

  micButton.disabled = true;
  statusText.textContent = "Speech recognition is not supported. Please use Google Chrome.";

} else {

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "en-IN";
  recognition.maxAlternatives = 1;

  recognition.onstart = function () {
    isListening = true;
    lastMessage = "";
    micButton.classList.add("listening");
    micIcon.textContent = "⏹️";
    micText.textContent = "Listening...";
    statusText.textContent = "Speak now...";
  };

  recognition.onresult = function (event) {
    const sessionText = getSessionText(event.results);
    if (!sessionText) return;

    // REPLACE the text, do not add to it
    result.value = joinText(oldText, sessionText);
    result.scrollTop = result.scrollHeight;
  };

  recognition.onerror = function (event) {
    if (event.error === "not-allowed") {
      lastMessage = "Please allow microphone permission.";
    } else if (event.error === "no-speech") {
      lastMessage = "No speech detected. Try again.";
    } else if (event.error !== "aborted") {
      lastMessage = "Error: " + event.error;
    }
  };

  recognition.onend = function () {
    isListening = false;

    // Save the finished text so the next session adds after it
    oldText = result.value.trim();

    micButton.classList.remove("listening");
    micIcon.textContent = "🎤";
    micText.textContent = "Start Speaking";
    statusText.textContent = lastMessage || "Ready";
  };

  micButton.addEventListener("click", function () {

    if (isListening) {
      recognition.stop();
      return;
    }

    oldText = result.value.trim();

    try {
      recognition.start();
    } catch (error) {
      console.log(error);
    }
  });
}

/* COPY */
copyButton.addEventListener("click", async function () {

  const text = result.value.trim();

  if (text === "") {
    statusText.textContent = "There is no text to copy.";
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    result.select();
    document.execCommand("copy");
  }

  statusText.textContent = "Text copied successfully!";
});

/* CLEAR */
clearButton.addEventListener("click", function () {

  result.value = "";
  oldText = "";
  lastMessage = "";
  statusText.textContent = "Text cleared.";

  if (isListening) {
    recognition.abort();
  }
});
