const uploadPdf = require("./api/useUploadPdf");
const puppeteer = require("puppeteer");

const path = require("path");
const fsp = require("fs/promises");
require("dotenv").config();

// env
const IS_LOCAL = process.env.IS_LOCAL;
const DOMAIN_NAME = process.env.DOMAIN_NAME;
const SELL_HOUSE_REPORT_URL = process.env.SELL_HOUSE_REPORT_URL;

module.exports = async ({ sessionToken, reportId }) => {
  const downloadPath = path.resolve(__dirname, "downloads");
  await fsp.mkdir(downloadPath, { recursive: true });

  console.log("下載路徑:", downloadPath);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: IS_LOCAL === "1" ? "" : "/bin/chromium", // 指定 Chrome 的路徑(本地不需要因為通常都有內建了)
    defaultViewport: null, // 使用原生 viewport size
    args: [
      "--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--start-maximized",
    ],
  });

  const page = await browser.newPage();

  page.on("error", (err) => {
    console.error("🔥 Page level error:", err);
  });

  page.on("pageerror", (err) => {
    console.error("🔥 Uncaught error in page context:", err);
  });

  await page.setUserAgent("leju-e2e");

  await page._client().send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath,
  });

  try {
    await browser.setCookie(
      {
        name: "sessionToken",
        value: sessionToken,
        domain: DOMAIN_NAME,
        path: "/",
        httpOnly: true,
      },
      {
        name: "lejuLoginCookie",
        value: "1",
        domain: DOMAIN_NAME,
        path: "/",
        httpOnly: true,
      }
    );

    // 前往指定網址
    await page.goto(`${SELL_HOUSE_REPORT_URL}/${reportId}`, {
      waitUntil: "networkidle0",
    });

    console.log("前往網址:", `${SELL_HOUSE_REPORT_URL}/${reportId}`);
    console.log("等待按鈕出現");

    // 等待按鈕出現
    await page.waitForSelector("#download-pdf-btn", {
      timeout: 15000,
    });

    console.log("✅ 成功抓到按鈕！");

    // 模擬點擊
    await page.click("#download-pdf-btn");

    const waitForFileDownload = async (dir, timeout = 10000) => {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const start = Date.now();

      while (Date.now() - start < timeout) {
        const currentFiles = await fsp.readdir(dir);

        // 找出檔名為download的檔案
        const downloadFile = currentFiles.find((f) => f === "download");

        // 找出已完成的 PDF
        const completed = currentFiles.find((f) => f.endsWith(".pdf"));

        if (completed) {
          console.log("✅ PDF 下載完成:", completed);
          return path.join(dir, completed);
        }

        // 如果有下載中的檔案，則重新命名為 reportId.pdf（否則無法上傳）
        if (downloadFile) {
          const newName = `${reportId}.pdf`;
          const newPath = path.join(dir, newName);

          await fsp.rename(path.join(dir, downloadFile), newPath);
          console.log("✅ 重新命名下載檔案為:", newPath);
          return newPath;
        } else {
          console.log("❓ 沒有下載中檔案也沒有 PDF，可能是失敗");
        }
        await sleep(1000);
      }

      throw new Error("PDF 檔案下載超時");
    };

    const pdfFilePath = await waitForFileDownload(downloadPath);

    console.log("PDF 檔案下載完成:", pdfFilePath);

    const fileBuffer = await fsp.readFile(pdfFilePath);
    const fileBlob = new Blob([fileBuffer], { type: "application/pdf" });

    const stats = await fsp.stat(pdfFilePath);

    console.log("📄 檔案大小 (bytes):", stats.size);

    const uploadResponse = await uploadPdf(fileBlob, sessionToken, reportId);

    if (uploadResponse.status !== 200) {
      throw new Error("上傳檔案失敗");
    } else {
      console.log("上傳成功");

      await fsp.rm(pdfFilePath, { force: true, recursive: true });
    }
  } catch (error) {
    await page.screenshot({ path: "output/debug.png", fullPage: true });
    throw error; // 讓上層捕捉錯誤
  } finally {
    await browser.close();
  }
};
