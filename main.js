// -------------------------------------------------- ELEMENTS --------------------------------------------------
// #region
var calculatorMainValuesContainer = document.getElementById("calculatorMainValues");

var minBaseClockElement = document.getElementById("minBaseClock");
var maxBaseClockElement = document.getElementById("maxBaseClock");

var minRatioElement = document.getElementById("minRatio");
var maxRatioElement = document.getElementById("maxRatio");

var selectableRamClockElement = document.getElementById("selectableRamClock");
var addSelectableRamClockButton = document.getElementById("addSelectableRamClock");
var selectableRamClockMessageElement = document.getElementById("selectableRamClockMessage");

var useDefaultRamClocksButton = document.getElementById("useDefaultRamClocks");

var selectableRamClocksListElement = document.getElementById("selectableRamClocksList");

var resetFormButton = document.getElementById("resetForm");
var calculatePrimaryButton = document.getElementById("calculatePrimary");

var calculatorFineTuningContainer = document.getElementById("calculatorFineTuning");

// #########################################################################################

var overclockDataTableElement = document.getElementById("overclockDataTable");

var stableCpuClockElement = document.getElementById("stableCpuClock");
var unstableCpuClockElement = document.getElementById("unstableCpuClock");
var stableRamClockElement = document.getElementById("stableRamClock");
var unstableRamClockElement = document.getElementById("unstableRamClock");

var hideSlowerThanCpuElement = document.getElementById("hideSlowerThanCpu");
var hideSlowerThanRamElement = document.getElementById("hideSlowerThanRam");

var backToStartButton = document.getElementById("backToStart");
var fineTuningCalculateButton = document.getElementById("fineTuningCalculate");

var fineTuningCalculateTextElement = document.getElementById("fineTuningCalculateText");
// #endregion



// -------------------------------------------------- VARIABLES --------------------------------------------------
// #region
var minBaseClock = 50;
var maxBaseClock = 300;

var minRatio = 1;
var maxRatio = 98;

var selectableRamClocks = [];
var defaultSelectableRamClocks = [1866, 2133, 2400, 2667, 2800, 2933, 3000, 3066, 3200, 3466, 3600, 3733, 3866, 4000, 4133, 4266, 4400, 4466, 4533, 4600, 4866, 5000, 5100];

// ###############################################################################

var stableCpuClock = 1;
var unstableCpuClock = 99999;
var stableRamClock = 1;
var unstableRamClock = 99999;

var hideSlowerThanCpu = 500;
var hideSlowerThanRam = 500;
// #endregion



// -------------------------------------------------- FUNCTIONS --------------------------------------------------
// #region
function updateSelectableRamClockList() { // Updating the selectable RAM clock list
	var selectableRamClockListCode = "";
	for (i = 0; i < selectableRamClocks.length; i++) {
		selectableRamClockListCode = `
			${selectableRamClockListCode}
			<div>
				<button onclick="removeSelectableRamClock(event)">X</button> | <span>${selectableRamClocks[i]}</span> MHz
			</div>
		`;
	}
	selectableRamClocksListElement.innerHTML = selectableRamClockListCode;
}

function useDefaultRamClocks() { // Setting selectable RAM clocks to pre-defined list
	selectableRamClocks = defaultSelectableRamClocks.slice();
	updateSelectableRamClockList();

	saveToLocalStorage();
}

function addSelectableRamClock() { // Manually adding a selectable RAM clock

	// Get current value from input field and sanitize it
	var frequency = Math.min(Math.max(Number(selectableRamClockElement.value), 1), 99999);

	// Abort if duplicate
	if (selectableRamClocks.indexOf(frequency) != -1) {
		selectableRamClockElement.focus();
		selectableRamClockMessageElement.style.color = "darkred";
		selectableRamClockMessageElement.innerText = `${frequency} MHz already exists!`;
		return;
	}

	// Insert into array
	selectableRamClocks.push(frequency);

	// Update selectable RAM clock list
	updateSelectableRamClockList();

	// Focus and clear input field
	selectableRamClockElement.value = "";
	selectableRamClockElement.focus();

	// Success message
	selectableRamClockMessageElement.style.color = "darkgreen";
	selectableRamClockMessageElement.innerText = `Successfully added ${frequency} MHz`;

	saveToLocalStorage();
}

