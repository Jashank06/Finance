/**
 * NAV Fetch Service
 * Uses the free mfapi.in API to get current NAV data for mutual funds.
 * API docs: https://www.mfapi.in/
 */

const https = require('https');

/**
 * Makes an HTTPS GET request and returns parsed JSON
 */
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.error(`mfapi.in returned status ${res.statusCode} for URL: ${url}`);
          return reject(new Error(`mfapi.in returned status ${res.statusCode}`));
        }
        
        try {
          if (!data || data.trim().length === 0) {
            return reject(new Error('Empty response from mfapi.in'));
          }
          resolve(JSON.parse(data));
        } catch (e) {
          console.error(`Invalid JSON from mfapi.in. URL: ${url}`);
          console.error('Raw response head (500 chars):', data.substring(0, 500));
          reject(new Error('Invalid JSON response from mfapi.in'));
        }
      });
    }).on('error', (err) => {
      console.error(`Network error calling mfapi.in (${url}):`, err.message);
      reject(err);
    }).on('timeout', () => {
      console.error(`Timeout calling mfapi.in (${url})`);
      reject(new Error('Timeout calling mfapi.in'));
    });
  });
}

/**
 * Search for a fund scheme code by name
 * @param {string} fundName - Fund name to search
 * @returns {Promise<Array>} - Array of matching schemes
 */
async function searchFund(fundName) {
  try {
    const encodedName = encodeURIComponent(fundName);
    const results = await httpsGet(`https://api.mfapi.in/mf/search?q=${encodedName}`);
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error('Error searching fund:', error.message);
    return [];
  }
}

/**
 * Get the latest NAV for a scheme by scheme code
 * @param {string|number} schemeCode
 * @returns {Promise<{nav: number, navDate: string}|null>}
 */
