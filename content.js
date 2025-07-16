const {res} = require('./ai');



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
    console.log('📘 Facebook detected, adding scrape buttons to posts...');
    
    // Only add buttons, no automatic scraping
    setTimeout(() => {
        addScrapeButtonsToPosts();
    }, 3000); // 3 second delay
} else {
    console.log('⚠️ Not on Facebook, skipping button addition');
}

// Function to add scrape buttons to posts
function addScrapeButtonsToPosts() {
    console.log('🔘 Adding scrape buttons to posts...');
    
    // Find all posts that might contain the target divs
    const allPosts = document.querySelectorAll('div[data-ad-rendering-role="story_message"]');
    
    allPosts.forEach((post, index) => {
        // Check if button already exists
        if (post.querySelector('.fb-scraper-button')) {
            return;
        }
        
        // Create scrape button
        const scrapeButton = document.createElement('button');
        scrapeButton.textContent = '🔍 Scrape';
        scrapeButton.className = 'fb-scraper-button';
        scrapeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #4267B2, #365899);
            color: white;
            border: none;
            border-radius: 20px;
            padding: 6px 12px;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        
        // Add hover effect
        scrapeButton.onmouseover = function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        };
        
        scrapeButton.onmouseout = function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
        };
        
        // Add click event to scrape individual post
        scrapeButton.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            scrapeIndividualPost(post, index + 1);
        };
        
        // Make the parent container relative for absolute positioning
        const parentContainer = post.closest('div');
        if (parentContainer) {
            parentContainer.style.position = 'relative';
            parentContainer.appendChild(scrapeButton);
        }
    });
    
    console.log(`✅ Added scrape buttons to ${allPosts.length} posts`);
}

// Function to scrape individual post
function scrapeIndividualPost(postElement, postNumber) {
    try {
        console.log(`🎯 Scraping individual post ${postNumber}...`);
        
        // Extract content from this specific post
        const targetspans = postElement.querySelectorAll('span[dir="auto"]');
        let content = '';
        
        targetspans.forEach(span => {
            content += `${span.innerText}\n`;
        });
        
        if (!content) {
            content = 'No content found in this post';
        }
        
        // Log the scraped content
        console.log(`[${new Date().toLocaleTimeString()}] Individual Post ${postNumber}:`, content);
        
        // Add div with scraped content under the post
        addScrapedContentDiv(postElement, postNumber, content);
        
        // Show notification
        showNotification(`Post ${postNumber} scraped! Check console for content.`);
        
        return content;
    } catch (error) {
        console.error(`❌ Error scraping post ${postNumber}:`, error);
        showNotification(`Error scraping post ${postNumber}!`);
        return null;
    }
}

// Function to add scraped content div under post
function addScrapedContentDiv(postElement, postNumber, content) {
    try {
        // Get the post container where the div will be inserted
        const postContainer = postElement.closest('div[data-ad-rendering-role="story_message"]').parentElement;
        
        // Check if div already exists (look for it after the post container)
        const existingDiv = postContainer.parentElement.querySelector(`.scraped-content-${postNumber}`);
        if (existingDiv) {
            // Update existing div content instead of creating new one
            existingDiv.querySelector('div:nth-child(2)').textContent = content;
            existingDiv.querySelector('div:nth-child(3) em').textContent = `Generated at: ${new Date().toLocaleTimeString()}`;
            console.log(`✅ Updated existing scraped content div for post ${postNumber}`);
            return;
        }
        
        // Create new div with scraped content
        const scrapedDiv = document.createElement('div');
        scrapedDiv.className = `scraped-content-${postNumber}`;
        scrapedDiv.style.cssText = `
            background: #f0f2f5;
            border: 2px solid #4267B2;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #1c1e21;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            animation: fadeIn 0.5s ease;
        `;
        
        // Add lorem ipsum content
        scrapedDiv.innerHTML = `
            <div style="font-weight: bold; color: #4267B2; margin-bottom: 10px;">
                📊 Scraped Content for Post ${postNumber}
            </div>
            <div>
                ${content}    
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: #65676b;">
                <em>Generated at: ${new Date().toLocaleTimeString()}</em>
            </div>
        `;
        
        // Add fade-in animation if not already added
        if (!document.getElementById('scraped-content-styles')) {
            const style = document.createElement('style');
            style.id = 'scraped-content-styles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Insert the div after the post element
        const postContainerElement = postElement.closest('div[data-ad-rendering-role="story_message"]').parentElement;
        postContainerElement.insertAdjacentElement('afterend', scrapedDiv);
        
        console.log(`✅ Added scraped content div for post ${postNumber}`);
    } catch (error) {
        console.error(`❌ Error adding scraped content div for post ${postNumber}:`, error);
    }
}

// Function to show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4267B2, #365899);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    
    // Add CSS animation
    if (!document.getElementById('fb-scraper-styles')) {
        const style = document.createElement('style');
        style.id = 'fb-scraper-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Function to continuously add buttons to new posts
function continuouslyAddButtons() {
    setInterval(() => {
        addScrapeButtonsToPosts();
    }, 2000); // Check every 2 seconds for new posts
}

// Start continuous button adding
if (window.location.hostname.includes('facebook.com')) {
    setTimeout(() => {
        continuouslyAddButtons();
    }, 5000); // Start after 5 seconds
}

// Listen for page navigation changes (for single-page app behavior)
let currentUrl = window.location.href;
setInterval(() => {
    if (currentUrl !== window.location.href) {
        currentUrl = window.location.href;
        if (window.location.hostname.includes('facebook.com')) {
            console.log('📘 Facebook page changed, adding buttons to new posts...');
            setTimeout(() => {
                addScrapeButtonsToPosts();
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
    } else if (request.action === 'addButtons') {
        addScrapeButtonsToPosts();
        sendResponse({success: true, message: 'Buttons added to posts'});
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


module.exports = {
  content
};