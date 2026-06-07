import { useState, useEffect, useRef, useCallback } from 'react';
import { GuleisCCTSWeb } from 'guleisccjs/src/guleisCCTSWeb';
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

  return (
    <g onClick={toggleNode} style={{ cursor: 'pointer' }}>
      <rect
        width="160" height="60"
        x="-80" y="-30"
        fill={bgColor}
        rx="8"
        stroke="var(--bg)"
        strokeWidth="3"
      />
      <text fill="white" strokeWidth="0" x="0" y="-5" textAnchor="middle" style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--mono)' }}>
        {nodeDatum.name}
      </text>
      {nodeDatum.attributes && Object.entries(nodeDatum.attributes).map(([key, val], i) => (
        <text key={key} fill="rgba(255, 255, 255, 0.9)" strokeWidth="0" x="0" y={15 + (i * 14)} textAnchor="middle" style={{ fontSize: '11px', fontFamily: 'var(--mono)' }}>
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
      } else
      {
        setError(result?.error || 'Compilation failed');
        setAssembly('');
        setTokens([]);
        setAst(null);
      }
    } catch (err: any)
    {
      setError(err.message);
    }
  };

  useEffect(() =>
  {
    handleCompile();
  }, []);

  return (
    <div className="workspace-container">
      <header className="header">
        <h1>GuleisCCTS Interactive Compiler </h1>
        <button onClick={handleCompile} className="compile-btn">
          Compile Code
        </button>
      </header>

      <div className="panels">
        <div className="panel">
          <div className="panel-header">C Source Code</div>
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            className="code-area"
            spellCheck={false}
          />
        </div>

        <div className="panel middle-panel">
          <div className="panel-header">Compilation Process</div>
          <div className="process-content">
            {error && <div className="error-box"><strong>Error:</strong> {error}</div>}

            <div className="process-section">
              <h3>Lexing</h3>
              <div className="token-container">
                {tokens.map((token, i) => (
                  <span key={i} className="token-badge">{token}</span>
                ))}
              </div>
            </div>

            <div className="process-section" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
                <h3 style={{ borderBottom: 'none', margin: 0, paddingBottom: 0 }}>Parsing</h3>
              </div>

              <div ref={treeContainerRef} style={{ width: '100%', height: '500px', background: 'var(--code-bg)', borderRadius: '6px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                {ast ? (
                  <Tree
                    data={ast}
                    orientation="vertical"
                    pathFunc="step"
                    translate={{ x: 250, y: 50 }}
                    nodeSize={{ x: 180, y: 100 }}
                    renderCustomNodeElement={renderCustomNode}
                  />
                ) : (
                  <div style={{ padding: '12px' }}>No AST generated.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">Generated Assembly (x86)</div>
          <textarea
            value={assembly}
            readOnly
            className="code-area output-area"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

export default App;