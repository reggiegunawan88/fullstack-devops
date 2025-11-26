import { useEffect, useState } from 'react';
import './App.css';

interface HealthData {
  status: string;
  timestamp: string;
}

interface HelloData {
  message: string;
}

interface InfoData {
  appName: string;
  framework: string;
  deployedOn: string;
  nodeVersion: string;
  platform: string;
  uptime: number;
}

function App() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [hello, setHello] = useState<HelloData | null>(null);
  const [info, setInfo] = useState<InfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all APIs in parallel
        const [healthRes, helloRes, infoRes] = await Promise.all([
          fetch('/api/health'),
          fetch('/api/hello'),
          fetch('/api/info'),
        ]);

        if (!healthRes.ok || !helloRes.ok || !infoRes.ok) {
          throw new Error('Failed to fetch API data');
        }

        const healthData = await healthRes.json();
        const helloData = await helloRes.json();
        const infoData = await infoRes.json();

        setHealth(healthData);
        setHello(helloData);
        setInfo(infoData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Fullstack DevOps</h1>
        <p className="subtitle">Turborepo + Vite + React 19 + HonoJS (version 2.0)</p>
      </header>

      <main className="main">
        <section className="card">
          <h2>Hello Message</h2>
          <div className="card-content">
            <p className="message">{hello?.message}</p>
          </div>
          <div className="card-content">
            <p className="message">This is the version 2 front end.</p>
          </div>
        </section>

        <section className="card">
          <h2>Health Status</h2>
          <div className="card-content">
            <div className="status">
              <span className="status-indicator"></span>
              <span className="status-text">{health?.status}</span>
            </div>
            <p className="timestamp">
              Last checked:{' '}
              {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}
            </p>
          </div>
        </section>

        <section className="card">
          <h2>Application Info</h2>
          <div className="card-content">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">App Name:</span>
                <span className="info-value">{info?.appName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Framework:</span>
                <span className="info-value">{info?.framework}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Deployed On:</span>
                <span className="info-value">{info?.deployedOn}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Node Version:</span>
                <span className="info-value">{info?.nodeVersion}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Platform:</span>
                <span className="info-value">{info?.platform}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Uptime:</span>
                <span className="info-value">
                  {info?.uptime ? formatUptime(info.uptime) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Built with Turborepo for efficient monorepo management</p>
      </footer>
    </div>
  );
}

export default App;
