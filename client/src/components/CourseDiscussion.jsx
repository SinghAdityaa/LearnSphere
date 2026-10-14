
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  MessageCircle,
  MessageSquare,
  Pencil,
  Search,
  Send,
  Trash2
} from 'lucide-react';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const errorMessage = error =>
  error.response?.data?.message ||
  'Something went wrong. Please try again.';

export default function CourseDiscussion({ courseId }) {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const requestId = useRef(0);

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const loadPosts = useCallback(async (silent = false) => {
    if (!courseId) return;

    const currentRequest = ++requestId.current;

    if (!silent) setLoading(true);
    setError('');

    try {
      const { data } = await api.get(
        `/courses/${courseId}/discussions`,
        {
          params: {
            page,
            search,
            status
          }
        }
      );

      if (currentRequest !== requestId.current) return;

      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setTotalPages(Math.max(1, data.pagination?.totalPages || 1));
      setTotal(data.pagination?.total || 0);

      const serverPage = data.pagination?.page || 1;

      if (serverPage !== page) {
        setPage(serverPage);
      }
    } catch (err) {
      if (currentRequest === requestId.current) {
        setError(errorMessage(err));
      }
    } finally {
      if (currentRequest === requestId.current && !silent) {
        setLoading(false);
      }
    }
  }, [courseId, page, search, status]);

  useEffect(() => {
    loadPosts();

    return () => {
      requestId.current += 1;
    };
  }, [loadPosts]);

  // Debounce search requests.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  function changeStatus(value) {
    setStatus(value);
    setPage(1);
    setNotice('');
  }

  function changeSearch(value) {
    setSearchInput(value);
    setPage(1);
  }

  function isOwner(post) {
    const authorId = post.author?._id || post.author?.id;
    const userId = user?._id || user?.id;

    return Boolean(
      authorId &&
      userId &&
      String(authorId) === String(userId)
    );
  }

  async function createPost(event, parent = null) {
    event.preventDefault();

    const text = parent ? replyText.trim() : content.trim();

    if (text.length < 3 || text.length > 3000) {
      setError('Write between 3 and 3000 characters.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    try {
      await api.post(`/courses/${courseId}/discussions`, {
        content: text,
        ...(parent ? { parent } : {})
      });

      if (parent) {
        setReplyText('');
        setReplyTo(null);
        setNotice('Reply posted.');
        await loadPosts(true);
      } else {
        setContent('');
        setNotice('Question posted.');

        // Return to all questions so the new post is visible.
        if (page !== 1 || search || status !== 'all') {
          setPage(1);
          setSearchInput('');
          setSearch('');
          setStatus('all');
        } else {
          await loadPosts(true);
        }
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit(id) {
    const text = editText.trim();

    if (text.length < 3 || text.length > 3000) {
      setError('Write between 3 and 3000 characters.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await api.patch(`/discussions/${id}`, {
        content: text
      });

      setEditing(null);
      setEditText('');
      setNotice('Discussion updated.');

      await loadPosts(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function deletePost(id) {
    if (!window.confirm('Delete this discussion?')) return;

    setBusy(true);
    setError('');

    try {
      await api.delete(`/discussions/${id}`);

      setEditing(null);
      setNotice('Discussion deleted.');

      await loadPosts(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleResolved(post) {
    setBusy(true);
    setError('');

    try {
      await api.patch(`/discussions/${post._id}`, {
        isResolved: !post.isResolved
      });

      setNotice(
        post.isResolved
          ? 'Question reopened.'
          : 'Question marked resolved.'
      );

      await loadPosts(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function renderPostActions(post) {
    const allowed = isOwner(post) || isAdmin;

    if (!allowed || editing === post._id) return null;

    return (
      <div className="discussion-actions">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setEditing(post._id);
            setEditText(post.content);
          }}
        >
          <Pencil size={14} />
          Edit
        </button>

        <button
          type="button"
          disabled={busy}
          className="discussion-danger"
          onClick={() => deletePost(post._id)}
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    );
  }

  function renderPostBody(post) {
    return (
      <>
        <div className="discussion-post-head">
          <strong>{post.author?.name || 'Student'}</strong>

          <time dateTime={post.createdAt}>
            {new Date(post.createdAt).toLocaleDateString()}
          </time>
        </div>

        {editing === post._id ? (
          <div className="discussion-edit">
            <textarea
              value={editText}
              maxLength={3000}
              onChange={event => setEditText(event.target.value)}
              aria-label="Edit discussion"
            />

            <div className="discussion-actions">
              <button
                type="button"
                disabled={busy || editText.trim().length < 3}
                onClick={() => saveEdit(post._id)}
              >
                Save
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setEditing(null);
                  setEditText('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="discussion-content">{post.content}</p>
        )}

        {renderPostActions(post)}
      </>
    );
  }

  if (!courseId) return null;

  return (
    <section
      className="course-discussion"
      id="course-discussions"
    >
      <div className="discussion-heading">
        <MessageCircle size={25} />

        <div>
          <h2>Course discussions</h2>
          <p>
            Ask questions and discuss lessons with other students.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="alert success" role="status">
          {notice}
        </div>
      )}

      {user && (
        <form
          className="discussion-compose"
          onSubmit={event => createPost(event)}
        >
          <label htmlFor="discussion-question">
            Ask a question
          </label>

          <textarea
            id="discussion-question"
            placeholder="What would you like to ask about this course?"
            value={content}
            maxLength={3000}
            minLength={3}
            required
            onChange={event => setContent(event.target.value)}
          />

          <button
            type="submit"
            className="button primary"
            disabled={busy || content.trim().length < 3}
          >
            <Send size={16} />
            Post question
          </button>
        </form>
      )}

      {/* Search and filters */}
      <div className="discussion-toolbar">
        <div className="discussion-search">
          <Search size={18} />

          <input
            type="search"
            value={searchInput}
            maxLength={100}
            placeholder="Search course questions..."
            aria-label="Search course discussions"
            onChange={event => changeSearch(event.target.value)}
          />
        </div>

        <div
          className="discussion-filters"
          role="group"
          aria-label="Filter discussions"
        >
          {[
            { value: 'all', label: 'All' },
            { value: 'unanswered', label: 'Unanswered' },
            { value: 'resolved', label: 'Resolved' }
          ].map(option => (
            <button
              key={option.value}
              type="button"
              className={
                status === option.value
                  ? 'discussion-filter active'
                  : 'discussion-filter'
              }
              aria-pressed={status === option.value}
              onClick={() => changeStatus(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="discussion-results-count">
        {total} {total === 1 ? 'question' : 'questions'}
        {search && ` matching "${search}"`}
      </div>

      {loading ? (
        <p role="status">Loading discussions...</p>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          {search || status !== 'all'
            ? 'No discussions match your search or filter.'
            : 'No questions yet. Start the discussion.'}
        </div>
      ) : (
        <div className="discussion-list">
          {posts.map(post => (
            <article
              className="discussion-thread"
              key={post._id}
            >
              {renderPostBody(post)}

              <div className="discussion-thread-footer">
                {post.isResolved && (
                  <span className="discussion-resolved">
                    <CheckCircle2 size={15} />
                    Resolved
                  </span>
                )}

                <span className="discussion-reply-count">
                  <MessageSquare size={15} />
                  {post.replyCount ?? post.replies?.length ?? 0}
                  {' '}
                  {(post.replyCount ?? post.replies?.length ?? 0) === 1
                    ? 'reply'
                    : 'replies'}
                </span>

                {(isOwner(post) || isAdmin) && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => toggleResolved(post)}
                  >
                    {post.isResolved
                      ? 'Reopen'
                      : 'Mark resolved'}
                  </button>
                )}

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setReplyTo(
                      replyTo === post._id ? null : post._id
                    );
                    setReplyText('');
                  }}
                >
                  Reply
                </button>
              </div>

              {post.replies?.length > 0 && (
                <div className="discussion-replies">
                  {post.replies.map(reply => (
                    <div
                      className="discussion-reply"
                      key={reply._id}
                    >
                      {renderPostBody(reply)}
                    </div>
                  ))}
                </div>
              )}

              {replyTo === post._id && (
                <form
                  className="discussion-reply-form"
                  onSubmit={event =>
                    createPost(event, post._id)
                  }
                >
                  <label htmlFor={`reply-${post._id}`}>
                    Write a reply
                  </label>

                  <textarea
                    id={`reply-${post._id}`}
                    value={replyText}
                    maxLength={3000}
                    minLength={3}
                    required
                    placeholder="Share an explanation or answer..."
                    onChange={event =>
                      setReplyText(event.target.value)
                    }
                  />

                  <button
                    type="submit"
                    className="button primary small"
                    disabled={
                      busy || replyText.trim().length < 3
                    }
                  >
                    Post reply
                  </button>
                </form>
              )}
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="discussion-pagination">
          <button
            type="button"
            className="button secondary small"
            disabled={page === 1 || loading || busy}
            onClick={() =>
              setPage(value => Math.max(1, value - 1))
            }
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            className="button secondary small"
            disabled={
              page >= totalPages || loading || busy
            }
            onClick={() =>
              setPage(value => value + 1)
            }
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
