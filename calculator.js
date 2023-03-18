function generateTables() { // Generating the code for the tables
	const benchmarkStart = Date.now();

	// Creating variables
	var ratiosToProcess = [];
	var basesToProcess = [];
	var baseRatioArray = {};

	// Iterate all base clocks
	for (base = minBaseClock; base <= maxBaseClock; base++) {

		// Iterate all ratios
		for (ratio = minRatio; ratio <= maxRatio; ratio += 0.25) {

			// Check if CPU clock is within limits
			var cpuClock = base * ratio;
			if ((cpuClock + 1) < unstableCpuClock && cpuClock > (stableCpuClock - hideSlowerThanCpu)) {

				// Iterate RAM clocks from back to front to find the highest possible clock
				for (i = selectableRamClocks.length - 1; i >= 0; i--) {

					// Calculate current RAM clock
					var ramClock = selectableRamClocks[i] * (base / 100);

					// RAM is not too slow and not too fast
					if (ramClock > (stableRamClock - hideSlowerThanRam) && (ramClock + 1) < unstableRamClock) {

						// Add all info to baseRatioArray, ratiosToProcess and basesToProcess
						// Mainly adding to the other two arrays as well due to baseRatioArray being
						// mostly unsorted and I never had to deal with this so I'm taking the easy way out.
						// If anyone knows how to handle this better with readable code, do let me know.
						if (!(base in baseRatioArray)) baseRatioArray[base] = {};
						baseRatioArray[base][ratio] = {cpu: cpuClock, ram: ramClock};
						if (ratiosToProcess.indexOf(ratio) === -1) ratiosToProcess.push(ratio);
						if (basesToProcess.indexOf(base) === -1) basesToProcess.push(base);

						// End RAM clock iteration, go back to base > ratio iteration
						break;
					}
				}
			}
		}
	}

	// Sort the ratiosToProcess and basesToProcess arrays
	ratiosToProcess.sort((a, b) => {return a - b;});
	basesToProcess.sort((a, b) => {return a - b;});

	// Create table header
	var tableHeader = "";
	for (i = 0; i < ratiosToProcess.length; i++) {
		tableHeader = `
			${tableHeader}
			<th colspan="2">x${(ratiosToProcess[i]).toFixed(2)}</th>
		`;
	}

	// Create table body
	var tableBody = "";

	// Iterate all base clocks (rows) that have a value
	for (i = 0; i < basesToProcess.length; i++) {

		// Needs opening <tr> tags and first th tag
		tableBody = `
			${tableBody}
			<tr>
				<th>${basesToProcess[i]} MHz</th>
		`;

		// Iterate all ratios
		for (j = 0; j < ratiosToProcess.length; j++) {

			// If this cell (base row > ratio col) needs to be shown
			var cellText = `
				<td>---</td>
				<td>---</td>
			`;
			if (basesToProcess[i] in baseRatioArray) {
				if (ratiosToProcess[j] in baseRatioArray[basesToProcess[i]]) {
					cellText = `
						<td>${Math.round(baseRatioArray[basesToProcess[i]][ratiosToProcess[j]].cpu)} MHz</td>
						<td>${Math.round(baseRatioArray[basesToProcess[i]][ratiosToProcess[j]].ram)} MHz</td>
					`;
				}
			}

			// Add cell text to var
			tableBody = `
				${tableBody}
				${cellText}
			`;
		}

		// Needs closing </tr> tags
		tableBody = `
			${tableBody}
			</tr>
		`;
	}

	// Merge all the table data together
	var mergedTableCode = `
		<table>
			<thead>
				<tr>
					<th></th>
					${tableHeader}
				</tr>
			</thead>
			<tbody>
				${tableBody}
			</tbody>
		</table>
	`;

	// Setting on-page table
	overclockDataTableElement.innerHTML = mergedTableCode;

	// Just for benchmarking performance
	const benchmarkEnd = Date.now();

	// Updating little done notification
	fineTuningCalculateTextElement.style.color = "darkgreen";
	fineTuningCalculateTextElement.innerText = `Done! (${benchmarkEnd - benchmarkStart}ms)`;
}

