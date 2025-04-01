import bcrypt from "bcrypt";

const INTERNAL_KEY = "gz5JvVLdQlgng9j712XYnGzd";

export default async (urlPath: string) => {
  try {
    const saltRounds = bcrypt?.genSaltSync(4);
    const timestamp = Math.floor(Date.now() / 1000).toString(); // 取得當前時間戳記
    const lejuInternalToken = bcrypt?.hashSync(
      urlPath + INTERNAL_KEY + timestamp,
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
