// был выбран ситилинк, так как там нет защиты cloudflare или похожего
// тестировалось в VS Code

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.goto('https://www.citilink.ru/', { waitUntil: 'domcontentloaded', timeout: 60000 });

  await page.waitForSelector('input[name="text"]', { timeout: 10000 });
  await page.type('input[name="text"]', 'телевизор');
  await page.keyboard.press('Enter');

  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 });

  const sortButtons = await page.$$('span.e1c14o6m0'); 

  let clicked = false;
  for (const btn of sortButtons) {
    const text = await page.evaluate(el => el.textContent.toLowerCase(), btn);
    if (text.includes('по цене')) {
      await btn.click();
      clicked = true;
      break;
    }
  }

  if (!clicked) {
    console.error('Кнопка сортировки "по цене" не найдена');
    await browser.close();
    return;
  }

  await new Promise(r => setTimeout(r, 5000)); 

  const products = await page.evaluate(() => {
    const titles = Array.from(document.querySelectorAll('a[data-meta-name="Snippet__title"]'));
    const prices = Array.from(document.querySelectorAll('span.app-catalog-1dno20p-StyledTypography--getTypographyStyle-composeBreakpointsStyles--arrayOfStylesByBreakpoints-StyledText--getTextStyle-Text--StyledTextComponent-MainPriceNumber--StyledMainPriceNumber'));
    const currencies = Array.from(document.querySelectorAll('span.app-catalog-3lmxwy-Currency--StyledCurrency'));

    const count = Math.min(10, titles.length, prices.length);
    const items = [];

    for (let i = 0; i < count; i++) {
      const title = titles[i]?.innerText.trim() || 'Без названия';
      const price = prices[i]?.innerText.trim() || 'Цена не найдена';
      const currency = currencies[i]?.innerText.trim() || '';
      items.push({ title, price: price + ' ' + currency });
    }

    return items;
  });

  console.log('Первые 10 телевизоров (по возрастанию цены):');
  products.forEach((p, i) => {
    console.log(`${i + 1}. ${p.title} — ${p.price}`);
  });

  await browser.close();
})();
