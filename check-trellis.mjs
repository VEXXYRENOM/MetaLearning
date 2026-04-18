import { Client } from "@gradio/client";
import fs from "fs";
async function check() {
  try {
    const space = "JeffreyXiang/TRELLIS";
    const app = await Client.connect(space);
    const info = await app.view_api();
    fs.writeFileSync("trellis_info.json", JSON.stringify(info, null, 2), "utf8");
    console.log("Wrote to trellis_info.json");
  } catch(e) {
    console.error(e);
  }
}
check();
