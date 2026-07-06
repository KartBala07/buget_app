import { useState } from 'react';
import { encodeShareData, decodeShareData } from '../store';

export default function ShareModal({ data, onImport, onClose }) {
  const [tab, setTab] = useState('export');
  const [importCode, setImportCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  const code = encodeShareData(data);

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleImport = () => {
    const decoded = decodeShareData(importCode.trim());
    if (!decoded) { setImportMsg('❌ Invalid code. Please check and try again.'); return; }
    onImport(decoded);
    setImportMsg('✅ Data imported! Your local data has been updated.');
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">
          👨‍👩‍👧 Share with Family
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="tabs" style={{ marginBottom: 18 }}>
          <div className={`tab ${tab === 'export' ? 'active' : ''}`} onClick={() => setTab('export')}>📤 Export / Share</div>
          <div className={`tab ${tab === 'import' ? 'active' : ''}`} onClick={() => setTab('import')}>📥 Import</div>
        </div>

        {tab === 'export' && (
          <div>
            <p className="share-info">
              Copy the code below and send it to a family member via message, email, or any app. They can paste it on their device to import your budget data. Each person keeps their own separate copy they can edit independently.
            </p>
            <div className="share-code">{code}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={copy} style={{ flex: 1 }}>
                {copied ? '✅ Copied!' : '📋 Copy Code'}
              </button>
              {navigator.share && (
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigator.share({ title: 'BudgetAI Data', text: code })}>
                  📱 Share via...
                </button>
              )}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 14, textAlign: 'center' }}>
              🔒 Data is encoded, not encrypted. Don't share with people you don't trust.
            </p>
          </div>
        )}

        {tab === 'import' && (
          <div>
            <p className="share-info">
              Paste a code from a family member to import their budget data onto this device. This will <strong style={{ color: 'var(--accent4)' }}>replace</strong> your current data — make sure to export yours first if you want to keep it.
            </p>
            <div className="form-group">
              <label className="form-label">Paste code here</label>
              <textarea
                className="form-textarea"
                placeholder="Paste the shared code..."
                value={importCode}
                onChange={e => setImportCode(e.target.value)}
                style={{ minHeight: 100, fontSize: 13, fontFamily: 'monospace' }}
              />
            </div>
            {importMsg && (
              <p style={{ fontSize: 13, marginBottom: 12, color: importMsg.startsWith('✅') ? 'var(--success)' : 'var(--danger)' }}>{importMsg}</p>
            )}
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleImport} disabled={!importCode.trim()}>
              📥 Import Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
