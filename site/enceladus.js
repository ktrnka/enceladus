// cache DOM lookups
const DOM = {
};

// simple script to read from
const script = [
    {speaker: 'doctor', text: 'What brings you here today?'},
    {speaker: 'patient', text: 'I haven\'t been sleeping too well and my head hurts.'},
    {speaker: 'doctor', text: 'Oh I\'m sorry to hear that. How long has this been going on?'},
    {speaker: 'patient', text: 'A few weeks now'},
    {speaker: 'doctor', text: 'Could you describe the headaches a bit for me?'},
    {speaker: 'patient', text: 'They\'re like a dull ache you know? Sort of always there and just like that, like usually it feels that way when I don\'t sleep well'}
];

// utterances must be stored in globals so that the callbacks aren't garbage collected before they're spoken
window.utterances = [];

/** SPEECH API STUFF **/




function makeUtterance({speaker, text}) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.addEventListener('start', function () {
        console.log('started ' + text);
    });
    utterance.addEventListener('end', function () {
        console.log('ended ' + text);
    });

    return utterance;
}

/** MAIN READER **/
window.utterances = $.map(script, function(obj, i) { return makeUtterance(obj); });

function startReading() {
    console.log("Starting to read");
    $.each(window.utterances, function(i, utterance) { speechSynthesis.speak(utterance); });
}


$('document').ready(function() {
    startReading();
});

/** OLD **/
function speechAvailable() {
    return 'speechSynthesis' in window;
}

function getVoices(langId) {
    /* NOTE: Voices aren't all loaded right away for some reason */
    return $.grep(speechSynthesis.getVoices(), (voice) => { return voice.lang.startsWith(langId); })
}