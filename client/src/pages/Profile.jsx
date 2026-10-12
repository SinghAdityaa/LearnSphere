import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { setName(user?.name || ''); }, [user?.name]);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await updateProfile(name.trim());
      setSuccess('Your profile has been saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save your profile. Try again.');
    } finally { setSaving(false); }
  }

  return <section className="section-shell page-section profile-page">
    <span className="eyebrow">Account</span>
    <h1>My profile</h1>
    <p>Update your display name. Your email is managed by your sign-in provider.</p>
    <form className="profile-form" onSubmit={submit}>
      <label htmlFor="profile-name">Display name</label>
      <input id="profile-name" value={name} onChange={e => setName(e.target.value)}
        minLength={2} maxLength={80} required autoComplete="name" />
      <label htmlFor="profile-email">Email address</label>
      <input id="profile-email" value={user?.email || ''} readOnly />
      <p className="profile-hint">Your sign-in role and email cannot be changed here.</p>
      {error && <div role="alert" className="alert error">{error}</div>}
      {success && <div role="status" className="alert success">{success}</div>}
      <button className="button primary" disabled={saving || name.trim() === user?.name} type="submit">
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  </section>;
}
