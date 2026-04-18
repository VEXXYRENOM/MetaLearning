import { Client } from "@gradio/client";
import fs from "fs";
async function check() {
  try {
    const space = "stabilityai/TripoSR";
    const app = await Client.connect(space);
    const info = await app.view_api();
    fs.writeFileSync("triposr_info.json", JSON.stringify(info, null, 2), "utf8");
    console.log("Wrote to triposr_info.json");
  } catch(e) {
    console.error(e);
  }
}
check();
