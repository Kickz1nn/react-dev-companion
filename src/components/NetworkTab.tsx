import { useState, useEffect } from 'react';
import { NetworkLog, networkConfig } from '../core/fetchInterceptor';
import { theme, injectDevCompanionStyles } from './styles';

interface NetworkTabProps {
  logs: NetworkLog[];
  onClear?: () => void;
}

export const NetworkTab = ({ logs = [], onClear }: NetworkTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [isOffline, setIsOffline] = useState(networkConfig.isOffline);
  const [delay, setDelay] = useState(networkConfig.delayMs);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'response' | 'payload'>('response');

  useEffect(() => {
    injectDevCompanionStyles();
  }, []);

  const handleToggleOffline = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
    networkConfig.isOffline = nextState;
  };

  const handleDelayChange = (newDelay: number) => {
    setDelay(newDelay);
    networkConfig.delayMs = newDelay;
  };

  const filteredLogs = logs.filter((log) => {
    if (!log || !log.url) return false;
    const matchesSearch = log.url.toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesMethod = selectedMethod === 'ALL' || log.method === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  const selectedLog = logs.find((l) => l.id === selectedLogId);

  const handleCopyCurl = (log: NetworkLog, e: React.MouseEvent) => {
    e.stopPropagation();
    const curl = `curl -X ${log.method} "${log.url}"`;
    navigator.clipboard.writeText(curl);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getMethodColor = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'GET': return theme.methodGet;
      case 'POST': return theme.methodPost;
      case 'PUT': return theme.methodPut;
      case 'DELETE': return theme.methodDelete;
      default: return theme.textPrimary;
    }
  };

  const formatData = (data: any) => {
    if (!data) return 'No data';
    if (typeof data === 'string') return data;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
      {/* Simulation Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent
          : 'space-between',
          background: theme.cardBg,
          padding: '8px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          border: `1px solid ${theme.borderSubtle}`,
          flexShrink: 0,
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: isOffline ? theme.danger : theme.textSecondary, fontWeight: 500 }}>
          <input type="checkbox" checked={isOffline} onChange={handleToggleOffline} style={{ accentColor: theme.danger }} />
          Offline Mode
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: theme.textSecondary }}>Delay:</span>
          <select
            value={delay}
            onChange={(e) => handleDelayChange(Number(e.target.value))}
            style={{
              background: theme.bg,
              color: theme.textPrimary,
              border: `1px solid ${theme.border}`,
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '11px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value={0}>None (0ms)</option>
            <option value={500}>Fast 3G (500ms)</option>
            <option value={2000}>Slow 3G (2s)</option>
          </select>
        </div>
      </div>

      {/* Filters & Actions */}
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Filter URL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            background: theme.cardBg,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '12px',
            outline: 'none',
          }}
        />
        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          style={{
            background: theme.cardBg,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            padding: '6px 8px',
            fontSize: '12px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="ALL">ALL</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>

        {onClear && (
          <button
            onClick={() => {
              setSelectedLogId(null);
              onClear();
            }}
            title="Clear request history"
            style={{
              padding: '6px 10px',
              fontSize: '11px',
              background: theme.cardBg,
              color: theme.textSecondary,
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Main Container: List + Detail Split View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflow: 'hidden' }}>
        {/* Requests List */}
        <div
          className="dev-companion-scroll"
          style={{
            flex: selectedLog ? '0 0 140px' : '1',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            paddingRight: '2px',
            transition: 'all 0.2s ease',
          }}
        >
          {filteredLogs.length === 0 ? (
            <p style={{ color: theme.textSecondary, fontSize: '12px', textAlign: 'center', marginTop: '24px' }}>
              No requests captured.
            </p>
          ) : (
            filteredLogs.map((log) => {
              const isError = !log.status || log.status >= 400;
              const statusColor = isError ? theme.danger : theme.success;
              const isSelected = selectedLogId === log.id;

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLogId(isSelected ? null : log.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    background: isSelected ? theme.hoverBg : theme.cardBg,
                    borderRadius: '6px',
                    border: `1px solid ${isSelected ? theme.accent : theme.borderSubtle}`,
                    fontSize: '12px',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: getMethodColor(log.method),
                        fontSize: '11px',
                        background: theme.bg,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: `1px solid ${theme.border}`,
                        minWidth: '45px',
                        textAlign: 'center',
                      }}
                    >
                      {log.method}
                    </span>
                    <span
                      title={log.url}
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '170px',
                        color: theme.textPrimary,
                        fontFamily: 'monospace',
                        fontSize: '11px',
                      }}
                    >
                      {log.url}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {log.duration !== undefined && (
                      <span style={{ color: theme.textSecondary, fontSize: '10px', fontFamily: 'monospace' }}>
                        {log.duration}ms
                      </span>
                    )}
                    <span
                      style={{
                        color: statusColor,
                        fontWeight: 700,
                        fontSize: '11px',
                        background: `${statusColor}15`,
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {log.status || 'ERR'}
                    </span>
                    <button
                      onClick={(e) => handleCopyCurl(log, e)}
                      title="Copy cURL"
                      style={{
                        background: copiedId === log.id ? theme.success : theme.hoverBg,
                        color: copiedId === log.id ? '#000' : theme.textPrimary,
                        border: 'none',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        fontSize: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {copiedId === log.id ? 'Copied!' : 'cURL'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Request Detail Panel */}
        {selectedLog && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              background: theme.cardBg,
              borderRadius: '6px',
              border: `1px solid ${theme.border}`,
              overflow: 'hidden',
            }}
          >
            {/* Detail Tabs */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, background: theme.bg }}>
              <button
                onClick={() => setDetailTab('response')}
                style={{
                  flex: 1,
                  padding: '6px',
                  background: detailTab === 'response' ? theme.cardBg : 'transparent',
                  color: detailTab === 'response' ? theme.accent : theme.textSecondary,
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Response Body
              </button>
              <button
                onClick={() => setDetailTab('payload')}
                style={{
                  flex: 1,
                  padding: '6px',
                  background: detailTab === 'payload' ? theme.cardBg : 'transparent',
                  color: detailTab === 'payload' ? theme.accent : theme.textSecondary,
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Request Payload
              </button>
            </div>

            {/* Data View */}
            <div className="dev-companion-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              <pre
                style={{
                  margin: 0,
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  color: theme.textPrimary,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {detailTab === 'response'
                  ? formatData(selectedLog.responseData)
                  : formatData(selectedLog.requestData)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};