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
let finalText = "";

/* Remove repeated words */
function removeRepeatedWords(text) {
  const words = text.trim().split(/\s+/);
  const cleaned = [];

  for (let i = 0; i < words.length; i++) {
    if (
      i === 0 ||
      words[i].toLowerCase() !== words[i - 1].toLowerCase()
    ) {
      cleaned.push(words[i]);
    }
  }

  return cleaned.join(" ");
}

/* Remove repeated phrases */
function removeRepeatedPhrases(text) {
  let words = text.trim().split(/\s+/);

  for (let size = 6; size >= 2; size--) {
    if (words.length >= size * 2) {
      const firstPart = words
        .slice(-size * 2, -size)
        .join(" ")
        .toLowerCase();

      const secondPart = words
        .slice(-size)
        .join(" ")
        .toLowerCase();

      if (firstPart === secondPart) {
        words.splice(words.length - size, size);
      }
    }
  }

  return words.join(" ");
}

function cleanText(text) {
  let cleaned = removeRepeatedWords(text);
  cleaned = removeRepeatedPhrases(cleaned);
  return cleaned.trim();
}

if (!SpeechRecognition) {
  micButton.disabled = true;

  statusText.textContent =
    "Speech recognition is not supported. Please use Google Chrome.";
} else {
  recognition = new SpeechRecognition();

  recognition.continuous = true;

  /*
    IMPORTANT:
    Interim results are disabled.
    This prevents the same speech from appearing
    again and again while you are speaking.
  */
  recognition.interimResults = false;

  recognition.lang = "en-IN";
  recognition.maxAlternatives = 1;

  recognition.onstart = function () {
    isListening = true;

    micButton.classList.add("listening");

    micIcon.textContent = "⏹️";
    micText.textContent = "Stop Speaking";

    statusText.textContent = "Listening...";
  };

  recognition.onresult = function (event) {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {

        let spokenText =
          event.results[i][0].transcript.trim();

        if (spokenText !== "") {

          spokenText = cleanText(spokenText);

          if (spokenText !== "") {

            finalText =
              finalText === ""
                ? spokenText
                : finalText + " " + spokenText;

            finalText = cleanText(finalText);

            result.value = finalText;

            result.scrollTop = result.scrollHeight;
          }
        }
      }
    }
  };

  recognition.onerror = function (event) {
    console.log("Speech recognition error:", event.error);

    if (event.error === "not-allowed") {

      statusText.textContent =
        "Microphone permission denied. Please allow microphone access.";

    } else if (event.error === "no-speech") {

      statusText.textContent =
        "No speech detected. Please speak again.";

    } else if (event.error === "network") {

      statusText.textContent =
        "Network error. Please check your internet connection.";

    } else {

      statusText.textContent =
        "Error: " + event.error;
    }
  };

  recognition.onend = function () {

    isListening = false;

    micButton.classList.remove("listening");

    micIcon.textContent = "🎤";
    micText.textContent = "Start Speaking";

    if (!statusText.textContent.includes("denied")) {
      statusText.textContent = "Ready";
    }
  };

  micButton.addEventListener("click", function () {

    if (isListening) {

      recognition.stop();

    } else {

      finalText = result.value.trim();

      try {
        recognition.start();
      } catch (error) {
        console.log("Recognition start error:", error);
      }
    }
  });
}


/* COPY BUTTON */

copyButton.addEventListener("click", async function () {

  const text = result.value.trim();

  if (text === "") {

    statusText.textContent =
      "There is no text to copy.";

    return;
  }

  try {

    await navigator.clipboard.writeText(text);

    statusText.textContent =
      "Text copied successfully!";

  } catch (error) {

    result.select();

    document.execCommand("copy");

    statusText.textContent =
      "Text copied successfully!";
  }
});


/* CLEAR BUTTON */

clearButton.addEventListener("click", function () {

  result.value = "";

  finalText = "";

  statusText.textContent =
    "Text cleared.";
});
