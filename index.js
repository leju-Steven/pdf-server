const runTask = require("./run");
const args = require("minimist")(process.argv.slice(2));

(async () => {
  try {
    const reportId = args.reportId || process.env.reportId;

    if (!reportId) {
      throw new Error("❗ 缺少必要參數 (--reportId)");
    }

    const sessionToken = "405492_d4a5ac3744e05a2a8ec845f80b81b847";

    await runTask({ reportId, sessionToken });

    console.log("✅ 任務完成");
    process.exit(0);
  } catch (error) {
    console.error("❌ 任務錯誤:", error);
    process.exit(1); // 🔥 不要讓程式卡住
  }
})();

process.on("unhandledRejection", (err) => {
  console.error("🚨 Unhandled rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("🚨 Uncaught exception:", err);
  process.exit(1);
});
