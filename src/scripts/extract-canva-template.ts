import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const TARGET_URL = 'https://tntlab.my.canva.site/tuthivananhportfolio/';
const OUTPUT_DIR = path.resolve(process.cwd(), 'references/canva-tuthivananh');

async function autoScroll(page: import('playwright').Page) {
  await page.evaluate(async () => {
    const candidates = Array.from(document.querySelectorAll<HTMLElement>('*')).filter(
      (el) => {
        const st = window.getComputedStyle(el);
        return (
          (st.overflowY === 'scroll' || st.overflowY === 'auto') &&
          el.scrollHeight > el.clientHeight + 100
        );
      }
    );
    const scroller =
      candidates.sort((a, b) => b.scrollHeight - a.scrollHeight)[0] ||
      (document.scrollingElement as HTMLElement) ||
      document.documentElement;

    const maxHeight = scroller.scrollHeight;
    for (let y = 0; y <= maxHeight + 400; y += 600) {
      scroller.scrollTop = y;
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    scroller.scrollTop = 0;
    window.scrollTo(0, 0);
  });
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop Capture (1440x900)
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: 'vi-VN',
    });
    const page = await desktopContext.newPage();
    console.log(`Opening ${TARGET_URL} at 1440x900...`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(2500);
    await autoScroll(page);
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'desktop-full.png'),
      fullPage: true,
    });

    // Capture each Canva <section> (or viewport slides) inside the primary scroll container
    const sectionOffsets = await page.evaluate(() => {
      const candidates = Array.from(document.querySelectorAll<HTMLElement>('*')).filter(
        (el) => {
          const st = window.getComputedStyle(el);
          return (
            (st.overflowY === 'scroll' || st.overflowY === 'auto') &&
            el.scrollHeight > el.clientHeight + 100
          );
        }
      );
      const scroller =
        candidates.sort((a, b) => b.scrollHeight - a.scrollHeight)[0] ||
        (document.scrollingElement as HTMLElement) ||
        document.documentElement;
      const sections = Array.from(document.querySelectorAll('section'));
      if (sections.length > 0) {
        return sections.map((sec) => {
          const rect = sec.getBoundingClientRect();
          return Math.max(0, Math.round(rect.top + scroller.scrollTop));
        });
      }
      const total = Math.max(document.body.scrollHeight, scroller.scrollHeight);
      const count = Math.min(10, Math.max(1, Math.ceil(total / 900)));
      return Array.from({ length: count }, (_, idx) => idx * 900);
    });

    // Always capture slide 1 at scrollTop = 0, then section anchors
    const capturePoints = Array.from(new Set([0, ...sectionOffsets])).slice(0, 12);
    for (let i = 0; i < capturePoints.length; i++) {
      const targetY = capturePoints[i];
      await page.evaluate((y) => {
        const candidates = Array.from(document.querySelectorAll<HTMLElement>('*')).filter(
          (el) => {
            const st = window.getComputedStyle(el);
            return (
              (st.overflowY === 'scroll' || st.overflowY === 'auto') &&
              el.scrollHeight > el.clientHeight + 100
            );
          }
        );
        const scroller =
          candidates.sort((a, b) => b.scrollHeight - a.scrollHeight)[0] ||
          (document.scrollingElement as HTMLElement) ||
          document.documentElement;
        scroller.scrollTop = y;
        window.scrollTo(0, y);
      }, targetY);
      await page.waitForTimeout(450);
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `desktop-slide-${i + 1}.png`),
      });
    }

    // Extract colors, fonts, headings, sections, and full text
    const extracted = await page.evaluate(() => {
      const fonts = new Set<string>();
      const bgColors = new Set<string>();
      const textColors = new Set<string>();
      const hexBgColors = new Set<string>();
      const hexTextColors = new Set<string>();
      const headings: string[] = [];

      const elements = Array.from(document.querySelectorAll('body *'));
      for (const el of elements.slice(0, 1200)) {
        const style = window.getComputedStyle(el);
        if (style.fontFamily) fonts.add(style.fontFamily);
        if (
          style.backgroundColor &&
          style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
          style.backgroundColor !== 'transparent'
        ) {
          bgColors.add(style.backgroundColor);
          const m = style.backgroundColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (m) {
            hexBgColors.add(
              '#' +
                [m[1], m[2], m[3]]
                  .map((v) => Number(v).toString(16).padStart(2, '0').toUpperCase())
                  .join('')
            );
          }
        }
        if (style.color && style.color !== 'rgba(0, 0, 0, 0)') {
          textColors.add(style.color);
          const m = style.color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (m) {
            hexTextColors.add(
              '#' +
                [m[1], m[2], m[3]]
                  .map((v) => Number(v).toString(16).padStart(2, '0').toUpperCase())
                  .join('')
            );
          }
        }

        const tag = el.tagName.toLowerCase();
        const fontSize = parseFloat(style.fontSize || '0');
        const txt = (el.textContent || '').trim();
        if (
          txt &&
          txt.length > 1 &&
          txt.length < 180 &&
          (tag === 'h1' || tag === 'h2' || tag === 'h3' || fontSize >= 24)
        ) {
          if (!headings.includes(txt)) headings.push(txt);
        }
      }

      const candidates = Array.from(document.querySelectorAll<HTMLElement>('*')).filter(
        (el) => {
          const st = window.getComputedStyle(el);
          return (
            (st.overflowY === 'scroll' || st.overflowY === 'auto') &&
            el.scrollHeight > el.clientHeight + 100
          );
        }
      );
      const scroller = candidates.sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
      const sections = Array.from(document.querySelectorAll('section')).map((sec, idx) => ({
        index: idx,
        height: Math.round(sec.getBoundingClientRect().height),
        preview: (sec.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 220),
      }));

      const images = Array.from(document.querySelectorAll('img')).map((img) => ({
        src: img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
      }));

      return {
        title: document.title,
        url: window.location.href,
        scrollHeight: scroller ? scroller.scrollHeight : document.body.scrollHeight,
        fonts: Array.from(fonts).slice(0, 20),
        backgroundColors: Array.from(bgColors).slice(0, 25),
        hexBackgroundColors: Array.from(hexBgColors).slice(0, 25),
        textColors: Array.from(textColors).slice(0, 25),
        hexTextColors: Array.from(hexTextColors).slice(0, 25),
        headings: headings.slice(0, 60),
        sectionCount: sections.length,
        sections,
        bodyTextSample: (document.body.innerText || '').slice(0, 20000),
        imageCount: images.length,
        images: images.slice(0, 40),
      };
    });

    await desktopContext.close();

    // 2. Mobile Capture (390x844)
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      locale: 'vi-VN',
    });
    const mobilePage = await mobileContext.newPage();
    console.log(`Opening ${TARGET_URL} at 390x844...`);
    await mobilePage.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 45000 });
    await mobilePage.waitForTimeout(2000);
    await autoScroll(mobilePage);
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({
      path: path.join(OUTPUT_DIR, 'mobile-full.png'),
      fullPage: true,
    });
    await mobileContext.close();

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'extracted-meta.json'),
      JSON.stringify(
        {
          extractedAt: new Date().toISOString(),
          ...extracted,
        },
        null,
        2
      ),
      'utf-8'
    );

    console.log(`Extraction complete! Saved outputs to ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('Canva extraction warning:', error);
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'extracted-meta.json'),
      JSON.stringify(
        {
          extractedAt: new Date().toISOString(),
          status: 'fallback',
          error: error instanceof Error ? error.message : String(error),
        },
        null,
        2
      ),
      'utf-8'
    );
  } finally {
    await browser.close();
  }
}

run();
