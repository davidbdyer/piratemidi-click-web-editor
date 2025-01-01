const clickImageIndicator = document.querySelector('#click-image-indicator');
const midiStatus = document.querySelector('#midi-status');

const allOpen = document.querySelector('#all-open');
const tip = document.querySelector('#tip');
const ring = document.querySelector('#ring');
const flip = document.querySelector('#flip');

const savePreset = document.querySelector('#save-preset');
const recallPreset = document.querySelector('#recall-preset');
const presetNumber = document.querySelector('#preset-number');
const recallPresetNumber = document.querySelectorAll('.recall-preset-number');
const autoProgram = document.querySelector('#auto-program-0-2');




// UX Event Listeners
let tipState = false;
let ringState = false;

// ------------- //
// Relay Controls
// ------------- //

/**
 * Handles the click event for the "all open" button. 
 * Sends a MIDI message to set the tip and ring to the open state.
 * Updates the indicator image accordingly.
 */
allOpen.addEventListener('click', () => {
	sendMIDIMessage(2, 0);
	tipState = false;
	ringState = false;
	// changeIndicatorImage(tip, ring);
});

/**
 * Handles the click event for the "tip closed" button.
 * Sends a MIDI message to set the tip to the closed state.
 * Updates the indicator image accordingly.
 */
tip.addEventListener('click', () => {
	sendMIDIMessage(0, 64);
	tipState = tipState ? false : true;
	// changeIndicatorImage(tip, ring);
});

/**
 * Handles the click event for the "ring closed" button.
 * Sends a MIDI message to set the ring to the closed state.
 * Updates the indicator image accordingly.
 */
ring.addEventListener('click', () => {
	sendMIDIMessage(1, 64);
	ringState = ringState ? false : true;
	// changeIndicatorImage(tip, ring);
});

/**
 * Handles the click event for the "flip" button.
 * Sends a MIDI message to set both the tip and ring to the opposite state.
 * Updates the indicator image accordingly.
 */
flip.addEventListener('click', () => {
	sendMIDIMessage(2, 64);
	tipState = tipState ? false : true;
	ringState = ringState ? false : true;
	// changeIndicatorImage(tip, ring);
});

// ---------------------- //
// Recall and save presets
// ---------------------- //

/**
 * Handles the click event for the "save preset" button.
 * Sends a MIDI message to save the current state to the selected preset number.
 * The preset number must be between 0 and 127 (inclusive).
 */
savePreset.addEventListener('click', () => {
	if (presetNumber.value >= 0 && presetNumber.value <= 127) {
		sendMIDIMessage(3, presetNumber.value);
	}
});

/**
 * Handles the click event for the "recall preset" button.
 * Sends a MIDI message to recall the state from the selected preset number.
 * The preset number must be between 0 and 127 (inclusive).
 */
recallPreset.addEventListener('click', () => {
	if (presetNumber.value >= 0 && presetNumber.value <= 127) {
		sendMIDIMessage(6, presetNumber.value);
	}
});

/**
 * Attaches a click event listener to each "recall preset" button.
 * When a button is clicked, it retrieves the preset number from the button's
 * "data-preset-number" attribute and sends a MIDI message to recall the
 * state from the selected preset number.
 */
recallPresetNumber.forEach((button) => {
	button.addEventListener('click', () => {
		const preset = button.getAttribute('data-preset-number');
		sendMIDIMessage(6, preset);
	});
});

autoProgram.addEventListener('click', () => {
	// recall preset 0
	sendMIDIMessage(6, 0);
	// tip open ring open
	sendMIDIMessage(2, 0);
	// save preset 0
	sendMIDIMessage(3, 0);
	// recall preset 1
	sendMIDIMessage(6, 1);
	// tip closed ring open
	sendMIDIMessage(0, 127);
	// save preset 1
	sendMIDIMessage(3, 1);
	// recall preset 2
	sendMIDIMessage(6, 2);
	// tip closed ring open
	sendMIDIMessage(0, 0);
	sendMIDIMessage(1, 127);
	// save preset 2
	sendMIDIMessage(3, 2);
});


// UX Feedback Functions
/**
 * Updates the indicator image based on the current state of the tip and ring.
 * @param {boolean} tip - The state of the tip (true for closed, false for open).
 * @param {boolean} ring - The state of the ring (true for closed, false for open).
 */
function changeIndicatorImage(tip, ring) {
	if (tip == true && ring == true) {
		clickImageIndicator.src = '../images/click-all-closed.png';
	} else if (tip == true && ring == false) {
		clickImageIndicator.src = '../images/click-tip-closed.png';
	} else if (tip == false && ring == true) {
		clickImageIndicator.src = '../images/click-ring-closed.png';
	} else if (tip == false && ring == false) {
		clickImageIndicator.src = '../images/click-all-open.png';
	}
}

/**
 * Updates the MIDI status message based on the availability of the target MIDI device.
 * @param {MIDIAccess} access - The MIDI access object obtained from the browser.
 */
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

// ------------- //
// MIDI Functions
// ------------- //

const targetDeviceName = 'CLiCK';
let clickInitialized = false;
let midiAccess = null;


navigator.requestMIDIAccess()
	.then(onMIDISuccess, onMIDIFailure);

/**
 * Initializes the CLiCK device by setting both relays to open.
 * This function also sets the `clickInitialized` flag to true.
 */
function initializeClick() {
	sendMIDIMessage(2, 0);
	clickInitialized = true;
}

/**
 * Handles the successful acquisition of MIDI access from the browser.
 * It sets the `midiAccess` variable, updates the MIDI status message,
 * initializes the CLiCK device, and logs a message to the console.
 * It also sets up a listener for MIDI port state changes, which
 * handles the connection and disconnection of the target MIDI device.
 * @param {MIDIAccess} access - The MIDI access object obtained from the browser.
 */
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

/**
 * Handles the failure to acquire MIDI access from the browser.
 * It sets the `midiAccess` variable to `null` and updates the MIDI status message.
 */
function onMIDIFailure() {
	midiAccess = null;
	midiStatusMessage(midiAccess);
}

/**
 * Sends a MIDI control change (CC) message to all available MIDI outputs.
 * @param {number} control - The MIDI control number (0-127).
 * @param {number} value - The MIDI control value (0-127).
 */
function sendMIDIMessage(control, value) {
	if (midiAccess) {
		const outputs = midiAccess.outputs.values();
		for (let output of outputs) {
			output.send([0xB0, control, value]); // CC message
		}
	}
}






