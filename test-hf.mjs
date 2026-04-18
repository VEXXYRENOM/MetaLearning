import { Client } from '@gradio/client';
Client.connect('stabilityai/stable-fast-3d')
  .then(c => console.log("Connected successfully"))
  .catch(e => console.error(e));
