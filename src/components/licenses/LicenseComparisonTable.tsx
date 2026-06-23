import { Check, X } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function LicenseComparisonTable() {
  return (
    <div className="bg-surface-0 border border-cream-border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-1 border-b border-cream-border">
              <th className="p-4 t-label text-ink w-1/3">Permissions</th>
              <th className="p-4 text-center">
                <Link to="/license/fox" className="t-label text-orange-500 hover:underline">Fox</Link>
                <div className="text-xs font-normal text-ink-light mt-1">Do Whatever</div>
              </th>
              <th className="p-4 text-center border-l border-cream-border/50">
                <Link to="/license/owl" className="t-label text-emerald-500 hover:underline">Owl</Link>
                <div className="text-xs font-normal text-ink-light mt-1">Attribution Req.</div>
              </th>
              <th className="p-4 text-center border-l border-cream-border/50">
                <Link to="/license/sparrow" className="t-label text-blue-400 hover:underline">Sparrow</Link>
                <div className="text-xs font-normal text-ink-light mt-1">Share-Alike</div>
              </th>
              <th className="p-4 text-center border-l border-cream-border/50">
                <Link to="/license/dolphin" className="t-label text-blue-600 hover:underline">Dolphin</Link>
                <div className="text-xs font-normal text-ink-light mt-1">Non-Commercial</div>
              </th>
            </tr>
          </thead>
          <tbody className="t-body-sm text-ink divide-y divide-cream-border">
            <tr>
              <td className="p-4">Commercial Use</td>
              <td className="p-4 text-center"><Check size={18} className="mx-auto text-green-500" /></td>
              <td className="p-4 text-center border-l border-cream-border/50"><Check size={18} className="mx-auto text-green-500" /></td>
              <td className="p-4 text-center border-l border-cream-border/50"><Check size={18} className="mx-auto text-green-500" /></td>
              <td className="p-4 text-center border-l border-cream-border/50"><X size={18} className="mx-auto text-red-500" /></td>
            </tr>
            <tr>
              <td className="p-4">Modification</td>
              <td className="p-4 text-center"><Check size={18} className="mx-auto text-green-500" /></td>
              <td className="p-4 text-center border-l border-cream-border/50"><Check size={18} className="mx-auto text-green-500" /></td>
              <td className="p-4 text-center border-l border-cream-border/50"><Check size={18} className="mx-auto text-green-500" /></td>
              <td className="p-4 text-center border-l border-cream-border/50"><Check size={18} className="mx-auto text-green-500" /></td>
            </tr>
            <tr>
              <td className="p-4">Distribution</td>
              <td className="p-4 text-center"><Check size={18} className="mx-auto text-green-500" /></td>
              <td className="p-4 text-center border-l border-cream-border/50"><Check size={18} className="mx-auto text-green-500" /></td>
              <td className="p-4 text-center border-l border-cream-border/50"><Check size={18} className="mx-auto text-green-500" /></td>
              <td className="p-4 text-center border-l border-cream-border/50"><Check size={18} className="mx-auto text-green-500" /></td>
            </tr>
            <tr>
              <td className="p-4">Requires Attribution</td>
              <td className="p-4 text-center"><X size={18} className="mx-auto text-red-500" /></td>
              <td className="p-4 text-center border-l border-cream-border/50"><Check size={18} className="mx-auto text-green-500" /></td>
              <td className="p-4 text-center border-l border-cream-border/50"><Check size={18} className="mx-auto text-green-500" /></td>
              <td className="p-4 text-center border-l border-cream-border/50"><Check size={18} className="mx-auto text-green-500" /></td>
            </tr>
            <tr>
              <td className="p-4 bg-surface-1">Must use same license (Share-Alike)</td>
              <td className="p-4 text-center bg-surface-1"><X size={18} className="mx-auto text-red-500" /></td>
              <td className="p-4 text-center border-l border-cream-border/50 bg-surface-1"><X size={18} className="mx-auto text-red-500" /></td>
              <td className="p-4 text-center border-l border-cream-border/50 bg-surface-1"><Check size={18} className="mx-auto text-green-500" /></td>
              <td className="p-4 text-center border-l border-cream-border/50 bg-surface-1"><X size={18} className="mx-auto text-red-500" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