async function getLatestNAVByCode(schemeCode) {
  try {
    const data = await httpsGet(`https://api.mfapi.in/mf/${schemeCode}/latest`);
    if (data && data.data && data.data.length > 0) {
      const latest = data.data[0];
      return {
        nav: parseFloat(latest.nav),
        navDate: latest.date,
        schemeName: data.meta?.scheme_name || '',
        schemeCode: schemeCode,
        isin: data.meta?.isin_growth || data.meta?.isin_div_reinvestment || '',
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching NAV by code:', error.message);
    return null;
  }
}

/**
 * Get historical NAV for a specific date (or nearest available date)
 * @param {string|number} schemeCode
 * @param {Date} targetDate
 * @returns {Promise<{nav: number, navDate: string}|null>}
 */
async function getHistoricalNAV(schemeCode, targetDate) {
  try {
    const data = await httpsGet(`https://api.mfapi.in/mf/${schemeCode}`);
    if (!data || !data.data || data.data.length === 0) return null;

    const targetMs = new Date(targetDate).getTime();

    // NAV data is newest first. Find the closest available date <= targetDate
    let closest = null;
    for (const entry of data.data) {
      // mfapi returns dates as "DD-MM-YYYY"
      const parts = entry.date.split('-');
      const entryDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      const entryMs = entryDate.getTime();

      if (entryMs <= targetMs) {
        closest = { nav: parseFloat(entry.nav), navDate: entry.date };
        break;
      }
    }

    return closest;
  } catch (error) {
    console.error('Error fetching historical NAV:', error.message);
    return null;
  }
}

/**
 * Get ALL historical NAV data for a scheme in one call.
 * Returns an object with a lookup function: findNavForDate(targetDate) → { nav, navDate }
 * This is much more efficient than calling getHistoricalNAV per installment.
 * @param {string|number} schemeCode
 * @returns {Promise<{findNavForDate: Function, entries: Array}|null>}
 */
async function getAllHistoricalNAV(schemeCode) {
  try {
    const data = await httpsGet(`https://api.mfapi.in/mf/${schemeCode}`);
    if (!data || !data.data || data.data.length === 0) return null;

    // Pre-parse all entries: convert DD-MM-YYYY to timestamps for fast lookup
    const entries = data.data.map(entry => {
      const parts = entry.date.split('-');
      const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      return { date, nav: parseFloat(entry.nav), navDate: entry.date, ts: date.getTime() };
    }).filter(e => !isNaN(e.nav) && !isNaN(e.ts));

    // entries are newest-first from mfapi
    const findNavForDate = (targetDate) => {
      const targetMs = new Date(targetDate).getTime();
      // Find closest entry on or before targetDate
      for (const entry of entries) {
        if (entry.ts <= targetMs) return { nav: entry.nav, navDate: entry.navDate };
      }
      // If no entry <= targetDate, return the oldest available
      return entries.length > 0 ? { nav: entries[entries.length - 1].nav, navDate: entries[entries.length - 1].navDate } : null;
    };

    return { findNavForDate, entries };
  } catch (error) {
    console.error('Error fetching all historical NAV:', error.message);
    return null;
  }
}


async function getCurrentNAVByName(fundName, expectedIsin = null) {
  try {
    // 1. Try exact name first
    let results = await searchFund(fundName);
    
    // 2. If no results, try stripping common suffixes
    if (!results || results.length === 0) {
      const strippedName = fundName
        .replace(/\s*-\s*Gr(owth)?\b/i, '')
        .replace(/\s*-\s*IDCW\b/i, '')
        .replace(/\s*-\s*Direct\b/i, '')
        .replace(/\s*-\s*Regular\b/i, '')
        .replace(/\s*-\s*Plan\b/i, '')
        .replace(/\(G\)$/i, '')
        .trim();
      
      if (strippedName !== fundName && strippedName.length > 2) {
        console.log(`No results for "${fundName}", trying stripped name: "${strippedName}"`);
        results = await searchFund(strippedName);
      }
    }

    // 3. If still no results, try just the first 3 keywords
    if (!results || results.length === 0) {
      const keywords = fundName.split(/\s+/).slice(0, 3).join(' ');
      if (keywords && keywords.length > 5 && keywords !== fundName) {
        console.log(`No results for "${fundName}", trying keywords: "${keywords}"`);
        results = await searchFund(keywords);
      }
    }

    if (!results || results.length === 0) return null;

    // 4. Score results to pick the correct variant (Direct vs Regular, Growth vs IDCW)
    const searchLower = fundName.toLowerCase();
    const isDirectSearch = searchLower.includes('direct');
    const isRegularSearch = searchLower.includes('regular');
    const isGrowthSearch = searchLower.match(/\b(gr|growth)\b/);
    const isIdcwSearch = searchLower.match(/\b(idcw|div|dividend)\b/);

    results.sort((a, b) => {
      const nameA = a.schemeName.toLowerCase();
      const nameB = b.schemeName.toLowerCase();
      let scoreA = 0; let scoreB = 0;
      
      if (isDirectSearch && nameA.includes('direct')) scoreA += 10;
      if (isDirectSearch && nameB.includes('direct')) scoreB += 10;
      if (!isDirectSearch && nameA.includes('direct')) scoreA -= 5;
      if (!isDirectSearch && nameB.includes('direct')) scoreB -= 5;

      if (isRegularSearch && nameA.includes('regular')) scoreA += 10;
      if (isRegularSearch && nameB.includes('regular')) scoreB += 10;
      if (!isRegularSearch && nameA.includes('regular')) scoreA -= 5;
      if (!isRegularSearch && nameB.includes('regular')) scoreB -= 5;

      if (isGrowthSearch && nameA.includes('growth')) scoreA += 10;
      if (isGrowthSearch && nameB.includes('growth')) scoreB += 10;
      if (!isGrowthSearch && nameA.includes('growth')) scoreA -= 5;
      if (!isGrowthSearch && nameB.includes('growth')) scoreB -= 5;

      if (isIdcwSearch && nameA.includes('idcw')) scoreA += 10;
      if (isIdcwSearch && nameB.includes('idcw')) scoreB += 10;
      if (!isIdcwSearch && nameA.includes('idcw')) scoreA -= 5;
      if (!isIdcwSearch && nameB.includes('idcw')) scoreB -= 5;

      return scoreB - scoreA;
    });

    // 5. If expected ISIN provided, fetch top 5 and try to find exact match
    if (expectedIsin && expectedIsin.length > 5) {
      for (const res of results.slice(0, 5)) {
        const navData = await getLatestNAVByCode(res.schemeCode);
        if (navData && (navData.isin === expectedIsin || navData.isin.includes(expectedIsin))) {
          console.log(`Found exact ISIN match for ${fundName}: ${res.schemeName} (${res.schemeCode})`);
          return { ...navData, schemeCode: res.schemeCode };
        }
      }
    }

    // Pick best scored match
    const bestMatch = results[0];
    console.log(`Best matched variant for "${fundName}": ${bestMatch.schemeName} (${bestMatch.schemeCode})`);
    const navData = await getLatestNAVByCode(bestMatch.schemeCode);
    return navData ? { ...navData, schemeCode: bestMatch.schemeCode } : null;
  } catch (error) {
    console.error('Error getting NAV by name:', error.message);
    return null;
  }
}

/**
 * Derive fund type from fund name by keyword matching
 * @param {string} fundName
 * @returns {string}
 */
function deriveFundType(fundName) {
  if (!fundName) return 'other';
  const name = fundName.toLowerCase();

  if (name.includes('small cap')) return 'Small Cap';
  if (name.includes('mid cap') || name.includes('midcap')) return 'Mid Cap';
  if (name.includes('large & mid cap') || name.includes('large and mid cap')) return 'Large and Mid Cap';
  if (name.includes('large cap') || name.includes('largecap') || name.includes('bluechip') || name.includes('blue chip')) return 'Large Cap';
  if (name.includes('multi cap') || name.includes('multicap')) return 'Multi Cap';
  if (name.includes('flexi cap') || name.includes('flexicap')) return 'Flexi Cap';
  if (name.includes('elss') || name.includes('tax saver') || name.includes('tax saving')) return 'ELSS';
  if (name.includes('gold') && name.includes('silver')) return 'Gold & Silver';
  if (name.includes('gold')) return 'Gold';
  if (name.includes('silver')) return 'Silver';
  if (name.includes('index') || name.includes('nifty') || name.includes('sensex')) return 'Index';
  if (name.includes('liquid') || name.includes('overnight') || name.includes('money market')) return 'Liquid';
  if (name.includes('debt') || name.includes('bond') || name.includes('gilt') || name.includes('credit risk')) return 'Debt';
  if (name.includes('hybrid') || name.includes('balanced') || name.includes('aggressive')) return 'Hybrid';
  if (name.includes('international') || name.includes('global') || name.includes('usa') || name.includes('nasdaq')) return 'International';
  if (name.includes('fof') || name.includes('fund of fund')) return 'FoF';
  if (name.includes('sectoral') || name.includes('thematic')) return 'Sectoral/Thematic';
  if (name.includes('banking') || name.includes('pharma') || name.includes('infra') || name.includes('consumption')) return 'Sectoral/Thematic';

  return 'Equity'; // Default for unknown equity funds
}

module.exports = {
  searchFund,
  getLatestNAVByCode,
  getHistoricalNAV,
  getAllHistoricalNAV,
  getCurrentNAVByName,
  deriveFundType,
};