function removeSelectableRamClock(event) { // Removing a selectable RAM clock
	var clock = Number(event.target.parentElement.querySelector("span").innerText);
	var clockIndex = selectableRamClocks.indexOf(clock);
	if (clockIndex != -1) selectableRamClocks.splice(clockIndex, 1);
	updateSelectableRamClockList();
	saveToLocalStorage();
}

function saveToLocalStorage() { // Saving stringified json to local storage
	localStorage.setItem("pcbs-overclock-calculator", JSON.stringify({
		minBC: minBaseClock,
		maxBC: maxBaseClock,
		minR: minRatio,
		maxR: maxRatio,
		clocksList: selectableRamClocks,

		stabCpu: stableCpuClock,
		unstabCpu: unstableCpuClock,
		stabRam: stableRamClock,
		unstabRam: unstableRamClock,
		slowCpu: hideSlowerThanCpu,
		slowRam: hideSlowerThanRam
	}));
}

function updateMinBaseClock(event) {

	// Get required variables
	var input = Number(event.target.value);
	var max = Number(event.target.max);
	var min = Number(event.target.min);

	// Can't be below min or above max, also no decimals
	var newInput = Math.round(Math.max(Math.min(input, max), min));

	// Not matching, force update the input field
	if (input != newInput) {
		event.target.value = newInput;
		event.target.dispatchEvent(new Event("change"));
		return;
	}

	// Set the max base clock to +1 if not high enough, exit function here to prevent double saving
	if (Number(maxBaseClockElement.value) <= newInput) {
		maxBaseClockElement.value = newInput + 1;
		maxBaseClockElement.dispatchEvent(new Event("change"));
		return;
	}

	// Trigger saving
	minBaseClock = newInput;
	saveToLocalStorage();
}

function updateMaxBaseClock(event) {

	// Get required variables
	var input = Number(event.target.value);
	var max = Number(event.target.max);
	var min = Number(event.target.min);

	// Can't be below min or above max, also no decimals
	var newInput = Math.round(Math.max(Math.min(input, max), min));

	// Not matching, force update the input field
	if (input != newInput) {
		event.target.value = newInput;
		event.target.dispatchEvent(new Event("change"));
		return;
	}

	// Set the min base clock to -1 if not low enough, exit function here to prevent double saving
	if (Number(minBaseClockElement.value) >= newInput) {
		minBaseClockElement.value = newInput - 1;
		minBaseClockElement.dispatchEvent(new Event("change"));
		return;
	}

	// Trigger saving
	maxBaseClock = newInput;
	saveToLocalStorage();
}

function updateMinRatio(event) {

	// Get required variables
	var input = Number(event.target.value);
	var max = Number(event.target.max);
	var min = Number(event.target.min);

	// Can't be below min or above max, also only .25 steps
	var newInput = Math.round((Math.max(Math.min(input, max), min) * 4)) / 4;

	// Not matching, force update the input field
	if (input != newInput) {
		event.target.value = newInput;
		event.target.dispatchEvent(new Event("change"));
		return;
	}

	// Set the max ratio to +.25 if not high enough, exit function here to prevent double saving
	if (Number(maxRatioElement.value) <= newInput) {
		maxRatioElement.value = newInput + 0.25;
		maxRatioElement.dispatchEvent(new Event("change"));
		return;
	}

	// Trigger saving
	minRatio = newInput;
	saveToLocalStorage();
}

function updateMaxRatio(event) {

	// Get required variables
	var input = Number(event.target.value);
	var max = Number(event.target.max);
	var min = Number(event.target.min);

	// Can't be below min or above max, also only .25 steps
	var newInput = Math.round((Math.max(Math.min(input, max), min) * 4)) / 4;

	// Not matching, force update the input field
	if (input != newInput) {
		event.target.value = newInput;
		event.target.dispatchEvent(new Event("change"));
		return;
	}

	// Set the min ratio to -.25 if not low enough, exit function here to prevent double saving
	if (Number(minRatioElement.value) >= newInput) {
		minRatioElement.value = newInput - 0.25;
		minRatioElement.dispatchEvent(new Event("change"));
		return;
	}

	// Trigger saving
	maxRatio = newInput;
	saveToLocalStorage();
}

function resetForm() { // Resetting form and local storage
	localStorage.removeItem("pcbs-overclock-calculator");
	location.reload();
}

