/**
 * Export & Import Modal for Character JSON & Standalone Vector SVG
 */

import React, { useState } from 'react';
import { Check, Copy, Download, Upload, X } from 'lucide-react';
import { KNOWN_ASSET_IDS } from '../assets/registry';
import {
  CharacterDefinition,
  validateCharacterDefinition,
} from '../schemas/character.schema';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: CharacterDefinition;
  onImportCharacter: (char: CharacterDefinition) => void;
  getCharacterSvgMarkup: () => string | null;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  character,
  onImportCharacter,
  getCharacterSvgMarkup,
}) => {
  const [tab, setTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const formattedJson = JSON.stringify(character, null, 2);

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.id || 'character'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSvg = () => {
    const markup = getCharacterSvgMarkup();
    if (!markup) return;
    const blob = new Blob([markup], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.id || 'character'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importText) as CharacterDefinition;
      const result = validateCharacterDefinition(parsed, KNOWN_ASSET_IDS);
      if (!result.valid) {
        setImportError(result.issues.map((i) => i.message).join(' '));
        return;
      }
      onImportCharacter(parsed);
      onClose();
    } catch {
      setImportError('Invalid JSON syntax. Please paste a valid SpriteForge character definition.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold text-slate-900">Character Definition & Export</h2>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
              <button
                type="button"
                onClick={() => setTab('export')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  tab === 'export' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Export
              </button>
              <button
                type="button"
                onClick={() => setTab('import')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  tab === 'import' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Import JSON
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {tab === 'export' ? (
            <>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied JSON' : 'Copy JSON'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .json
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Transparent .svg
                </button>
              </div>
              <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-96">
                {formattedJson}
              </pre>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-600">
                Paste a SpriteForge character JSON definition below to reconstruct and validate the character.
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={12}
                placeholder='{"schemaVersion": "1.0.0", "id": "char_custom", ...}'
                className="w-full p-3 rounded-lg border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {importError && (
                <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-xs text-red-700">
                  {importError}
                </div>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Load Character
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
