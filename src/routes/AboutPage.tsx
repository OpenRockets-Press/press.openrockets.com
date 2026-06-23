import { Link } from '@tanstack/react-router';
import { ArrowRight, BookOpen, GraduationCap, Briefcase, ShieldCheck } from 'lucide-react';
import { LicenseBadge } from '@/components/badges/LicenseBadge';
import { DivisionArtifact, Division3D, DivisionCode } from '@/components/icons';

const TEAM = [
  { name: 'Dr. Sarah Chen', role: 'Executive Director', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { name: 'Marcus Johnson', role: 'Head of Engineering', avatar: 'https://i.pravatar.cc/150?u=marcus' },
  { name: 'Elena Rodriguez', role: 'Community Lead', avatar: 'https://i.pravatar.cc/150?u=elena' },
  { name: 'David Kim', role: 'Legal Strategy', avatar: 'https://i.pravatar.cc/150?u=david' },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-surface-1 text-ink pb-24">
      
      {/* 1. Mission Statement (Hero) */}
      <section className="bg-zinc-950 text-cream py-24 px-4 sm:px-6 lg:px-8 border-b-4 border-gold text-center shadow-inner">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif mb-8 text-cream/90 italic">
            "Knowledge belongs to the world."
          </h1>
          <p className="text-xl md:text-2xl font-medium text-cream/80 max-w-2xl mx-auto leading-relaxed">
            Open Rockets Press is a non-profit library dedicated to the preservation, peer-review, and free distribution of aerospace engineering resources.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 py-16">
        
        {/* 2. What Open Rockets Press Is */}
        <section className="prose prose-lg max-w-none">
          <h2 className="text-4xl font-serif text-ink mb-6">What We Do</h2>
          <p className="text-xl text-ink-light leading-relaxed">
            For decades, high-quality engineering research and functional models have been locked behind expensive academic journals or fragmented across disjointed personal websites. Open Rockets Press serves as a centralized, modernized publishing house. We accept submissions from individuals and organizations, submit them to a rigorous peer-review process, and distribute them to the public under clear, permissive licenses.
          </p>
        </section>

        {/* 3. Three Divisions Infographic */}
        <section>
          <h2 className="text-4xl font-serif text-ink mb-8 text-center">Our Divisions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-0 border border-cream-border rounded-xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                <DivisionArtifact size={32} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-serif mb-2">Artifacts</h3>
              <p className="t-body-sm text-ink-light mb-4">Academic papers, research logs, and standard documentation.</p>
              <div className="text-3xl font-bold font-mono text-ink">12,450+</div>
            </div>
            
            <div className="bg-surface-0 border border-cream-border rounded-xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <Division3D size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-2xl font-serif mb-2">3D Models</h3>
              <p className="t-body-sm text-ink-light mb-4">Print-ready STLs and editable CAD files for physical replication.</p>
              <div className="text-3xl font-bold font-mono text-ink">8,200+</div>
            </div>

            <div className="bg-surface-0 border border-cream-border rounded-xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6">
                <DivisionCode size={32} className="text-purple-600" />
              </div>
              <h3 className="text-2xl font-serif mb-2">Code</h3>
              <p className="t-body-sm text-ink-light mb-4">Simulation software, flight controllers, and data analysis tools.</p>
              <div className="text-3xl font-bold font-mono text-ink">5,100+</div>
            </div>
          </div>
        </section>

        {/* 4. Our Licenses */}
        <section>
          <h2 className="text-4xl font-serif text-ink mb-8 text-center">Standardized Licensing</h2>
          <p className="text-lg text-ink-light text-center max-w-2xl mx-auto mb-12">
            To combat legal ambiguity, all publications on our platform must be released under one of four proprietary, easy-to-understand licenses.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/license/fox" className="bg-surface-0 border border-orange-500/30 rounded-xl p-6 hover:-translate-y-1 transition-transform block">
              <div className="mb-4"><LicenseBadge type="fox" /></div>
              <h3 className="font-bold mb-1">Fox</h3>
              <p className="text-sm text-ink-light">Do Whatever</p>
            </Link>
            <Link to="/license/owl" className="bg-surface-0 border border-emerald-500/30 rounded-xl p-6 hover:-translate-y-1 transition-transform block">
              <div className="mb-4"><LicenseBadge type="owl" /></div>
              <h3 className="font-bold mb-1">Owl</h3>
              <p className="text-sm text-ink-light">Attribution Req.</p>
            </Link>
            <Link to="/license/sparrow" className="bg-surface-0 border border-blue-400/30 rounded-xl p-6 hover:-translate-y-1 transition-transform block">
              <div className="mb-4"><LicenseBadge type="sparrow" /></div>
              <h3 className="font-bold mb-1">Sparrow</h3>
              <p className="text-sm text-ink-light">Share-Alike</p>
            </Link>
            <Link to="/license/dolphin" className="bg-surface-0 border border-blue-600/30 rounded-xl p-6 hover:-translate-y-1 transition-transform block">
              <div className="mb-4"><LicenseBadge type="dolphin" /></div>
              <h3 className="font-bold mb-1">Dolphin</h3>
              <p className="text-sm text-ink-light">Non-Commercial</p>
            </Link>
          </div>
        </section>

        {/* 5. Moderation Standards */}
        <section className="bg-surface-0 border border-cream-border rounded-xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
            <ShieldCheck size={32} className="text-gold" />
          </div>
          <div>
            <h2 className="text-3xl font-serif text-ink mb-4">Rigorous Moderation</h2>
            <p className="text-lg text-ink-light mb-4">
              We believe in quality over quantity. Every submission to Open Rockets Press undergoes a manual review by our moderation team to ensure formatting, clarity, and safety standards are met before it is distributed.
            </p>
            <Link to="/moderation" className="text-gold font-medium hover:underline inline-flex items-center gap-1">
              Read our Submission Guidelines <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* 6 & 7. Audiences */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface-0 border border-cream-border rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-blue-600">
              <GraduationCap size={28} />
              <h2 className="text-2xl font-serif text-ink">For Educators</h2>
            </div>
            <p className="t-body text-ink-light mb-6">
              Our publications are used in university classrooms and high school STEM programs globally. All resources are free to use in academic settings under the Dolphin and Owl licenses.
            </p>
            <a href="mailto:education@openrockets.com" className="text-blue-600 font-medium hover:underline inline-flex items-center gap-1">
              Contact our Education Team <ArrowRight size={16} />
            </a>
          </div>

          <div className="bg-surface-0 border border-cream-border rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-emerald-600">
              <Briefcase size={28} />
              <h2 className="text-2xl font-serif text-ink">For Press & Investors</h2>
            </div>
            <p className="t-body text-ink-light mb-6">
              Open Rockets Press is a registered 501(c)(3) non-profit. We rely on public grants and private donations to keep the servers running and the library expanding.
            </p>
            <a href="#" className="text-emerald-600 font-medium hover:underline inline-flex items-center gap-1">
              Download Media Kit <ArrowRight size={16} />
            </a>
          </div>
        </section>

        {/* 8. Team */}
        <section>
          <h2 className="text-4xl font-serif text-ink mb-8 text-center">Our Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <div key={i} className="text-center">
                <img src={member.avatar} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-surface-0 shadow-md object-cover" />
                <h3 className="font-bold text-ink">{member.name}</h3>
                <p className="text-sm text-ink-light">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 9. Final CTA */}
        <section className="bg-zinc-950 text-cream rounded-2xl p-12 text-center shadow-lg">
          <BookOpen size={48} className="mx-auto text-gold mb-6" />
          <h2 className="text-4xl font-serif mb-4">Ready to share your knowledge?</h2>
          <p className="text-xl text-cream/80 mb-8 max-w-xl mx-auto">
            Join thousands of engineers who have open-sourced their designs and data.
          </p>
          <Link to="/publish" className="btn-primary px-8 py-4 text-lg inline-flex items-center gap-2">
            Start Publishing <ArrowRight size={20} />
          </Link>
        </section>

      </div>
    </div>
  );
}
