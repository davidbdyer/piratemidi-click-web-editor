const allOpen = document.querySelector('#all-open');
const tipClosed = document.querySelector('#tip-closed');
const ringClosed = document.querySelector('#ring-closed');

const savePreset = document.querySelector('#save-preset');
const recallPreset = document.querySelector('#recall-preset');
const presetNumber = document.querySelector('input', '#preset-number');


savePreset.addEventListener('click',() => {
	if (presetNumber.value >= 0 && presetNumber.value <= 127) {
		sendMIDIMessage(3, presetNumber.value);
	}
});

recallPreset.addEventListener('click',() => {
	if (presetNumber.value >= 0 && presetNumber.value <= 127) {
		sendMIDIMessage(6, presetNumber.value);
	}
});

allOpen.addEventListener('click', () => sendMIDIMessage(2, 0));
tipClosed.addEventListener('click', () => sendMIDIMessage(0, 64));
ringClosed.addEventListener('click', () => sendMIDIMessage(1, 64))



let midiAccess = null;

navigator.requestMIDIAccess()
	.then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(access) {
	midiAccess = access;
	console.log('MIDI access obtained');
}

function onMIDIFailure() {
	console.log('Could not access your MIDI devices.');
}

function sendMIDIMessage(control, value) {
	if (midiAccess) {
		const outputs = midiAccess.outputs.values();
		for (let output of outputs) {
			output.send([0xB0, control, value]); // CC message
		}
	}
}





