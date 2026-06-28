import { useState, useEffect, useRef } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { getCoreCategory } from "./fileTypeUtils";
import { AlertModal } from "@/components/ui/AlertModal";
import labelsData from "@/data/labels.json";
import localforage from "localforage";

// Register custom fonts
const Font = Quill.import('formats/font') as any;
const customFonts = [
  "roboto", "open-sans", "lato", "montserrat", "oswald", "source-sans-pro", 
  "raleway", "pt-sans", "merriweather", "nunito", "playfair-display", "lora", 
  "pt-serif", "titillium-web", "inconsolata", "fira-sans", "dosis", "ubuntu", 
  "dancing-script", "pacifico"
];
Font.whitelist = customFonts;
Quill.register(Font, true);

// Configure Quill Toolbar
const quillModules = {
  toolbar: [
    [{ 'font': customFonts }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    ['formula'],
    ['clean']
  ],
};

const PLACEHOLDER_SUGGESTIONS: Record<string, string[]> = {
  "Images": [
    "A painting which I have submitted to California XYZ Arts Competition...",
    "A painting of the Liberty Statue submitted to the New York State XYZ art competition...",
    "Russian dolls painting on an eggshell...",
    "A still life photograph taken in a bustling city in London...",
    "A drawing of the royal mouser in 10 Downing Street..."
  ],
  "Club Artifacts": [
    "A club poster of our United Kids Club of New York High School...",
    "2025 November impact report of the Sea Cleaners Club of Canada...",
    "Sea Cleaners Magazine 31st issue of November 2025...",
    "A creative flyer to distribute awareness of dental sanitization during the quarantine period...",
    "How to wear masks properly: Five steps from Young Medical scientists of New York..."
  ],
  "Software and Code": [
    "A code for a web-based complex calculator...",
    "A new fork of Chatsiyen to optimize asset rendering of Next.js...",
    "My first Android application: Cookie bot..."
  ],
  "Research": [
    "A study related to collecting a salmonella bacteria sample and photographs taken by a light microscope..."
  ],
  "3D Models": [
    "A 3D hat of a farmer created using Blender...",
    "A Godot engine creation of a human hand movement...",
    "A school pencil sharpener created using Blender and ready to print...",
    "A 3D fashion design of a new type of T-shirt..."
  ]
};

const STEP_CONTENT: Record<string, { title: string; subtitle: React.ReactNode }> = {
  title: {
    title: "Give a title to your work",
    subtitle: "Make the title engaging, specific and creative as it will be shown everywhere and will be used as a unique synonym.",
  },
  tagline: {
    title: "Add a tagline to your work",
    subtitle: "A short, catchy description that will appear below your title (optional).",
  },
  description: {
    title: "Add a detailed description to your work",
    subtitle: "Provide a comprehensive overview of your artifact, its purpose, and any other relevant details.",
  },
  links: {
    title: "Add up to 10 links.",
    subtitle: (
      <>
        <span style={{ color: "#c7511f", fontWeight: "bold" }}>This is optional.</span> If you have any other reference materials like online resources, data sets, your social profiles, Patreon, or anything related to your work, please include them here.
      </>
    ),
  },
  labels: {
    title: "Represent or celebrate communities. Be part of it.",
    subtitle: (
      <>
        <span style={{ color: "#c7511f", fontWeight: "bold" }}>This is optional.</span> You can select up to 3 labels and if you don't need to, please skip this by clicking on the skip button.
      </>
    ),
  }
};

function useTypewriter(strings: string[], typingSpeed = 50, deletingSpeed = 30, pauseDuration = 2000) {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!strings || strings.length === 0) return;

    const currentString = strings[index];
    
    let timer: number;
    if (isDeleting) {
      if (text === "") {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % strings.length);
        timer = window.setTimeout(() => {}, 500); 
      } else {
        timer = window.setTimeout(() => {
          setText(currentString.substring(0, text.length - 1));
        }, deletingSpeed);
      }
    } else {
      if (text === currentString) {
        timer = window.setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      } else {
        timer = window.setTimeout(() => {
          setText(currentString.substring(0, text.length + 1));
        }, typingSpeed);
      }
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, index, strings, typingSpeed, deletingSpeed, pauseDuration]);

  return text;
}

