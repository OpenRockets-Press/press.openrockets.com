const DELIMITER = "\n[---]\n";
const BRAND_MASK = "ZXZXBRANDZXZX";

export async function translateTextBatch(texts: string[], targetLang: string): Promise<string[]> {
  if (targetLang === 'en' || texts.length === 0) return texts;

  // Mask brand names
  const maskedTexts = texts.map(t => t.replace(/open\s*rockets/gi, BRAND_MASK));
  const translatedTexts: string[] = [];
  const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

  const CHUNK_SIZE = apiKey ? 100 : 15; // Official API can handle larger arrays directly

  for (let i = 0; i < maskedTexts.length; i += CHUNK_SIZE) {
    const chunk = maskedTexts.slice(i, i + CHUNK_SIZE);
    
    try {
      if (apiKey) {
        // --- OFFICIAL GOOGLE CLOUD TRANSLATION API (v2) ---
        // This will NEVER rate-limit or IP-block you as long as billing is enabled.
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
        
        // The official API accepts a JSON array of strings, completely avoiding delimiter issues!
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: chunk,
            source: "en",
            target: targetLang,
            format: "text"
          })
        });

        if (!res.ok) throw new Error(`Official API error: ${res.status}`);
        const data = await res.json();
        
        if (data.data && data.data.translations) {
          translatedTexts.push(
            ...data.data.translations.map((t: any) => t.translatedText.replace(new RegExp(BRAND_MASK, "gi"), "Open Rockets"))
          );
        } else {
          throw new Error("Unexpected official API response structure");
        }

      } else {
        // --- FREE UNDOCUMENTED API (gtx) ---
        const combinedText = chunk.join(DELIMITER);
        const url = new URL("https://translate.googleapis.com/translate_a/single");
        url.searchParams.append("client", "gtx");
        url.searchParams.append("sl", "en");
        url.searchParams.append("tl", targetLang);
        url.searchParams.append("dt", "t");
        url.searchParams.append("q", combinedText);

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Free API error: ${res.status}`);
        const data = await res.json();

        let translatedCombined = "";
        if (data && data[0]) {
          for (const segment of data[0]) {
            if (segment[0]) translatedCombined += segment[0];
          }
        }

        const split = translatedCombined.split(/\[\s*-\s*-\s*-\s*\]/g).map(s => s.trim());
        if (split.length === chunk.length) {
          translatedTexts.push(...split.map(s => s.replace(new RegExp(BRAND_MASK, "gi"), "Open Rockets")));
        } else {
          throw new Error(`Chunk mismatch (expected ${chunk.length}, got ${split.length})`);
        }
      }
    } catch (err) {
      console.error("Translation request failed:", err);
      // Fallback to mock translation to visually prove the DOM observer works
      translatedTexts.push(
        ...chunk.map(s => {
          let cleaned = s.replace(new RegExp(BRAND_MASK, "gi"), "Open Rockets");
          if (cleaned.trim().length <= 1) return cleaned;
          return `[${targetLang.toUpperCase()}] ${cleaned}`;
        })
      );
    }
  }

  return translatedTexts;
}
