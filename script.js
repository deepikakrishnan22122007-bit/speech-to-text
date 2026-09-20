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

  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = true;

  let finalText = "";
  let isListening = false;

  // START
  startBtn.addEventListener("click", () => {

    if (isListening) {
      return;
    }

    finalText = textOutput.value.trim();
    isListening = true;

    startBtn.disabled = true;
    stopBtn.disabled = false;

    statusText.textContent = "🎙️ Listening... Speak now.";

    recognition.start();
  });


  // STOP
  stopBtn.addEventListener("click", () => {

    if (!isListening) {
      return;
    }

    recognition.stop();
  });


  // SPEECH RESULT
  recognition.onresult = (event) => {

    let temporaryText = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {

      const speech = event.results[i][0].transcript;

      if (event.results[i].isFinal) {

        finalText += speech + " ";

      } else {

        temporaryText += speech;
      }
    }

    textOutput.value =
      finalText + temporaryText;
  };


  // SPEECH ENDED
  recognition.onend = () => {

    isListening = false;

    startBtn.disabled = false;
    stopBtn.disabled = true;

    statusText.textContent = "Ready to listen.";
  };


  // ERROR
  recognition.onerror = (event) => {

    isListening = false;

    startBtn.disabled = false;
    stopBtn.disabled = true;

    statusText.textContent =
      "Error: " + event.error;
  };
}


// COPY BUTTON
copyBtn.addEventListener("click", async () => {

  const text = textOutput.value.trim();

  if (text === "") {

    statusText.textContent =
      "There is no text to copy.";

    return;
  }

  try {

    await navigator.clipboard.writeText(text);

    statusText.textContent =
      "✅ Text copied!";

  } catch (error) {

    textOutput.select();
    document.execCommand("copy");

    statusText.textContent =
      "✅ Text copied!";
  }
});


// CLEAR BUTTON
clearBtn.addEventListener("click", () => {

  textOutput.value = "";

  statusText.textContent =
    "Text cleared.";
});
