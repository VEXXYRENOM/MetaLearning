import { Client } from "@gradio/client";
async function check() {
  try {
    const spaces = [
        "stabilityai/TripoSR",
        "TencentARC/InstantMesh",
        "JeffreyXiang/TRELLIS"
    ];
    for (const space of spaces) {
       console.log(`Checking ${space}...`);
       try {
           const app = await Client.connect(space);
           const info = await app.view_api();
           console.log(`--- ${space} API ---`);
           console.log(JSON.stringify(info, null, 2));
           break; // If we found one, stop.
       } catch (e) {
           console.log(`${space} failed to connect:`, e.message);
       }
    }
  } catch(e) {
    console.error(e);
  }
}
check();
