import { useParams, Link } from '@tanstack/react-router';
import { ChevronRight, ArrowRight, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { LicenseBadge } from '@/components/badges/LicenseBadge';
import { LicenseComparisonTable } from '@/components/licenses/LicenseComparisonTable';

const LICENSE_DATA = {
  fox: {
    name: 'Fox License',
    tagline: 'The "Do Whatever" License',
    color: 'bg-orange-500',
    textColor: 'text-orange-500',
    description: 'The Fox license is our most permissive tier. It acts functionally similar to the MIT license in software. You are free to do whatever you want with this artifact, including using it in closed-source commercial hardware, without any requirement to credit the original author.',
    permissions: {
      can: ['Commercial Use', 'Modification', 'Distribution', 'Private Use'],
      cannot: ['Hold Author Liable'],
      must: ['Include Copyright Notice (Optional but polite)']
    }
  },
  owl: {
    name: 'Owl License',
    tagline: 'The "Attribution" License',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-500',
    description: 'The Owl license encourages widespread use while ensuring the original creator receives credit. Similar to Apache 2.0, you may use this commercially and modify it, but you MUST provide attribution to the original creator in your documentation or product.',
    permissions: {
      can: ['Commercial Use', 'Modification', 'Distribution', 'Patent Grant'],
      cannot: ['Use Trademark Without Permission', 'Hold Author Liable'],
      must: ['Provide Attribution', 'Include Original Copyright']
    }
  },
  sparrow: {
    name: 'Sparrow License',
    tagline: 'The "Share-Alike" License',
    color: 'bg-blue-400',
    textColor: 'text-blue-400',
    description: 'The Sparrow license is designed to keep the ecosystem open. Similar to GPL, if you use, modify, or distribute this artifact, any resulting derivatives MUST also be open-sourced under the Sparrow license.',
    permissions: {
      can: ['Commercial Use', 'Modification', 'Distribution'],
      cannot: ['Closed-Source Derivatives', 'Hold Author Liable'],
      must: ['Provide Attribution', 'Release Modifications under Sparrow License', 'Disclose Source']
    }
  },
  dolphin: {
    name: 'Dolphin License',
    tagline: 'The "Non-Commercial" License',
    color: 'bg-blue-600',
    textColor: 'text-blue-600',
    description: 'The Dolphin license protects academic and hobbyist research. You are free to view, modify, and distribute this artifact for personal or academic use. You MAY NOT use this artifact for commercial purposes or financial gain without explicit written permission from the creator.',
    permissions: {
      can: ['Academic Research', 'Hobbyist Projects', 'Modification', 'Distribution'],
      cannot: ['Commercial Use', 'Financial Gain', 'Hold Author Liable'],
      must: ['Provide Attribution']
    }
  }
};

export function LicensePage() {
  const { licenseId } = useParams({ strict: false }) as { licenseId?: keyof typeof LICENSE_DATA };
  const licenseKey = licenseId && LICENSE_DATA[licenseId] ? licenseId : 'fox';
  const data = LICENSE_DATA[licenseKey];

  return (
    <div className="min-h-screen bg-surface-1 pb-20">
      
      {/* Breadcrumbs */}
      <div className="bg-surface-0 border-b border-cream-border py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center gap-2 t-body-sm text-ink-light">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-ink font-medium capitalize">{data.name}</span>
        </div>
      </div>

      {/* Hero */}
      <div className={`${data.color} text-cream py-16 px-4 sm:px-6 lg:px-8 shadow-inner`}>
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          <div className="p-4 bg-surface-0 rounded-2xl shadow-lg shrink-0">
            <LicenseBadge type={licenseKey} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-serif mb-2">{data.name}</h1>
            <p className="text-xl text-cream/90 font-medium">{data.tagline}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="prose prose-lg max-w-none mb-16">
          <p className="text-xl text-ink leading-relaxed">
            {data.description}
          </p>
        </div>

        {/* Permissions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-surface-0 border border-green-500/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <ShieldCheck size={24} />
              <h3 className="font-bold text-lg">You Can</h3>
            </div>
            <ul className="space-y-3">
              {data.permissions.can.map((item, i) => (
                <li key={i} className="flex items-start gap-2 t-body-sm text-ink">
                  <span className="text-green-500 mt-0.5">•</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface-0 border border-red-500/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <ShieldAlert size={24} />
              <h3 className="font-bold text-lg">You Cannot</h3>
            </div>
            <ul className="space-y-3">
              {data.permissions.cannot.map((item, i) => (
                <li key={i} className="flex items-start gap-2 t-body-sm text-ink">
                  <span className="text-red-500 mt-0.5">•</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface-0 border border-blue-500/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 mb-4">
              <Shield size={24} />
              <h3 className="font-bold text-lg">You Must</h3>
            </div>
            <ul className="space-y-3">
              {data.permissions.must.map((item, i) => (
                <li key={i} className="flex items-start gap-2 t-body-sm text-ink">
                  <span className="text-blue-500 mt-0.5">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Apply License Section */}
        <div className="bg-surface-0 border border-cream-border rounded-xl p-8 mb-16 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="text-2xl font-serif text-ink mb-2">Want to use the {data.name}?</h3>
            <p className="t-body text-ink-light">You can apply this license directly during the artifact submission process.</p>
          </div>
          <Link to="/publish" className="btn-primary px-6 py-3 shrink-0 flex items-center gap-2 whitespace-nowrap">
            Publish an Artifact <ArrowRight size={18} />
          </Link>
        </div>

        {/* Comparison Table */}
        <div>
          <h2 className="text-2xl font-serif text-ink mb-6">Compare Licenses</h2>
          <LicenseComparisonTable />
        </div>

      </div>
    </div>
  );
}
