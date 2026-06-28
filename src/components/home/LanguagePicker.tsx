import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faChevronDown, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { useTranslationContext } from "@/lib/TranslationContext";

type Language = {
  name: string;
  code: string;
  flag: string;
};

type Region = {
  name: string;
  languages: Language[];
};

const REGIONS: Region[] = [
  {
    name: "Americas",
    languages: [
      { name: "English (United States)", code: "en-US", flag: "us" },
      { name: "Español (México)", code: "es-MX", flag: "mx" },
      { name: "Português (Brasil)", code: "pt-BR", flag: "br" },
    ]
  },
  {
    name: "Europe",
    languages: [
      { name: "English (United Kingdom)", code: "en-GB", flag: "gb" },
      { name: "Español (España)", code: "es-ES", flag: "es" },
      { name: "Deutsch", code: "de", flag: "de" },
    ]
  },
  {
    name: "Asia Pacific",
    languages: [
      { name: "हिन्दी (Hindi)", code: "hi", flag: "in" },
      { name: "తెలుగు (Telugu)", code: "te", flag: "in" },
      { name: "മലയാളം (Malayalam)", code: "ml", flag: "in" },
      { name: "中文 (Chinese)", code: "zh", flag: "cn" },
      { name: "日本語 (Japanese)", code: "ja", flag: "jp" },
      { name: "한국어 (Korean)", code: "ko", flag: "kr" },
    ]
  }
];

export function LanguagePicker() {
  const { setLanguage } = useTranslationContext();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({
    "Americas": true
  });
  const [selectedLang, setSelectedLang] = useState<Language>(REGIONS[0].languages[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleRegion = (regionName: string) => {
    setExpandedRegions(prev => ({
      ...prev,
      [regionName]: !prev[regionName]
    }));
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000', padding: '4px 8px', backgroundColor: 'transparent', border: '1px solid transparent', borderRadius: '4px', cursor: 'pointer' }}
      >
        <img 
          src={`https://flagcdn.com/w20/${selectedLang.flag}.png`} 
          alt={selectedLang.flag} 
          style={{ width: "20px", height: "auto", borderRadius: "2px" }}
        />
        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{selectedLang.code.split("-")[0].toUpperCase()}</span>
        <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: "0.75rem", marginLeft: "2px", color: '#4b5563' }} />
      </button>

      {isOpen && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: '0', width: '280px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 50, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', backgroundColor: '#111827', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FontAwesomeIcon icon={faGlobe} style={{ fontSize: "1.1rem" }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Select Language</h3>
          </div>
          <div style={{ maxHeight: "320px", overflowY: "auto" }}>
            {REGIONS.map(region => (
              <div key={region.name}>
                <button 
                  type="button" 
                  onClick={() => toggleRegion(region.name)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#f9fafb', border: 'none', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', textAlign: 'left', color: '#374151' }}
                >
                  <FontAwesomeIcon 
                    icon={faChevronRight} 
                    style={{ 
                      transform: expandedRegions[region.name] ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      width: '12px',
                      color: '#6b7280'
                    }} 
                  />
                  <strong style={{ fontSize: '0.9rem' }}>{region.name}</strong>
                </button>
                {expandedRegions[region.name] && (
                  <div style={{ backgroundColor: '#fff' }}>
                    {region.languages.map(lang => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setSelectedLang(lang);
                          const newLangCode = lang.code.split('-')[0];
                          setLanguage(newLangCode);
                          setIsOpen(false);
                        }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px 10px 36px', backgroundColor: selectedLang.code === lang.code ? '#eff6ff' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#111827', borderBottom: '1px solid #f3f4f6' }}
                      >
                        <img 
                          src={`https://flagcdn.com/w20/${lang.flag}.png`} 
                          alt="" 
                          style={{ width: "16px", borderRadius: "2px", border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }}
                        />
                        <span style={{ fontWeight: selectedLang.code === lang.code ? 600 : 400, fontSize: '0.9rem' }}>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
