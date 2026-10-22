chrome.alarms.onAlarm.addListener((alarm) => {
    console.log("🔔 Alarm triggered:", alarm.name);

    if (alarm.name.startsWith('close-tab-')) {
        const tabIdStr = alarm.name.replace('close-tab-', '');
        const tabId = parseInt(tabIdStr, 10);

        console.log(`🗑️ Attempting to close tab ID: ${tabId}`);

        chrome.tabs.remove(tabId, () => {
            if (chrome.runtime.lastError) {
                console.error("❌ Error closing tab:", chrome.runtime.lastError.message);
            } else {
                console.log(`✅ Successfully closed tab ID: ${tabId}`);
            }
        });
    }
});