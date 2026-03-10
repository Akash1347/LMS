import React from 'react'

const linkStyle = {
  color: '#cbd5e1',
  textDecoration: 'none',
  fontSize: 14,
  lineHeight: 1.9,
}

const Footer = () => {
  return (
    <footer
      style={{
        background: '#0b1220',
        borderTop: '1px solid rgba(148,163,184,0.2)',
        color: '#e2e8f0',
        marginTop: 30,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '38px 20px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 22, color: '#f8fafc' }}>smartLearn</h3>
          <p style={{ marginTop: 10, fontSize: 14, color: '#cbd5e1', lineHeight: 1.7 }}>
            Where education meets real-world needs.
          </p>
        </div>

        <div>
          <h4 style={{ margin: 0, fontSize: 16 }}>Helpful Links</h4>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column' }}>
            <a href='/course' style={linkStyle}>Courses</a>
            <a href='#' style={linkStyle}>Privacy policy</a>
            <a href='#' style={linkStyle}>Refund Policy</a>
            <a href='#' style={linkStyle}>Terms &amp; Conditions</a>
          </div>
        </div>

        <div>
          <h4 style={{ margin: 0, fontSize: 16 }}>Get in touch</h4>
          <p style={{ marginTop: 10, marginBottom: 0, fontSize: 14, color: '#cbd5e1', lineHeight: 1.8 }}>
            support@smartlearn.in
            <br />
            hello@smartlearn.in
            <br />
            contact@smartlearn.in
            <br />
            Support Team : 10am-6pm
          </p>
        </div>

        <div>
          <h4 style={{ margin: 0, fontSize: 16 }}>Connect with us</h4>
          <p style={{ marginTop: 10, fontSize: 14, color: '#cbd5e1', lineHeight: 1.9 }}>
            Facebook
            <br />
            Twitter
            <br />
            Youtube
            <br />
            Instagram
            <br />
            Linkedin
          </p>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid rgba(148,163,184,0.2)',
          padding: '12px 20px',
          textAlign: 'center',
          fontSize: 13,
          color: '#94a3b8',
        }}
      >
        Copyright © 2026
      </div>
    </footer>
  )
}

export default Footer