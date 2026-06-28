import React, { useState } from 'react';
import type { WizardState } from './PublishWizard';

interface Props {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
}

export const Step3Metadata: React.FC<Props> = ({ state, setState }) => {
  const [newLink, setNewLink] = useState('');

  const handleAddName = () => {
    setState(s => ({ ...s, additionalNames: [...s.additionalNames, ''] }));
  };

  const handleUpdateName = (index: number, value: string) => {
    const updated = [...state.additionalNames];
    updated[index] = value;
    setState(s => ({ ...s, additionalNames: updated }));
  };

  const handleAddLink = () => {
    if (newLink && state.links.length < 2) {
      setState(s => ({ ...s, links: [...s.links, newLink] }));
      setNewLink('');
    }
  };

  return (
    <div className="content-google-sans" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="input-group">
        <label className="input-label">Name your artifact *</label>
        <input 
          className="input-field" 
          value={state.name} 
          onChange={e => setState(s => ({ ...s, name: e.target.value }))}
          placeholder="E.g., High School Science Project 2026"
        />
      </div>

      <div className="input-group">
        <label className="input-label">Additional Names</label>
        {state.additionalNames.map((name, i) => (
          <input 
            key={i}
            className="input-field" 
            value={name} 
            onChange={e => handleUpdateName(i, e.target.value)}
            style={{ marginBottom: '0.5rem' }}
          />
        ))}
        <button 
          className="wizard-btn wizard-btn-secondary" 
          style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          onClick={handleAddName}
        >
          Add More Names
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="input-group" style={{ flex: 1 }}>
          <label className="input-label">Hashtags</label>
          <input 
            className="input-field" 
            value={state.hashtags} 
            onChange={e => setState(s => ({ ...s, hashtags: e.target.value }))}
            placeholder="#science, #project"
          />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label className="input-label">Primary Category</label>
          <select 
            className="input-field" 
            value={state.category} 
            onChange={e => setState(s => ({ ...s, category: e.target.value }))}
          >
            <option value="physical_sciences">Physical Sciences</option>
            <option value="biological_sciences">Biological Sciences</option>
            <option value="social_sciences">Social Sciences</option>
            <option value="arts_humanities">Arts and Humanities</option>
            <option value="technology">Technology</option>
          </select>
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">Short Description *</label>
        <textarea 
          className="input-field" 
          rows={2}
          value={state.shortDescription} 
          onChange={e => setState(s => ({ ...s, shortDescription: e.target.value }))}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Long Description</label>
        <textarea 
          className="input-field" 
          rows={5}
          value={state.longDescription} 
          onChange={e => setState(s => ({ ...s, longDescription: e.target.value }))}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Artifact About Page (Optional Formatting)</label>
        <textarea 
          className="input-field" 
          rows={8}
          style={{ fontFamily: '"Google Sans", sans-serif' }}
          value={state.aboutPage} 
          onChange={e => setState(s => ({ ...s, aboutPage: e.target.value }))}
          placeholder="Write a complete thesis or introduction here..."
        />
      </div>

      <div className="input-group">
        <label className="input-label">Links (Max 2)</label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input 
            className="input-field" 
            style={{ flex: 1 }}
            value={newLink} 
            onChange={e => setNewLink(e.target.value)}
            disabled={state.links.length >= 2}
            placeholder="https://..."
          />
          <button 
            className="wizard-btn wizard-btn-secondary"
            onClick={handleAddLink}
            disabled={state.links.length >= 2 || !newLink}
          >
            Add Link
          </button>
        </div>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {state.links.map((link, i) => (
            <li key={i} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>• {link}</li>
          ))}
        </ul>
      </div>

      <div className="input-group">
        <label className="input-label">License</label>
        <select 
          className="input-field" 
          value={state.license} 
          onChange={e => setState(s => ({ ...s, license: e.target.value }))}
        >
          <option value="ORP_BEAVER">Open Rockets Beaver</option>
          <option value="ORP_KANGAROO">Open Rockets Kangaroo</option>
          <option value="ORP_HUMMINGBIRD">Open Rockets Hummingbird</option>
          <option value="CC_BY_NC_ND">Creative Commons (Non-derivative, No Commercial)</option>
        </select>
      </div>
    </div>
  );
};
