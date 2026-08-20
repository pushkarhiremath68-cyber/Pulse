async function findWorkingNodes() {
  console.log('Fetching official Piped instances list...');
  try {
    const res = await fetch('https://raw.githubusercontent.com/TeamPiped/piped-instances/main/instances.json');
    if (!res.ok) throw new Error('Failed to fetch instances');
    const instances = await res.json();
    
    // Sort by uptime or whatever metrics available, but since we just have a list, let's test a few random ones.
    const validNodes = instances.filter(i => i.api_url && i.up_to_date).map(i => i.api_url);
    console.log(`Found ${validNodes.length} potentially working instances. Testing first 15...`);
    
    let workingNodes = [];
    for (let i = 0; i < Math.min(15, validNodes.length); i++) {
      const node = validNodes[i];
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const testRes = await fetch(`${node}/streams/Umqb9KENgmk`, { signal: controller.signal });
        clearTimeout(timeout);
        if (testRes.ok) {
          const data = await testRes.json();
          if (data.audioStreams && data.audioStreams.length > 0) {
            console.log(`[WORKING] ${node}`);
            workingNodes.push(node);
          }
        }
      } catch (e) {}
    }
    console.log('--- Working Nodes ---');
    console.log(workingNodes.map(n => `'${n}'`).join(',\n'));
  } catch (e) {
    console.error('Failed', e);
  }
}

findWorkingNodes().catch(console.error);
