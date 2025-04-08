const generateInternalHeader = require("../utils/generateInternalHeader");

/**
 * 上傳行情報告 PDF
 * method: POST
 * @param {Files} formData 賣屋報告 PDF 檔
 * @param {String} sessionToken 驗證是否為合法會員
 * @param {String} reportId 賣屋報告 ID
 * @returns
 */
// const API_URL = "https://dev-leju-internal-api.leju.trade";
const API_URL = "http://ec2-43-201-79-31.ap-northeast-2.compute.amazonaws.com";

module.exports = async (formData, sessionToken) => {
  // 產生內部驗證token
  const urlPath = "/api/internal/sell_house/upload/report";

  const headers = {
    ...(await generateInternalHeader(urlPath)),
    sessionToken,
  };

  console.log("headers", headers);
  console.log("body", formData);

  try {
    return await fetch(API_URL + urlPath, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch (error) {
    console.error("上傳檔案失敗:", error);
    throw error;
  }
};
