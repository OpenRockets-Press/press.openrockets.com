import { useState, useEffect } from "react";
import { AlertModal } from "@/components/ui/AlertModal";
import localforage from "localforage";

const CheckboxRow = ({ checked, onChange, label, disabled = false }: { checked: boolean; onChange?: (e: any) => void; label: string; disabled?: boolean }) => (
  <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: disabled ? "default" : "pointer", textAlign: "left", marginBottom: "1.25rem" }}>
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange}
      disabled={disabled}
      style={{ 
        width: "20px", 
        height: "20px", 
        accentColor: "#c7511f",
        marginTop: "3px",
        cursor: disabled ? "default" : "pointer",
        flexShrink: 0
      }} 
    />
    <span style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "1rem", color: "#111", lineHeight: "1.5", flex: 1 }}>
      {label}
    </span>
  </label>
);

export function FinalScreen() {
  const [slideIn, setSlideIn] = useState(false);
  const [certify1, setCertify1] = useState(false);
  const [certify2, setCertify2] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlideIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const canSubmit = certify1 && certify2;

  const handleSubmit = async () => {
    if (canSubmit) {
      setHasSubmitted(true);
      
      try {
        // Gather data
        const title = await localforage.getItem<string>("openRockets_title") || "Untitled Artifact";
        const subtitle = await localforage.getItem<string>("openRockets_tagline") || "";
        const type = localStorage.getItem("publish_artifact_type") || "unknown";
        
        // Count non-empty slots
        const slots = await localforage.getItem<any[]>("openRockets_uploadSlots");
        let fileCount = 0;
        if (slots) {
          fileCount = slots.filter(s => s.file !== null).length;
        }

        // Fetch publisher domain
        const publisherId = localStorage.getItem("publish_artifact_publisher");
        const linkId = localStorage.getItem("publish_artifact_link_id") || "unknown";
        let publisherDomain = "Unknown Publisher";
        if (publisherId) {
          const res = await fetch("/config/publishers.json");
          if (res.ok) {
            const data = await res.json();
            const matched = data.publishers?.find((p: any) => p.id === publisherId);
            if (matched) {
              publisherDomain = matched.domain;
            }
          }
        }

        const storedHashtags = localStorage.getItem("publish_artifact_hashtags");
        let hashtags = [];
        if (storedHashtags) {
          try {
            hashtags = JSON.parse(storedHashtags);
          } catch (e) {}
        }

        const submission = {
          id: Date.now().toString(),
          type,
          title,
          subtitle,
          fileCount,
          publisherDomain,
          linkId,
          hashtags,
          author: "OpenRockets User",
          status: "pending"
        };

        const existing = await localforage.getItem<any[]>("openRockets_submissions") || [];
        existing.push(submission);
        await localforage.setItem("openRockets_submissions", existing);
        
        alert("Submission complete!");
      } catch (err) {
        console.error("Failed to compile submission:", err);
        alert("Submission complete, but failed to track it internally.");
      }
    }
  };

  const handleGoBack = () => {
    sessionStorage.setItem("returnToLabels", "true");
    window.location.hash = "#editor";
  };

  return (
    <div 
      className="publish-step-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "4rem 2rem",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#fff",
        fontFamily: "Ubuntu, sans-serif",
        transform: slideIn ? "translateY(0)" : "translateY(20px)",
        opacity: slideIn ? 1 : 0,
        transition: "all 0.4s ease-out",
        boxSizing: "border-box"
      }}
    >
      <style>{`
        @keyframes shapeShift {
          0% { clip-path: circle(50% at 50% 50%); transform: rotate(0deg) scale(1); }
          25% { clip-path: polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%); transform: rotate(90deg) scale(1.1); }
          50% { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); transform: rotate(180deg) scale(0.9); }
          75% { clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%); transform: rotate(270deg) scale(1.2); }
          100% { clip-path: circle(50% at 50% 50%); transform: rotate(360deg) scale(1); }
        }
      `}</style>

      <div style={{ position: "relative", width: "10rem", height: "10rem", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "2rem" }}>
        <div style={{ 
          position: "absolute", 
          width: "100%", 
          height: "100%", 
          backgroundColor: "#c7511f", 
          animation: "shapeShift 8s infinite linear",
          opacity: 0.15
        }} />
        <img src="/brand/987935879357.png" alt="Graphic" style={{ height: "6rem", position: "relative", zIndex: 1 }} />
      </div>

      <div style={{ width: "100%", textAlign: "left" }}>
        <h1 
          style={{ 
            fontFamily: "Ubuntu, sans-serif", 
            fontSize: "2.5rem", 
            fontWeight: "bold",
            color: "#111", 
            letterSpacing: "0.5px",
            marginBottom: "2.5rem",
          }}
        >
          All done. Congrats!
        </h1>

        <div style={{ width: "100%" }}>
          <CheckboxRow 
            checked={certify1} 
            onChange={(e) => setCertify1(e.target.checked)} 
            label="I confirm that the resources I have uploaded do not contain unauthorized copyrighted material."
          />
          <CheckboxRow 
            checked={certify2} 
            onChange={(e) => setCertify2(e.target.checked)} 
            label="I confirm that these resources do not contain illicit or explicit material which would violate OpenRockets Press policies."
          />

          <hr style={{ border: "none", borderTop: "1px solid #111", margin: "2rem 0" }} />

          <h3 style={{ fontFamily: "Ubuntu, sans-serif", fontWeight: "bold", fontSize: "1.5rem", color: "#111", marginBottom: "1.5rem", textAlign: "left" }}>
            We certify
          </h3>

          <CheckboxRow 
            checked={true}
            disabled={true} 
            label="Your content is fully secured and stored in encryption inside Oracle Cloud Infrastructure, a highly legitimate cloud provider."
          />
          <CheckboxRow 
            checked={true}
            disabled={true} 
            label="Your content is completely yours. We do not steal your intellectual property rights and respect your work."
          />
          <CheckboxRow 
            checked={true}
            disabled={true} 
            label="Submissions are completely confidential until accepted."
          />
          <CheckboxRow 
            checked={true}
            disabled={true} 
            label="You have full control over your submissions. You can delete them anytime or keep them indefinitely on this platform."
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "3rem" }}>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              padding: "8px 24px",
              backgroundColor: !canSubmit ? "#ccc" : "#000",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.95rem",
              fontWeight: "bold",
              cursor: !canSubmit ? "not-allowed" : "pointer",
              fontFamily: "Ubuntu, sans-serif",
              opacity: !canSubmit ? 0.5 : 1
            }}
          >
            Submit
          </button>
          <button
            onClick={handleGoBack}
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
        </div>

        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "1rem",
          marginTop: "4rem",
          padding: "1.5rem",
          backgroundColor: "#faf8f0",
          border: "1px solid #111",
          borderRadius: "8px"
        }}>
          <img 
            src="/brand/85974.png" 
            alt="Breakfast" 
            style={{ height: "5rem", width: "auto", objectFit: "contain", flexShrink: 0 }} 
          />
          <div style={{ fontFamily: "Ubuntu, sans-serif", color: "#111", lineHeight: "1.5", fontSize: "0.95rem" }}>
            <p style={{ margin: "0 0 0.5rem 0" }}>
              <span style={{ fontSize: "1.4rem", fontWeight: "bold" }}>D</span><span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>id you know?</span>
            </p>
            <p style={{ margin: 0 }}>
              Every artifact has its own story. OpenRockets Magazine is the largest and most secure student magazine which is open to everyone and can make your artifact about 20 to 30 times more popular and get you more reach by publishing on it. We have a rigorous review process and abuse protection process. Be seen by thousands of monthly readers every day by publishing.
            </p>
            <a 
              href="https://mag.openrockets.com/submit"
              onClick={(e) => {
                if (!hasSubmitted) {
                  e.preventDefault();
                  setShowAlert(true);
                }
              }}
              style={{
                display: "inline-block",
                marginTop: "1rem",
                color: "#c7511f",
                fontWeight: "bold",
                textDecoration: "underline",
                cursor: "pointer"
              }}
            >
              Publish on OpenRockets magazine
            </a>
          </div>
        </div>
      </div>

      <AlertModal 
        isOpen={showAlert} 
        onClose={() => setShowAlert(false)} 
        title="Action Required" 
        message="Please submit your artifact first before leaving the page."
      />
    </div>
  );
}