function switchToFineTuning() { // Switching to the secondary page

	// Don't run if selectable RAM clocks list is empty
	if (selectableRamClocks.length === 0) {
		selectableRamClockMessageElement.innerText = "You need to add selectable RAM clocks for the calculation to work!";
		selectableRamClockMessageElement.style.color = "darkred";
		return;
	}

	// Hiding main calculator and showing fine tuning calculator
	calculatorMainValuesContainer.style.display = "none";
	calculatorFineTuningContainer.removeAttribute("style");
}

function mainInit() { // Loading from local storage and adding event listeners

	var storageString = localStorage.getItem("pcbs-overclock-calculator");
	if (storageString != null) {
		var obj = JSON.parse(storageString);

		// Only accept defined values
		if (obj.minBC != undefined && obj.minBC != minBaseClock) {
			minBaseClock = obj.minBC;
			minBaseClockElement.value = minBaseClock;
			minBaseClockElement.dispatchEvent(new Event("change"));
		}
		if (obj.maxBC != undefined && obj.maxBC != maxBaseClock) {
			maxBaseClock = obj.maxBC;
			maxBaseClockElement.value = maxBaseClock;
			maxBaseClockElement.dispatchEvent(new Event("change"));
		}
		if (obj.minR != undefined && obj.minR != minRatio) {
			minRatio = obj.minR;
			minRatioElement.value = minRatio;
			minRatioElement.dispatchEvent(new Event("change"));
		}
		if (obj.maxR != undefined && obj.maxR != maxRatio) {
			maxRatio = obj.maxR;
			maxRatioElement.value = maxRatio;
			maxRatioElement.dispatchEvent(new Event("change"));
		}
		if (obj.clocksList != undefined) {
			selectableRamClocks = obj.clocksList;
			try {
				updateSelectableRamClockList();
			} catch(error) {
				console.debug(`Failed to update RAM clock list via local storage, reason: ${error}`);
				selectableRamClocks = [];
			}
		}

		if (obj.stabCpu != undefined && obj.stabCpu != stableCpuClock) {
			stableCpuClock = obj.stabCpu;
			stableCpuClockElement.value = stableCpuClock;
			stableCpuClockElement.dispatchEvent(new Event("change"));
		}
		if (obj.unstabCpu != undefined && obj.unstabCpu != unstableCpuClock) {
			unstableCpuClock = obj.unstabCpu;
			unstableCpuClockElement.value = unstableCpuClock;
			unstableCpuClockElement.dispatchEvent(new Event("change"));
		}
		if (obj.stabRam != undefined && obj.stabRam != stableRamClock) {
			stableRamClock = obj.stabRam;
			stableRamClockElement.value = stableRamClock;
			stableRamClockElement.dispatchEvent(new Event("change"));
		}
		if (obj.unstabRam != undefined && obj.unstabRam != unstableRamClock) {
			unstableRamClock = obj.unstabRam;
			unstableRamClockElement.value = unstableRamClock;
			unstableRamClockElement.dispatchEvent(new Event("change"));
		}
		if (obj.slowCpu != undefined && obj.slowCpu != hideSlowerThanCpu) {
			hideSlowerThanCpu = obj.slowCpu;
			hideSlowerThanCpuElement.value = hideSlowerThanCpu;
			hideSlowerThanCpuElement.dispatchEvent(new Event("change"));
		}
		if (obj.slowRam != undefined && obj.slowRam != hideSlowerThanRam) {
			hideSlowerThanRam = obj.slowRam;
			hideSlowerThanRamElement.value = hideSlowerThanRam;
			hideSlowerThanRamElement.dispatchEvent(new Event("change"));
		}

		updateSelectableRamClockList();
	}

	minBaseClockElement.addEventListener("change", updateMinBaseClock);
	maxBaseClockElement.addEventListener("change", updateMaxBaseClock);
	minRatioElement.addEventListener("change", updateMinRatio);
	maxRatioElement.addEventListener("change", updateMaxRatio);
	addSelectableRamClockButton.addEventListener("click", addSelectableRamClock);
	useDefaultRamClocksButton.addEventListener("click", useDefaultRamClocks);
	resetFormButton.addEventListener("click", resetForm);
	calculatePrimaryButton.addEventListener("click", switchToFineTuning);
}
// #endregion



// -------------------------------------------------- ON CONTENT LOAD --------------------------------------------------
// #region
window.addEventListener("DOMContentLoaded", mainInit);
// #endregion
