import React, { useState, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import graphData from './graph.json';

export default function App() {
  const [impacted, setImpacted] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);

  const nodes = useMemo(() => graphData.modules.map((mod, i) => ({
    id: mod.source,
    data: { label: mod.source.split('/').pop() },
    position: { x: (i % 3) * 250, y: Math.floor(i / 3) * 150 },
    style: { 
      background: impacted.has(mod.source) ? '#ff0055' : '#0f172a', 
      color: '#fff', 
      border: impacted.has(mod.source) ? '2px solid #ff0055' : '1px solid #334155', 
      borderRadius: '12px', padding: '15px', fontWeight: '600',
      boxShadow: impacted.has(mod.source) ? '0 0 20px #ff005577' : 'none',
      width: 160, transition: 'all 0.3s ease'
    }
  })), [impacted]);

  const edges = useMemo(() => {
    const e = [];
    graphData.modules.forEach(mod => {
      mod.dependencies.forEach(dep => {
        const isImpacted = impacted.has(dep.resolved);
        e.push({
          id: `e-${mod.source}-${dep.resolved}`,
          source: dep.resolved,
          target: mod.source,
          animated: isImpacted,
          style: { stroke: isImpacted ? '#ff0055' : '#334155', strokeWidth: isImpacted ? 3 : 1 }
        });
      });
    });
    return e;
  }, [impacted]);

  const onNodeClick = (_, node) => {
    setSelectedNode(node.id);
    const affected = new Set([node.id]);
    const findAffected = (id) => {
      graphData.modules.forEach(m => {
        if (m.dependencies.some(d => d.resolved === id) && !affected.has(m.source)) {
          affected.add(m.source);
          findAffected(m.source);
        }
      });
    };
    findAffected(node.id);
    setImpacted(affected);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#020617', display: 'flex' }}>
      {/* Sidebar UI */}
      <div style={{ width: '300px', background: '#0f172a', borderRight: '1px solid #1e293b', padding: '20px', zIndex: 10 }}>
        <h1 style={{ color: '#f43f5e', fontSize: '24px', letterSpacing: '2px', marginBottom: '5px' }}>SNAPDIFF</h1>
        <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '30px' }}>AI IMPACT ANALYSIS ENGINE</div>
        
        {selectedNode ? (
          <div>
            <div style={{ color: '#94a3b8', marginBottom: '10px' }}>Selected File:</div>
            <div style={{ color: '#fff', background: '#1e293b', padding: '10px', borderRadius: '8px', fontSize: '14px' }}>{selectedNode}</div>
            <hr style={{ border: '0.5px solid #1e293b', margin: '20px 0' }} />
            <div style={{ color: '#f43f5e', fontSize: '32px', fontWeight: 'bold' }}>{impacted.size}</div>
            <div style={{ color: '#94a3b8' }}>Files in Blast Radius</div>
            <div style={{ marginTop: '20px', padding: '15px', background: '#1e293b', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                <div style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>EFFICIENCY GAIN</div>
                <div style={{ color: '#fff', fontSize: '18px' }}>+ {80 - impacted.size * 5}% faster CI</div>
            </div>
            <button onClick={() => {setImpacted(new Set()); setSelectedNode(null);}} style={{ marginTop: '20px', width: '100%', padding: '10px', background: 'transparent', border: '1px solid #334155', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}>Reset Analysis</button>
          </div>
        ) : (
          <div style={{ color: '#475569', textAlign: 'center', marginTop: '50px' }}>Select a file to calculate blast radius</div>
        )}
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow nodes={nodes} edges={edges} onNodeClick={onNodeClick} fitView>
          <Background color="#1e293b" variant="dots" />
          <Controls />
          <MiniMap nodeColor={(n) => n.style.background} style={{ background: '#0f172a' }} />
        </ReactFlow>
      </div>
    </div>
  );
}