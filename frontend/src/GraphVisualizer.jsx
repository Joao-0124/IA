import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import './GraphVisualizer.css';

/**
 * GraphVisualizer com posicionamento geográfico real dos nós
 * Usa lat/lon para posicionar cidades corretamente no mapa
 */
const GraphVisualizer = ({
  graphData,
  animationSteps,
  isAnimating,
  animationSpeed,
}) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);

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

    // Cores por estado
    const stateColors = {
      'MT': '#FF6B6B',  // Vermelho
      'MS': '#4ECDC4',  // Teal
      'GO': '#45B7D1',  // Azul
      'DF': '#FFA07A',  // Laranja
    };

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
            'background-color': node => stateColors[node.data('state')] || '#c5d9f1',
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
            'border-color': '#1a1a1a',
            'text-wrap': 'wrap',
            'color': '#222',
            'text-overflow-wrap': 'whitespace',
            'text-background-padding': '1px', // Fundo mais justo e fino
            'text-background-opacity': 0.75,
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
            'line-color': '#b0b0b0',
            'width': 0.5,
            'opacity': 0.2,
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
    cy.on('zoom', () => {
      setZoomLevel(cy.zoom());
    });

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

    // Animar passos da busca
    if (isAnimating && animationSteps.length > 0) {
      let stepIndex = 0;

      const animationInterval = setInterval(() => {
        if (stepIndex >= animationSteps.length) {
          clearInterval(animationInterval);
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

        // Atualizar cores dos nós
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

        stepIndex++;
      }, animationSpeed);

      return () => {
        clearInterval(animationInterval);
        clearTimeout(wheelTimeout);
        if (containerRef.current) {
          containerRef.current.removeEventListener('wheel', wheelHandler);
        }
      };
    }

    return () => {
      clearTimeout(wheelTimeout);
      if (containerRef.current) {
        containerRef.current.removeEventListener('wheel', wheelHandler);
      }
    };
  }, [graphData, animationSteps, isAnimating, animationSpeed]);

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
        <h3>Legenda Estados</h3>
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
    </div>
  );
};

export default GraphVisualizer;
