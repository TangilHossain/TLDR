document.getElementById('grabHtml').addEventListener('click', async() => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            return new Promise(resolve => {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    window.addEventListener('load', () => resolve());
                }
            }).then(() => {
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
                    content += `<!-- Div ${index} -->\n${div.outerHTML}\n\n`;
                    index++;
                });

                if (!content) {
                    content = '<!-- No matching <div> elements found -->';
                }

                // Create and trigger download
                const blob = new Blob([content], { type: 'text/html' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'facebook_story_messages.html';
                a.click();
            });
        }
    });
});