exports.handler = async function(event, context) {
  const targetUrl = event.queryStringParameters.url;
  if (!targetUrl) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Missing url parameter' })
    };
  }

  try {
    const fetchRes = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    
    // Convert headers to object
    const headers = { 'Access-Control-Allow-Origin': '*' };
    if (fetchRes.headers.has('content-type')) headers['Content-Type'] = fetchRes.headers.get('content-type');
    
    // Netlify Serverless Functions don't natively support chunked streaming easily with standard response body.
    // However, they can return ArrayBuffer or Base64 for binary data. 
    // Wait, since we are fetching a stream, we can just return the raw arrayBuffer if it's small,
    // but audio files can be 5MB. Netlify allows up to 6MB.
    
    const buffer = await fetchRes.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');
    
    return {
      statusCode: 200,
      headers: headers,
      isBase64Encoded: true,
      body: base64Data
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
