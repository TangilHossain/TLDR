// Content script for Facebook Post Scraper
console.log('🚀 Facebook Post Scraper content script loaded');

// Auto-scraping variables
let autoScrapeInterval = null;
let isAutoScraping = false;
let apikey=null;

async function summarizePost(content, apiKey) {
    if (!apiKey) {
        apiKey = "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"; // Replace with your actual key
    }else{
        apiKey = apiKey;
    }
    // const siteUrl = "https://your-site-url.com";
    // const siteName = "Qwen3 Summary Tool";

const fewShotPrompt = `
    You are a helpful assistant that summarizes social media or blog posts. Your task is to generate a summary that is approximately one fourth the length of the original post.

    Instructions:
    - **Detect the language** of the input post automatically.
    - **Write the summary in the same language** as the original post.
    - Maintain the tone and intent of the original content.
    - If the post is in English, summarize in English.
    - If the post is in Bengali, summarize in Bengali.
    - Do not translate or switch languages.
    - Keep the summary concise and relevant.

    Example (Bengali):
    Post: সময়টা ছিলো ১৯৭৮ সাল। নির্বাচনী প্রচারে প্রেসিডেন্ট জিয়াউর রহমান গিয়েছিলেন গোপালগঞ্জে। কিন্তু গোপালগঞ্জ তাঁকে স্বাগত জানায়নি। মঞ্চে ওঠার আগেই স্থানীয় জনগণের তীব্র প্রতিক্রিয়া ও প্রতিরোধের মুখোমুখি হন তিনি। পরিস্থিতি এতটাই উত্তপ্ত হয়ে ওঠে যে, তাঁকে সেনাবাহিনীর হেলিকপ্টারে করে তাৎক্ষণিকভাবে খুলনায় সরিয়ে নেওয়া হয়। এই ঘটনা তখন সামরিক বাহিনীর মধ্যেও চাঞ্চল্যের জন্ম দেয়।
    স্বৈরশাসক এইচএম এরশাদ চেয়েছিলেন গোপালগঞ্জে ঢুকতে। পুরো রাষ্ট্রযন্ত্র এবং সেনাবাহিনী নিয়ন্ত্রণে থাকা সত্ত্বেও তিনি গোপালগঞ্জে ঢোকার সাহস পাননি। চেষ্টা করেও সফল হননি। গাড়ি ঘুড়িয়ে দেওয়া হয় নিরাপত্তা বেস্টনি করে। গোপালগঞ্জ আওয়ামী লীগ ছাড়া সবার জন্য ছিলো এক অদৃশ্য দেওয়াল।
    এখন দেখছি, সেই জায়গায় হাসনাত আবদুল্লাহ একটা লাঠি হাতে, গোখরো সাপের মতো ফোসফোস করতে করতে বারবার এগিয়ে যাচ্ছে........
    এটাই ইতিহাসের নির্মম ব্যঙ্গ। যেখানে জিয়া ও এরশাদ গণরোষে গোপালগঞ্জ থেকে ফেরত যান, সেখানে তারুণ্যের শক্তি শো ডাউন দিয়ে এসেছে।
    তাঁদের এ্যাপ্রিশিয়েট করা উচিৎ। এরা তো সাহস করে গেছে এবং গোপালগঞ্জের মাটিতে দাঁড়িয়ে বুক ফুলিয়ে গলা ফাটিয়ে "মুজিববাদ মুরদাবাদ" শ্লোগান দিয়ে এসেছে।
    অন্যান্য রাজনৈতিক দল ১৬ বছর যাওয়ার সাহসই করে নাই, দখল বাজি, চান্দা-ধান্ধায়ই আছে। এতটুকু সাহস ও হয় নাই।
    উপহাস করার আগে গোপালগঞ্জের মাটিতে গিয়ে বলে এসো, "মুজিববাদ মুর্দাবাদ"।

    Summary (Bengali):  
    ১৯৭৮ সালে জিয়া ও পরে এরশাদ গোপালগঞ্জে গিয়ে জনরোষে পিছু হটেন। সেই জায়গায় এখন তরুণরা সাহসিকতা দেখিয়ে "মুজিববাদ মুর্দাবাদ" স্লোগান দেয়, যা ইতিহাসের ব্যঙ্গাত্মক মোড়কে পরিবর্তনের ইঙ্গিত দেয়।

    Now summarize the following post:

    Post: ${content}  
    Summary:

    `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
                // "HTTP-Referer": siteUrl,
                // "X-Title": siteName
            },
            body: JSON.stringify({
                model: "qwen/qwen3-8b:free",
                messages: [
                    {
                        role: "user",
                        content: fewShotPrompt
                    }
                ]
            })
        });

        const data = await response.json();
        const summary = data.choices?.[0]?.message?.content;
        console.log("✅ Summary:", summary);
        return summary;

    } catch (error) {
        console.error("🔴 Error:", error);
        return null;
    }
}

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
    }, 1000); // 3 second delay
} else {
    console.log('⚠️ Not on Facebook, skipping button addition');
}