export interface ExternalLink {
  url: string;
  customName?: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
}

export function EditorScreen() {
  const [slideIn, setSlideIn] = useState(false);
  
  type StepType = "title" | "tagline" | "description" | "links" | "labels";
  const [step, setStep] = useState<StepType>("title");
  const [transitioningTo, setTransitioningTo] = useState<StepType | null>(null);

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [descLength, setDescLength] = useState(0);
  
  const [links, setLinks] = useState<ExternalLink[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [linkNameInput, setLinkNameInput] = useState("");
  const [isLinkLoading, setIsLinkLoading] = useState(false);
  const [labelSearchQuery, setLabelSearchQuery] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const [aiHover, setAiHover] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalMessage, setAiModalMessage] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  // Initialize from storage
  useEffect(() => {
    const loadState = async () => {
      try {
        const t = await localforage.getItem<string>("openRockets_title");
        const tag = await localforage.getItem<string>("openRockets_tagline");
        const d = await localforage.getItem<string>("openRockets_desc");
        const l = await localforage.getItem<ExternalLink[]>("openRockets_links");
        const sl = await localforage.getItem<string[]>("openRockets_labels");
        
        if (t) setTitle(t);
        if (tag) setTagline(tag);
        if (d) {
          setDescription(d);
          setDescLength(d.length > 0 ? d.replace(/<[^>]+>/g, '').trim().length : 0);
        }
        if (l) setLinks(l);
        if (sl) setSelectedLabels(sl);
      } catch (err) {
        console.error("Error loading editor state", err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadState();
  }, []);

  // Save to storage
  useEffect(() => {
    if (!isLoaded) return;
    localforage.setItem("openRockets_title", title);
  }, [title, isLoaded]);
  useEffect(() => {
    if (!isLoaded) return;
    localforage.setItem("openRockets_tagline", tagline);
  }, [tagline, isLoaded]);
  useEffect(() => {
    if (!isLoaded) return;
    localforage.setItem("openRockets_desc", description);
  }, [description, isLoaded]);
  useEffect(() => {
    if (!isLoaded) return;
    localforage.setItem("openRockets_links", links);
  }, [links, isLoaded]);
  useEffect(() => {
    if (!isLoaded) return;
    localforage.setItem("openRockets_labels", selectedLabels);
  }, [selectedLabels, isLoaded]);

  const selectedType = localStorage.getItem("publish_artifact_type") || "painting";
  const coreCategory = getCoreCategory(selectedType);
  const suggestions = PLACEHOLDER_SUGGESTIONS[coreCategory] || PLACEHOLDER_SUGGESTIONS["Images"];
  const typewriterText = useTypewriter(suggestions);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSlideIn(true);
      if (sessionStorage.getItem("returnToLabels") === "true") {
        sessionStorage.removeItem("returnToLabels");
        setStep("labels");
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const wordCount = title.trim().split(/\s+/).filter(w => w.length > 0).length;
  const isTitleValid = wordCount >= 3 && title.length <= 70;
  const isTaglineValid = tagline.length <= 150;
  const isDescValid = descLength > 0 && descLength <= 4000;

  const handleNext = (nextTarget: StepType) => {
    setTransitioningTo(nextTarget);
    setTimeout(() => {
      setStep(nextTarget);
      setTransitioningTo(null);
    }, 300); 
  };

  const currentHeader = STEP_CONTENT[step];

  const handleEdit = (targetStep: StepType) => {
    setTransitioningTo(targetStep);
    setTimeout(() => {
      setStep(targetStep);
      setTransitioningTo(null);
    }, 300);
  };

  const handleQuillChange = (content: string, delta: any, source: string, editor: any) => {
    setDescription(content);
    setDescLength(editor.getLength() - 1); // Quill adds a trailing newline
  };

  const handleAiClick = async () => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const text = editor.getText();

    if (text.trim().length === 0) {
      setAiModalMessage("You should enter text to correct grammar.");
      setAiModalOpen(true);
      return;
    }

    try {
      setIsAiLoading(true);
      const res = await fetch("https://api.sapling.ai/api/v1/edits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "HS4YDDSJZNR191BK8Q81L19OQWZEK0FR",
          text: text,
          session_id: "openrockets_press"
        })
      });

      if (!res.ok) throw new Error("API request failed");
      const data = await res.json();
      
      if (data && data.edits && data.edits.length > 0) {
        // Sort edits in descending order by 'start' to avoid offset shifts when replacing text
        const sortedEdits = data.edits.sort((a: any, b: any) => b.start - a.start);
        
        for (const edit of sortedEdits) {
          editor.deleteText(edit.start, edit.end - edit.start);
          editor.insertText(edit.start, edit.replacement);
        }
      } else {
        setAiModalMessage("No grammar issues found!");
        setAiModalOpen(true);
      }
    } catch (e) {
      console.error("Sapling AI Error:", e);
      setAiModalMessage("Failed to correct grammar. Please try again.");
      setAiModalOpen(true);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (links.length >= 10) {
      setAiModalMessage("You can only add up to 10 links.");
      setAiModalOpen(true);
      return;
    }

    let url = linkInput.trim();
    if (!url) return;

    // Fix https://https:// typo
    url = url.replace(/^(https?:\/\/)+/i, 'https://');
    
    // Prepend https:// if missing
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    setIsLinkLoading(true);
    
    try {
      const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      
      const customName = linkNameInput.trim() || undefined;

      if (data && data.status === "success" && data.data) {
        setLinks([...links, {
          url: data.data.url || url,
          customName,
          title: data.data.title || "",
          description: data.data.description || "",
          image: data.data.image?.url || "",
          favicon: data.data.logo?.url || ""
        }]);
      } else {
        setLinks([...links, { url, customName }]);
      }
    } catch (e) {
      console.error("Microlink API error:", e);
      setLinks([...links, { url, customName: linkNameInput.trim() || undefined }]);
    } finally {
      setIsLinkLoading(false);
      setLinkInput("");
      setLinkNameInput("");
    }
  };

  return (
    <div 
      className="publish-step-container"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "70vh",
        transform: slideIn ? "translateX(0)" : "translateX(20px)",
        opacity: slideIn ? 1 : 0,
        transition: "all 0.4s ease-out",
        padding: "1rem 0",
        width: "100%",
        alignItems: "flex-start",
      }}
    >
      <div style={{ opacity: transitioningTo ? 0 : 1, transition: "opacity 0.3s ease", width: "100%" }}>
        <h1
          style={{
            fontFamily: "Ubuntu, sans-serif",
            fontSize: "2rem",
            marginBottom: "0.25rem",
            color: "#111",
            margin: 0,
            minHeight: "2.4rem", 
          }}
        >
          {currentHeader.title}
        </h1>
          <div 
            style={{ 
              fontSize: "1.05rem", 
              lineHeight: "1.5", 
              fontFamily: "Ubuntu, sans-serif",
              color: "#111",
              marginBottom: step === "links" ? 0 : "1.5rem",
              marginTop: "0.25rem",
              minHeight: "3rem", 
            }}
          >
            {currentHeader.subtitle}
          </div>
      </div>

      {/* Input Areas */}
      <div style={{ 
        width: "100%", 
        maxWidth: "600px", 
        opacity: transitioningTo ? 0 : 1, 
        pointerEvents: transitioningTo ? 'none' : 'auto',
        transition: "opacity 0.3s ease",
        position: "relative"
      }}>
        {step === "title" && (
          <>
            <input 
              type="text"
              className="search-input"
              placeholder={typewriterText}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isTitleValid) {
                  handleNext("tagline");
                }
              }}
              maxLength={70}
              style={{ 
                fontSize: "1rem", 
                padding: "10px 14px",
                width: "100%",
                boxSizing: "border-box"
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.85rem', color: '#000', fontFamily: 'Ubuntu, sans-serif' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000' }}>
                <img src="/brand/3d-alarm-clock.png" alt="" style={{ width: "16px", height: "16px", objectFit: "contain" }} />
                {wordCount} of 3 minimum words
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000' }}>
                <img src="/brand/3d-alarm-clock.png" alt="" style={{ width: "16px", height: "16px", objectFit: "contain" }} />
                {70 - title.length} left
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
              <button
                onClick={() => window.location.hash = "#hashtags"}
                style={{
                  padding: "8px 24px",
                  backgroundColor: "transparent",
                  color: "#c7511f",
                  border: "none",
                  fontSize: "0.95rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontFamily: "Ubuntu, sans-serif"
                }}
              >
                Go Back
              </button>
              <button
                onClick={() => handleNext("tagline")}
                disabled={!isTitleValid}
                style={{
                  padding: "8px 24px",
                  backgroundColor: !isTitleValid ? "#ccc" : "#000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                  fontWeight: "bold",
                  cursor: !isTitleValid ? "not-allowed" : "pointer",
                  fontFamily: "Ubuntu, sans-serif",
                  opacity: !isTitleValid ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === "tagline" && (
          <>
            <input 
              type="text"
              className="search-input"
              placeholder="Enter a brief tagline..."
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isTaglineValid) {
                  handleNext("description");
                }
              }}
              maxLength={150}
              style={{ 
                fontSize: "1rem", 
                padding: "10px 14px",
                width: "100%",
                boxSizing: "border-box"
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', fontSize: '0.85rem', color: '#000', fontFamily: 'Ubuntu, sans-serif' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000' }}>
                <img src="/brand/3d-alarm-clock.png" alt="" style={{ width: "16px", height: "16px", objectFit: "contain" }} />
                {150 - tagline.length} left
              </span>
            </div>

            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
              <button
                onClick={() => handleNext("description")}
                style={{
                  padding: "8px 24px",
                  backgroundColor: "#c7511f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontFamily: "Ubuntu, sans-serif",
                }}
              >
                Skip
              </button>
              <button
                onClick={() => handleNext("description")}
                disabled={!isTaglineValid}
                style={{
                  padding: "8px 24px",
                  backgroundColor: !isTaglineValid ? "#ccc" : "#000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                  fontWeight: "bold",
                  cursor: !isTaglineValid ? "not-allowed" : "pointer",
                  fontFamily: "Ubuntu, sans-serif",
                  opacity: !isTaglineValid ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === "description" && (
          <div style={{ position: "relative", paddingTop: "2rem" }}>
            
            {/* Puter AI Button Container - Placed in top right inside padding */}
            <div 
              style={{
                position: "absolute",
                top: "0.25rem",
                right: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#fff",
                borderRadius: "20px",
                padding: "6px 12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                cursor: isAiLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                zIndex: 10,
                border: "1px solid #000",
                opacity: isAiLoading ? 0.7 : 1
              }}
              onMouseEnter={() => setAiHover(true)}
              onMouseLeave={() => setAiHover(false)}
              onClick={isAiLoading ? undefined : handleAiClick}
            >
              <img src="/brand/linguix.png" alt="AI" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
              
              <div style={{
                overflow: "hidden",
                width: "110px",
                transition: "width 0.3s ease",
                whiteSpace: "nowrap"
              }}>
                <span style={{ 
                  fontFamily: "Ubuntu, sans-serif", 
                  fontSize: "0.85rem", 
                  fontWeight: "bold",
                  color: "#111"
                }}>
                  {isAiLoading ? "Enhancing..." : "Correct Grammar"}
                </span>
              </div>
            </div>

            <ReactQuill 
              ref={quillRef}
              theme="snow"
              value={description}
              onChange={handleQuillChange}
              modules={quillModules}
              placeholder="Enter your detailed description..."
              style={{ 
                width: "100%",
                backgroundColor: "#fff",
                borderBottomLeftRadius: "6px",
                borderBottomRightRadius: "6px",
                fontFamily: "Ubuntu, sans-serif",
              }}
            />
            
              <style>{`
              .ql-editor {
                min-height: 12rem;
                font-family: 'Ubuntu', sans-serif;
                font-size: 1rem;
              }
              .ql-toolbar {
                border-top-left-radius: 6px;
                border-top-right-radius: 6px;
                background-color: #faf8f0 !important;
                border: 1px solid #000 !important;
                border-bottom: none !important;
              }
              .ql-container {
                border-bottom-left-radius: 6px;
                border-bottom-right-radius: 6px;
                background-color: #faf8f0 !important;
                border: 1px solid #000 !important;
              }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', fontSize: '0.85rem', color: '#000', fontFamily: 'Ubuntu, sans-serif' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000' }}>
                <img src="/brand/3d-alarm-clock.png" alt="" style={{ width: "16px", height: "16px", objectFit: "contain" }} />
                {4000 - descLength} left
              </span>
            </div>

            <div style={{ marginTop: "2rem" }}>
              <button
                disabled={!isDescValid}
                onClick={() => handleNext("links")}
                style={{
                  padding: "8px 24px",
                  backgroundColor: !isDescValid ? "#ccc" : "#000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                  fontWeight: "bold",
                  cursor: !isDescValid ? "not-allowed" : "pointer",
                  fontFamily: "Ubuntu, sans-serif",
                  opacity: !isDescValid ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === "links" && (
          <div style={{ marginTop: "2rem" }}>
            <style>{`.black-placeholder::placeholder { color: #000 !important; }`}</style>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <img src="/brand/349837284347834.png" alt="" style={{ height: "10rem", width: "auto" }} />
            </div>

            {links.length < 10 && (
              <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginBottom: "1rem" }}>
                  <input 
                    type="text" 
                    placeholder="Type your link here (e.g. https://example.com)"
                    style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #000", fontSize: "16px", width: "100%", fontFamily: "Ubuntu, sans-serif" }}
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddLink();
                    }}
                    disabled={isLinkLoading}
                  />
                  <input 
                    type="text" 
                    placeholder="Name the link (optional)"
                    style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #000", fontSize: "16px", width: "100%", fontFamily: "Ubuntu, sans-serif" }}
                    value={linkNameInput}
                    onChange={(e) => setLinkNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddLink();
                    }}
                    disabled={isLinkLoading}
                  />
                </div>
                <button
                  onClick={handleAddLink}
                  disabled={isLinkLoading || !linkInput.trim()}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#c7511f",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.95rem",
                    fontWeight: "bold",
                    cursor: (isLinkLoading || !linkInput.trim()) ? "not-allowed" : "pointer",
                    fontFamily: "Ubuntu, sans-serif",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    opacity: (isLinkLoading || !linkInput.trim()) ? 0.7 : 1
                  }}
                >
                  {isLinkLoading ? "Adding..." : "+ Add Link"}
                </button>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
              {links.map((link, idx) => (
                <div key={idx} style={{
                  border: "1px solid #000",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#fff",
                }}>
                  <div className="sidebar-header" style={{ margin: 0, borderRadius: 0, borderBottom: "1px solid #000" }}>
                    <div className="sidebar-header-left">
                      <img src="/brand/983473984834.png" alt="Icon" className="sidebar-book-icon" />
                      <h3 style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "16px", fontWeight: "bold" }}>{link.customName ? link.customName : `Link ${idx + 1}`}</h3>
                    </div>
                    <button onClick={() => setLinks(links.filter((_, i) => i !== idx))} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontWeight: "bold", fontSize: "14px", display: "flex", alignItems: "center", gap: "4px" }}>
                      ✕ Remove
                    </button>
                  </div>

                  {link.image && (
                    <div style={{ width: "100%", height: "80px", overflow: "hidden", borderBottom: "1px solid #eee" }}>
                      <img src={link.image} alt={link.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ padding: "12px 16px" }}>
                    <h4 style={{ margin: "0 0 6px 0", fontFamily: "Ubuntu, sans-serif", fontSize: "1rem", color: "#111", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {link.title || link.url}
                    </h4>
                    {link.description && (
                      <p style={{ margin: "0 0 10px 0", fontSize: "0.85rem", color: "#555", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "Ubuntu, sans-serif" }}>
                        {link.description}
                      </p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {link.favicon ? (
                        <img src={link.favicon} alt="Favicon" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '16px', height: '16px', backgroundColor: '#ccc', borderRadius: '4px', flexShrink: 0 }}></div>
                      )}
                      <span style={{ fontSize: "0.8rem", color: "#000", fontFamily: "Ubuntu, sans-serif", maxWidth: '50%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {link.url}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "2rem" }}>
              <button
                onClick={() => handleNext("labels")}
                style={{
                  padding: "8px 24px",
                  backgroundColor: "#000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontFamily: "Ubuntu, sans-serif"
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === "labels" && (
          <div style={{ marginTop: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
              <button
                onClick={() => window.location.hash = "#final"}
                style={{
                  padding: "4px 12px",
                  backgroundColor: "transparent",
                  color: "#c7511f",
                  border: "none",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontFamily: "Ubuntu, sans-serif",
                  textDecoration: "underline"
                }}
              >
                Skip
              </button>
            </div>
            <div style={{ marginBottom: "2rem" }}>
              <input
                type="text"
                className="search-input"
                placeholder="Find your community"
                value={labelSearchQuery}
                onChange={(e) => setLabelSearchQuery(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(3, 1fr)", 
              gap: "1rem" 
            }}>
              {labelsData.filter(l => l.name.toLowerCase().includes(labelSearchQuery.toLowerCase())).map((label, idx) => {
                const isSelected = selectedLabels.includes(label.id);
                return (
                  <div 
                    key={label.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedLabels(selectedLabels.filter(id => id !== label.id));
                      } else if (selectedLabels.length < 3) {
                        setSelectedLabels([...selectedLabels, label.id]);
                      }
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      cursor: "pointer",
                      opacity: isSelected ? 1 : 0.6,
                      transition: "opacity 0.2s"
                    }}
                  >
                    <div style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "1 / 1",
                      backgroundColor: isSelected ? "#e5e5e5" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "1rem",
                      borderRadius: "8px"
                    }}>
                      {isSelected && (
                        <div style={{ 
                          position: "absolute", 
                          top: "8px", 
                          right: "8px", 
                          width: "16px", 
                          height: "16px", 
                          borderRadius: "50%", 
                          border: "4px solid #c7511f", 
                          backgroundColor: "#fff",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                        }} />
                      )}
                      <img src={label.image} alt={label.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div style={{
                      fontFamily: "Ubuntu, sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: isSelected ? "bold" : "normal",
                      color: "#111",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {label.name}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "3rem" }}>
              <button
                onClick={() => window.location.hash = "#final"}
                style={{
                  padding: "8px 24px",
                  backgroundColor: "#000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontFamily: "Ubuntu, sans-serif"
                }}
              >
                Next
              </button>
              <button
                onClick={() => window.location.hash = "#final"}
                style={{
                  padding: "8px 24px",
                  backgroundColor: "transparent",
                  color: "#c7511f",
                  border: "none",
                  fontSize: "0.95rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontFamily: "Ubuntu, sans-serif"
                }}
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Area */}
      <div style={{ 
        marginTop: "3rem", 
        width: "100%", 
        maxWidth: "600px",
        opacity: transitioningTo ? 0 : 1, 
        transition: "opacity 0.3s ease" 
      }}>
        {step !== "title" && (
          <div style={{ border: "1px solid #000", borderRadius: "8px", marginBottom: "1rem", backgroundColor: "#faf8f0", overflow: "hidden" }}>
            <div className="sidebar-header" style={{ margin: 0, borderRadius: 0, borderBottom: "1px solid #000" }}>
              <div className="sidebar-header-left">
                <img src="/brand/97363947364.png" alt="Icon" className="sidebar-book-icon" />
                <h3 style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "16px", fontWeight: "bold" }}>Title</h3>
              </div>
              <button onClick={() => handleEdit("title")} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>✎ Edit</button>
            </div>
            <div style={{ padding: "1rem", color: "#444", wordBreak: "break-word", fontFamily: "Ubuntu, sans-serif" }}>
              {title || "(No title provided)"}
            </div>
          </div>
        )}

        {(step === "description" || step === "links" || step === "labels") && (
          <div style={{ border: "1px solid #000", borderRadius: "8px", marginBottom: "1rem", backgroundColor: "#faf8f0", overflow: "hidden" }}>
            <div className="sidebar-header" style={{ margin: 0, borderRadius: 0, borderBottom: "1px solid #000" }}>
              <div className="sidebar-header-left">
                <img src="/brand/97363947364.png" alt="Icon" className="sidebar-book-icon" />
                <h3 style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "16px", fontWeight: "bold" }}>Tagline</h3>
              </div>
              <button onClick={() => handleEdit("tagline")} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>✎ Edit</button>
            </div>
            <div style={{ padding: "1rem", color: "#444", wordBreak: "break-word", fontFamily: "Ubuntu, sans-serif" }}>
              {tagline || "(Skipped)"}
            </div>
          </div>
        )}

        {(step === "links" || step === "labels") && (
          <div style={{ border: "1px solid #000", borderRadius: "8px", marginBottom: "1rem", backgroundColor: "#faf8f0", overflow: "hidden" }}>
            <div className="sidebar-header" style={{ margin: 0, borderRadius: 0, borderBottom: "1px solid #000" }}>
              <div className="sidebar-header-left">
                <img src="/brand/97363947364.png" alt="Icon" className="sidebar-book-icon" />
                <h3 style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "16px", fontWeight: "bold" }}>Description</h3>
              </div>
              <button onClick={() => handleEdit("description")} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>✎ Edit</button>
            </div>
            <div 
              style={{ padding: "1rem", color: "#444", wordBreak: "break-word", fontFamily: "Ubuntu, sans-serif", maxHeight: "200px", overflowY: "auto" }}
              dangerouslySetInnerHTML={{ __html: description || "(No description provided)" }}
            />
          </div>
        )}

        {step === "labels" && (
          <div style={{ border: "1px solid #000", borderRadius: "8px", marginBottom: "1rem", backgroundColor: "#faf8f0", overflow: "hidden" }}>
            <div className="sidebar-header" style={{ margin: 0, borderRadius: 0, borderBottom: "1px solid #000" }}>
              <div className="sidebar-header-left">
                <img src="/brand/97363947364.png" alt="Icon" className="sidebar-book-icon" />
                <h3 style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "16px", fontWeight: "bold" }}>Links</h3>
              </div>
              <button onClick={() => handleEdit("links")} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>✎ Edit</button>
            </div>
            <div style={{ padding: "1rem", color: "#444", wordBreak: "break-word", fontFamily: "Ubuntu, sans-serif" }}>
              {links.length > 0 ? `${links.length} link(s) added.` : "(No links added)"}
            </div>
          </div>
        )}
      </div>

      <AlertModal 
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title="AI Assistant"
        message={aiModalMessage}
      />
    </div>
  );
}