import { useState, useEffect, useRef } from 'react';
import { GuleisCCTSWeb } from 'guleisccjs/src/guleisCCTSWeb';
import Editor from '@monaco-editor/react';
import Tree from 'react-d3-tree';
import './App.css';

const defaultCode = `int main() {
  int a = 5;
  int b = 10;
  if (a < b) 
    return a;
  else 
    return b;
}`;

const getNodeColor = (type: string) =>
{
  switch (type)
  {
    case 'Program':
    case 'FunctionDeclaration': return '#8b5cf6';
    case 'Declare':
    case 'Assign': return '#3b82f6';
    case 'BinOp':
    case 'UnOp': return '#f59e0b';
    case 'Constant':
    case 'VariableRef': return '#10b981';
    case 'Conditional':
    case 'ConditionalExpression': return '#ef4444';
    case 'ReturnStatement': return '#ec4899';
    default: return '#6b7280';
  }
};
const renderCustomNode = ({ nodeDatum, toggleNode }: any) =>
{
  const bgColor = getNodeColor(nodeDatum.name);

  const charWidthTitle = 8.5;
  const charWidthAttr = 6.6; 

  let maxTextWidth = (nodeDatum.name?.length || 0) * charWidthTitle;
  let attrCount = 0;

  if (nodeDatum.attributes) {
    Object.entries(nodeDatum.attributes).forEach(([key, val]) => {
      const textLen = `${key}: ${String(val)}`.length * charWidthAttr;
      if (textLen > maxTextWidth) maxTextWidth = textLen;
      attrCount++;
    });
  }

  const paddingX = 40; 
  const width = Math.max(100, maxTextWidth + paddingX); 
  const height = 30 + (attrCount * 14) + 10;         

  return (
    <g onClick={toggleNode} style={{ cursor: 'pointer' }}>
      <rect 
        width={width} 
        height={height} 
        x={-(width / 2)} 
        y="-20"        
        fill={bgColor} 
        rx="6" 
        stroke="var(--bg)" 
        strokeWidth="3" 
      />
      <text fill="white" strokeWidth="0" x="0" y="0" textAnchor="middle" style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--mono)' }}>
        {nodeDatum.name}
      </text>
      {nodeDatum.attributes && Object.entries(nodeDatum.attributes).map(([key, val], i) => (
        <text key={key} fill="rgba(255, 255, 255, 0.9)" strokeWidth="0" x="0" y={18 + (i * 14)} textAnchor="middle" style={{ fontSize: '11px', fontFamily: 'var(--mono)' }}>
          {key}: {String(val)}
        </text>
      ))}
    </g>
  );
};
function App()
{
  const [sourceCode, setSourceCode] = useState(defaultCode);
  const [assembly, setAssembly] = useState('');
  const [tokens, setTokens] = useState<string[]>([]);
  const [ast, setAst] = useState<any>(null);
  const [symbols, setSymbols] = useState<any>(null);
  const [error, setError] = useState('');

  const treeContainerRef = useRef<HTMLDivElement>(null);

  const handleCompile = async () =>
  {
    setError('');
    const compiler = new GuleisCCTSWeb();

    try
    {
      const result: any = await compiler.compile(sourceCode);

      if (result && result.success)
      {
        setAssembly(result.compiled || '');
        setTokens(result.tokens || []);
        setAst(result.parsed || null);
        setSymbols(result.symbols || null);
      } else
      {
        setError(result?.error || 'Compilation failed');
        setAssembly('');
        setTokens([]);
        setAst(null);
        setSymbols(null);
      }
    } catch (err: any)
    {
      setError(err.message);
    }
  };

  useEffect(() => { handleCompile(); }, []);

  return (
    <div className="workspace-container">
      <header className="header">
        <h1>GuleisCCTS Interactive Compiler</h1>
        <button onClick={handleCompile} className="compile-btn">Compile Code</button>
      </header>

      {error && <div className="error-box" style={{ marginBottom: '16px' }}><strong>Error:</strong> {error}</div>}

      <div className="panels">
        <div className="column col-left">
          <div className="panel">
            <div className="panel-header">C Source Code</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <Editor
                height="100%" language="c" theme="vs-dark" value={sourceCode}
                onChange={(value) => setSourceCode(value || '')}
                options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: 'ui-monospace, Consolas, monospace', padding: { top: 16 } }}
              />
            </div>
          </div>
        </div>

        <div className="column col-middle">
          <div className="panel panel-lexing">
            <div className="panel-header">Lexing (Tokens)</div>
            <div className="process-content">
              <div className="token-container">
                {tokens.map((token, i) => (
                  <span key={i} className="token-badge">{token}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="panel panel-ast">
            <div className="panel-header">Parsing (AST)</div>
            <div ref={treeContainerRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
              {ast ? (
                <Tree
                  data={ast} 
                  orientation="vertical" 
                  pathFunc="step"
                  translate={{ x: 300, y: 50 }} 
                  nodeSize={{ x: 150, y: 90 }}
                  separation={{ siblings: 1.5, nonSiblings: 1.2 }}
                  renderCustomNodeElement={renderCustomNode}
                />
              ) : (
                <div style={{ padding: '16px', color: 'var(--text-h)' }}>No AST generated.</div>
              )}
            </div>
          </div>
          </div>

        <div className="column col-right">
          <div className="panel panel-semantic">
            <div className="panel-header">Semantic Analysis</div>
            <div className="process-content">
              {symbols ? (
                <div>
                  <h3 style={{ fontSize: '14px', color: 'var(--accent)', marginTop: 0 }}>Symbol Table</h3>
                  {symbols.functions.map((fn: any, i: number) => (
                    <div key={i} style={{ fontFamily: 'var(--mono)', fontSize: '12px', background: 'var(--code-bg)', padding: '8px', borderRadius: '4px', marginBottom: '8px', border: '1px solid var(--border)' }}>
                      <strong style={{ color: '#8b5cf6' }}>{fn.name}</strong>(
                      {fn.params.join(', ')})<br />
                      <span style={{ color: 'var(--text-h)', fontSize: '11px' }}>Definition: {fn.hasBody ? 'Yes' : 'No'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-h)' }}>Waiting for analysis...</div>
              )}
            </div>
          </div>

          <div className="panel panel-output">
            <div className="panel-header">Generated Assembly (x86)</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <Editor
                height="100%" language="assembly" theme="vs-dark" value={assembly}
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14, fontFamily: 'ui-monospace, Consolas, monospace', padding: { top: 16 } }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;