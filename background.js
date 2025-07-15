// Background script for Facebook Post Scraper
console.log('Facebook Post Scraper background script loaded');

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Facebook Post Scraper installed');
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.action === 'scrapeData') {
    // Handle scraping request
    handleScrapeRequest(request, sender, sendResponse);
    return true; // Will respond asynchronously
  }
});

async function handleScrapeRequest(request, sender, sendResponse) {
  try {
    // You can add additional background processing here
    // For now, we'll just forward the response
    sendResponse({success: true, message: 'Background processing complete'});
  } catch (error) {
    console.error('Background processing error:', error);
    sendResponse({success: false, error: error.message});
  }
}

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('facebook.com')) {
    console.log('Facebook tab loaded:', tab.url);
    
    // Inject content script if not already injected
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(error => {
      // Script might already be injected, ignore error
      console.log('Content script injection result:', error.message);
    });
  }
});

// Handle storage events
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.posts) {
    console.log('Posts data updated:', changes.posts.newValue?.length || 0, 'posts');
  }
});

// Utility function to clean up old data
async function cleanupOldData() {
  try {
    const result = await chrome.storage.local.get(['posts']);
    const posts = result.posts || [];
    
    // Keep only posts from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPosts = posts.filter(post => {
      const postDate = new Date(post.timestamp);
      return postDate >= thirtyDaysAgo;
    });
    
    if (recentPosts.length !== posts.length) {
      await chrome.storage.local.set({posts: recentPosts});
      console.log(`Cleaned up ${posts.length - recentPosts.length} old posts`);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Run cleanup daily
setInterval(cleanupOldData, 24 * 60 * 60 * 1000); // 24 hours
