// mapping the speaker names to SpeechSynthesisUtterance configuration
const speechConfigs = {
    doctor: function (utterance) {
        // utterance.pitch = 0.8;
        utterance.voice = findVoice("en", "Google UK English Male");

        utterance.addEventListener('start', function () {
            $('#doctor').show();
        });
        utterance.addEventListener('end', function () {
            $('#doctor').hide();
        });
    },
    patient: function (utterance) {
        utterance.pitch = 0.6;
        utterance.voice = findVoice("en", "Google US English");

        utterance.addEventListener('start', function () {
            $('#patient').show();
        });
        utterance.addEventListener('end', function () {
            $('#patient').hide();
        });
    }
};

// utterances must be stored in globals so that the callbacks aren't garbage collected before they're spoken
window.utterances = [];



/** SPEECH API STUFF **/




function makeUtterance({speaker, text}) {
    const utterance = new SpeechSynthesisUtterance(text);

    // speaker-based configuration (note: not very safe)
    speechConfigs[speaker](utterance);

    return utterance;
}

/** MAIN READER **/
function buildUtterances(messages) {
    window.utterances = $.map(messages, function (obj, i) {
        return makeUtterance(obj);
    });
}

function startReading() {
    console.log("Starting to read");
    $.getJSON('./scripts/demo_script.json', function(data) {
        buildUtterances(data);
        $.each(window.utterances, function(i, utterance) { speechSynthesis.speak(utterance); });
    });
}


$('document').ready(function() {
    waitForVoices(() => { startReading(); });
    // startReading();
});

/** OLD **/
function speechAvailable() {
    return 'speechSynthesis' in window;
}

function logVoices() {
    console.log("Available voices:");
    $.each(getVoices("en"), (i, voice) => { console.log(voice); });
}
function getVoices(langId) {
    /* NOTE: Voices aren't all loaded right away for some reason */
    return $.grep(speechSynthesis.getVoices(), (voice) => { return voice.lang.startsWith(langId); })
}

function findVoice(langId, name) {
    const matches = $.grep(getVoices(langId), (voice) => { return voice.name == name; });

    return matches[0];
}

function waitForVoices(func_callback) {
    setTimeout(function() {
        console.log("Checking for voices again");
        if (speechAvailable() && getVoices("en").length > 0) {
            logVoices();
            console.log(func_callback);
            func_callback();
        }
        else {
            waitForVoices(func_callback);
        }
    }, 500);
}