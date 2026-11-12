import React, { useState, useEffect } from 'react';
import {
  StorageItem,
  getLocalStorageItems,
  getSessionStorageItems,
  getCookieItems,
  deleteStorageItem,
  setStorageItem
} from '../core/storageManager';

export const StorageInspector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'local' | 'session' | 'cookie'>('local');
  const [items, setItems] = useState<StorageItem[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const refreshItems = () => {
    if (activeTab === 'local') setItems(getLocalStorageItems());
    else if (activeTab === 'session') setItems(getSessionStorageItems());
    else if (activeTab === 'cookie') setItems(getCookieItems());
  };

  useEffect(() => {
    refreshItems();
  }, [activeTab]);

  const handleDelete = (key: string) => {
    deleteStorageItem(key, activeTab);
    refreshItems();
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    setStorageItem(newKey.trim(), newValue.trim(), activeTab);
    setNewKey('');
    setNewValue('');
    refreshItems();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Tab Selectors */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
        {(['local', 'session', 'cookie'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? '#3b82f6' : '#1e293b',
              color: '#fff',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '4px' }}>
        <input
          placeholder="Key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          style={{ flex: 1, padding: '4px', fontSize: '11px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}
        />
        <input
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          style={{ flex: 1, padding: '4px', fontSize: '11px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}
        />
        <button
          type="submit"
          style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
        >
          Add
        </button>
      </form>

      {/* List */}
      <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
        {items.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '12px' }}>No items found.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 0',
                borderBottom: '1px solid #1e293b',
                fontSize: '11px'
              }}
            >
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                <strong style={{ color: '#38bdf8' }}>{item.key}:</strong> {item.value}
              </div>
              <button
                onClick={() => handleDelete(item.key)}
                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
              >
                Del
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};