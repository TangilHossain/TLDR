// Global variables
let scrapingInterval = null;

// Function to scrape Facebook posts
function scrapeFacebookPosts() {
    try {
        if (document.readyState !== 'complete') {
            console.log('Page not ready yet...');
            return;
        }
        
        // Clone the body so we don't modify live DOM
        const bodyClone = document.body.cloneNode(true);

        // Remove unwanted tags to clean it up
        bodyClone.querySelectorAll('script, a').forEach(el => el.remove());

        // Select all divs with the attribute data-ad-rendering-role="story_message"
        const targetDivs = bodyClone.querySelectorAll('div[data-ad-rendering-role="story_message"]');

        // Serialize the selected divs
        let content = '';
        let index = 1;
        
        targetDivs.forEach(div => {
            const targetspans = div.querySelectorAll('span[dir="auto"]');
            targetspans.forEach(span => {
                content += `<!-- Post ${index} -->\n${span.innerText}\n\n`;
            });
            index++;
        });

        if (!content) {
            content = '<!-- No matching <div> elements found -->';
        }
        
        // Log with timestamp
        console.log(`[${new Date().toLocaleTimeString()}] Facebook Posts:`, content);
        
        return content;
    } catch (error) {
        console.error('Scraping error:', error);
        return null;
    }
}

// Start automatic scraping
async function startAutoScraping() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('facebook.com')) {
        updateStatus('Please navigate to Facebook first!');
        return;
    }
    
    updateStatus('Auto-scraping started (every 1 second)');
    
    // Initial scrape
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeFacebookPosts
    });
    
    // Set up interval to scrape every second
    scrapingInterval = setInterval(() => {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: scrapeFacebookPosts
        });
        updateStatus(`Auto-scraping... (${new Date().toLocaleTimeString()})`);
    }, 1000); // 1 second interval
}

// Check if we're on Facebook and get background scraping status
document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('facebook.com')) {
        updateStatus('Please navigate to Facebook first!');
        return;
    }
    
    updateStatus('🔄 Checking background scraping status...');
    
    // Add a delay to ensure content script is loaded
    setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, {action: 'getStatus'}, (response) => {
            if (chrome.runtime.lastError) {
                updateStatus('🔄 Content script loading... Try starting manually.');
                console.log('Content script not ready:', chrome.runtime.lastError.message);
            } else if (response && response.success) {
                if (response.isRunning) {
                    updateStatus('✅ Background scraping is already running every 1 second!');
                } else {
                    updateStatus('⏸️ Background scraping is not running. Click Start to begin.');
                }
            } else {
                updateStatus('🔄 Background scraping will start automatically...');
            }
        });
    }, 1000);
});

// Manual trigger button
document.getElementById('grabHtml').addEventListener('click', async() => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('facebook.com')) {
        updateStatus('Please navigate to Facebook first!');
        return;
    }

    updateStatus('🔄 Performing manual scrape...');

    chrome.tabs.sendMessage(tab.id, {action: 'scrape'}, (response) => {
        if (chrome.runtime.lastError) {
            // Content script not loaded, try direct injection
            console.log('Content script not found, using direct injection...');
            
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: scrapeFacebookPosts
            }, () => {
                if (chrome.runtime.lastError) {
                    updateStatus('❌ Manual scrape failed: ' + chrome.runtime.lastError.message);
                } else {
                    updateStatus('✅ Manual scrape completed (check console)!');
                }
            });
        } else if (response && response.success) {
            updateStatus('✅ Manual scrape completed!');
        } else {
            updateStatus('❌ Manual scrape failed!');
        }
    });
});

// Start scraping button
document.getElementById('startScraping').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('facebook.com')) {
        updateStatus('Please navigate to Facebook first!');
        return;
    }
    
    updateStatus('🔄 Starting background scraping...');
    
    // Try to send message to content script
    chrome.tabs.sendMessage(tab.id, {action: 'startAutoScraping'}, (response) => {
        if (chrome.runtime.lastError) {
            // Content script not loaded, try to inject it
            console.log('Content script not found, injecting...');
            
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            }, () => {
                if (chrome.runtime.lastError) {
                    updateStatus('❌ Failed to inject content script: ' + chrome.runtime.lastError.message);
                } else {
                    // Try again after injection
                    setTimeout(() => {
                        chrome.tabs.sendMessage(tab.id, {action: 'startAutoScraping'}, (response) => {
                            if (response && response.success) {
                                updateStatus('✅ Background scraping started (every 1 second)');
                            } else {
                                updateStatus('❌ Failed to start background scraping');
                            }
                        });
                    }, 1000);
                }
            });
        } else if (response && response.success) {
            updateStatus('✅ Background scraping started (every 1 second)');
        } else {
            updateStatus('❌ Failed to start background scraping');
        }
    });
});

// Stop scraping button
document.getElementById('stopScraping').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('facebook.com')) {
        updateStatus('Please navigate to Facebook first!');
        return;
    }
    
    updateStatus('🔄 Stopping background scraping...');
    
    chrome.tabs.sendMessage(tab.id, {action: 'stopAutoScraping'}, (response) => {
        if (chrome.runtime.lastError) {
            updateStatus('⚠️ Content script not found - scraping may already be stopped');
        } else if (response && response.success) {
            updateStatus('⏹️ Background scraping stopped');
        } else {
            updateStatus('❌ Failed to stop background scraping');
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