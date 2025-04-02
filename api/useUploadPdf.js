const generateInternalHeader = require("../utils/generateInternalHeader");

/**
 * 上傳行情報告 PDF
 * method: POST
 * @param {String} sessionToken 驗證是否為合法會員
 * @param {Files} pdfFile 賣屋報告 PDF 檔
 * @param {String} reportId 賣屋報告 ID
 * @returns
 */
const API_URL = "https://dev-leju-internal-api.leju.trade";

module.exports = async (sessionToken, pdfFile, reportId) => {
  // 產生內部驗證token
  const urlPath = "/api/internal/sell_house/upload/report";
  const headers = await generateInternalHeader(urlPath);

  Object.assign(headers, {
    sessionToken,
  });

  const formData = new FormData();
  formData.append("report_id", reportId);
  formData.append("file_content", pdfFile);

  try {
    return await fetch(`${API_URL}/api/internal/sell_house/upload/report`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch (error) {
    console.error("上傳檔案失敗:", error);
    throw error;
  }
};
