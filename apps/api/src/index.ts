import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app";

const PORT = Number(process.env.PORT) || 5000;
const app = createApp();

app.listen(PORT, "0.0.0.0", () => {
  console.log("=========================================");
  console.log(`LANDCHAIN API server listening on 0.0.0.0:${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/api/health`);
  console.log("=========================================");
});
