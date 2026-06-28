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
    <div className="language-picker-container" ref={ref} style={{ position: "relative" }}>
      <button 
        type="button" 
        className="nav-link language-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000', padding: 0 }}
      >
        <img 
          src={`https://flagcdn.com/w20/${selectedLang.flag}.png`} 
          alt={selectedLang.flag} 
          style={{ width: "20px", height: "auto", borderRadius: "2px" }}
        />
        {selectedLang.code.split("-")[0].toUpperCase()}
        <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: "0.75rem", marginLeft: "2px" }} />
      </button>

      {isOpen && (
        <div className="language-dropdown profile-dropdown slide-down" style={{ width: "280px", right: "0" }}>
          <div className="profile-dropdown-header sidebar-header" style={{ margin: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
            <div className="sidebar-header-left">
              <FontAwesomeIcon icon={faGlobe} style={{ fontSize: "1.1rem", color: "#fff" }} />
              <h3>Select Language</h3>
            </div>
          </div>
          <div className="language-dropdown-body" style={{ padding: "0.5rem 0", maxHeight: "300px", overflowY: "auto" }}>
            {REGIONS.map(region => (
              <div key={region.name} className="language-region">
                <button 
                  type="button" 
                  className="language-region-header"
                  onClick={() => toggleRegion(region.name)}
                >
                  <FontAwesomeIcon 
                    icon={faChevronRight} 
                    className="chevron-icon" 
                    style={{ 
                      transform: expandedRegions[region.name] ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      width: '12px'
                    }} 
                  />
                  <strong>{region.name}</strong>
                </button>
                {expandedRegions[region.name] && (
                  <div className="language-region-list" style={{ marginTop: "4px" }}>
                    {region.languages.map(lang => (
                      <button
                        key={lang.code}
                        type="button"
                        className={`language-item dropdown-item ${selectedLang.code === lang.code ? 'active' : ''}`}
                        onClick={async () => {
                          setSelectedLang(lang);
                          const newLangCode = lang.code.split('-')[0];
                          setLanguage(newLangCode);
                          setIsOpen(false);

                          if (newLangCode !== 'en') {
                            const { translateTextBatch } = await import('@/lib/translator');
                            const baseMsg = `You have changed your language from English to ${lang.name}.`;
                            try {
                              const [translatedMsg] = await translateTextBatch([baseMsg], newLangCode);
                              setSuccessMessage(translatedMsg);
                            } catch (e) {
                              setSuccessMessage(baseMsg);
                            }
                          } else {
                            setSuccessMessage("You have changed your language back to English.");
                          }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '32px' }}
                      >
                        <img 
                          src={`https://flagcdn.com/w20/${lang.flag}.png`} 
                          alt="" 
                          style={{ width: "16px", borderRadius: "2px", border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }}
                        />
                        <span style={{ fontWeight: selectedLang.code === lang.code ? 600 : 400 }}>{lang.name}</span>
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
