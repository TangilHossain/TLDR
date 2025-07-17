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

// Check if we're on Facebook and get button status
document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('facebook.com')) {
        updateStatus('Please navigate to Facebook first!');
        return;
    }
    
    updateStatus('Scrape buttons are available on each post! Click them to scrape individual posts.');
    
    // Add buttons to posts if not already added
    setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, {action: 'addButtons'}, (response) => {
            if (chrome.runtime.lastError) {
                updateStatus('Extension loading... Refresh the page if buttons don\'t appear.');
            } else if (response && response.success) {
                updateStatus('Scrape buttons added to posts! Click any button to scrape that post.');
            }
        });
    }, 1000);
});



// Update status function
function updateStatus(message) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

document.getElementById('saveApiKey').onclick = function() {
    const apiKey = document.getElementById('apiKey').value;
    chrome.storage.sync.set({ fbApiKey: apiKey }, function() {
        document.getElementById('status').textContent = 'API Key saved!';
    });
};