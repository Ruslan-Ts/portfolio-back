const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());
const port = 3000;

app.get('/get-contact-data', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: false,  
    // Mit diesen Einstellungen können im Browser visuell sehen, wie das Scraping funktioniert
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Zeitüberschreitung bei der Navigation
    page.setDefaultNavigationTimeout(60000);

    // Gehen zur Anmeldeseite
    await page.goto('https://www.freelance.de/login.php', { waitUntil: 'networkidle0' });
    // Warten auf ein Pop-up mit Coocies
    await page.waitForSelector('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll', { visible: true });
    await page.click('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll');
    // Autorisierung durchführen
    await page.type('#username', 'ruslan.tsuman@gmail.com');
    await page.type('#password', 't7v!h3HztNy@HMi');
    
    // Warten darauf, dass die Anmeldeschaltfläche anklickbar wird
    await page.waitForSelector('#login', { visible: true });
    await page.click('#login');

    // await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Rufen die Seite mit den erforderlichen Daten auf
    await page.goto('https://www.freelance.de/profile_freelancer/index.php', { waitUntil: 'domcontentloaded' });

    // Warten, bis der Block mit den Kontaktinformationen erscheint
    await page.waitForSelector('#contact_data', { visible: true });

    // Abrufen von Daten aus dem Block mit id="contact_data"
    const contactData = await page.$eval('#contact_data', el => el.innerText);
    console.log('====================================');
    console.log(contactData);
    console.log('====================================');

    await browser.close();

    res.json(contactData);
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Scraping error', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`server started on http://localhost:${port}`);
});