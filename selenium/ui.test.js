const { Builder, By, until } = require('selenium-webdriver');

const APP_URL = 'http://localhost:3000/submit'; // Adjust if your dev server runs elsewhere

async function submitQuestion(driver, question, url, email, site) {
  await driver.get(APP_URL);

  await driver.findElement(By.id('question')).sendKeys(question);
  await driver.findElement(By.id('url')).sendKeys(url);
  await driver.findElement(By.id('email')).sendKeys(email);
  await driver.findElement(By.id('site')).sendKeys(site);

  await driver.findElement(By.css('button[type="submit"]')).click();
}

// Runs the UI test to verify question submission and rate limiting functionality.
async function run() {
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    // 1. Submit a valid question
    await submitQuestion(
      driver,
      'Why is the sky blue?',
      'https://example.com/q1',
      'test@example.com',
      'Stack Overflow'
    );

    // 2. Wait for success message
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'Question Submitted!')]")), 10000);

    // 3. Try to submit again immediately (should trigger rate limit)
    await driver.findElement(By.css('button')).click(); // "Submit Another Question"
    await submitQuestion(
      driver,
      'Why is water wet?',
      'https://example.com/q2',
      'test@example.com',
      'Stack Overflow'
    );

    // 4. Wait for rate limit warning
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'try again later')]")), 10000);

    console.log('UI test passed: Submission and rate limiting work as expected.');
  } catch (err) {
    console.error('UI test failed:', err);
  } finally {
    await driver.quit();
  }
}

run();