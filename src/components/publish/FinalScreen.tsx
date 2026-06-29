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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (canSubmit && !isSubmitting) {
      setIsSubmitting(true);
      
      try {
        const title = await localforage.getItem<string>("openRockets_title") || "Untitled Artifact";
        const subtitle = await localforage.getItem<string>("openRockets_tagline") || "";
        const type = localStorage.getItem("publish_artifact_type") || "unknown";
        
        const slots = await localforage.getItem<any[]>("openRockets_uploadSlots");
        const activeFiles = slots ? slots.filter(s => s.file !== null).map(s => s.file) : [];

        if (activeFiles.length === 0) {
          alert("No files to upload.");
          setIsSubmitting(false);
          return;
        }

        const fileMetaList = activeFiles.map(f => ({ name: f.name, type: f.type || 'application/octet-stream' }));

        // 1. Get pre-signed upload URLs
        const preUploadRes = await fetch('/api/publications/pre-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: fileMetaList })
        });
        const preUploadData = await preUploadRes.json();
        
        if (!preUploadRes.ok || !preUploadData.success) {
          throw new Error(preUploadData.error || "Failed to get upload URLs");
        }

        const uploadUrls = preUploadData.data;
        const uploadedKeys: string[] = [];

        // 2. Upload files directly to S3
        for (let i = 0; i < uploadUrls.length; i++) {
          const { url, key } = uploadUrls[i];
          const fileToUpload = activeFiles[i];
          const s3Res = await fetch(url, {
            method: 'PUT',
            body: fileToUpload,
            headers: { 'Content-Type': fileToUpload.type || 'application/octet-stream' }
          });
          
          if (!s3Res.ok) throw new Error(`Failed to upload ${fileToUpload.name} to Object Storage`);
          uploadedKeys.push(key);
        }

        // 3. Collect metadata
        const abstract = await localforage.getItem<string>("openRockets_desc") || "";
        const publisherId = localStorage.getItem("publish_artifact_publisher") || "";
        const storedHashtags = localStorage.getItem("publish_artifact_hashtags");
        const hashtags = storedHashtags ? JSON.parse(storedHashtags) : [];
        const communities = await localforage.getItem<string[]>("openRockets_labels") || [];
        const links = await localforage.getItem<any[]>("openRockets_links") || [];

        // 4. Submit to backend
        const submitPayload = {
          title,
          subtitle,
          abstract,
          type,
          license: localStorage.getItem("publish_artifact_license") || "ORP_BEAVER",
          division: "artifacts",
          publisherId,
          tags: JSON.stringify(hashtags),
          communities: JSON.stringify(communities),
          links: JSON.stringify(links),
          fileStorageKey: uploadedKeys[0],
          extraFiles: JSON.stringify(uploadedKeys)
        };

        const submitRes = await fetch('/api/publications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitPayload)
        });

        const submitData = await submitRes.json();
        if (!submitRes.ok || !submitData.success) {
          throw new Error(submitData.error?.message || "Failed to finalize submission");
        }

        setHasSubmitted(true);
        // Clear caches
        await localforage.removeItem("openRockets_title");
        await localforage.removeItem("openRockets_tagline");
        await localforage.removeItem("openRockets_uploadSlots");
        
        // Redirect to new artifact route
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        window.location.href = `/artifacts/${slug}`;
      } catch (err: any) {
        console.error("Submission error:", err);
        alert(`Error during submission: ${err.message}`);
        setIsSubmitting(false);
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
        @keyframes spinner-spin {
          to { transform: rotate(360deg); }
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
            disabled={!canSubmit || isSubmitting}
            style={{
              padding: "8px 24px",
              backgroundColor: (!canSubmit || isSubmitting) ? "#ccc" : "#000",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.95rem",
              fontWeight: "bold",
              cursor: (!canSubmit || isSubmitting) ? "not-allowed" : "pointer",
              fontFamily: "Ubuntu, sans-serif",
              opacity: (!canSubmit || isSubmitting) ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {isSubmitting ? (
              <>
                <div style={{ animation: "spinner-spin 1s linear infinite", width: "16px", height: "16px", border: "2px solid #fff", borderTop: "2px solid transparent", borderRadius: "50%" }}></div>
                Submitting...
              </>
            ) : "Submit"}
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
