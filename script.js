document.addEventListener("DOMContentLoaded", function () {
    const startScreen = document.getElementById("start-screen");
    const rangeEditor = document.getElementById("range-editor");
    const createRangeButton = document.getElementById("create-range");
    const saveRangeButton = document.getElementById("save-range");
    const positionSelect = document.getElementById("position-select");
    const rangeContainer = document.getElementById("range-container");
    const savedRangesContainer = document.getElementById("saved-ranges");
    const rangeNameInput = document.getElementById("range-name");
    const quickSelectButtons = document.getElementById("quick-select-buttons");
    const coverageDisplay = document.getElementById("coverage-percentage");

    let currentPosition = "early";
    let currentRange = {};
    let savedRanges = JSON.parse(localStorage.getItem("pokerRanges")) || [];

    const ranks = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
    const hands = [];

    ranks.forEach((r1, i) => {
        ranks.forEach((r2, j) => {
            if (i < j) hands.push(r1 + r2 + "s");
            else if (i > j) hands.push(r2 + r1 + "o");
            else hands.push(r1 + r2);
        });
    });

    function createGrid() {
        rangeContainer.innerHTML = "";
        hands.forEach((hand) => {
            const div = document.createElement("div");
            div.classList.add("hand-box");
            div.textContent = hand;
            div.dataset.hand = hand;
            div.addEventListener("click", () => toggleHand(hand, div));
            if (currentRange[hand]) div.classList.add("selected");
            rangeContainer.appendChild(div);
        });
        updateCoverage();
    }

    function toggleHand(hand, div) {
        if (currentRange[hand]) {
            delete currentRange[hand];
            div.classList.remove("selected");
        } else {
            currentRange[hand] = true;
            div.classList.add("selected");
        }
        updateCoverage();
    }

    function isSuited(hand) {
        return hand.endsWith("s");
    }

    function selectCategory(category) {
        hands.forEach((hand) => {
            if (matchesCategory(hand, category) && category != "clear") {
                currentRange[hand] = true;
            } else if (category == "clear") {
                currentRange[hand] = false
            }
        });
        createGrid();
    }

    function matchesCategory(hand, category) {
        const highCard = ranks.indexOf(hand[1]);
        const lowCard = ranks.indexOf(hand[0]);

        console.log(`${highCard} ${lowCard} suited: ${isSuited(hand)}`)

        if (category === "clear") return false;
        if (category === "pockets") return hand[0] === hand[1];
        if (category === "suited-connectors") return isSuited(hand) && highCard - lowCard === 1;
        if (category === "suited-one-gappers") return isSuited(hand) && highCard - lowCard === 2;
        if (category === "A2s+") return hand.startsWith("A") && isSuited(hand);
        if (category === "A2+") return hand.startsWith("A");
        return false;
    }

    function saveRange() {
        const rangeName = rangeNameInput.value.trim();
        if (!rangeName) {
            alert("Please enter a range name.");
            return;
        }
        
        const existingIndex = savedRanges.findIndex(range => range.name === rangeName);
        if (existingIndex !== -1) {
            savedRanges[existingIndex] = { name: rangeName, position: currentPosition, hands: { ...currentRange } };
        } else {
            savedRanges.push({ name: rangeName, position: currentPosition, hands: { ...currentRange } });
        }
        localStorage.setItem("pokerRanges", JSON.stringify(savedRanges));
        displaySavedRanges();
        rangeEditor.classList.add("hidden");
        startScreen.classList.remove("hidden");
    }

    function updateCoverage() {
        const selectedHands = Object.keys(currentRange).length;
        const totalHands = hands.length;
        const percentage = ((selectedHands / totalHands) * 100).toFixed(2);
        coverageDisplay.textContent = `Coverage: ${percentage}%`;
    }

    function displaySavedRanges() {
        savedRangesContainer.innerHTML = "";
        savedRanges.forEach((range, index) => {
            const div = document.createElement("div");
            div.classList.add("saved-range");
            div.textContent = `${range.name} (${range.position})`;
            div.addEventListener("click", () => loadRange(index));
            savedRangesContainer.appendChild(div);
        });
    }

    function loadRange(index) {
        const range = savedRanges[index];
        currentRange = { ...range.hands };
        rangeNameInput.value = range.name;
        positionSelect.value = range.position;
        currentPosition = range.position;
        createGrid();
        rangeEditor.classList.remove("hidden");
        startScreen.classList.add("hidden");
    }

    quickSelectButtons.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", () => selectCategory(button.dataset.category));
    });
    
    createRangeButton.addEventListener("click", () => {
        currentRange = {};
        rangeNameInput.value = "";
        positionSelect.value = "early";
        currentPosition = "early";
        createGrid();
        rangeEditor.classList.remove("hidden");
        startScreen.classList.add("hidden");
    });

    saveRangeButton.addEventListener("click", saveRange);
    positionSelect.addEventListener("change", (e) => {
        currentPosition = e.target.value;
        createGrid();
    });
    
    displaySavedRanges();
});
