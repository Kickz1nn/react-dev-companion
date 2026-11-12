import React, { useState, useEffect } from 'react';
import {
  StorageItem,
  getLocalStorageItems,
  getSessionStorageItems,
  getCookieItems,
  deleteStorageItem,
  setStorageItem,
  clearAllStorage
} from '../core/storageManager';

export const StorageInspector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'local' | 'session' | 'cookie'>('local');
  const [items, setItems] = useState<StorageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleClearAll = () => {
    if (items.length === 0) return;
    if (confirm(`Are you sure you want to clear all ${activeTab} storage items?`)) {
      clearAllStorage(activeTab);
      refreshItems();
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    setStorageItem(newKey.trim(), newValue.trim(), activeTab);
    setNewKey('');
    setNewValue('');
    refreshItems();
  };

  const filteredItems = items.filter(
    (item) =>
      item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Tab Selectors & Clear All */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
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

        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            style={{
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Filter by key or value..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: '4px 8px',
          fontSize: '11px',
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #334155',
          borderRadius: '4px',
          outline: 'none'
        }}
      />

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
        {filteredItems.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '12px' }}>
            {items.length === 0 ? 'No items found.' : 'No matching items.'}
          </p>
        ) : (
          filteredItems.map((item) => (
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