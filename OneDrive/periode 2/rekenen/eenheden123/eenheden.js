const units = {
    "1D": {
        mm: 1,
        cm: 10,
        dm: 100,
        m: 1000,
        dam: 10000,
        hm: 100000,
        km: 1000000
    },
    "2D": {
        "mm²": 1,
        "cm²": 100,
        "dm²": 10000,
        "m²": 1000000,
        "dam²": 100000000,
        "hm²": 10000000000,
        "km²": 1000000000000
    },
    "3D": {
        "mm³": 1,
        "cm³": 1000,
        "dm³": 1000000,
        "m³": 1000000000,
        "dam³": 1000000000000,
        "hm³": 1000000000000000,
        "km³": 1000000000000000000
    }
};

let correctAnswer = 0;
let correctCount = 0;
let wrongCount = 0;
let timerId = null;
let secondsLeft = 0;
let questionAnswered = false;

const questionInput = document.getElementById("question");
const answerInput = document.getElementById("answer");
const resultElement = document.getElementById("result");
const targetUnitElement = document.getElementById("targetUnit");
const dimensionSelect = document.getElementById("dimensionSelect");
const timerSelect = document.getElementById("timerSelect");
const timerDisplay = document.getElementById("timerDisplay");

function normalizeNumber(value) {
    return value.toString().replace(".", ",");
}

function formatAnswer(value) {
    if (Math.abs(value) >= 1000000 || (Math.abs(value) > 0 && Math.abs(value) < 0.000001)) {
        return normalizeNumber(value.toPrecision(8).replace(/\.?0+$/, ""));
    }

    return normalizeNumber(Number(value.toFixed(8)).toString());
}

function stopTimer() {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
}

function startTimer() {
    stopTimer();
    const selectedSeconds = Number(timerSelect.value);
    secondsLeft = selectedSeconds;

    if (selectedSeconds === 0) {
        timerDisplay.textContent = "--";
        return;
    }

    timerDisplay.textContent = selectedSeconds + " sec";
    timerId = setInterval(() => {
        secondsLeft--;
        timerDisplay.textContent = secondsLeft + " sec";

        if (secondsLeft <= 0) {
            stopTimer();
            if (!questionAnswered) {
                wrongCount++;
                document.getElementById("wrongScore").textContent = wrongCount;
                resultElement.textContent = "⏱ Tijd is om! Het juiste antwoord is " + formatAnswer(correctAnswer);
                resultElement.className = "result wrong";
                questionAnswered = true;
                answerInput.disabled = true;
            }
        }
    }, 1000);
}

function newQuestion() {
    stopTimer();
    questionAnswered = false;
    answerInput.disabled = false;
    answerInput.value = "";
    resultElement.textContent = "";
    resultElement.className = "result";
    answerInput.focus();

    const dimension = dimensionSelect.value;
    const unitNames = Object.keys(units[dimension]);
    let fromIndex = Math.floor(Math.random() * unitNames.length);
    let toIndex = Math.floor(Math.random() * unitNames.length);

    while (toIndex === fromIndex) {
        toIndex = Math.floor(Math.random() * unitNames.length);
    }

    const fromUnit = unitNames[fromIndex];
    const toUnit = unitNames[toIndex];
    const value = Math.floor(Math.random() * 9001) / 100 + 1;
    const factor = units[dimension][fromUnit] / units[dimension][toUnit];

    correctAnswer = value * factor;
    questionInput.value = formatAnswer(value) + " " + fromUnit;
    targetUnitElement.textContent = "Antwoord in " + toUnit;
    answerInput.dataset.unit = toUnit;
    startTimer();
}

function checkAnswer() {
    if (questionAnswered) {
        resultElement.textContent = "Klik op NIEUW voor de volgende som.";
        resultElement.className = "result";
        return;
    }

    const enteredValue = answerInput.value.trim().replace(",", ".");
    const userAnswer = Number(enteredValue);

    if (enteredValue === "" || !Number.isFinite(userAnswer)) {
        resultElement.textContent = "Vul eerst een getal in.";
        resultElement.className = "result wrong";
        return;
    }

    stopTimer();
    questionAnswered = true;
    answerInput.disabled = true;

    const tolerance = Math.max(Math.abs(correctAnswer) * 0.00001, 0.0000001);
    if (Math.abs(userAnswer - correctAnswer) <= tolerance) {
        correctCount++;
        document.getElementById("correctScore").textContent = correctCount;
        resultElement.textContent = "✓ Correct! Het antwoord is " + formatAnswer(correctAnswer) + " " + answerInput.dataset.unit;
        resultElement.className = "result correct";
    } else {
        wrongCount++;
        document.getElementById("wrongScore").textContent = wrongCount;
        resultElement.textContent = "✗ Fout. Het juiste antwoord is " + formatAnswer(correctAnswer) + " " + answerInput.dataset.unit;
        resultElement.className = "result wrong";
    }
}

document.getElementById("newQuestionButton").addEventListener("click", newQuestion);
document.getElementById("checkAnswerButton").addEventListener("click", checkAnswer);
dimensionSelect.addEventListener("change", newQuestion);
timerSelect.addEventListener("change", () => {
    if (questionInput.value) {
        startTimer();
    }
});

answerInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        checkAnswer();
    }
});

newQuestion();