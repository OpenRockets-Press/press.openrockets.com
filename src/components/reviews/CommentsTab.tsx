import { useState } from 'react';
import { ThumbsUp, MessageCircle, Flag, Send } from 'lucide-react';

interface CommentType {
  id: string;
  user: string;
  avatar: string;
  date: string;
  content: string;
  upvotes: number;
  replies?: CommentType[];
}

const INITIAL_COMMENTS: CommentType[] = [
  {
    id: 'c1',
    user: 'Engineer_Bob',
    avatar: 'https://i.pravatar.cc/150?u=bob',
    date: 'Oct 19, 2026',
    content: 'Has anyone tested these titanium specifications in a vacuum chamber yet? I am curious if the off-gassing matches the theoretical models.',
    upvotes: 12,
    replies: [
      {
        id: 'r1',
        user: 'Author (Open Aerospace)',
        avatar: 'https://i.pravatar.cc/150?u=author',
        date: 'Oct 19, 2026',
        content: 'Yes! We ran a full 48-hour vacuum test. The off-gassing was negligible after the initial 2-hour bake-out period. I will upload the raw telemetry data as an appendix next week.',
        upvotes: 24,
      },
      {
        id: 'r2',
        user: 'ThermalDynamics_LLC',
        avatar: 'https://i.pravatar.cc/150?u=thermo',
        date: 'Oct 20, 2026',
        content: 'We replicated the bake-out procedure and confirm the authors findings. Good to go for orbital assembly.',
        upvotes: 8,
      }
    ]
  },
  {
    id: 'c2',
    user: 'Student_Sarah',
    avatar: 'https://i.pravatar.cc/150?u=sarah2',
    date: 'Oct 15, 2026',
    content: 'This is an amazing resource for my senior design project. What compiler did you use for the simulation script?',
    upvotes: 3,
  }
];

export function CommentsTab() {
  const [comments, setComments] = useState<CommentType[]>(INITIAL_COMMENTS);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: CommentType = {
      id: `c-${Date.now()}`,
      user: 'Current_User',
      avatar: 'https://i.pravatar.cc/150?u=current',
      date: 'Just now',
      content: newCommentText,
      upvotes: 0,
      replies: []
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
  };

  const handlePostReply = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newReply: CommentType = {
      id: `r-${Date.now()}`,
      user: 'Current_User',
      avatar: 'https://i.pravatar.cc/150?u=current',
      date: 'Just now',
      content: replyText,
      upvotes: 0,
    };

    setComments(comments.map(c => {
      if (c.id === parentId) {
        return { ...c, replies: [...(c.replies || []), newReply] };
      }
      return c;
    }));

    setReplyingTo(null);
    setReplyText('');
  };

  return (
    <div className="py-6 max-w-4xl mx-auto">
      
      {/* Top Level Submission */}
      <div className="bg-surface-0 border border-cream-border rounded-xl p-6 shadow-sm mb-10">
        <h3 className="t-card-title text-ink mb-4">Start a discussion</h3>
        <form onSubmit={handlePostComment}>
          <textarea 
            rows={3}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Ask a technical question or share your findings..."
            className="w-full bg-surface-1 border border-cream-border rounded-lg p-4 text-ink focus:outline-none focus:border-gold resize-none mb-3"
          />
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={!newCommentText.trim()}
              className="btn-primary px-6 py-2 flex items-center gap-2 t-label"
            >
              <Send size={16} /> Post Comment
            </button>
          </div>
        </form>
      </div>

      {/* Comments Feed */}
      <div className="space-y-8">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <img src={comment.avatar} alt={comment.user} className="w-10 h-10 rounded-full object-cover shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              
              {/* Top Level Comment */}
              <div className="bg-surface-0 border border-cream-border rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="t-label text-ink">{comment.user}</span>
                    <span className="text-ink-light text-xs">•</span>
                    <span className="t-body-sm text-ink-light">{comment.date}</span>
                  </div>
                </div>
                <p className="t-body text-ink mb-4 leading-relaxed">
                  {comment.content}
                </p>
                
                {/* Actions */}
                <div className="flex items-center gap-6 t-body-sm">
                  <button className="flex items-center gap-1.5 text-ink-light hover:text-ink transition-colors">
                    <ThumbsUp size={14} /> {comment.upvotes}
                  </button>
                  <button 
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="flex items-center gap-1.5 text-ink-light hover:text-ink transition-colors"
                  >
                    <MessageCircle size={14} /> Reply
                  </button>
                  <button className="flex items-center gap-1.5 text-ink-light hover:text-error transition-colors ml-auto">
                    <Flag size={14} /> Report
                  </button>
                </div>
              </div>

              {/* Inline Reply Box */}
              {replyingTo === comment.id && (
                <div className="mt-4 ml-6 pl-4 border-l-2 border-cream-border animate-in fade-in slide-in-from-top-2">
                  <form onSubmit={(e) => handlePostReply(e, comment.id)}>
                    <textarea 
                      autoFocus
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full bg-surface-0 border border-cream-border rounded-lg p-3 text-ink focus:outline-none focus:border-gold resize-none mb-2"
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setReplyingTo(null)}
                        className="btn-secondary px-4 py-1.5 t-label text-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={!replyText.trim()}
                        className="btn-primary px-4 py-1.5 t-label text-sm"
                      >
                        Reply
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Threaded Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-6 pl-4 border-l-2 border-cream-border space-y-4">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="flex gap-3">
                      <img src={reply.avatar} alt={reply.user} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      <div className="flex-1 min-w-0 bg-surface-1 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="t-label text-ink">{reply.user}</span>
                          {reply.user.includes('Author') && (
                            <span className="bg-gold/20 text-gold text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold">Author</span>
                          )}
                          <span className="text-ink-light text-xs">•</span>
                          <span className="t-body-sm text-ink-light">{reply.date}</span>
                        </div>
                        <p className="t-body-sm text-ink mb-3 leading-relaxed">
                          {reply.content}
                        </p>
                        <div className="flex items-center gap-4 t-body-sm">
                          <button className="flex items-center gap-1.5 text-ink-light hover:text-ink transition-colors text-xs">
                            <ThumbsUp size={12} /> {reply.upvotes}
                          </button>
                          <button className="flex items-center gap-1.5 text-ink-light hover:text-error transition-colors text-xs ml-auto">
                            <Flag size={12} /> Report
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        ))}
      </div>
      
      {comments.length > 0 && (
        <div className="mt-10 text-center">
          <button className="btn-secondary px-6 py-2 t-label">
            Load More Comments
          </button>
        </div>
      )}

    </div>
  );
}
