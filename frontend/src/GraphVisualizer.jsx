import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import coselayout from 'cytoscape-cose-bilkent';
import './GraphVisualizer.css';

cytoscape.use(coselayout);

/**
 * @typedef {Object} Node
 * @property {string} id
 * @property {string} label
 * @property {number} lat
 * @property {number} lon
 */

/**
 * @typedef {Object} Edge
 * @property {string} source
 * @property {string} target
 */

/**
 * @typedef {Object} GraphData
 * @property {Node[]} nodes
 * @property {Edge[]} edges
 */

/**
 * @typedef {Object} AnimationStep
 * @property {string} current
 * @property {string[]} visited
 * @property {boolean} found
 */

/**
 * @param {Object} props
 * @param {GraphData|null} props.graphData
 * @param {AnimationStep[]} props.animationSteps
 * @param {boolean} props.isAnimating
 * @param {number} props.animationSpeed
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

    // Normalize coordinates for layout
    const lats = graphData.nodes.map(n => n.lat);
    const lons = graphData.nodes.map(n => n.lon);
    const latMin = Math.min(...lats);
    const latMax = Math.max(...lats);
    const lonMin = Math.min(...lons);
    const lonMax = Math.max(...lons);

    // Create Cytoscape elements
    const elements = [
      ...graphData.nodes.map(node => {
        // Normalize positions
        const x = ((node.lon - lonMin) / (lonMax - lonMin)) * 800 - 400;
        const y = ((latMax - node.lat) / (latMax - latMin)) * 600 - 300;

        return {
          data: { id: node.id, label: node.label },
          position: { x, y },
        };
      }),
      ...graphData.edges.map(edge => ({
        data: { id: `${edge.source}-${edge.target}`, source: edge.source, target: edge.target },
      })),
    ];

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      wheelSensitivity: 0.1,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#c5d9f1',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': '50px',
            'height': '50px',
            'font-size': '11px',
            'border-width': '2px',
            'border-color': '#1a1a1a',
            'text-wrap': 'wrap',
          },
        },
        {
          selector: 'edge',
          style: {
            'line-color': '#d0d0d0',
            'width': 2,
            'opacity': 0.6,
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#d0d0d0',
          },
        },
      ],
      layout: {
        name: 'cose-bilkent',
        animate: false,
        avoidOverlap: true,
        avoidOverlapPadding: 40,
        nodeSpacing: 80,
        spacingFactor: 2.5,
        nodeSeparation: 150,
        randomize: false,
        convergenceThreshold: 0.01,
        numIter: 3000,
        tile: true,
        tilingPaddingVertical: 30,
        tilingPaddingHorizontal: 30,
        gravity: 0.5,
        gravityRangeCompound: 300,
      },
    });

    cyRef.current = cy;

    // Setup zoom event listener
    cy.on('zoom', () => {
      setZoomLevel(cy.zoom());
    });

    // Add scroll wheel zoom support
    containerRef.current.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const newZoom = cy.zoom() + (e.deltaY > 0 ? -0.1 : 0.1);
        cy.zoom(Math.max(0.5, Math.min(3, newZoom)));
      }
    }, { passive: false });

    // Animate using steps
    if (isAnimating && animationSteps.length > 0) {
      let stepIndex = 0;

      const animationInterval = setInterval(() => {
        if (stepIndex >= animationSteps.length) {
          clearInterval(animationInterval);
          return;
        }

        const step = animationSteps[stepIndex];
        
        // Update node colors
        cy.nodes().forEach((node) => {
          const nodeId = node.id();
          if (nodeId === step.current) {
            node.style('background-color', '#2ecc71'); // Green
          } else if (step.visited.includes(nodeId)) {
            node.style('background-color', '#f39c12'); // Orange
          } else {
            node.style('background-color', '#c5d9f1'); // Light blue
          }
        });

        stepIndex++;
      }, animationSpeed);

      return () => clearInterval(animationInterval);
    }
  }, [graphData, animationSteps, isAnimating, animationSpeed]);

  const handleZoomIn = () => {
    if (cyRef.current) {
      const newZoom = Math.min(3, cyRef.current.zoom() + 0.2);
      cyRef.current.zoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      const newZoom = Math.max(0.5, cyRef.current.zoom() - 0.2);
      cyRef.current.zoom(newZoom);
    }
  };

  const handleFitView = () => {
    if (cyRef.current) {
      cyRef.current.fit(null, 50);
    }
  };

  return (
    <div className="graph-wrapper">
      <div className="zoom-controls">
        <button onClick={handleZoomIn} className="zoom-btn" title="Aumentar zoom (Ctrl+Scroll)">
          🔍+
        </button>
        <button onClick={handleZoomOut} className="zoom-btn" title="Diminuir zoom (Ctrl+Scroll)">
          🔍-
        </button>
        <button onClick={handleFitView} className="zoom-btn" title="Ajustar vista">
          ↔️
        </button>
        <span className="zoom-level">{(zoomLevel * 100).toFixed(0)}%</span>
      </div>
      <div ref={containerRef} className="graph-container" />
    </div>
  );
};

export default GraphVisualizer;
