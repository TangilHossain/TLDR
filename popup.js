// Check if we're on Facebook and update status
document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('facebook.com')) {
        updateStatus('Please navigate to Facebook first!');
        return;
    }
    
    updateStatus('Auto-scraping is running every 1 second in the background!');
    
    // Send message to content script to ensure auto-scraping is active
    chrome.tabs.sendMessage(tab.id, {action: 'startAutoScraping'}, (response) => {
        if (response && response.success) {
            updateStatus('Auto-scraping confirmed active (every 1 second)');
        }
    });
});

// Manual trigger button
document.getElementById('grabHtml').addEventListener('click', async() => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('facebook.com')) {
        updateStatus('Please navigate to Facebook first!');
        return;
    }

    chrome.tabs.sendMessage(tab.id, {action: 'scrape'}, (response) => {
        if (response && response.success) {
            updateStatus('Manual scrape completed!');
        } else {
            updateStatus('Manual scrape failed!');
        }
    });
});

// Stop scraping button
document.getElementById('stopScraping').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, {action: 'stopAutoScraping'}, (response) => {
        if (response && response.success) {
            updateStatus('Auto-scraping stopped');
        }
    });
});

// Update status function
function updateStatus(message) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = message;
    }
}