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

const cookieList = [
  {
    domain: ".dev2.leju.trade",
    expirationDate: 1778175039.457494,
    hostOnly: false,
    httpOnly: false,
    name: "__lt__cid",
    path: "/",
    sameSite: "unspecified",
    secure: false,
    session: false,
    storeId: "0",
    value: "a8c99acf-e880-4c7f-b82c-5653e144dc5f",
    id: 1,
  },
  {
    domain: ".dev2.leju.trade",
    expirationDate: 1743616839,
    hostOnly: false,
    httpOnly: false,
    name: "__lt__sid",
    path: "/",
    sameSite: "unspecified",
    secure: false,
    session: false,
    storeId: "0",
    value: "1d6d56c0-b31d7514",
    id: 2,
  },
  {
    domain: ".leju.trade",
    expirationDate: 1743616268.755266,
    hostOnly: false,
    httpOnly: true,
    name: "__cf_bm",
    path: "/",
    sameSite: "no_restriction",
    secure: true,
    session: false,
    storeId: "0",
    value:
      "br4ZQ9arqnrwwbRDcf6HBMj2y_0B93OGpHwdETEOrN8-1743614469-1.0.1.1-39Jhb7RYYcO0p5WXAmI3ARNAE8Mh9p.8_KAHdFMd0F9VPM5B_KLT8M1rCLQJkLJ0CWEqez.cZkqbjA3xjjdC4nkWZGzxINXAAMpISL5GoAo",
    id: 3,
  },
  {
    domain: ".leju.trade",
    expirationDate: 1751391039,
    hostOnly: false,
    httpOnly: false,
    name: "_fbp",
    path: "/",
    sameSite: "unspecified",
    secure: false,
    session: false,
    storeId: "0",
    value: "fb.1.1741762450656.235041984845289057",
    id: 4,
  },
  {
    domain: ".leju.trade",
    expirationDate: 1778175039.424454,
    hostOnly: false,
    httpOnly: false,
    name: "_ga",
    path: "/",
    sameSite: "unspecified",
    secure: false,
    session: false,
    storeId: "0",
    value: "GA1.1.463050845.1741762465",
    id: 5,
  },
  {
    domain: ".leju.trade",
    expirationDate: 1778175039.424149,
    hostOnly: false,
    httpOnly: false,
    name: "_ga_L3MN46Q38F",
    path: "/",
    sameSite: "unspecified",
    secure: false,
    session: false,
    storeId: "0",
    value: "GS1.1.1743613489.8.1.1743615039.60.0.0",
    id: 6,
  },
  {
    domain: ".leju.trade",
    expirationDate: 1749538465,
    hostOnly: false,
    httpOnly: false,
    name: "_gcl_au",
    path: "/",
    sameSite: "unspecified",
    secure: false,
    session: false,
    storeId: "0",
    value: "1.1.13032393.1741762465",
    id: 7,
  },
  {
    domain: "dev2.leju.trade",
    expirationDate: 1743615960,
    hostOnly: true,
    httpOnly: false,
    name: "_dd_s",
    path: "/",
    sameSite: "strict",
    secure: false,
    session: false,
    storeId: "0",
    value:
      "logs=1&id=e1cec379-05fa-40f6-8345-d5fb14a4e818&created=1743614469822&expire=1743615939283",
    id: 8,
  },
  {
    domain: "dev2.leju.trade",
    expirationDate: 1777533680.804189,
    hostOnly: true,
    httpOnly: true,
    name: "cookie_id",
    path: "/",
    sameSite: "strict",
    secure: true,
    session: false,
    storeId: "0",
    value: "336471667e3aaf0868283.16803911",
    id: 9,
  },
  {
    domain: "dev2.leju.trade",
    expirationDate: 1746206471.297456,
    hostOnly: true,
    httpOnly: true,
    name: "expertStatus",
    path: "/",
    sameSite: "lax",
    secure: true,
    session: false,
    storeId: "0",
    value: "1",
    id: 10,
  },
  {
    domain: "dev2.leju.trade",
    expirationDate: 1746206471.297502,
    hostOnly: true,
    httpOnly: true,
    name: "frontend_session",
    path: "/",
    sameSite: "lax",
    secure: true,
    session: false,
    storeId: "0",
    value:
      "eyJpdiI6InI1QUFNXC8xK0ZFYzVSOWc2NHJhVCt3PT0iLCJ2YWx1ZSI6IjE3T2dTWEdURTJma2tSV29yMFZWOHBBb1FVbHdnNW1XcnE4TmFPV3k3Qlpxc05NZUlvSVFyYU9PbFYzbXpWbHAiLCJtYWMiOiJmM2JjOGYyMjJmNWY5YTJkMTgyMDRjNWEzMDA1ZmQ3ZDIyMTllMTUzNTgyMTk2ODYyNzg1OWViZWFlMmYyODZlIn0%3D",
    id: 11,
  },
  {
    domain: "dev2.leju.trade",
    expirationDate: 1746206471.297402,
    hostOnly: true,
    httpOnly: true,
    name: "lejuLoginCookie",
    path: "/",
    sameSite: "lax",
    secure: true,
    session: false,
    storeId: "0",
    value: "1",
    id: 12,
  },
  {
    domain: "dev2.leju.trade",
    expirationDate: 1746206471.29744,
    hostOnly: true,
    httpOnly: true,
    name: "memberName",
    path: "/",
    sameSite: "lax",
    secure: true,
    session: false,
    storeId: "0",
    value: "%E9%99%B3%E5%AD%9F%E6%98%95",
    id: 13,
  },
  {
    domain: "dev2.leju.trade",
    hostOnly: true,
    httpOnly: true,
    name: "PHPSESSID",
    path: "/",
    sameSite: "strict",
    secure: true,
    session: true,
    storeId: "0",
    value: "metv9js3jdn3enjs67gen1pb6g",
    id: 14,
  },
  {
    domain: "dev2.leju.trade",
    expirationDate: 1778174471.297529,
    hostOnly: true,
    httpOnly: true,
    name: "remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d",
    path: "/",
    sameSite: "lax",
    secure: true,
    session: false,
    storeId: "0",
    value:
      "eyJpdiI6ImlMZjI4dlh3cU9lYmhOQmczdW5rNVE9PSIsInZhbHVlIjoiRWk2Z01TXC9TenFkY29xY0VSNjZMYXFzVnB3UUkwK2xpNVwvWVVzU2lYMGgyc21FSHFGWHdtXC9uSEoyeW1VSkVyOUtrR1hGWFRNbXN4XC9YRlRJSjlMVDhxcTlPekY2TWZcLzlpMEJZc2czOWRDU1VRVlYyVW5MY0hpQ1VVdlBhUndiRjRBY2hvNUQ3aHRScXFaWSsxY09SSUp5SmNWQnVDeUkzWkJRQmxGbzB5TVQ0VjJJTFUxSmlwTmlOaUdhTEg5M08iLCJtYWMiOiI2Y2Q0ZDAzNWNmYzhiODI0MzIxZDA4MWJhZGVjMmYzYmE4OTM3ZTUxZjQ5MjFiZGFkZGIxMjMyZjU0MjFhOGFhIn0%3D",
    id: 15,
  },
  {
    domain: "dev2.leju.trade",
    expirationDate: 1746206471.297422,
    hostOnly: true,
    httpOnly: true,
    name: "sessionToken",
    path: "/",
    sameSite: "lax",
    secure: true,
    session: false,
    storeId: "0",
    value: "405492_d4a5ac3744e05a2a8ec845f80b81b847",
    id: 16,
  },
  {
    domain: "dev2.leju.trade",
    expirationDate: 1746206471.297474,
    hostOnly: true,
    httpOnly: false,
    name: "XSRF-TOKEN",
    path: "/",
    sameSite: "lax",
    secure: true,
    session: false,
    storeId: "0",
    value:
      "eyJpdiI6ImhoY2xVZjRCd1YzR2FUNWtUdkRqeHc9PSIsInZhbHVlIjoiU1ZpR09FZU55MEI2TVdpVVBGcXorXC8wcnZwNVpqSTdmUHYzY21uZDVWOWUzKzRjbnJNVGJRM2RXNkNkT00waWsiLCJtYWMiOiIyZjNhODM3MzFmYjQyZmFlOWVjZDFhZTBiNzViODlkZjU0ZWY0MmIwNDAxYzA1NzVkNDYzOTAzMzlkOGZkNTM2In0%3D",
    id: 17,
  },
];

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

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
  );
  await page.setViewport({ width: 1280, height: 800 });
  await page.setExtraHTTPHeaders({
    "Accept-Language": "zh-TW,zh;q=0.9",
  });

  await page._client().send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath,
  });

  await page.setCookie(...cookieList);

  try {
    // await browser.setCookie(
    //   {
    //     name: "sessionToken",
    //     value: "405492_d4a5ac3744e05a2a8ec845f80b81b847",
    //     domain: "dev2.leju.trade",
    //     path: "/",
    //     httpOnly: true,
    //   },
    //   {
    //     name: "lejuLoginCookie",
    //     value: "1",
    //     domain: "dev2.leju.trade",
    //     path: "/",
    //     httpOnly: true,
    //   }
    // );

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
