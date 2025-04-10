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
    headless: IS_LOCAL === "1" ? false : true, // 是否開啟無頭模式（不會開啟瀏覽器UI）
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

    console.log("等待按鈕出現");

    // 等待按鈕出現
    await page.waitForSelector("#download-pdf-btn", {
      timeout: 15000,
    });

    console.log("✅ 成功抓到按鈕！");

    // 點擊下載按鈕前，先記下現有檔案
    const existingFiles = new Set(await fsp.readdir(downloadPath));

    // 模擬點擊
    await page.click("#download-pdf-btn");

    const waitForFileDownload = async (dir, timeout = 10000) => {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const start = Date.now();

      while (Date.now() - start < timeout) {
        const currentFiles = await fsp.readdir(dir);
        console.log("現有檔案:", existingFiles);
        console.log("目前下載的檔案:", currentFiles);
        const newPdf = currentFiles.find(
          (file) => file.endsWith(".pdf") && !existingFiles.has(file)
        );

        if (newPdf) return path.join(dir, newPdf);
        await sleep(1000);
      }

      const downloadSubPath = path.join(downloadPath, "download");

      try {
        const stat = await fsp.stat(downloadSubPath);

        if (stat.isDirectory()) {
          const innerFiles = await fsp.readdir(downloadSubPath);
          console.log("⬇️ download/ 資料夾內容:", innerFiles);
        } else {
          console.log("⚠️ download 是檔案，不是資料夾（可能是 .crdownload）");
        }
      } catch (e) {
        console.log("📁 無法讀取 download 子路徑:", e.message);
      }

      // throw new Error("PDF 檔案下載超時");
    };

    const pdfFilePath = await waitForFileDownload(downloadPath);

    console.log("PDF 檔案下載完成:", pdfFilePath);

    const fileBuffer = await fsp.readFile(pdfFilePath);
    const fileBlob = new Blob([fileBuffer], { type: "application/pdf" });

    const stats = await fsp.stat(pdfFilePath);

    console.log("📄 檔案大小 (bytes):", stats.size);
    console.log("sessionToken:", sessionToken);

    const uploadResponse = await uploadPdf(fileBlob, sessionToken, reportId);

    if (uploadResponse.status !== 200) {
      throw new Error("上傳檔案失敗");
    } else {
      console.log("上傳成功");
    }
  } catch (error) {
    await page.screenshot({ path: "debug.png", fullPage: true });
    throw error; // 讓上層捕捉錯誤
  } finally {
    await browser.close();
  }
};
