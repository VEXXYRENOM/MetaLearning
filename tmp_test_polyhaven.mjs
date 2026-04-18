import https from 'https';

https.get('https://api.polyhaven.com/assets?t=models', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const keys = Object.keys(parsed).slice(0, 5);
      console.log('Success! Found:', keys);
    } catch (e) {
      console.error('Parse error');
    }
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
