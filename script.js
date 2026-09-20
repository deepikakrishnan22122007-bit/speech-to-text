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
    "Speech recognition is not supported in this browser. Try Google Chrome.";
  startBtn.disabled = true;
} else {
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-IN";

  let finalText = "";

  startBtn.addEventListener("click", () => {
    finalText = textOutput.value;
    recognition.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    statusText.textContent = "🎙️ Listening... Speak now.";
  });

  stopBtn.addEventListener("click", () => {
    recognition.stop();
  });

  recognition.onresult = (event) => {
    let temporaryText = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalText += transcript + " ";
      } else {
        temporaryText += transcript;
      }
    }

    textOutput.value = finalText + temporaryText;
  };

  recognition.onend = () => {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusText.textContent = "Ready to listen.";
  };

  recognition.onerror = (event) => {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusText.textContent = "Error: " + event.error;
  };
}

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

clearBtn.addEventListener("click", () => {
  textOutput.value = "";
  statusText.textContent = "Text cleared.";
});
