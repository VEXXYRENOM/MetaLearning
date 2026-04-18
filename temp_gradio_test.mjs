import { Client } from "@gradio/client";

async function checkSpace(name) {
  console.log(`Checking ${name}...`);
  try {
    const app = await Client.connect(name);
    console.log(`[SUCCESS] ${name} is awake!`);
    return true;
  } catch(e) {
    console.error(`[FAIL] ${name}: ${e.message}`);
    return false;
  }
}

async function main() {
  await checkSpace("stabilityai/stable-fast-3d");
  await checkSpace("TencentARC/InstantMesh");
  await checkSpace("dylanebert/LGM");
  await checkSpace("tripo-bilibili/TripoSR");
}
main();