function updateStableCpuClock(event) {

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

	// If unstable cpu clock is lower, warn user
	if (unstableCpuClock <= newInput) {
		fineTuningCalculateTextElement.style.color = "darkred";
		fineTuningCalculateTextElement.innerText = "Stable CPU speed can't be higher than unstable CPU speed!";
		fineTuningCalculateButton.setAttribute("disabled", "");
		return;
	}

	// Reset text and button
	fineTuningCalculateTextElement.innerText = "";
	fineTuningCalculateButton.removeAttribute("disabled");

	// Trigger saving
	stableCpuClock = newInput;
	saveToLocalStorage();
}

function updateUnstableCpuClock(event) {

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

	// If stable cpu clock is higher, warn user
	if (stableCpuClock >= newInput) {
		fineTuningCalculateTextElement.style.color = "darkred";
		fineTuningCalculateTextElement.innerText = "Unstable CPU speed can't be lower than stable CPU speed!";
		fineTuningCalculateButton.setAttribute("disabled", "");
		return;
	}

	// Reset text and button
	fineTuningCalculateTextElement.innerText = "";
	fineTuningCalculateButton.removeAttribute("disabled");

	// Trigger saving
	unstableCpuClock = newInput;
	saveToLocalStorage();
}

function updateStableRamClock(event) {

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

	// If unstable ram clock is lower, warn user
	if (unstableRamClock <= newInput) {
		fineTuningCalculateTextElement.style.color = "darkred";
		fineTuningCalculateTextElement.innerText = "Stable RAM speed can't be higher than unstable RAM speed!";
		fineTuningCalculateButton.setAttribute("disabled", "");
		return;
	}

	// Reset text and button
	fineTuningCalculateTextElement.innerText = "";
	fineTuningCalculateButton.removeAttribute("disabled");

	// Trigger saving
	stableRamClock = newInput;
	saveToLocalStorage();
}

function updateUnstableRamClock(event) {

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

	// If stable ram clock is higher, warn user
	if (stableRamClock >= newInput) {
		fineTuningCalculateTextElement.style.color = "darkred";
		fineTuningCalculateTextElement.innerText = "Unstable RAM speed can't be lower than stable RAM speed!";
		fineTuningCalculateButton.setAttribute("disabled", "");
		return;
	}

	// Reset text and button
	fineTuningCalculateTextElement.innerText = "";
	fineTuningCalculateButton.removeAttribute("disabled");

	// Trigger saving
	unstableRamClock = newInput;
	saveToLocalStorage();
}

function updateHideSlowerThanCpu(event) {

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

	// Trigger saving
	hideSlowerThanCpu = newInput;
	saveToLocalStorage();
}

function updateHideSlowerThanRam(event) {

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

	// Trigger saving
	hideSlowerThanRam = newInput;
	saveToLocalStorage();
}

function backToStart() {

	// Clear the table
	overclockDataTableElement.innerHTML = "";
	calculatorFineTuningContainer.style.display = "none";
	calculatorMainValuesContainer.removeAttribute("style");
}



stableCpuClockElement.addEventListener("change", updateStableCpuClock);
unstableCpuClockElement.addEventListener("change", updateUnstableCpuClock);
stableRamClockElement.addEventListener("change", updateStableRamClock);
unstableRamClockElement.addEventListener("change", updateUnstableRamClock);
hideSlowerThanCpuElement.addEventListener("change", updateHideSlowerThanCpu);
hideSlowerThanRamElement.addEventListener("change", updateHideSlowerThanRam);
backToStartButton.addEventListener("click", backToStart);
fineTuningCalculateButton.addEventListener("click", generateTables);