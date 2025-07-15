// Content script for Facebook Post Scraper
console.log('🚀 Facebook Post Scraper content script loaded');

// Auto-scraping variables
let autoScrapeInterval = null;
let isAutoScraping = false;

// Function to scrape Facebook posts
function scrapeFacebookPosts() {
    try {
        console.log('📊 Scraping Facebook posts...');
        
        if (document.readyState !== 'complete') {
            console.log('⏳ Page not ready yet...');
            return '<!-- Page not ready -->';
        }
        
        // Clone the body so we don't modify live DOM
        const bodyClone = document.body.cloneNode(true);

        // Remove unwanted tags to clean it up
        bodyClone.querySelectorAll('script, a').forEach(el => el.remove());

        // Select all divs with the attribute data-ad-rendering-role="story_message"
        const targetDivs = bodyClone.querySelectorAll('div[data-ad-rendering-role="story_message"]');
        console.log(`🔍 Found ${targetDivs.length} target divs`);

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
        console.error('❌ Scraping error:', error);
        return `<!-- Error: ${error.message} -->`;
    }
}

// Function to start automatic scraping
function startAutoScraping() {
    if (isAutoScraping) {
        console.log('⚠️ Auto-scraping already running');
        return;
    }
    
    isAutoScraping = true;
    console.log('🚀 Auto-scraping started - running every 1 second in background');
    
    // Wait for page to be ready, then start scraping
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                console.log('📱 Page loaded, starting scraping...');
                scrapeFacebookPosts();
                startInterval();
            }, 2000); // Wait 2 seconds for page to fully load
        });
    } else {
        console.log('📱 Page already loaded, starting scraping...');
        scrapeFacebookPosts();
        startInterval();
    }
}

// Function to start the interval
function startInterval() {
    if (autoScrapeInterval) {
        clearInterval(autoScrapeInterval);
    }
    
    autoScrapeInterval = setInterval(() => {
        scrapeFacebookPosts();
    }, 1000); // 1 second interval
}

// Function to stop automatic scraping
function stopAutoScraping() {
    if (autoScrapeInterval) {
        clearInterval(autoScrapeInterval);
        autoScrapeInterval = null;
        isAutoScraping = false;
        console.log('🛑 Auto-scraping stopped');
    } else {
        console.log('⚠️ Auto-scraping was not running');
    }
}

// Start automatic scraping when page loads
if (window.location.hostname.includes('facebook.com')) {
    console.log('📘 Facebook detected, starting automatic background scraping...');
    
    // Start scraping after a short delay to ensure page is loaded
    setTimeout(() => {
        startAutoScraping();
    }, 3000); // 3 second delay
} else {
    console.log('⚠️ Not on Facebook, skipping auto-scraping');
}

// Listen for page navigation changes (for single-page app behavior)
let currentUrl = window.location.href;
setInterval(() => {
    if (currentUrl !== window.location.href) {
        currentUrl = window.location.href;
        if (window.location.hostname.includes('facebook.com')) {
            console.log('📘 Facebook page changed, restarting scraping...');
            stopAutoScraping();
            setTimeout(() => {
                startAutoScraping();
            }, 2000);
        }
    }
}, 1000);

// Listen for messages from popup (for manual control)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrape') {
        try {
            const result = scrapeFacebookPosts();
            sendResponse({success: true, posts: result});
        } catch (error) {
            console.error('Content script error:', error);
            sendResponse({success: false, error: error.message});
        }
    } else if (request.action === 'startAutoScraping') {
        startAutoScraping();
        sendResponse({success: true, message: 'Auto-scraping started'});
    } else if (request.action === 'stopAutoScraping') {
        stopAutoScraping();
        sendResponse({success: true, message: 'Auto-scraping stopped'});
    } else if (request.action === 'getStatus') {
        sendResponse({success: true, isRunning: isAutoScraping});
    }
    return true; // Keep the message channel open for async response
});

// Utility functions
function cleanText(text) {
    return text
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/\n+/g, ' ')  // Replace newlines with spaces
        .trim();
}

function generatePostId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Auto-scroll functionality for loading more posts
function autoScroll() {
    return new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
                clearInterval(timer);
                resolve();
            }
        }, 100);
    });
}

// Export functions for popup use
window.scrapeFacebookPosts = scrapeFacebookPosts;
window.autoScroll = autoScroll;
