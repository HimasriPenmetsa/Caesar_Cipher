// ===============================
// Element References
// ===============================
const form = document.getElementById("controls");
const inputText = document.getElementById("input-text");
const outputText = document.getElementById("output-text");
const shiftKey = document.getElementById("shift-input");
const modulo = document.getElementById("mod-input");
const alphabet = document.getElementById("alphabet-input");
const letterCase = document.getElementById("letter-case");
const foreignChars = document.getElementById("foreign-chars");
const inputHeading = document.getElementById("input-heading");
const outputHeading = document.getElementById("output-heading");
const selectEncodeOrDecode = document.querySelectorAll('input[name="code"]');
let inputChart, outputChart;

// ===============================
// Heading Update on Mode Change
// ===============================
selectEncodeOrDecode.forEach((option) => {
	option.addEventListener("change", () => {
		const selected = document.querySelector('input[name="code"]:checked').value;
		inputHeading.textContent = selected === "encode" ? "Plaintext" : "Ciphertext";
		outputHeading.textContent = selected === "encode" ? "Ciphertext" : "Plaintext";
		inputText.value = "";
		outputText.value = "";
	});
});

// ===============================
// Cipher Logic
// ===============================
function caesarCipher(decode, text, shift, mod, charset, foreignOption) {
	if (decode === "decode") {
		shift = -shift;
	}
	if (foreignOption === 1) {
		text = removeForeignChars(text);
	}
	charset = charset.toLowerCase();
	let result = "";

	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		const lowerChar = char.toLowerCase();
		const index = charset.indexOf(lowerChar);

		if (index !== -1) {
			let newIndex = (index + shift) % mod;
			if (newIndex < 0) newIndex += mod;

			let cipherChar = charset[newIndex];
			cipherChar = char === lowerChar ? cipherChar : cipherChar.toUpperCase();
			result += cipherChar;
		} else {
			result += char;
		}
	}

	return result;
}

function removeForeignChars(input) {
	return input.replace(/[^a-zA-Z0-9 ]/g, "");
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "toast show";
    setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}

function validateShiftInput(value) {
    return /^\d+$/.test(value);
}

function validateModInput(value) {
    return /^\d+$/.test(value) && parseInt(value) !== 0;
}

document.getElementById("shift-input").addEventListener("input", function () {
    const value = this.value.trim();
    if (!validateShiftInput(value)) {
        showToast("Shift must be a positive number.");
    }
});

document.getElementById("mod-input").addEventListener("input", function () {
    const value = this.value.trim();
    if (!validateModInput(value)) {
        showToast("Modulo must be a non-zero number.");
    }
});

// ===============================
// Output Updater
// ===============================
function updateOutput() {
	const inputTextValue = inputText.value;
	const selectedOption = Array.from(selectEncodeOrDecode).find(opt => opt.checked)?.value || "encode";
	const shiftValue = parseInt(shiftKey.value, 10);
	const moduloValue = parseInt(modulo.value, 10);
	const alphabetValue = alphabet.value;
	const letterCaseValue = parseInt(letterCase.value, 10);
	const foreignCharsValue = parseInt(foreignChars.value, 10);

	let cipherOutput = caesarCipher(selectedOption, inputTextValue, shiftValue, moduloValue, alphabetValue, foreignCharsValue);

	// Apply case setting
	if (letterCaseValue === 2) {
		cipherOutput = cipherOutput.toLowerCase();
	} else if (letterCaseValue === 3) {
		cipherOutput = cipherOutput.toUpperCase();
	}

	outputText.value = cipherOutput;
	updateCharts();
}

// ===============================
// Event Listeners for Live Update
// ===============================
inputText.addEventListener("input", updateOutput);
shiftKey.addEventListener("input", updateOutput);
modulo.addEventListener("input", updateOutput);
alphabet.addEventListener("input", updateOutput);
letterCase.addEventListener("change", updateOutput);
foreignChars.addEventListener("change", updateOutput);
selectEncodeOrDecode.forEach(opt => opt.addEventListener("change", updateOutput));

// ===============================
// Copy to Clipboard
// ===============================
document.getElementById("copy-btn").addEventListener("click", () => {
	const text = outputText.value;
	navigator.clipboard.writeText(text).then(() => {
		alert("Ciphertext copied to clipboard!");
	}).catch(err => {
		console.error("Copy failed:", err);
		alert("Failed to copy text.");
	});
});

