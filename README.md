# Facebook Post Summarizer Chrome Extension

A Chrome extension that Summarize facebook Posts.

## Features

- 🔍 **Smart Post Detection**: Automatically identifies Facebook posts using multiple selector strategies
- 📊 **Summary Generation**: Can generate summary of the post
- 👤 **Multi Lingual Support**: Can support both Bengali & English
<!-- - 📅 **Timestamp Data**: Records when posts were created
- 🖼️ **Media Detection**: Identifies images and media in posts
- 🏷️ **Hashtag Extraction**: Finds and extracts hashtags from post content
- 💾 **Data Storage**: Saves scraped data locally with Chrome storage
- 📥 **Export Function**: Export data to JSON format
- 🎨 **Modern UI**: Beautiful gradient interface with smooth animations -->

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your Chrome toolbar

## Usage

1. Navigate to Facebook.com
2. Click on the extension icon in your Chrome toolbar
3. Paste your api key in the popup window
4. Reload the facebook tab
5. Press the summarize button to "summarize" any post and wait 5 to 10 seconds
6. If generation is failed, press "summaraize" button again and wait 5 to 10 seconds

<!-- ## Data Structure

Each scraped post contains:

```json
{
  "id": "unique-post-id",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "author": "Post Author Name",
  "content": "Post content text...",
  "likes": 123,
  "comments": 45,
  "shares": 6,
  "postTime": "2024-01-01T00:00:00.000Z",
  "postUrl": "https://facebook.com/post/url",
  "images": [
    {
      "url": "image-url",
      "alt": "image description"
    }
  ],
  "hashtags": ["#hashtag1", "#hashtag2"]
}
``` -->

## Privacy and Ethics

⚠️ **Important Notes:**

- This extension is for educational and research purposes only
- Always respect Facebook's Terms of Service and robots.txt
- Do not use this tool to violate privacy or scrape personal data without consent
- Be mindful of rate limiting and avoid excessive use of api key
- Consider the ethical implications of data collection

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: 
  - `activeTab`: Access to current tab
  - `scripting`: Inject content scripts
  - `storage`: Local data storage
- **Host Permissions**: Facebook domains only
- **Architecture**: 
  - Background script for persistence
  - Content script for DOM manipulation
  - Popup interface for user interaction

## Limitations

- Facebook frequently updates their DOM structure, which may break selectors
- Some posts may not be accessible due to privacy settings
- Rate limiting by Openrouter may prevent scraping large amounts of data
- The extension works best with public posts and pages

<!-- ## Troubleshooting

### Generation failed
- Make sure you're on a Facebook page with visible posts
- Try scrolling down to load more posts
- Check if posts are public and visible

### Extension not working
- Refresh the Facebook page
- Disable and re-enable the extension
- Check Chrome console for errors

### Data not exporting
- Make sure you have scraped some posts first
- Check if your browser allows downloads

## Development

To modify or extend the extension:

1. Edit the source files as needed
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes -->

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this extension.

## License

This project is for educational purposes. Please use responsibly and in accordance with Facebook's Terms of Service.

---

**Disclaimer**: This tool is provided as-is for educational purposes. Users are responsible for complying with Facebook's Terms of Service and applicable laws regarding data scraping and privacy.
