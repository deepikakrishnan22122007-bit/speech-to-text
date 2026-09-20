const micButton = document.getElementById("micButton");
const micIcon = document.getElementById("micIcon");
const micText = document.getElementById("micText");
const statusText = document.getElementById("status");
const result = document.getElementById("result");
const copyButton = document.getElementById("copyButton");
const clearButton = document.getElementById("clearButton");

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;
let oldText = "";


if (!SpeechRecognition) {

    micButton.disabled = true;

    statusText.textContent =
        "Speech recognition is not supported in this browser.";

} else {

    recognition = new SpeechRecognition();

    /*
     * IMPORTANT
     * One speech session = one result.
     */
    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.lang = "en-IN";

    recognition.maxAlternatives = 1;


    recognition.onstart = function () {

        isListening = true;

        micButton.classList.add("listening");

        micIcon.textContent = "⏹️";

        micText.textContent = "Listening...";

        statusText.textContent = "Speak now...";
    };


    recognition.onresult = function (event) {

        if (
            !event.results ||
            event.results.length === 0
        ) {
            return;
        }


        const speech =
            event.results[0][0].transcript.trim();


        if (speech === "") {
            return;
        }


        /*
         * Add the new sentence only once.
         */
        if (oldText === "") {

            result.value = speech;

        } else {

            result.value =
                oldText + " " + speech;
        }


        oldText = result.value.trim();


        result.scrollTop =
            result.scrollHeight;
    };


    recognition.onerror = function (event) {

        console.log(
            "Speech recognition error:",
            event.error
        );


        if (event.error === "not-allowed") {

            statusText.textContent =
                "Please allow microphone permission.";

        } else if (event.error === "no-speech") {

            statusText.textContent =
                "No speech detected. Try again.";

        } else {

            statusText.textContent =
                "Error: " + event.error;
        }
    };


    recognition.onend = function () {

        isListening = false;

        micButton.classList.remove("listening");

        micIcon.textContent = "🎤";

        micText.textContent =
            "Start Speaking";


        if (
            !statusText.textContent.includes("permission") &&
            !statusText.textContent.includes("detected")
        ) {

            statusText.textContent =
                "Ready";
        }
    };


    micButton.addEventListener(
        "click",
        function () {

            if (isListening) {

                recognition.stop();

                return;
            }


            /*
             * Save the existing text.
             */
            oldText = result.value.trim();


            try {

                recognition.start();

            } catch (error) {

                console.log(error);
            }
        }
    );
}


/* COPY */

copyButton.addEventListener(
    "click",
    async function () {

        const text =
            result.value.trim();


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
    }
);


/* CLEAR */

clearButton.addEventListener(
    "click",
    function () {

        result.value = "";

        oldText = "";

        statusText.textContent =
            "Text cleared.";
    }
);
