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
  stopBtn.disabled = true;
} else {

  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-IN";

  let savedText = "";
  let listening = false;

  stopBtn.disabled = true;

  // START SPEAKING
  startBtn.addEventListener("click", () => {

    savedText = textOutput.value.trim();
    listening = true;

    try {
      recognition.start();

      startBtn.disabled = true;
      stopBtn.disabled = false;

      statusText.textContent = "🎙️ Listening... Speak now.";

    } catch (error) {
      statusText.textContent = "Already listening.";
    }
  });

  // STOP SPEAKING
  stopBtn.addEventListener("click", () => {
    listening = false;
    recognition.stop();
  });

  // SPEECH RESULT
  recognition.onresult = (event) => {

    const finalParts = [];
    let interimText = "";

    for (let i = 0; i < event.results.length; i++) {

      const result = event.results[i];
      const text = result[0].transcript.trim();

      if (!text) continue;

      if (result.isFinal) {

        const last = finalParts[finalParts.length - 1];

        if (last && text.startsWith(last)) {
          finalParts[finalParts.length - 1] = text;
        } else if (last && last.startsWith(text)) {
          // ignore shorter repeat
        } else {
          finalParts.push(text);
        }

      } else {
        interimText = text;
      }
    }

    const finalText = finalParts.join(" ");

    if (finalText && interimText.startsWith(finalText)) {
      interimText = interimText.slice(finalText.length).trim();
    }

    const currentText = (finalText + " " + interimText).trim();

    textOutput.value = savedText
      ? (savedText + " " + currentText).trim()
      : currentText;
  };

  // WHEN THE BROWSER ENDS A SESSION
  recognition.onend = () => {

    if (listening) {
      savedText = textOutput.value.trim();

      setTimeout(() => {
        try {
          recognition.start();
        } catch (error) {}
      }, 250);

      return;
    }

    startBtn.disabled = false;
    stopBtn.disabled = true;

    statusText.textContent = "Ready to listen.";
  };

  // ERROR
  recognition.onerror = (event) => {

    if (event.error === "no-speech" || event.error === "aborted") {
      return;
    }

    listening = false;

    startBtn.disabled = false;
    stopBtn.disabled = true;

    if (event.error === "not-allowed") {
      statusText.textContent =
        "Microphone blocked. Please allow the mic in your browser.";
    } else {
      statusText.textContent = "Error: " + event.error;
    }
  };

  // CLEAR TEXT
  clearBtn.addEventListener("click", () => {

    textOutput.value = "";
    savedText = "";

    statusText.textContent = "Text cleared.";

    if (listening) {
      recognition.abort();
    }
  });
}

// COPY TEXT
copyBtn.addEventListener("click", async () => {

  if (!textOutput.value.trim()) {
    statusText.textContent = "There is no text to copy.";
    return;
  }

  try {
    await navigator.clipboard.writeText(textOutput.value);
    statusText.textContent = "✅ Text copied!";
  } catch {
    textOutput.select();
    document.execCommand("copy");
    statusText.textContent = "✅ Text copied!";
  }
});
