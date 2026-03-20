import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GraphVisualizer from './GraphVisualizer';
import './App.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * @typedef {Object} GraphData
 * @property {Array<{id: string, label: string, lat: number, lon: number}>} nodes
 * @property {Array<{source: string, target: string}>} edges
 */

function App() {
  const [cities, setCities] = useState([]);
  const [startCity, setStartCity] = useState('');
  const [targetCity, setTargetCity] = useState('');
  const [method, setMethod] = useState('bfs');
  const [graphData, setGraphData] = useState(null);
  const [animationSteps, setAnimationSteps] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Load cities and graph on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Get cities
        const citiesRes = await axios.get(`${API_BASE_URL}/cities`);
        setCities(citiesRes.data.cities);
        if (citiesRes.data.cities.length > 0) {
          setStartCity(citiesRes.data.cities[0]);
          setTargetCity(citiesRes.data.cities[1] || citiesRes.data.cities[0]);
        }

        // Get graph
        const graphRes = await axios.get(`${API_BASE_URL}/graph`);
        setGraphData(graphRes.data);
      } catch (err) {
        setError('Erro ao carregar dados iniciais: ' + err.message);
        console.error(err);
      }
    };

    loadInitialData();
  }, []);

  const handlePlay = async () => {
    if (!startCity || !targetCity) {
      setError('Por favor, selecione cidade de origem e destino');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setAnimationSteps([]);

    try {
      const searchRes = await axios.post(`${API_BASE_URL}/search`, {
        start: startCity,
        target: targetCity,
        method: method,
      });

      const data = searchRes.data;
      setResult(data);
      setAnimationSteps(data.steps);
      setIsAnimating(true);

      // Auto-stop animation after it finishes
      setTimeout(() => {
        setIsAnimating(false);
      }, data.steps.length * animationSpeed + 1000);
    } catch (err) {
      setError('Erro na busca: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const methodName = method === 'bfs' ? 'Largura' : 'Profundidade';

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🗺️ Busca em Grafo - Cidades de Mato Grosso</h1>
        <p>Visualização Interativa de BFS e DFS</p>
      </header>

      <div className="app-content">
        <aside className="control-panel">
          <div className="control-section">
            <h2>Controles</h2>

            <div className="form-group">
              <label htmlFor="start-city">Cidade de Origem:</label>
              <select
                id="start-city"
                value={startCity}
                onChange={e => setStartCity(e.target.value)}
                disabled={isAnimating}
              >
                <option value="">Selecione...</option>
                {cities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="target-city">Cidade de Destino:</label>
              <select
                id="target-city"
                value={targetCity}
                onChange={e => setTargetCity(e.target.value)}
                disabled={isAnimating}
              >
                <option value="">Selecione...</option>
                {cities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="method">Tipo de Busca:</label>
              <select
                id="method"
                value={method}
                onChange={e => setMethod(e.target.value)}
                disabled={isAnimating}
              >
                <option value="bfs">Busca em Largura (BFS)</option>
                <option value="dfs">Busca em Profundidade (DFS)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="speed">Velocidade da Animação:</label>
              <input
                id="speed"
                type="range"
                min="100"
                max="2000"
                step="100"
                value={animationSpeed}
                onChange={e => setAnimationSpeed(parseInt(e.target.value))}
                disabled={isAnimating}
              />
              <span className="speed-value">{animationSpeed}ms</span>
            </div>

            <button
              className="play-button"
              onClick={handlePlay}
              disabled={isAnimating || loading || !startCity || !targetCity}
            >
              {loading ? 'Carregando...' : isAnimating ? 'Animando...' : '▶ Play'}
            </button>

            {error && <div className="error-message">{error}</div>}

            {result && (
              <div className="result-section">
                <h3>Resultado</h3>
                {result.found ? (
                  <>
                    <p className="success">✓ {result.target} foi encontrado!</p>
                    <div className="path-info">
                      <p>
                        <strong>Total visitadas:</strong> {result.visited.length}
                      </p>
                      <p>
                        <strong>Cidades visitadas:</strong>
                      </p>
                      <div className="visited-list">
                        {result.visited.map((city, idx) => (
                          <span key={idx} className="visited-item">
                            {city}
                            {idx < result.visited.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                      <p style={{ marginTop: '10px' }}>
                        <strong>Caminho (solução):</strong>
                      </p>
                      <div className="path-list">
                        {result.path.map((city, idx) => (
                          <span key={idx}>
                            {city}
                            {idx < result.path.length - 1 && ' → '}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="error">✗ Cidade não encontrada no grafo</p>
                )}
              </div>
            )}
          </div>
        </aside>

        <main className="graph-section">
          {graphData ? (
            <GraphVisualizer
              graphData={graphData}
              animationSteps={animationSteps}
              isAnimating={isAnimating}
              animationSpeed={animationSpeed}
            />
          ) : (
            <div className="loading">Carregando grafo...</div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
