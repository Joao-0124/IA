import React, { useEffect, useRef } from 'react';
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
        name: 'breadthfirst',
        directed: true,
        roots: '#' + graphData.nodes[0].id,
        spacingFactor: 1.75,
        avoidOverlap: true,
        nodeSeparation: 100,
        rankSeparation: 150,
      },
    });

    cyRef.current = cy;

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

  return <div ref={containerRef} className="graph-container" />;
};

export default GraphVisualizer;
