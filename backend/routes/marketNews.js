const express = require('express');
const router = express.Router();
const Parser = require('rss-parser');
const parser = new Parser();

router.get('/live', async (req, res) => {
    try {
        // Fetch from Economic Times Markets RSS or similar Indian finance feed
        const feedUrl = 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms';
        const feed = await parser.parseURL(feedUrl);

        // Extract top 10 news items
        const newsItems = feed.items.slice(0, 10).map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate
        }));

        res.json({
            success: true,
            source: feed.title || 'Market News',
            data: newsItems
        });
    } catch (error) {
        console.error('Error fetching market RSS feed:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch live market news', error: error.message });
    }
});

module.exports = router;
