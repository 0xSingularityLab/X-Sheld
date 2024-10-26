function getBlockedMessage() {
    const lang = navigator.language || document.documentElement.lang;
    return lang.startsWith('zh') ? '本条信息涉及恶意、病毒、钓鱼、盗号、滥用等危害，已被X盾屏蔽。' : 'Abuse Information Blocked by X Sheld.';
}

function extractTwitterAccount(article) {
    const accountSpan = article.querySelector('div[data-testid="User-Name"] a[href^="/"]');
    if (accountSpan) {
        const href = accountSpan.getAttribute('href');
        return href.startsWith('/') ? href.slice(1) : href;
    }
    return null;
}

function hideCommentsWithLinks() {
    const articles = document.querySelectorAll('article');

    if (articles.length === 0) {
        return;
    }

    const tweetAuthorAccount = extractTwitterAccount(articles[0]);

    articles.forEach((article, index) => {
        if (index === 0) return;

        const commentAuthorAccount = extractTwitterAccount(article);
        if (!commentAuthorAccount) {
            return;
        }

        if (commentAuthorAccount === tweetAuthorAccount) {
            return;
        }

        if (article.innerHTML.includes('https://t.co/')) {
            article.innerHTML = `<div style="color: red; font-size: 18px; font-weight: bold;">${getBlockedMessage()}</div>`;
        }
    });
}

function hideAdTweets() {
    const adSpans = document.querySelectorAll('span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0');

    adSpans.forEach((adSpan) => {
        if (adSpan.textContent === 'Ad' || adSpan.textContent === '推荐' || adSpan.textContent === '广告') {
            let tweetArticle = adSpan.closest('article');
            if (tweetArticle) {
                const blockedMessage = getBlockedMessage();
                tweetArticle.innerHTML = `<div style="color: red; font-size: 18px;">${blockedMessage}</div>`;
            }
        }
    });
}

function recheckCommentsOnPage() {
    setTimeout(() => {
        hideCommentsWithLinks();
    }, 1000); 
}

let lastUrl = location.href;
new MutationObserver(() => {
    const currentUrl = location.href;

    if (currentUrl !== lastUrl && currentUrl.includes('/status/')) {
        lastUrl = currentUrl;

        const commentObserver = new MutationObserver(() => {
            hideCommentsWithLinks();
        });

        const commentsSection = document.querySelector('section[aria-labelledby]');
        if (commentsSection) {
            commentObserver.observe(commentsSection, { childList: true, subtree: true });
            recheckCommentsOnPage();
        }

        hideCommentsWithLinks();
    }
}).observe(document, { subtree: true, childList: true });

const observer = new MutationObserver(() => {
    hideAdTweets();
    const currentUrl = location.href;
    if (currentUrl.includes('/status/')) {
        hideCommentsWithLinks();
        recheckCommentsOnPage();
    }
});

observer.observe(document.body, { childList: true, subtree: true });

hideAdTweets();

const currentUrl = location.href;
if (currentUrl.includes('/status/')) {
    hideCommentsWithLinks();
}
