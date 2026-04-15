const https = require('https');

/**
 * Fetch stock price from Yahoo Finance
 * @param {string} symbol - Stock symbol (e.g., RELIANCE, TCS.NS)
 * @param {string} exchange - Optional exchange ('NSE' or 'BSE')
 * @returns {Promise<{price: number, currency: string, symbol: string}>}
 */
async function getStockPrice(symbol, exchange = 'NSE') {
  return new Promise((resolve, reject) => {
    if (!symbol) return reject(new Error('Symbol is required'));

    // For Indian stocks, suffix .NS (NSE) or .BO (BSE) is required for Yahoo Finance
    let fullSymbol = symbol.toUpperCase();
    if (!fullSymbol.includes('.')) {
      fullSymbol += (exchange === 'BSE' ? '.BO' : '.NS');
    }
      
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${fullSymbol}?interval=1d&range=1d`;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      },
      timeout: 10000
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Yahoo Finance returned status ${res.statusCode}`));
        }
        
        try {
          const json = JSON.parse(data);
          if (json.chart && json.chart.result && json.chart.result.length > 0) {
            const result = json.chart.result[0];
            const price = result.meta.regularMarketPrice;
            const currency = result.meta.currency;
            
            if (price == null) {
              return reject(new Error('Price not found in response'));
            }

            resolve({ 
              symbol: fullSymbol, 
              price: parseFloat(price), 
              currency: currency || 'INR' 
            });
          } else if (json.chart && json.chart.error) {
            reject(new Error(json.chart.error.description || 'Unknown Yahoo Finance error'));
          } else {
            reject(new Error('Invalid response format or symbol not found'));
          }
        } catch (e) {
          reject(new Error('Failed to parse Yahoo Finance response'));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Network error: ${err.message}`));
    }).on('timeout', () => {
      reject(new Error('Request timed out'));
    });
  });
}

module.exports = {
  getStockPrice
};
