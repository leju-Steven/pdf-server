const uploadPdf = require("./api/useUploadPdf");
const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const FormData = require("form-data");

const app = express();
const PORT = process.env.PORT || 3000;

// 下載 PDF 的 API
app.get("/pdf_report", async (req, res) => {
  const downloadPath = path.resolve(__dirname, "downloads");
  await fsp.mkdir(downloadPath, { recursive: true });

  // 加入避免被網站偵測的外掛（Cloudflare / bot 防禦）
  puppeteer.use(StealthPlugin());

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/bin/chromium",
    defaultViewport: null, // 使用原生 viewport size
    args: [
      "--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      // "--start-maximized", // 瀏覽器啟動後最大化視窗
    ],
  });

  const page = await browser.newPage();

  await page.setUserAgent("leju-e2e");
  await page.setViewport({ width: 1280, height: 800 });
  await page.setExtraHTTPHeaders({
    "Accept-Language": "zh-TW,zh;q=0.9",
  });

  await page._client().send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath,
  });

  try {
    await browser.setCookie(
      {
        name: "sessionToken",
        value: "405492_d4a5ac3744e05a2a8ec845f80b81b847",
        domain: "www.leju.com.tw",
        path: "/",
        httpOnly: true,
      },
      {
        name: "lejuLoginCookie",
        value: "1",
        domain: "www.leju.com.tw",
        path: "/",
        httpOnly: true,
      }
    );

    // 前往指定網址
    await page.goto("https://dev2.leju.trade/sell_house/report/R0073bdbee", {
      waitUntil: "networkidle0",
    });

    await page.screenshot({ path: "debug.png", fullPage: true });

    // 等待按鈕出現
    await page.waitForSelector("#download-pdf-btn");

    // 模擬點擊
    await page.click("#download-pdf-btn");

    const waitForFileDownload = async (dir, timeout = 10000) => {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const start = Date.now();

      while (Date.now() - start < timeout) {
        const files = await fsp.readdir(dir);
        const pdfFile = files.find((file) => file.endsWith(".pdf"));
        if (pdfFile) return path.join(dir, pdfFile);
        await sleep(1000);
      }

      throw new Error("PDF 檔案下載超時");
    };

    const pdfFilePath = await waitForFileDownload(downloadPath);

    console.log("PDF 檔案下載完成:", pdfFilePath);

    const form = new FormData();
    form.append(
      "file",
      fs.createReadStream(pdfFilePath),
      path.basename(pdfFilePath)
    );

    const uploadResponse = await uploadPdf(
      "405492_d4a5ac3744e05a2a8ec845f80b81b847",
      form,
      "R0073bdbee"
    );
    console.log("上傳 API response:", uploadResponse);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("伺服器錯誤");
  } finally {
    await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
