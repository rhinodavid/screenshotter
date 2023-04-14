import { baseUrl, outputDir, pages, widths } from "./config";
import cliProgress from "cli-progress";
import { Page, chromium } from "playwright";
import fs from "fs-extra";

function escapeFilePath(path: string) {
  return path.replace(/(\s+)/g, "_");
}

const grabSnapshot = async (url: string, page: Page, width: number) => {
  await page.setViewportSize({ width, height: 1200 });
  await page.goto(`${baseUrl}/${url}`);
  await page.waitForLoadState("domcontentloaded");
  // nasty, but will work for now
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: escapeFilePath(`${outputDir}/${url}-${width}.png`),
    fullPage: true,
  });
};

async function main() {
  await fs.ensureDir(outputDir);
  await fs.emptyDir(outputDir);

  const browser = await chromium.launch();
  const browserPage = await browser.newPage();

  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  let progress = 0;
  progressBar.start(pages.length * widths.length, progress);

  for (let page of pages) {
    for (let width of widths) {
      await grabSnapshot(page, browserPage, width);
      progress++;
      progressBar.update(progress);
    }
  }

  progressBar.stop();
  await browser.close();
}
main();
