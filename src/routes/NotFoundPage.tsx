import { Link } from "@tanstack/react-router";

export function NotFoundPage() {
  return (
    <main style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', color: '#fff' }}>
      <img src="/brand/spih.png" alt="Not found" style={{ width: '200px', height: 'auto', marginBottom: '30px', borderRadius: '8px' }} />
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Our library couldn't find what you were searching for.</h1>
      <p style={{ color: '#aaa', fontSize: '16px', marginBottom: '40px' }}>Don't worry, there are a lot more things to explore.</p>
      
      <Link className="solid-button" to="/">
        Return to Home
      </Link>
    </main>
  );
}
