import generateInternalHeader from "../utils/generateInternalHeader";

/**
 * 上傳行情報告 PDF
 * method: POST
 * @param {String} sessionToken 驗證是否為合法會員
 * @param {Files} imageFile 達人證照圖檔,合法檔案格式:jpg,png,jpeg
 * @returns
 */
const API_URL = "https://dev-api.leju.trade";

export default async (sessionToken: string, imageFile: File, reportId: string) => {
  // 產生內部驗證token
  const urlPath = "/api/internal/sell_house/upload/report";
  const headers = await generateInternalHeader(urlPath);

  Object.assign(headers, {
    sessionToken,
  });

  const formData = new FormData();
  formData.append("report_id", reportId);
  formData.append("file_content", imageFile);

  try {
    return await fetch(`${API_URL}/expert/management/uploadCoverPhoto`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch (error) {
    console.error("上傳檔案失敗:", error);
    throw error;
  }
};
