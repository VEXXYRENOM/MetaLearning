import { Client } from '@gradio/client';

async function testHuggingFace() {
    console.log("Testing Hugging Face connection...");
    try {
        const app = await Client.connect('stabilityai/stable-fast-3d');
        console.log("✅ Hugging Face is accessible.");
        return true;
    } catch (e) {
        console.error("❌ Hugging Face Error:", e.message);
        return false;
    }
}

async function testPollinations() {
    console.log("Testing Pollinations AI...");
    try {
        const res = await fetch("https://image.pollinations.ai/prompt/robot?width=512&height=512&nologo=true");
        if (res.ok) {
            console.log("✅ Pollinations is accessible.");
            return true;
        } else {
            console.error("❌ Pollinations returned status:", res.status);
            return false;
        }
    } catch (e) {
        console.error("❌ Pollinations Error:", e.message);
        return false;
    }
}

async function run() {
    await testPollinations();
    await testHuggingFace();
    console.log("Tests complete.");
}
run();
