// Content script for Facebook Post Scraper
console.log('Facebook Post Scraper content script loaded');

// Auto-scraping variables
let autoScrapeInterval = null;
let isAutoScraping = false;

// Start automatic scraping when page loads
if (window.location.hostname.includes('facebook.com')) {
    console.log('Facebook detected, starting automatic scraping...');
    startAutoScraping();
}

// Function to start automatic scraping
function startAutoScraping() {
    if (isAutoScraping) return;
    
    isAutoScraping = true;
    console.log('Auto-scraping started - running every 1 second');
    
    // Initial scrape
    scrapeFacebookPostsContent();
    
    // Set interval for continuous scraping
    autoScrapeInterval = setInterval(() => {
        scrapeFacebookPostsContent();
    }, 1000); // 1 second interval
}

// Function to stop automatic scraping
function stopAutoScraping() {
    if (autoScrapeInterval) {
        clearInterval(autoScrapeInterval);
        autoScrapeInterval = null;
        isAutoScraping = false;
        console.log('Auto-scraping stopped');
    }
}

// Modified scraping function for content script
function scrapeFacebookPostsContent() {
    try {
        if (document.readyState !== 'complete') {
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

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrape') {
        try {
            const posts = scrapeFacebookPostsContent();
            sendResponse({success: true, posts: posts});
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
    }
});

// Enhanced scraping function with better selectors
function scrapeFacebookPosts() {
  const posts = [];
  
  try {
    // Wait for page to load
    if (document.readyState !== 'complete') {
      console.log('Page not fully loaded, waiting...');
      return [];
    }
    
    // Modern Facebook feed selectors
    const feedSelectors = [
      '[role="feed"]',
      '[data-pagelet="FeedUnit_0"]',
      '[data-pagelet^="FeedUnit_"]',
      '#stream_pagelet',
      '#timeline_story_container'
    ];
    
    let feedContainer = null;
    for (const selector of feedSelectors) {
      feedContainer = document.querySelector(selector);
      if (feedContainer) break;
    }
    
    if (!feedContainer) {
      console.warn('Feed container not found');
      return [];
    }
    
    // Find individual posts
    const postSelectors = [
      '[role="article"]',
      '[data-testid="fbfeed_story"]',
      '.userContentWrapper',
      '[data-ft]',
      'div[data-testid="story-root-element"]'
    ];
    
    let postElements = [];
    for (const selector of postSelectors) {
      postElements = feedContainer.querySelectorAll(selector);
      if (postElements.length > 0) break;
    }
    
    console.log(`Found ${postElements.length} potential posts`);
    
    // Process each post
    for (let i = 0; i < Math.min(postElements.length, 15); i++) {
      const postElement = postElements[i];
      
      try {
        const postData = extractPostData(postElement);
        
        if (postData && postData.content && postData.content.length > 10) {
          posts.push(postData);
        }
      } catch (error) {
        console.warn('Error processing post:', error);
      }
    }
    
    console.log(`Successfully scraped ${posts.length} posts`);
    return posts;
    
  } catch (error) {
    console.error('Scraping error:', error);
    return [];
  }
}

function extractPostData(postElement) {
  const postData = {
    id: generatePostId(),
    timestamp: new Date().toISOString(),
    author: extractAuthor(postElement),
    content: extractContent(postElement),
    likes: extractEngagement(postElement, 'like'),
    comments: extractEngagement(postElement, 'comment'),
    shares: extractEngagement(postElement, 'share'),
    postTime: extractPostTime(postElement),
    postUrl: extractPostUrl(postElement),
    images: extractImages(postElement),
    hashtags: extractHashtags(postElement)
  };
  
  return postData;
}

function extractAuthor(post) {
  const authorSelectors = [
    'strong[data-testid="post-author"]',
    'h3 a[role="link"]',
    'strong a[role="link"]',
    '[data-testid="post-author"] strong',
    '.userContentWrapper strong a',
    'a[role="link"] strong',
    'span[dir="auto"] strong'
  ];
  
  for (const selector of authorSelectors) {
    const element = post.querySelector(selector);
    if (element && element.textContent.trim()) {
      return element.textContent.trim();
    }
  }
  
  return 'Unknown Author';
}

function extractContent(post) {
  const contentSelectors = [
    '[data-testid="post-text"]',
    '[data-ad-preview="message"]',
    '.userContent',
    '[data-testid="post-message"]',
    '.text_exposed_root',
    'div[data-testid="post-text"] span',
    'div[dir="auto"][style*="text-align: start"]'
  ];
  
  for (const selector of contentSelectors) {
    const element = post.querySelector(selector);
    if (element && element.textContent.trim()) {
      return cleanText(element.textContent.trim());
    }
  }
  
  // Fallback method
  const allText = post.textContent || '';
  const lines = allText.split('\n').filter(line => line.trim().length > 0);
  
  // Find content that looks like a post
  const contentLine = lines.find(line => 
    line.length > 20 && 
    !line.includes('Like') && 
    !line.includes('Comment') && 
    !line.includes('Share') &&
    !line.includes('ago') &&
    !line.includes('·') &&
    !line.includes('Follow')
  );
  
  return contentLine ? cleanText(contentLine) : cleanText(allText.substring(0, 300));
}

function extractEngagement(post, type) {
  const patterns = {
    like: /(\d+(?:,\d+)*)\s*(?:likes?|reactions?)/i,
    comment: /(\d+(?:,\d+)*)\s*comments?/i,
    share: /(\d+(?:,\d+)*)\s*shares?/i
  };
  
  const text = post.textContent || '';
  const match = text.match(patterns[type]);
  
  if (match) {
    return parseInt(match[1].replace(/,/g, ''));
  }
  
  // Try aria-labels
  const ariaSelectors = [
    `[aria-label*="${type}"]`,
    `[aria-label*="${type.charAt(0).toUpperCase() + type.slice(1)}"]`
  ];
  
  for (const selector of ariaSelectors) {
    const element = post.querySelector(selector);
    if (element) {
      const ariaText = element.getAttribute('aria-label') || '';
      const ariaMatch = ariaText.match(/(\d+)/);
      if (ariaMatch) return parseInt(ariaMatch[1]);
    }
  }
  
  return 0;
}

function extractPostTime(post) {
  const timeSelectors = [
    'abbr[data-utime]',
    'time',
    '[data-testid="story-subtitle"] a',
    'span[id*="timestamp"]',
    'a[href*="/posts/"] abbr',
    'a[href*="/permalink/"] abbr'
  ];
  
  for (const selector of timeSelectors) {
    const element = post.querySelector(selector);
    if (element) {
      const utime = element.getAttribute('data-utime');
      const datetime = element.getAttribute('datetime');
      const text = element.textContent.trim();
      
      if (utime) {
        return new Date(parseInt(utime) * 1000).toISOString();
      } else if (datetime) {
        return datetime;
      } else if (text) {
        return text;
      }
    }
  }
  
  return null;
}

function extractPostUrl(post) {
  const linkSelectors = [
    'a[href*="/posts/"]',
    'a[href*="/permalink/"]',
    'a[href*="/story.php"]',
    'a[href*="/photo.php"]'
  ];
  
  for (const selector of linkSelectors) {
    const element = post.querySelector(selector);
    if (element && element.href) {
      return element.href;
    }
  }
  
  return null;
}

function extractImages(post) {
  const images = [];
  const imgElements = post.querySelectorAll('img[src]');
  
  imgElements.forEach(img => {
    const src = img.src;
    if (src && !src.includes('emoji') && !src.includes('icon')) {
      images.push({
        url: src,
        alt: img.alt || ''
      });
    }
  });
  
  return images;
}

function extractHashtags(post) {
  const text = post.textContent || '';
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  const hashtags = text.match(hashtagRegex);
  
  return hashtags || [];
}

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
