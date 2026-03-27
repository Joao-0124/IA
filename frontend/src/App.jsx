import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GraphVisualizer from './GraphVisualizer';
import './App.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

function App() {
  // State management
  const [states, setStates] = useState([]);
  const [startState, setStartState] = useState('');
  const [targetState, setTargetState] = useState('');
  const [citiesByState, setCitiesByState] = useState({});
  const [filteredStartCities, setFilteredStartCities] = useState([]);
  const [filteredTargetCities, setFilteredTargetCities] = useState([]);
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

  // Load initial data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Get states
        const statesRes = await axios.get(`${API_BASE_URL}/states`);
        const statesList = statesRes.data.states || [];
        setStates(statesList);

        // Load cities for each state
        const citiesMap = {};
        for (const state of statesList) {
          const citiesRes = await axios.get(`${API_BASE_URL}/cities?state=${state}`);
          citiesMap[state] = citiesRes.data.cities || [];
        }
        setCitiesByState(citiesMap);

        // Set default states
        if (statesList.length > 0) {
          setStartState(statesList[0]);
          setTargetState(statesList[Math.min(1, statesList.length - 1)]);
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

  // Update filtered cities when start state changes
  useEffect(() => {
    const cities = citiesByState[startState] || [];
    setFilteredStartCities(cities);
    setStartCity(cities.length > 0 ? cities[0] : '');
  }, [startState, citiesByState]);

  // Update filtered cities when target state changes
  useEffect(() => {
    const cities = citiesByState[targetState] || [];
    setFilteredTargetCities(cities);
    setTargetCity(cities.length > 0 ? cities[0] : '');
  }, [targetState, citiesByState]);

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
        <h1>🗺️ Busca em Grafo - Centro-Oeste Brasileiro</h1>
        <p>Visualização Interativa de BFS e DFS com 468 Cidades</p>
      </header>

      <div className="app-content">
        <aside className="control-panel">
          <div className="control-section">
            <h2>Controles de Busca</h2>

            {/* Origin State and City */}
            <div className="form-group">
              <label htmlFor="start-state">Estado de Origem:</label>
              <select
                id="start-state"
                value={startState}
                onChange={e => setStartState(e.target.value)}
                disabled={isAnimating}
              >
                <option value="">Selecione...</option>
                {states.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="start-city">Cidade de Origem:</label>
              <select
                id="start-city"
                value={startCity}
                onChange={e => setStartCity(e.target.value)}
                disabled={isAnimating || filteredStartCities.length === 0}
              >
                <option value="">Selecione uma cidade...</option>
                {filteredStartCities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Target State and City */}
            <div className="form-group">
              <label htmlFor="target-state">Estado de Destino:</label>
              <select
                id="target-state"
                value={targetState}
                onChange={e => setTargetState(e.target.value)}
                disabled={isAnimating}
              >
                <option value="">Selecione...</option>
                {states.map(state => (
                  <option key={state} value={state}>
                    {state}
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
                disabled={isAnimating || filteredTargetCities.length === 0}
              >
                <option value="">Selecione uma cidade...</option>
                {filteredTargetCities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Method */}
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

            {/* Animation Speed */}
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

            {/* Play Button */}
            <button
              className="play-button"
              onClick={handlePlay}
              disabled={isAnimating || loading || !startCity || !targetCity}
            >
              {loading ? 'Carregando...' : isAnimating ? 'Animando...' : '▶ Play'}
            </button>

            {error && <div className="error-message">{error}</div>}

            {/* Results Section */}
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
            <div className="loading">Carregando grafo com 468 cidades...</div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
