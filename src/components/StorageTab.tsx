import { useState, useEffect, ChangeEvent } from 'react';
import { StorageItem, StorageType } from '../types/storage';
import { getCookies, setCookie, deleteCookie, exportStorageJSON } from '../utils/storage';
import { theme, injectDevCompanionStyles } from './styles';

export const StorageTab = () => {
  const [storageType, setStorageType] = useState<StorageType>('localStorage');
  const [items, setItems] = useState<StorageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    injectDevCompanionStyles();
  }, []);

  const loadItems = () => {
    if (typeof window === 'undefined') return;
    const list: StorageItem[] = [];

    if (storageType === 'localStorage') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) list.push({ key, value: localStorage.getItem(key) || '' });
      }
    } else if (storageType === 'sessionStorage') {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) list.push({ key, value: sessionStorage.getItem(key) || '' });
      }
    } else if (storageType === 'cookie') {
      list.push(...getCookies());
    }

    setItems(list);
  };

  useEffect(() => {
    loadItems();
  }, [storageType]);

  const handleSaveEdit = (key: string) => {
    if (storageType === 'localStorage') {
      localStorage.setItem(key, editValue);
    } else if (storageType === 'sessionStorage') {
      sessionStorage.setItem(key, editValue);
    } else if (storageType === 'cookie') {
      setCookie(key, editValue);
    }
    setEditingKey(null);
    loadItems();
  };

  const handleDelete = (key: string) => {
    if (storageType === 'localStorage') {
      localStorage.removeItem(key);
    } else if (storageType === 'sessionStorage') {
      sessionStorage.removeItem(key);
    } else if (storageType === 'cookie') {
      deleteCookie(key);
    }
    loadItems();
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    if (!confirm(`Are you sure you want to clear all ${storageType} items?`)) return;

    if (storageType === 'localStorage') {
      localStorage.clear();
    } else if (storageType === 'sessionStorage') {
      sessionStorage.clear();
    } else if (storageType === 'cookie') {
      getCookies().forEach((c) => deleteCookie(c.key));
    }
    loadItems();
  };

  const handleImportJSON = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.data) {
          Object.entries(json.data).forEach(([k, v]) => {
            const strVal = typeof v === 'string' ? v : JSON.stringify(v);
            if (storageType === 'localStorage') localStorage.setItem(k, strVal);
            if (storageType === 'sessionStorage') sessionStorage.setItem(k, strVal);
            if (storageType === 'cookie') setCookie(k, strVal);
          });
          loadItems();
        }
      } catch (err) {
        console.error('[DevCompanion] Failed to import JSON:', err);
      }
    };
    reader.readAsText(file);
  };

  const filteredItems = items.filter(
    (item) =>
      item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
      {/* Sub-tabs & Actions Aligned */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '4px', background: theme.cardBg, padding: '3px', borderRadius: '6px', border: `1px solid ${theme.border}` }}>
          {(['localStorage', 'sessionStorage', 'cookie'] as StorageType[]).map((type) => (
            <button
              key={type}
              onClick={() => setStorageType(type)}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: storageType === type ? theme.accent : 'transparent',
                color: storageType === type ? '#fff' : theme.textSecondary,
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
            >
              {type === 'localStorage' ? 'Local' : type === 'sessionStorage' ? 'Session' : 'Cookies'}
            </button>
          ))}
        </div>

        {/* Refresh + Clear All + Export / Import */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button
            onClick={loadItems}
            title="Refresh storage data"
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              background: theme.cardBg,
              color: theme.accent,
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ↻ Refresh
          </button>

          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              title="Clear all entries"
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                background: theme.cardBg,
                color: theme.danger,
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Clear All
            </button>
          )}

          <button
            onClick={() => exportStorageJSON(storageType)}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              background: theme.cardBg,
              color: theme.textPrimary,
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Export
          </button>
          <label
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              background: theme.cardBg,
              color: theme.textPrimary,
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Import
            <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <input
        type="text"
        placeholder="Filter storage by key or value..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '6px 10px',
          background: theme.cardBg,
          color: theme.textPrimary,
          border: `1px solid ${theme.border}`,
          borderRadius: '6px',
          fontSize: '11px',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      {/* Items Table */}
      <div className="dev-companion-scroll" style={{ flex: 1, overflowY: 'auto', background: theme.cardBg, borderRadius: '6px', border: `1px solid ${theme.border}` }}>
        {filteredItems.length === 0 ? (
          <p style={{ color: theme.textSecondary, fontSize: '12px', textAlign: 'center', padding: '24px 0' }}>
            {items.length === 0 ? `No items found in ${storageType}.` : 'No matching items found.'}
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', color: theme.textPrimary }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}`, textAlign: 'left', background: theme.bg, color: theme.textSecondary }}>
                <th style={{ padding: '8px', width: '35%' }}>Key</th>
                <th style={{ padding: '8px' }}>Value</th>
                <th style={{ padding: '8px', width: '80px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.key} style={{ borderBottom: `1px solid ${theme.borderSubtle}` }}>
                  <td style={{ padding: '8px', fontWeight: 600, color: theme.methodGet, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {item.key}
                  </td>
                  <td style={{ padding: '8px' }}>
                    {editingKey === item.key ? (
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{
                          width: '100%',
                          background: theme.bg,
                          color: theme.textPrimary,
                          border: `1px solid ${theme.accent}`,
                          borderRadius: '4px',
                          padding: '3px 6px',
                          fontSize: '11px',
                          outline: 'none',
                        }}
                      />
                    ) : (
                      <span style={{ wordBreak: 'break-all', fontFamily: 'monospace', color: theme.textSecondary }}>
                        {item.value}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    {editingKey === item.key ? (
                      <button onClick={() => handleSaveEdit(item.key)} style={{ color: theme.success, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginRight: '6px' }}>
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingKey(item.key);
                          setEditValue(item.value);
                        }}
                        style={{ color: theme.warning, background: 'none', border: 'none', cursor: 'pointer', marginRight: '6px' }}
                      >
                        Edit
                      </button>
                    )}
                    <button onClick={() => handleDelete(item.key)} style={{ color: theme.danger, background: 'none', border: 'none', cursor: 'pointer' }}>
                      Del
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};