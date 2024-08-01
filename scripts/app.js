const clickImageIndicator = document.querySelector('#click-image-indicator');
const midiStatus = document.querySelector('#midi-status');

const allOpen = document.querySelector('#all-open');
const tipClosed = document.querySelector('#tip-closed');
const ringClosed = document.querySelector('#ring-closed');
const flip = document.querySelector('#flip');

const savePreset = document.querySelector('#save-preset');
const recallPreset = document.querySelector('#recall-preset');
const presetNumber = document.querySelector('#preset-number');


// UX Event Listeners
let tip = false;
let ring = false;

allOpen.addEventListener('click', () => {
	sendMIDIMessage(2, 0);
	tip = false;
	ring = false;
	changeIndicatorImage(tip, ring);
});

tipClosed.addEventListener('click', () => {
	sendMIDIMessage(0, 64);
	tip = tip ? false : true;
	changeIndicatorImage(tip, ring);
});

ringClosed.addEventListener('click', () => {
	sendMIDIMessage(1, 64);
	ring = ring ? false : true;
	changeIndicatorImage(tip, ring);
});

flip.addEventListener('click', () => {
	sendMIDIMessage(2, 64);
	tip = tip ? false : true;
	ring = ring ? false : true;
	changeIndicatorImage(tip, ring);
});

savePreset.addEventListener('click', () => {
	if (presetNumber.value >= 0 && presetNumber.value <= 127) {
		sendMIDIMessage(3, presetNumber.value);
	}
});

recallPreset.addEventListener('click', () => {
	if (presetNumber.value >= 0 && presetNumber.value <= 127) {
		sendMIDIMessage(6, presetNumber.value);
	}
});


// UX Feedback Functions
function changeIndicatorImage(tip, ring) {
	if (tip == true && ring == true) {
		clickImageIndicator.src = 'images/click-all-closed.png';
	} else if (tip == true && ring == false) {
		clickImageIndicator.src = 'images/click-tip-closed.png';
	} else if (tip == false && ring == true) {
		clickImageIndicator.src = 'images/click-ring-closed.png';
	} else if (tip == false && ring == false) {
		clickImageIndicator.src = 'images/click-all-open.png';
	}
}

function midiStatusMessage(access) {
	if (access) {
		let clickFound = false;
		for (let output of access.outputs.values()) {
			if (output.name === targetDeviceName) {
				midiStatus.textContent = 'CLiCK Online!';
				midiStatus.style.color = 'green';
				clickFound = true;
				break;
			}
		}
		if (!clickFound) {
			midiStatus.textContent = 'CLiCK Not Found!';
			midiStatus.style.color = 'red';
		}
	} else {
		midiStatus.textContent = 'Browser MIDI permissions not granted.';
		midiStatus.style.color = 'red';
	}
}


// MIDI Functions
const targetDeviceName = 'CLiCK';
let clickInitialized = false;
let midiAccess = null;


navigator.requestMIDIAccess()
	.then(onMIDISuccess, onMIDIFailure);

function initializeClick() {
	sendMIDIMessage(2, 0);
	clickInitialized = true;
}

function onMIDISuccess(access) {
	midiAccess = access;
	midiStatusMessage(midiAccess);
	initializeClick();
	console.log('MIDI access obtained');

	// Listen for state changes on MIDI ports
	midiAccess.onstatechange = function(event) {
		const port = event.port;
		const state = port.state;

		if (state === 'connected') {
			// Check if the connected device is the target device (CLiCK)
			if (port.name === targetDeviceName) {
				console.log(`MIDI port connected: ${port.name}`);
				midiStatusMessage(midiAccess);
				if (!clickInitialized) {
					initializeClick();
				}
			}
		} else if (state === 'disconnected') {
			console.log(`MIDI port disconnected: ${port.name}`);
			// Check if the disconnected device is the target device (CLiCK)
			if (port.name === targetDeviceName) {
				midiStatusMessage(midiAccess);
				clickInitialized = false;
			}
		}
	};
}

function onMIDIFailure() {
	midiAccess = null;
	midiStatusMessage(midiAccess);
}

function sendMIDIMessage(control, value) {
	if (midiAccess) {
		const outputs = midiAccess.outputs.values();
		for (let output of outputs) {
			output.send([0xB0, control, value]); // CC message
		}
	}
}






