const bcrypt = require("bcryptjs");
require('dotenv').config();

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

module.exports = async (urlPath) => {
  try {
    const saltRounds = bcrypt?.genSaltSync(4);
    const timestamp = Math.floor(Date.now() / 1000).toString(); // 取得當前時間戳記
    const lejuInternalToken = bcrypt?.hashSync(
      urlPath + INTERNAL_API_SECRET + timestamp,
      saltRounds
    );

    return {
      "leju-internal-token": lejuInternalToken,
      timestamp,
      source: "frontend", // 前端.
    };
  } catch (error) {
    console.error("Error generating internal header:", error);
    throw error;
  }
};
