import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function NotFoundPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/", search: { q: query } });
  };

  return (
    <main style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', color: '#fff' }}>
      <img src="/brand/spih.png" alt="Not found" style={{ width: '200px', height: 'auto', marginBottom: '30px', borderRadius: '8px' }} />
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Our library couldn't find what you were searching for.</h1>
      <p style={{ color: '#aaa', fontSize: '16px', marginBottom: '32px' }}>Try something else.</p>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '40px', maxWidth: '400px', width: '100%' }}>
        <input 
          type="search" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..." 
          style={{ flex: 1, padding: '10px 16px', borderRadius: '24px', border: '1px solid #333', backgroundColor: '#111', color: '#fff', outline: 'none' }} 
        />
        <button type="submit" style={{ padding: '10px 20px', borderRadius: '24px', backgroundColor: '#fff', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          Search
        </button>
      </form>

      <Link className="solid-button" to="/" style={{ display: 'inline-block', maxWidth: 'max-content', padding: '10px 24px' }}>
        Return to Home
      </Link>
    </main>
  );
}
