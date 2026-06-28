import { useState, useEffect, useMemo } from "react";
import type { HomeInfoModalKind } from "@/components/home/HomeInfoModal";

interface Template1FooterProps {
  onOpenInfo: (kind: HomeInfoModalKind) => void;
}

export function Template1Footer({ onOpenInfo }: Template1FooterProps) {
  const [publisher, setPublisher] = useState<any>(null);

  useEffect(() => {
    fetch("/config/publishers.json")
      .then(res => res.json())
      .then(data => {
        const scienteen = data.publishers.find((p: any) => p.id === "scienteen");
        if (scienteen) setPublisher(scienteen);
      })
      .catch(err => console.error("Failed to load publishers", err));
  }, []);

  const year = new Date().getFullYear();
  // Strip trademark icon from name
  const pubName = publisher?.name ? publisher.name.replace(/™/g, '') : 'Publisher';

  // Generate random 16-character alphanumeric ID in format XXXX-XXX-XX-XXXXXXX
  const randomId = useMemo(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const r = (len: number) => Array.from({length: len}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    return `${r(4)}-${r(3)}-${r(2)}-${r(7)}`;
  }, []);

  return (
    <footer translate="no" className="template1-footer notranslate" data-testid="template1-footer" style={{ borderTop: '1px solid #000000', paddingTop: '40px', paddingBottom: '15px', backgroundColor: '#ffffff', color: '#000000' }}>
      <div className="home-shell footer-content" style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Top Section: Publisher Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start', textAlign: 'left', maxWidth: '800px' }}>
          {publisher && (
            <>
              <img src={publisher.logoUrl} alt={pubName} style={{ height: '4rem', width: 'auto', marginBottom: '10px' }} />
              <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#000000' }}>
                {publisher.about}
              </p>
              <a 
                href={publisher.learnMoreLink || `https://${publisher.domain}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 600, fontSize: '15px' }}
              >
                {publisher.domain}
              </a>
              <p style={{ color: '#000000', fontSize: '14px', lineHeight: '1.5', margin: 0, fontWeight: 500 }}>
                This content is reviewed and accepted by {pubName}.
              </p>
              <p style={{ color: '#000000', fontSize: '14px', lineHeight: '1.5', margin: 0, fontWeight: 500 }}>
                Copyright © {year} {pubName}. All rights reserved.
              </p>
            </>
          )}
        </div>

        <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #000000', margin: '8px 0' }} />

        {/* Bottom Row */}
        <div className="footer-bottom-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <a href="https://openrockets.com/press" target="_blank" rel="noreferrer">
              <img 
                src="/brand/271742354.png" 
                alt="OpenRockets Logo" 
                style={{ height: '1.5rem', width: 'auto', filter: 'none', display: 'block' }} 
              />
            </a>
            <span style={{ color: '#000000', fontSize: '14px', fontWeight: 500 }}>
              Platforms and security by OpenRockets Inc.
            </span>
          </div>

          <span style={{ color: '#000000', fontSize: '12px', fontWeight: 400, marginTop: '2px' }}>
            © & (TM) OpenRockets Inc,
          </span>
          <span style={{ color: '#000000', fontSize: '12px', fontWeight: 400 }}>
            ID: {randomId}
          </span>

        </div>
      </div>
    </footer>
  );
}
