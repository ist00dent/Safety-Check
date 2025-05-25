function injectSafetyButtons() {
  const isFacebook = window.location.hostname.includes('facebook.com');
  const isGitHub = window.location.hostname.includes('github.com');

  let postSelectors = '';

  if (isFacebook) {
    // Refined selectors for Facebook posts
    postSelectors = [
      'div[data-ad-preview="message"]:not([data-safetychecked])', // Original selector, sometimes works
      'div[data-ad-comet-preview="message"]:not([data-safetychecked])', // Comet preview attribute
      '[data-testid="post_message"]:not([data-safetychecked])', // Another common text container
      'div[role="article"]:not([data-safetychecked])' // Main post article container
    ].join(',');

  } else if (isGitHub) {
    // Selectors for GitHub comments and relevant content
    postSelectors = [
      '.js-comment-container:not([data-safetychecked]) .comment-body', // GitHub comments
      '.js-discussion-timeline-item:not([data-safetychecked]) .comment-body', // Issue/PR timeline comments
      '.markdown-body:not([data-safetychecked])' // General markdown content (like issue/PR descriptions)
    ].join(',');
  }

  if (!postSelectors) {
    console.log('Content Safety Checker: No selectors defined for this hostname.');
    return;
  }

  const posts = document.querySelectorAll(postSelectors);

  console.log(`Content Safety Checker: Found ${posts.length} potential elements to process on ${window.location.hostname}.`); // Log found elements

  posts.forEach(post => {
    // Skip if already processed
    if (post.hasAttribute('data-safetychecked')) {
      // console.log('Content Safety Checker: Element already processed', post);
      return;
    }

    post.setAttribute('data-safetychecked', 'true');
    console.log('Content Safety Checker: Processing element:', post); // Log element being processed

    let postContent = null;
    let appendTarget = null;

    if (isFacebook) {
      // For Facebook, the element found might be the content itself or a container.
      // Let's try to find a suitable append target which is typically a parent element.
      postContent = post; // Assume the matched element contains the text

      // Find a reliable parent to append the button container to
      // We'll try to find a parent that seems like the post footer or actions area
      appendTarget = post.closest('[role="article"] > div') || post.parentElement; // Try finding a div within the article or just the direct parent

    } else if (isGitHub) {
      // For GitHub, the element itself is usually the content
      postContent = post;
      // For GitHub, append to the comment header or a suitable parent
      const commentHeader = post.closest('.js-comment-container, .js-discussion-timeline-item')?.querySelector('.timeline-comment-header');
      if (commentHeader) {
        appendTarget = commentHeader;
      } else {
        // Fallback to parent element if header not found
        appendTarget = post.parentElement;
      }
    }

    if (!postContent || !appendTarget) {
      console.log('Content Safety Checker: Could not find content or append target for:', post); // Debug log
      return;
    }

    // Create button container
    const btnContainer = document.createElement('div');
    btnContainer.className = 'safety-buttons-container';

    // Create Safety Check button
    const safetyBtn = document.createElement('button');
    safetyBtn.innerText = '🛡️ Safety Check';
    safetyBtn.className = 'safety-btn';
    safetyBtn.onclick = async () => {
      try {
        const text = postContent.innerText; // Use postContent for text
        console.log('Content Safety Checker: Analyzing content:', text);

        const response = await fetch('http://localhost:5000/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });

        const data = await response.json();
        console.log('Content Safety Checker: Analysis results:', data);

        // Create result popup
        const resultPopup = document.createElement('div');
        resultPopup.className = 'safety-result';

        // Create the content
        let content = '<div class="result-header">🔍 Content Safety Analysis</div>';

        // Add toxicity results
        if (data.toxicity && data.toxicity.has_toxic_content) {
          content += `
            <div class="result-section warning">
              <div class="section-title">⚠️ Toxic Content Detected</div>
              <div class="section-content">
                Found potentially harmful words: ${data.toxicity.toxic_words.join(', ')}
              </div>
            </div>`;
        }

        // Add emotional manipulation results
        if (data.emotional_manipulation && data.emotional_manipulation.has_manipulation) {
          content += `
            <div class="result-section warning">
              <div class="section-title">🎭 Emotional Manipulation Detected</div>
              <div class="section-content">`;

          for (const [type, words] of Object.entries(data.emotional_manipulation.manipulation_types)) {
            content += `<div class="manipulation-item">
              ${type}: ${words.join(', ')}
            </div>`;
          }

          content += `</div></div>`;
        }

        // Add sentiment analysis
        if (data.sentiment) {
          content += `
            <div class="result-section">
              <div class="section-title">📊 Sentiment Analysis</div>
              <div class="section-content">
                ${data.sentiment.label} (Score: ${data.sentiment.score.toFixed(2)})
              </div>
            </div>`;
        }

        // Add source credibility if available
        if (data.source_credibility) {
          content += `
            <div class="result-section">
              <div class="section-title">🔗 Source Credibility</div>
              <div class="section-content">
                ${data.source_credibility}
              </div>
            </div>`;
        }

        resultPopup.innerHTML = content;

        // Add a close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '&times;'; // 'x' icon
        closeButton.onclick = () => {
          overlay.remove();
        };
        resultPopup.appendChild(closeButton);

        // Create and append overlay
        const overlay = document.createElement('div');
        overlay.className = 'safety-overlay';
        overlay.appendChild(resultPopup);

        // Remove any existing overlay
        const existingOverlay = document.querySelector('.safety-overlay');
        if (existingOverlay) existingOverlay.remove();

        document.body.appendChild(overlay);

      } catch (err) {
        console.error('Content Safety Checker: Safety check failed:', err);
        alert('Safety check failed. Please try again.');
      }
    };

    btnContainer.appendChild(safetyBtn);
    appendTarget.appendChild(btnContainer);
    console.log('Content Safety Checker: Added safety button to element.'); // Log successful injection
  });
}

// Run immediately and then every 2 seconds
console.log('Content Safety Checker: Starting injection process...'); // Initial log
injectSafetyButtons();
setInterval(injectSafetyButtons, 2000); 