import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import './GraphVisualizer.css';

/**
 * GraphVisualizer com posicionamento geográfico real dos nós
 * Usa lat/lon para posicionar cidades corretamente no mapa
 */
// Cores por estado globais
const stateColors = {
  'MT': '#FF6B6B',  // Vermelho
  'MS': '#4ECDC4',  // Teal
  'GO': '#45B7D1',  // Azul
  'DF': '#FFA07A',  // Laranja
};

const GraphVisualizer = ({
  graphData,
  animationSteps,
  isAnimating,
  animationSpeed,
  searchMode = 'traditional'
}) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [geneticHUD, setGeneticHUD] = useState(null);

  // === USE EFFECT 1: RENDERIZAR E INICIALIZAR O MAPA ===
  useEffect(() => {
    if (!graphData || !containerRef.current) return;

    // Calcular bounds geográficos reais
    const lats = graphData.nodes.map(n => n.lat);
    const lons = graphData.nodes.map(n => n.lon);
    const latMin = Math.min(...lats);
    const latMax = Math.max(...lats);
    const lonMin = Math.min(...lons);
    const lonMax = Math.max(...lons);

    const latRange = latMax - latMin;
    const lonRange = lonMax - lonMin;

    // Canvas virtual: largura base, altura proporcional à lat/lon para evitar distorção (aspect ratio correto)
    const canvasWidth = 1200;
    const aspectRatio = latRange / lonRange;
    const canvasHeight = canvasWidth * aspectRatio;

    // Converter lat/lon para coordenadas canvas (X, Y)
    // Longitude: da esquerda para direita (Oeste para Leste)
    // Latitude: invertida (Norte no topo, Sul em baixo)
    const mapCoordinates = graphData.nodes.map(node => {
      const x = ((node.lon - lonMin) / lonRange) * canvasWidth;
      const y = ((latMax - node.lat) / latRange) * canvasHeight;
      return { id: node.id, x, y };
    });

    // Criar elementos do Cytoscape com posições fixas geográficas
    const elements = [
      ...graphData.nodes.map(node => {
        const coord = mapCoordinates.find(c => c.id === node.id);
        return {
          data: { 
            id: node.id, 
            label: node.label,
            state: node.state 
          },
          position: { x: coord.x, y: coord.y },
        };
      }),
      ...graphData.edges.map(edge => ({
        data: { 
          id: `${edge.source}-${edge.target}`, 
          source: edge.source, 
          target: edge.target 
        },
      })),
    ];

    // Inicializar Cytoscape com otimizações de performance
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      wheelSensitivity: 0.5,  // Aumentado de 0.1 para melhor responsividade
      pixelRatio: 1,  // Performance sobre qualidade
      hideEdgesOnViewport: true,  // Esconder arestas durante pan/zoom
      textureOnViewport: true,
      motionBlur: false,
      styleEnabled: true,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': node => searchMode === 'genetic' ? '#0a2a0a' : (stateColors[node.data('state')] || '#c5d9f1'),
            'label': 'data(label)',
            'text-valign': 'top',
            'text-halign': 'center',
            'text-margin-y': -2,
            'width': '6px',
            'height': '6px',
            'font-size': '6px', // Tamanho bem menor para não engolir o mapa
            'min-zoomed-font-size': 12, // Aparece em zoom >= 2.0 (quando 6px * 2.0 = 12)
            'font-weight': 'bold',
            'border-width': '0.5px',
            'border-color': searchMode === 'genetic' ? '#004400' : '#1a1a1a',
            'text-wrap': 'wrap',
            'color': searchMode === 'genetic' ? '#00cc00' : '#222',
            'text-overflow-wrap': 'whitespace',
            'text-background-padding': '1px', // Fundo mais justo e fino
            'text-background-opacity': searchMode === 'genetic' ? 0 : 0.75,
            'text-background-color': '#ffffff',
            'text-background-shape': 'roundrectangle',
          },
        },
        {
          selector: 'node:hover',
          style: {
            'width': '10px',
            'height': '10px',
            'font-size': '10px', // Cresce a fonte para ganhar destaque extra no hover
            'text-background-opacity': 1,
            'z-index': 100, // Traz para frente ao passar o mouse
          },
        },
        {
          selector: 'edge',
          style: {
            'line-color': searchMode === 'genetic' ? '#001a00' : '#b0b0b0',
            'width': 0.5,
            'opacity': searchMode === 'genetic' ? 0.3 : 0.2,
            'curve-style': 'straight',
            'display': 'element',
          },
        },
      ],
      layout: {
        name: 'preset',
        animate: false,
      },
    });

    cyRef.current = cy;

    // Evento de zoom
    const zoomHandler = () => {
      setZoomLevel(cy.zoom());
    };
    cy.on('zoom', zoomHandler);

    // Suporte a scroll com Ctrl+Wheel para zoom - OTIMIZADO PARA RESPONSIVIDADE
    let wheelTimeout;
    const wheelHandler = (e) => {
      if ((e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        
        // Zoom multiplicativo é muito mais responsivo que aditivo
        const zoomFactor = e.deltaY > 0 ? 0.88 : 1.12; // ~12% por scroll
        const currentZoom = cy.zoom();
        const newZoom = Math.max(0.3, Math.min(4, currentZoom * zoomFactor));
        
        // Zoom imediato sem delay
        cy.zoom(newZoom);
        setZoomLevel(newZoom);
        
        // Esconder arestas durante zoom para performance
        if (newZoom !== currentZoom) {
          clearTimeout(wheelTimeout);
          cy.elements('edge').hide();
          
          wheelTimeout = setTimeout(() => {
            cy.elements('edge').show();
          }, 200); // Mostrar arestas após 200ms
        }
      }
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('wheel', wheelHandler, { passive: false });
    }

    return () => {
      clearTimeout(wheelTimeout);
      cy.off('zoom', zoomHandler);
      if (containerRef.current) {
        containerRef.current.removeEventListener('wheel', wheelHandler);
      }
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [graphData, searchMode]); // Depende apenas de graphData e searchMode!

  // === USE EFFECT 2: ANIMAÇÃO (NÃO RECRIARÁ O CYTOSCAPE) ===
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // Limpar o mapa de rotas velhas quando uma nova busca inicia (animationSteps é zerado no App.jsx)
    if (animationSteps.length === 0) {
      if (searchMode === 'genetic') {
        cy.edges().style({ 'line-color': '#001a00', 'width': 0.5, 'opacity': 0.3 });
        cy.nodes().style({ 
          'background-color': '#0a2a0a', 
          'color': '#00cc00', 
          'font-size': '6px', 
          'width': '6px', 
          'height': '6px', 
          'z-index': 1 
        });
      } else {
        cy.nodes().forEach(node => {
          const state = node.data('state');
          node.style({
            'background-color': stateColors[state] || '#c5d9f1',
            'width': '6px',
            'height': '6px',
            'font-size': '6px',
            'z-index': 1
          });
        });
      }
      setGeneticHUD(null);
      return;
    }

    // Animar passos da busca
    if (isAnimating && animationSteps.length > 0) {
      let stepIndex = 0;

      const animationInterval = setInterval(() => {
        if (stepIndex >= animationSteps.length) {
          clearInterval(animationInterval);
          setGeneticHUD(prev => prev ? { ...prev, done: true } : null);
          return;
        }

        const step = animationSteps[stepIndex];

        // PAN ANIMADO DA CÂMERA ACOMPANHANDO A BUSCA
        const targetNode = cy.getElementById(step.current);
        if (targetNode.length > 0) {
          cy.animate({
            center: { eles: targetNode }
          }, {
            duration: Math.max(animationSpeed * 0.8, 100),
            easing: 'ease-out'
          });
        }

        // Atualizar cores dos nós e arestas baseado no modo de busca
        if (searchMode === 'genetic' && step.generation !== undefined) {
          // HUD e Câmera
          setGeneticHUD({ gen: step.generation, fit: step.best_fitness, found: step.found });
          
          // EFEITO DE RASTRO: Esfria os caminhos anteriores (fossilização) em vez de apagá-los
          cy.edges('[line-color="#00ff00"]').style({ 
            'line-color': '#005500', 
            'width': 2, 
            'opacity': 0.85 
          });
          
          cy.nodes('[background-color="#00ff00"]').style({ 
            'background-color': '#002200', 
            'color': '#00cc00',
            'font-size': '6px',
            'width': '6px', 
            'height': '6px', 
            'z-index': 10 
          });

          // Pintar o "Best Path" dessa geração sequencialmente
          const bestPath = step.best_path || [];
          
          if (bestPath.length > 0) {
            const timePerStep = Math.max(10, Math.floor(animationSpeed / bestPath.length));
            
            // Pintar a origem imediatamente
            cy.getElementById(bestPath[0]).style({
              'background-color': '#00ff00', 'color': '#00ff00',
              'font-size': '10px', 'width': '10px', 'height': '10px', 'z-index': 50
            });

            // Crescimento sequencial
            for (let i = 0; i < bestPath.length - 1; i++) {
              setTimeout(() => {
                const n1 = bestPath[i];
                const n2 = bestPath[i+1];
                
                // Pinta aresta
                cy.edges(`[source="${n1}"][target="${n2}"], [source="${n2}"][target="${n1}"]`)
                  .style({ 'line-color': '#00ff00', 'width': 3, 'opacity': 0.8 });
                
                // Pinta nó destino do passo
                const isLast = (i === bestPath.length - 2);
                cy.getElementById(n2).style({
                  'background-color': isLast ? '#ffffff' : '#00ff00',
                  'color': isLast ? '#ffffff' : '#00ff00',
                  'font-size': '10px',
                  'width': isLast ? '14px' : '10px',
                  'height': isLast ? '14px' : '10px',
                  'z-index': isLast ? 100 : 50
                });
              }, i * timePerStep);
            }
          }

        } else {
          // MODO TRADICIONAL (BFS/DFS)
          setGeneticHUD(null);
          cy.nodes().forEach((node) => {
            const nodeId = node.id();
            if (nodeId === step.current) {
              node.style('background-color', '#2ecc71'); // Verde - atual
              node.style('width', '12px');
              node.style('height', '12px');
              node.style('font-size', '10px'); // Destaca o nome da cidade atual
              node.style('z-index', 50);
            } else if (step.visited.includes(nodeId)) {
              node.style('background-color', '#f39c12'); // Laranja - visitado
              node.style('width', '8px');
              node.style('height', '8px');
              node.style('font-size', '6px');
              node.style('z-index', 10);
            } else {
              const state = node.data('state');
              node.style('background-color', stateColors[state] || '#c5d9f1');
              node.style('width', '6px');
              node.style('height', '6px');
              node.style('font-size', '6px');
              node.style('z-index', 1);
            }
          });
        }

        stepIndex++;
      }, animationSpeed);

      return () => {
        clearInterval(animationInterval);
      };
    }
  }, [animationSteps, isAnimating, animationSpeed, searchMode]);

  const handleZoomIn = () => {
    if (cyRef.current) {
      const currentZoom = cyRef.current.zoom();
      const newZoom = Math.min(4, currentZoom * 1.15); // 15% de aumento
      cyRef.current.zoom(newZoom);
      setZoomLevel(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      const currentZoom = cyRef.current.zoom();
      const newZoom = Math.max(0.3, currentZoom * 0.85); // 15% de redução
      cyRef.current.zoom(newZoom);
      setZoomLevel(newZoom);
    }
  };

  const handleFitView = () => {
    if (cyRef.current) {
      cyRef.current.fit(null, 50);
    }
  };

  return (
    <div className="graph-wrapper">
      <div className="map-legend">
        <h3>{searchMode === 'genetic' ? 'Matrix Map' : 'Legenda Estados'}</h3>
        {searchMode === 'genetic' ? (
          <div className="legend-item" style={{ color: '#00ff00' }}>
            <div className="legend-color" style={{ backgroundColor: '#00ff00', boxShadow: '0 0 5px #00ff00' }}></div>
            <span>Melhor Genoma (Neon)</span>
          </div>
        ) : (
          <>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#FF6B6B' }}></div>
              <span>Mato Grosso (MT)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#4ECDC4' }}></div>
              <span>Mato Grosso do Sul (MS)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#45B7D1' }}></div>
              <span>Goiás (GO)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#FFA07A' }}></div>
              <span>Distrito Federal (DF)</span>
            </div>
          </>
        )}
      </div>

      <div className="zoom-controls">
        <button onClick={handleZoomIn} className="zoom-btn" title="Ampliar (Ctrl+Scroll)">
          🔍+
        </button>
        <button onClick={handleZoomOut} className="zoom-btn" title="Reduzir (Ctrl+Scroll)">
          🔍-
        </button>
        <button onClick={handleFitView} className="zoom-btn" title="Ajustar à tela">
          ⬍
        </button>
        <span className="zoom-level">{(zoomLevel * 100).toFixed(0)}%</span>
      </div>

      <div ref={containerRef} className="graph-container" />
      
      {/* GENETIC HUD OVERLAY */}
      {geneticHUD && searchMode === 'genetic' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(0, 20, 0, 0.85)',
          border: '1px solid #00ff00',
          padding: '15px',
          color: '#00ff00',
          fontFamily: 'monospace',
          borderRadius: '5px',
          boxShadow: '0 0 20px rgba(0, 255, 0, 0.2)',
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          <h2 style={{ fontSize: '18px', margin: '0 0 10px 0', borderBottom: '1px solid #005500', paddingBottom: '5px' }}>
            ▤ TERMINAL GENÉTICO
          </h2>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <div><span style={{opacity: 0.7}}>GERAÇÃO:</span> {geneticHUD.gen}</div>
            <div><span style={{opacity: 0.7}}>APTIDÃO (FITNESS):</span> {geneticHUD.fit}</div>
            <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: 'bold' }}>
              {geneticHUD.done ? 
                (geneticHUD.found ? <span style={{color: '#fff', textShadow: '0 0 5px #fff'}}>✅ SOLUÇÃO EVOLUÍDA</span> : <span style={{color: '#ff3333'}}>❌ NÃO ALCANÇOU DESTINO</span>) 
                : <span style={{opacity: 0.5, fontSize: '10px'}}>EVOLUINDO CROMOSSOMOS...</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphVisualizer;
