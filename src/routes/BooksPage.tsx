import { useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export function BooksPage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#000' }}>
      <AppShell hideSidebar hideSidebarToggle>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          
          {/* Background Image */}
          <div 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              backgroundImage: 'url(/brand/books-cover.jpg)', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              zIndex: 0
            }} 
          />

          {/* Gradient Overlay */}
          <div 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(192,192,192,0.4) 100%)',
              zIndex: 1
            }} 
          />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '2rem', maxWidth: '800px', color: '#fff' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2, fontFamily: 'Inter, system-ui, sans-serif', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              Publishing a book?<br />
              Publish it with OpenRockets Press,<br />
              <span style={{ color: '#e0e0e0' }}>400% free of charge.</span>
            </h1>
            
            <p style={{ fontSize: '1.25rem', lineHeight: 1.6, marginBottom: '2.5rem', color: '#eaeaea', fontWeight: 500, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              OpenRockets Press will begin accepting book submissions soon. We will notify everyone as soon as this feature becomes available.
            </p>
            
            <button 
              onClick={() => navigate({ to: '/' })}
              style={{
                backgroundColor: '#000',
                color: '#fff',
                border: '2px solid rgba(255,255,255,0.2)',
                padding: '12px 32px',
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#222';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#000';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Back to Home
            </button>
          </div>

        </div>
      </AppShell>
    </div>
  );
}
