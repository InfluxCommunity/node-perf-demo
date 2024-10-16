async function fetchMetrics() {
  try {
    const response = await fetch('/api/metrics');
    const metrics = await response.json();

    if (metrics && metrics.length > 0) {
      const latest = metrics[0];

      document.getElementById('cpuValue').textContent = `${latest.cpu.toFixed(2)}%`;
      document.getElementById('memoryValue').textContent = `${(latest.memory / (1024 * 1024)).toFixed(2)} MB`;
      document.getElementById('restartsValue').textContent = latest.restarts;
      document.getElementById('uptimeValue').textContent = `${Math.floor(Number(latest.uptime) / 1000)}s`;
      document.getElementById('requestsPerFiveSecondsValue').textContent = latest.requestsPerFiveSeconds;
      document.getElementById('activeRequestsValue').textContent = latest.activeRequests;

      const now = new Date();
      document.getElementById('lastUpdated').textContent = `Last updated: ${now.toLocaleTimeString()}`;
    }
    else {
      console.log('No metrics data received');
    }
  }
  catch (error) {
    console.error('Error fetching metrics:', error);
  }
}

// Update metrics every 5 seconds
setInterval(fetchMetrics, 5000);
fetchMetrics(); // Initial fetch