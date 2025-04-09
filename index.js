const uploadPdf = require("./api/useUploadPdf");
const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
require("dotenv").config();
const app = express();

// env
const PORT = process.env.PORT || 3000;
const IS_LOCAL = process.env.IS_LOCAL || false;
const DOMAIN_NAME = process.env.DOMAIN_NAME;
const SELL_HOUSE_REPORT_URL = process.env.SELL_HOUSE_REPORT_URL;

// 下載 PDF 的 API
app.get("/pdf_report", async (req, res) => {
  const downloadPath = path.resolve(__dirname, "downloads");
  await fsp.mkdir(downloadPath, { recursive: true });

  const browser = await puppeteer.launch({
    headless: IS_LOCAL ? false : "new",
    executablePath: IS_LOCAL ? "" : "/bin/chromium", // 指定 Chrome 的路徑(本地不需要因為通常都有內建了)
    defaultViewport: null, // 使用原生 viewport size
    args: [
      "--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--start-maximized",
    ],
  });

  const page = await browser.newPage();

  await page.setUserAgent("leju-e2e");

  await page._client().send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath,
  });

  try {
    await browser.setCookie(
      {
        name: "sessionToken",
        value: "405492_d4a5ac3744e05a2a8ec845f80b81b847",
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
    await page.goto(`${SELL_HOUSE_REPORT_URL}/R0073bdbee`, {
      waitUntil: "networkidle0",
    });

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

      await page.screenshot({ path: "debug.png", fullPage: true });
      throw new Error("PDF 檔案下載超時");
    };

    const pdfFilePath = await waitForFileDownload(downloadPath);

    console.log("PDF 檔案下載完成:", pdfFilePath);

    const fileBuffer = await fsp.readFile(pdfFilePath);
    const fileBlob = new Blob([fileBuffer], { type: "application/pdf" });

    const stats = await fsp.stat(pdfFilePath);

    console.log("📄 檔案大小 (bytes):", stats.size);

    const uploadResponse = await uploadPdf(
      fileBlob,
      "405492_d4a5ac3744e05a2a8ec845f80b81b847",
      "Rc2f187b9a36"
    );

    if (uploadResponse.status !== 200) {
      throw new Error("上傳檔案失敗");
    } else {
      console.log("上傳成功");
      res.status(200).send("上傳成功");
    }
  } catch (error) {
    await page.screenshot({ path: "debug.png", fullPage: true });
    console.error("Error:", error);
    res.status(500).send("伺服器錯誤", error);
  } finally {
    await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
