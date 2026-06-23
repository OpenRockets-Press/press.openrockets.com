import { useState } from 'react';
import { StarRating } from '@/components/reviews/StarRating';
import { ThumbsUp, Flag, MessageSquare, Plus, X } from 'lucide-react';
import { createPortal } from 'react-dom';

// --- MOCK DATA ---
const MOCK_REVIEWS = [
  {
    id: '1',
    user: 'Dr. Sarah Jenkins',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    rating: 5,
    date: 'Oct 18, 2026',
    content: 'This schematic saved my team weeks of thermal stress simulations. The titanium alloy tolerances match NASA standards perfectly. Highly recommended for any atmospheric entry vehicles.',
    helpfulVotes: 24,
  },
  {
    id: '2',
    user: 'Marcus Thorne',
    avatar: 'https://i.pravatar.cc/150?u=marcus',
    rating: 4,
    date: 'Oct 12, 2026',
    content: 'Very solid design. I had to modify the mounting brackets for our specific chassis, but the core heat shielding geometry is flawless. Deducting one star only because the CAD file lacked some layer organization.',
    helpfulVotes: 8,
  },
  {
    id: '3',
    user: 'AeroDynamics Inc',
    avatar: 'https://i.pravatar.cc/150?u=aero',
    rating: 5,
    date: 'Sep 29, 2026',
    content: 'Flawless execution. We ran this through OpenFOAM and the thermal dissipation was exactly as claimed in the abstract.',
    helpfulVotes: 42,
  }
];

const RATING_DISTRIBUTION = [
  { stars: 5, count: 184, percent: 82 },
  { stars: 4, count: 28, percent: 12 },
  { stars: 3, count: 8, percent: 4 },
  { stars: 2, count: 4, percent: 2 },
  { stars: 1, count: 0, percent: 0 },
];
// -----------------

function ReviewModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Mock API call
    setTimeout(() => {
      setSubmitting(false);
      onClose();
    }, 1500);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm">
      <div className="bg-surface-0 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-cream-border animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-cream-border">
          <h2 className="t-card-title text-ink">Write a Review</h2>
          <button onClick={onClose} className="p-2 text-ink-light hover:text-ink hover:bg-surface-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 flex flex-col items-center">
            <span className="t-label text-ink-light mb-2">Overall Rating</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <svg 
                    width="32" height="32" viewBox="0 0 24 24" 
                    fill={(hoverRating || rating) >= star ? "#ffb400" : "transparent"} 
                    stroke={(hoverRating || rating) >= star ? "#ffb400" : "#d1d5db"} 
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block t-label text-ink mb-2">Your Review</label>
            <textarea 
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you think of this artifact? Did it meet your expectations?"
              className="w-full bg-surface-1 border border-cream-border rounded-lg p-3 text-ink focus:outline-none focus:border-gold resize-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting || rating === 0 || content.trim() === ''}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

export function ReviewsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row gap-12 py-4">
      {/* Left Column: Summary */}
      <div className="w-full lg:w-1/3 shrink-0">
        <h3 className="text-3xl font-serif text-ink mb-2">4.8</h3>
        <div className="flex items-center gap-2 mb-2">
          <StarRating rating={4.8} size="md" />
          <span className="t-body-sm text-ink-light">224 Reviews</span>
        </div>
        
        <div className="mt-6 space-y-3">
          {RATING_DISTRIBUTION.map((row) => (
            <div key={row.stars} className="flex items-center gap-3 t-body-sm">
              <span className="w-12 text-ink-light">{row.stars} Stars</span>
              <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gold rounded-full" 
                  style={{ width: `${row.percent}%` }}
                />
              </div>
              <span className="w-8 text-right text-ink font-medium">{row.percent}%</span>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-cream-border">
          <h4 className="t-card-title text-ink mb-2">Review this artifact</h4>
          <p className="t-body-sm text-ink-light mb-4">Share your technical analysis and feedback with the community.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full btn-secondary py-2 flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} /> Write a Review
          </button>
        </div>
      </div>

      {/* Right Column: Review List */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-cream-border">
          <span className="t-label text-ink">Community Feedback</span>
          <select className="bg-transparent border-none text-ink-light t-body-sm focus:outline-none cursor-pointer">
            <option>Most Helpful</option>
            <option>Highest Rated</option>
            <option>Newest</option>
          </select>
        </div>

        <div className="space-y-6">
          {MOCK_REVIEWS.map((review) => (
            <div key={review.id} className="bg-surface-0 border border-cream-border rounded-xl p-5 shadow-sm flex gap-4">
              <img src={review.avatar} alt={review.user} className="w-12 h-12 rounded-full object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="t-label text-ink">{review.user}</h4>
                    <span className="t-body-sm text-ink-light">{review.date}</span>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <p className="t-body text-ink mt-3 mb-4 leading-relaxed">
                  {review.content}
                </p>
                <div className="flex items-center gap-4 border-t border-cream-border pt-4">
                  <button className="flex items-center gap-1.5 text-ink-light hover:text-ink transition-colors t-body-sm">
                    <ThumbsUp size={14} /> Helpful ({review.helpfulVotes})
                  </button>
                  <button className="flex items-center gap-1.5 text-ink-light hover:text-error transition-colors t-body-sm ml-auto">
                    <Flag size={14} /> Report
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-6 py-3 border border-cream-border rounded-lg text-ink-light hover:text-ink hover:bg-surface-0 transition-colors t-label">
          Load More Reviews
        </button>
      </div>

      <ReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