// ===============================
// Dark Mode Toggle
// ===============================
document.getElementById('dark-toggle').addEventListener('change', function() {
	document.body.classList.toggle('dark-mode', this.checked);

	// Apply to charts
	if (inputChart) applyDarkModeToChart(inputChart, this.checked);
	if (outputChart) applyDarkModeToChart(outputChart, this.checked);
});


// ===============================
// Frequency Chart Logic
// ===============================
function getFrequencyMap(text, alphabet) {
	const freq = {};
	for (const char of alphabet) freq[char] = 0;
	for (const ch of text.toLowerCase()) {
		if (ch in freq) freq[ch]++;
	}
	return Object.values(freq);
}

function updateCharts() {
	const alphabetVal = alphabet.value.toLowerCase();
	const inputVal = inputText.value;
	const outputVal = outputText.value;

	const inputFreq = getFrequencyMap(inputVal, alphabetVal);
	const outputFreq = getFrequencyMap(outputVal, alphabetVal);

	const chartData = {
		labels: alphabetVal.split(""),
		datasets: [{
			label: 'Frequency',
			backgroundColor: '#4e73df',
			borderColor: '#4e73df',
			data: inputFreq,
		}]
	};

	const outputData = {
		labels: alphabetVal.split(""),
		datasets: [{
			label: 'Frequency',
			backgroundColor: '#1cc88a',
			borderColor: '#1cc88a',
			data: outputFreq,
		}]
	};

	if (!inputChart) {
		inputChart = new Chart(document.getElementById('input-chart'), {
			type: 'bar',
			data: chartData,
			options: {
				responsive: true,
				plugins: {
					legend: { display: false }
				},
				scales: {
                    x: {
                        ticks: {
                            autoSkip: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
				}
			}
		});
	} else {
		inputChart.data.datasets[0].data = inputFreq;
		inputChart.update();
	}

	if (!outputChart) {
		outputChart = new Chart(document.getElementById('output-chart'), {
			type: 'bar',
			data: outputData,
			options: {
				responsive: true,
				plugins: {
					legend: { display: false }
				},
				scales: {
                    x: {
                        ticks: {
                            autoSkip: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
				}
			}
		});
	} else {
		outputChart.data.datasets[0].data = outputFreq;
		outputChart.update();
	}
}

// ===============================
// Chart Dark Mode Support
// ===============================
function applyDarkModeToChart(chart, isDarkMode) {
	const textColor = isDarkMode ? '#FFFFFF' : '#000000';
	const gridColor = isDarkMode ? '#444444' : '#e0e0e0';

	chart.options.scales = {
		x: {
			ticks: { color: textColor },
			grid: { color: gridColor }
		},
		y: {
			ticks: { color: textColor },
			grid: { color: gridColor }
		}
	};

	chart.options.plugins = {
		legend: {
			labels: { color: textColor }
		}
	};

	chart.update();
}

// ===============================
// Caesar Crack (Brute-force)
// ===============================
function caesarCrack(cipherText) {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let results = [];

	for (let shift = 0; shift < 26; shift++) {
		let decrypted = "";

		for (let char of cipherText) {
			const isUpper = char === char.toUpperCase();
			const charUpper = char.toUpperCase();

			if (alphabet.includes(charUpper)) {
				let idx = (alphabet.indexOf(charUpper) - shift + 26) % 26;
				let decryptedChar = alphabet[idx];
				decrypted += isUpper ? decryptedChar : decryptedChar.toLowerCase();
			} else {
				decrypted += char;
			}
		}

		results.push(`Shift ${shift}: ${decrypted}`);
	}

	return results.join("\n");
}

// ===============================
// Crack Button Listener
// ===============================
document.getElementById('crack-btn').addEventListener('click', () => {
	const cipherText = document.getElementById('crack-input').value;
	if (!cipherText.trim()) {
		alert("Please enter ciphertext to crack.");
		return;
	}
	const output = caesarCrack(cipherText);
	document.getElementById('crack-output').value = output;
});

// ===============================
// Initialize Output on Load
// ===============================
updateOutput();
