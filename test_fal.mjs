import fs from 'fs';

async function test() {
    // Generate a tiny valid transparent pixel png data url
    const imgUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
    
    console.log("fetching...");
    const res = await fetch("https://fal.run/fal-ai/stable-fast-3d", {
        method: "POST",
        headers: {
            "Authorization": "Key 02172802-18cc-4d3d-a91b-bf21c838a477:049d758069722d68d58a208af27d64f2",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            image_url: imgUrl 
        })
    });
    
    console.log(res.status);
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
}

test();
