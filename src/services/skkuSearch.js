import axios from 'axios';

/**
 * SKKU Search Service
 * Fetches search results from the SKKU website via AllOrigins proxy to bypass CORS.
 */
export const searchSKKU = async (query, category = 'ALL') => {
  const categoryMap = {
    'ALL': '',
    'NOTICE': '공지게시판',
    'WEB': '웹사이트',
    'FACULTY': '교원검색'
  };

  const menuParam = categoryMap[category] || '';
  const skkuUrl = `https://www.skku.edu/skku/search/search.do?qt=${encodeURIComponent(query)}${menuParam ? `&menu=${encodeURIComponent(menuParam)}` : ''}`;

  // Using corsproxy.io for better performance than allorigins
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(skkuUrl)}`;

  try {
    const response = await axios.get(proxyUrl, { timeout: 10000 });
    const html = response.data;

    // Use DOMParser to parse HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const results = [];

    if (category === 'FACULTY') {
      // Specialized parser for Faculty category
      const items = doc.querySelectorAll('ul.bullet_list > li');
      items.forEach((item) => {
        const titleEl = item.querySelector('p b.keyword');
        if (titleEl) {
          const name = titleEl.textContent.trim();
          const details = Array.from(item.querySelectorAll('p'))
            .map(p => p.textContent.trim())
            .filter(text => text.includes(':') || text.includes('소속') || text.includes('전화'))
            .join(' | ');

          results.push({
            title: name,
            link: `https://www.skku.edu/skku/search/search.do?qt=${encodeURIComponent(name)}&menu=${encodeURIComponent('교원검색')}`,
            snippet: details,
            date: '교원 정보',
            id: Math.random().toString(36).substr(2, 9)
          });
        }
      });
    } else {
      // General parser for other categories
      const items = doc.querySelectorAll('.sea_resultList > li');
      items.forEach((item) => {
        const titleLink = item.querySelector('.res_tit');
        const snippetEl = item.querySelector('.res_cont');

        if (titleLink) {
          const titleClone = titleLink.cloneNode(true);
          const dateSpan = titleClone.querySelector('span');
          let date = '';
          if (dateSpan) {
            date = dateSpan.textContent.trim();
            dateSpan.remove();
          }

          const title = titleClone.textContent.trim();
          const link = titleLink.getAttribute('href');
          const snippet = snippetEl ? snippetEl.textContent.trim() : '';

          results.push({
            title,
            link: link.startsWith('http') ? link : `https://www.skku.edu${link}`,
            snippet,
            date,
            id: Math.random().toString(36).substr(2, 9)
          });
        }
      });
    }

    return results;
  } catch (error) {
    console.error('SKKU Search extraction failed:', error);
    throw error;
  }
};

/**
 * Unified Search Service
 * Fetches results from multiple categories in parallel.
 */
export const unifiedSearchSKKU = async (query) => {
  if (!query.trim()) return {};

  const categories = [
    { id: 'FACULTY', name: '교원' },
    { id: 'NOTICE', name: '공지사항' },
    { id: 'WEB', name: '웹사이트' }
  ];

  try {
    const results = await Promise.all(
      categories.map(async (cat) => {
        try {
          const data = await searchSKKU(query, cat.id);
          return { id: cat.id, name: cat.name, data };
        } catch (err) {
          console.error(`Failed to fetch ${cat.id}:`, err);
          return { id: cat.id, name: cat.name, data: [] };
        }
      })
    );

    // Grouping results by category ID
    return results.reduce((acc, current) => {
      if (current.data.length > 0) {
        acc[current.id] = current;
      }
      return acc;
    }, {});
  } catch (error) {
    console.error('Unified search failed:', error);
    throw error;
  }
};
