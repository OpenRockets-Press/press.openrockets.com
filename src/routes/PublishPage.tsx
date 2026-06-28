import { useState, useEffect } from "react";
import { PublishLayout } from "@/components/publish/PublishLayout";
import { WelcomeScreen } from "@/components/publish/WelcomeScreen";
import { TypeSelectorScreen } from "@/components/publish/TypeSelectorScreen";
import { LicenseScreen } from "@/components/publish/LicenseScreen";
import { PublisherScreen } from "@/components/publish/PublisherScreen";
import { UploadScreen } from "@/components/publish/UploadScreen";
import { EditorScreen } from "@/components/publish/EditorScreen";
import { FinalScreen } from "@/components/publish/FinalScreen";
import { HashtagsScreen } from "@/components/publish/HashtagsScreen";

export function PublishPage() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || "#welcome");
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Initial scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    const handleHashChange = () => {
      const newHash = window.location.hash || "#welcome";
      if (newHash !== currentHash) {
        setIsFading(true);
        setTimeout(() => {
          setCurrentHash(newHash);
          window.scrollTo({ top: 0, behavior: 'instant' });
          setIsFading(false);
        }, 300); // fade out duration
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    
    // Ensure initial hash is set if empty
    if (!window.location.hash) {
      window.history.replaceState(null, "", "#welcome");
    }

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [currentHash]);

  return (
    <PublishLayout>
      <div 
        className="publish-pipeline-container"
        style={{
          transition: "opacity 0.3s ease-in-out",
          opacity: isFading ? 0 : 1,
          width: "100%",
          height: "100%"
        }}
      >
        {currentHash === "#welcome" && <WelcomeScreen />}
        {currentHash === "#type-selector" && <TypeSelectorScreen />}
        {currentHash === "#license" && <LicenseScreen />}
        {currentHash === "#publisher" && <PublisherScreen />}
        {currentHash === "#next-stage" && <UploadScreen />}
        {currentHash === "#hashtags" && <HashtagsScreen />}
        {currentHash === "#editor" && <EditorScreen />}
        {currentHash === "#final" && <FinalScreen />}
      </div>
    </PublishLayout>
  );
}
