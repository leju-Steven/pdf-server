const generateInternalHeader = require("../utils/generateInternalHeader");
require('dotenv').config();

/**
 * 上傳行情報告 PDF
 * method: POST
 * @param {Files} fileBlob 賣屋報告 PDF 檔
 * @param {String} sessionToken 驗證是否為合法會員
 * @param {String} reportId 賣屋報告 ID
 * @returns
 */
const API_URL = process.env.INTERNAL_API_URL;

module.exports = async (fileBlob, sessionToken, reportId) => {
  // 產生內部驗證token
  const urlPath = "/api/internal/sell_house/upload/report";

  const headers = {
    ...(await generateInternalHeader(urlPath)),
    sessionToken,
  };

  const form = new FormData();
  form.append("file_content", fileBlob);
  form.append("report_id", reportId);

  try {
    return await fetch(API_URL + urlPath, {
      method: "POST",
      headers,
      body: form,
    });
  } catch (error) {
    console.error("上傳檔案失敗:", error);
    throw error;
  }
};
