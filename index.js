const logDiv = document.getElementsByClassName('log')[0]
const statusDiv = document.getElementsByClassName('status')[0]
const startBtn = document.getElementsByClassName('start-btn')[0]
const stopBtn = document.getElementsByClassName('stop-btn')[0]
const clearLogBtn = document.getElementsByClassName('clear-log-btn')[0];
const downloadLogBtn = document.getElementsByClassName('download-log-btn')[0];
const pauseBtn = document.getElementsByClassName('pause-btn')[0];
const resumeBtn = document.getElementsByClassName('resume-btn')[0];
const typingSpeedDiv = document.getElementsByClassName('typing-speed')[0];

let isLogging = false;
let logEntries = [];
let startTime = null;
let charCount = 0;
let isPaused = false;

let typingSpeedInterval = setInterval(updateTypingSpeed, 1000);


startBtn.addEventListener("click", () => {
    if (!isLogging) {
        isLogging = true;
        startTime = new Date();
        document.addEventListener("keydown", handleDown);
        document.addEventListener("keyup", handleUp);
        statusDiv.textContent = "Status: Logging";
        startBtn.disabled = true;
        stopBtn.disabled = false;
        pauseBtn.disabled = false;
        typingSpeedInterval = setInterval(updateTypingSpeed, 1000);
    }
});

stopBtn.addEventListener("click", () => {
    if (isLogging) {
        isLogging = false;
        document.removeEventListener("keydown", handleDown);
        document.removeEventListener("keyup", handleUp);
        statusDiv.textContent = "Status: Not Logging";
        clearInterval(typingSpeedInterval);
    }
});

pauseBtn.addEventListener("click", () => {
    if (isLogging && !isPaused) {
        isPaused = true;
        document.removeEventListener("keydown", handleDown);
        document.removeEventListener("keyup", handleUp);
        statusDiv.textContent = "Status: Paused";
        resumeBtn.disabled = false;
        pauseBtn.disabled = true;
    }
});

resumeBtn.addEventListener("click", () => {
    if (isLogging && isPaused) {
        isPaused = false;
        document.addEventListener("keydown", handleDown);
        document.addEventListener("keyup", handleUp);
        statusDiv.textContent = "Status: Logging";
        resumeBtn.disabled = true;
        pauseBtn.disabled = false;
    }
});

clearLogBtn.addEventListener("click", () => {
    logDiv.innerHTML = "";
    logEntries = [];
    charCount = 0;
    localStorage.removeItem('keyLog');
    updateDownloadButtonState();
    updateTypingSpeed();
    startBtn.disabled = false;
    if (isLogging) {
        document.addEventListener("keydown", handleDown);
        document.addEventListener("keyup", handleUp);
    }
});

downloadLogBtn.addEventListener("click", () => {
    const blob = new Blob([logEntries.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob)
    console.log(url, "url");
    const a = document.createElement('a');
    a.href = url;
    console.log(url)
    a.download = 'key-log.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

function handleDown(e) {
    if (isPaused) return;
    const logEntry = `${new Date().toLocaleTimeString()} - Key ${e.key} is pressed`;
    logDiv.innerHTML += `<div>${logEntry}</div>`;
    logEntries.push(logEntry);
    charCount++;
    localStorage.setItem('keyLog', JSON.stringify(logEntries));
    updateDownloadButtonState();
}

function handleUp(e) {
    if (isPaused) return;
    const logEntry = `${new Date().toLocaleTimeString()} - Key ${e.key} is released`;
    logDiv.innerHTML += `<div>${logEntry}</div>`;
    logEntries.push(logEntry);
    localStorage.setItem('keyLog', JSON.stringify(logEntries));
}

function updateDownloadButtonState() {
    downloadLogBtn.disabled = logEntries.length === 0;
}

function updateTypingSpeed() {
    if (!isLogging) {
        typingSpeedDiv.textContent = `Typing Speed: 0 WPM`;
        return;
    }
    const elapsedTime = (new Date() - startTime) / 60000; // in minutes
    const wpm = Math.round(charCount / 5 / elapsedTime);
    typingSpeedDiv.textContent = `Typing Speed: ${wpm} WPM`;
}

// Load log from localStorage if available
window.addEventListener('load', () => {
    const savedLog = JSON.parse(localStorage.getItem('keyLog'));
    if (savedLog && savedLog.length > 0) {
        logEntries = savedLog;
        logEntries.forEach(entry => logDiv.innerHTML += `<div>${entry}</div>`);
        charCount = logEntries.filter(entry => entry.includes('pressed')).length;
        updateDownloadButtonState();
        updateTypingSpeed();
    }
});

