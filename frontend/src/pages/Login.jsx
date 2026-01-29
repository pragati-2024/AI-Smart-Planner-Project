import React, { useState } from 'react'

// Login page (local-only demo).
// Stores a user session in localStorage via App.jsx handlers.
export default function Login({ onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      setError('Please enter your name.')
      return
    }

    // Simple email sanity check.
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    onLogin({ name: trimmedName, email: trimmedEmail })
  }

  return (
    <div className="loginWrap">
      <div className="loginCard">
        <div className="loginCard__top">
          <div className="loginBadge">AI</div>
          <div>
            <h2 className="loginTitle">Welcome back</h2>
            <p className="loginSubtitle">Login to save tasks per user (localStorage).</p>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="formRow">
            <label className="label">
              Name
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., JMD"
                autoFocus
              />
            </label>
          </div>

          <div className="formRow">
            <label className="label">
              Email
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., you@example.com"
              />
            </label>
          </div>

          {error ? <div className="formError">{error}</div> : null}

          <div className="formActions">
            <button className="btn btn--primary" type="submit">
              Login
            </button>
            <div className="formHint">No backend — saved locally only.</div>
          </div>
        </form>
      </div>
    </div>
  )
}
