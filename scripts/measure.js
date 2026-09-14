const { chromium } = require('playwright');
const fs = require('fs');

async function measure() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport to the requested size
  await page.setViewportSize({ width: 1417, height: 957 });

  const getMeasurements = async (url) => {
    console.log(`Loading ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    return await page.evaluate(() => {
      const getStyles = (el) => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const computed = window.getComputedStyle(el);
        return {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          paddingLeft: computed.paddingLeft,
          paddingRight: computed.paddingRight,
          paddingTop: computed.paddingTop,
          paddingBottom: computed.paddingBottom,
          marginLeft: computed.marginLeft,
          marginRight: computed.marginRight,
          marginTop: computed.marginTop,
          marginBottom: computed.marginBottom,
          gap: computed.gap,
          fontSize: computed.fontSize,
          lineHeight: computed.lineHeight,
        };
      };

      return {
        header: getStyles(document.querySelector('header')),
        main: getStyles(document.querySelector('main') || document.querySelector('.page-view')),
        contentWrapper: getStyles(document.querySelector('.page-view > div') || document.querySelector('.page-view')),
        hero: getStyles(document.querySelector('.bg-gradient-to-r')),
        heroTitle: getStyles(document.querySelector('.bg-gradient-to-r h1')),
        kpiGrid: getStyles(document.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4')),
        kpiCard: getStyles(document.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div')),
      };
    });
  };

  try {
    const nextjs = await getMeasurements('http://localhost:3000/college/dashboard');
    const original = await getMeasurements('file:///Y:/Naaguru/collage%20admin%20dashboard%20ui/dashboard.html');

    console.log('--- MEASUREMENT RESULTS ---');
    console.log(JSON.stringify({ original, nextjs }, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
}

measure();
