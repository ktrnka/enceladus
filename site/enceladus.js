

// mapping the speaker names to SpeechSynthesisUtterance configuration
const speechConfigs = {
    doctor: (utterance) => {
        // utterance.pitch = 0.8;
        utterance.voice = findVoice("en", "Google UK English Male");

        utterance.addEventListener('start', () => {
            $('#doctor').show();
        });
        utterance.addEventListener('end', () => {
            $('#doctor').hide();
        });
    },
    patient: (utterance) => {
        utterance.pitch = 0.6;
        utterance.voice = findVoice("en", "Google US English");

        utterance.addEventListener('start', () => {
            $('#patient').show();
        });
        utterance.addEventListener('end', () => {
            $('#patient').hide();
        });
    }
};

/** SPEECH API STUFF **/
// build a SpeechSynthesisUtterance for this speaker and text
function makeUtterance({speaker, text}) {
    const utterance = new SpeechSynthesisUtterance(text);

    // speaker-based configuration
    if (speaker in speechConfigs) {
        speechConfigs[speaker](utterance);
    }
    else {
        console.error("Speaker name not in speech config: " + speaker + ". Available: " + Object.getOwnPropertyNames(speechConfigs));
    }

    return utterance;
}

// create the global variable that stores all utterances. This is necessary to prevent garbage collection of the callbacks
function buildUtterances(messages) {
    window.utterances = $.map(messages, (obj) => { return makeUtterance(obj); });
}

function speechAvailable() {
    return 'speechSynthesis' in window;
}

function logVoices() {
    console.log("Available voices:");
    $.each(getVoices("en"), (i, voice) => { console.log(voice); });
}

// find voices by langId (returns an array)
function getVoices(langId) {
    /* NOTE: Voices aren't all loaded right away for some reason */
    return $.grep(speechSynthesis.getVoices(), (voice) => { return voice.lang.startsWith(langId); })
}

// find a voice by langId and name prefixes (returns only one)
function findVoice(langId, name) {
    const matches = $.grep(getVoices(langId), (voice) => { return voice.name.startsWith(name); });

    return matches[0];
}

// check every 500 ms to see if the speech list is available before building all the objects
function waitForVoices(func_callback) {
    setTimeout(() => {
        if (speechAvailable() && getVoices("en").length > 0) {
            logVoices();
            func_callback();
        }
        else {
            waitForVoices(func_callback);
        }
    }, 500);
}

// this function seems to bug out Chrome so bad that I have to reboot
function pauseSpeechFor(millis) {
    window.speechSynthesis.pause();

    setTimeout(() => {
        window.speechSynthesis.resume();
    }, millis);
}

/** MAIN READER **/

// load the script from JSON, build the utterance list, and start them all reading
function main() {
    $.getJSON('./scripts/chat_P4FXZN4PXA.json', (data) => {
        buildUtterances(data);
        speechSynthesis.resume();
        $.each(window.utterances, (i, utterance) => { speechSynthesis.speak(utterance); });
    });
}


$('document').ready(() => {
    waitForVoices(() => { main(); });
});
