document.addEventListener('DOMContentLoaded', async () => {
    const activeCard = document.getElementById('activeCard');
    const setSection = document.getElementById('setSection');
    const countdownTimer = document.getElementById('countdownTimer');
    const cancelBtn = document.getElementById('cancelBtn');
    const statusDiv = document.getElementById('status');
    const customInput = document.getElementById('customMinutes');

    let countdownInterval = null;

    // Synthesize a clean, crisp click/beep sound using Web Audio API
    function playClickSound() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime); // Pitch
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);     // Soft volume
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.08);
        } catch (e) {
            // Ignore if audio context isn't allowed yet
        }
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    const alarmName = `close-tab-${tab.id}`;
    const existingAlarm = await chrome.alarms.get(alarmName);

    if (existingAlarm) {
        showActiveState(existingAlarm);
    } else {
        showSetState();
    }

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            playClickSound();
            const minutes = parseFloat(btn.getAttribute('data-minutes'));
            setTabExpiry(minutes);
        });
    });

    document.getElementById('setCustomBtn').addEventListener('click', () => {
        playClickSound();
        const val = parseFloat(customInput.value);
        if (isNaN(val) || val <= 0) {
            statusDiv.style.color = '#f43f5e';
            statusDiv.textContent = 'Enter valid minutes!';
            return;
        }
        setTabExpiry(val);
    });

    cancelBtn.addEventListener('click', async () => {
        playClickSound();
        await chrome.alarms.clear(alarmName);
        if (countdownInterval) clearInterval(countdownInterval);

        statusDiv.style.color = '#10b981';
        statusDiv.textContent = 'Timer canceled!';
        setTimeout(() => {
            showSetState();
            statusDiv.textContent = '';
        }, 800);
    });

    function setTabExpiry(minutes) {
        chrome.alarms.create(alarmName, { delayInMinutes: minutes });
        statusDiv.style.color = '#10b981';
        statusDiv.textContent = `Auto-close set for ${minutes}m!`;

        setTimeout(() => {
            window.close();
        }, 1000);
    }

    function showActiveState(alarm) {
        activeCard.style.display = 'block';
        setSection.style.display = 'none';

        if (countdownInterval) clearInterval(countdownInterval);

        const updateClock = () => {
            const remainingMs = alarm.scheduledTime - Date.now();

            if (remainingMs <= 0) {
                countdownTimer.textContent = '00:00';
                clearInterval(countdownInterval);
                return;
            }

            const totalSeconds = Math.floor(remainingMs / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;

            countdownTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        };

        updateClock();
        countdownInterval = setInterval(updateClock, 1000);
    }

    function showSetState() {
        activeCard.style.display = 'none';
        setSection.style.display = 'block';
    }
});