// Function to add scrape buttons to posts
function addScrapeButtonsToPosts() {
    console.log('🔘Adding scrape buttons to posts...');
    
    // Find all posts that might contain the target divs
    const allPosts = document.querySelectorAll('div[data-ad-rendering-role="story_message"]');
    
    allPosts.forEach((post, index) => {
        // Check if button already exists
        if (post.querySelector('.fb-scraper-button')) {
            return;
        }
        
        // Create scrape button
        const scrapeButton = document.createElement('button');
        scrapeButton.textContent = '🔍 Summarize';
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
        console.log(`🎯Scraping individual post ${postNumber}...`);
        
        // Add div immediately with loading state
        addScrapedContentDiv(postElement, postNumber, null);
        
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
        
        // Update div with actual summary
        updateScrapedContentDiv(postElement, postNumber, content);
        
        // Show notification
        // showNotification(`Post ${postNumber} scraped! Check console for content.`);
        
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
            // If div exists, don't create a new one
            return;
        }
        
        // Create new div with loading state
        const scrapedDiv = document.createElement('div');
        scrapedDiv.className = `scraped-content-${postNumber}`;
        scrapedDiv.style.cssText = `
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 25%, #90caf9 50%, #64b5f6 75%, #42a5f5 100%);
            background-size: 400% 400%;
            animation: gradientShift 4s ease infinite, fadeIn 0.5s ease;
            border: 2px solid #4267B2;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #1c1e21;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
        `;
        
        // Add loading content
        scrapedDiv.innerHTML = `
            <div style="font-weight: bold; color: #4267B2; margin-bottom: 10px;">
                📊 Summary:
            </div>
            <div class="summary-content">
                <div style="display: flex; align-items: center; color: #65676b;">
                    <div style="margin-right: 10px; animation: spin 1s linear infinite;">🔄</div>
                    <div class="loading-text">Generating summary<span class="loading-dots">...</span></div>
                </div>
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
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    25% { background-position: 100% 50%; }
                    50% { background-position: 50% 100%; }
                    75% { background-position: 0% 50%; }
                    100% { background-position: 50% 0%; }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                @keyframes loadingDots {
                    0%, 20% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .loading-text {
                    background: linear-gradient(90deg, #65676b 25%, #4267B2 50%, #65676b 75%);
                    background-size: 200% 100%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 2s ease-in-out infinite;
                    font-weight: 500;
                }
                .loading-dots {
                    animation: pulse 2s ease-in-out infinite;
                    color: #5f7aafff;
                    font-weight: bold;
                }
                .loading-dots::after {
                    content: '';
                    animation: loadingDots 1.5s infinite 0.5s;
                }
                .loading-dots::before {
                    content: '';
                    animation: loadingDots 1.5s infinite 1s;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Insert the div before the post element
        const postContainerElement = postElement.closest('div[data-ad-rendering-role="story_message"]').parentElement;
        postContainerElement.insertAdjacentElement('beforebegin', scrapedDiv);
        
        console.log(`✅ Added scraped content div for post ${postNumber}`);
    } catch (error) {
        console.error(`❌ Error adding scraped content div for post ${postNumber}:`, error);
    }
}

// Function to update scraped content div with actual summary
async function updateScrapedContentDiv(postElement, postNumber, content) {
    try {
        const postContainer = postElement.closest('div[data-ad-rendering-role="story_message"]').parentElement;
        // Get API key from chrome.storage
        chrome.storage.sync.get(['fbApiKey'], async function(result) {
            const apiKey = result.fbApiKey || null;
            let summary = await summarizePost(content, apiKey);

            const existingDiv = postContainer.parentElement.querySelector(`.scraped-content-${postNumber}`);
            if (existingDiv) {
                const summaryContentDiv = existingDiv.querySelector('.summary-content');
                if (summaryContentDiv) {
                    summaryContentDiv.innerHTML = summary || 'Failed to generate summary';
                }
                existingDiv.style.background = '#f0f2f5';
                existingDiv.style.animation = 'none';
                existingDiv.querySelector('div:nth-child(3) em').textContent = `Generated at: ${new Date().toLocaleTimeString()}`;
                console.log(`✅ Updated existing scraped content div for post ${postNumber}`);
            }
        });
    } catch (error) {
        console.error(`❌ Error updating scraped content div for post ${postNumber}:`, error);
        
        // Show error in the div if it exists
        const postContainer = postElement.closest('div[data-ad-rendering-role="story_message"]').parentElement;
        const existingDiv = postContainer.parentElement.querySelector(`.scraped-content-${postNumber}`);
        if (existingDiv) {
            const summaryContentDiv = existingDiv.querySelector('.summary-content');
            if (summaryContentDiv) {
                summaryContentDiv.innerHTML = '<div style="color: #dc3545;">❌ Failed to generate summary</div>';
            }
            
            // Remove gradient animation and apply static background even on error
            existingDiv.style.background = '#f0f2f5';
            existingDiv.style.animation = 'none';
        }
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
