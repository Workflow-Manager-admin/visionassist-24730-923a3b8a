import React from 'react';

/**
 * Home component for VisionAssist
 * - Provides navigation controls for Picture Identification and Text Reader.
 * - Focused on accessibility; ARIA roles and keyboard navigation included.
 *
 * PUBLIC_INTERFACE
 */
function Home() {
  return (
    <main role="main" tabIndex={-1} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '96px' }}>
      <h1 style={{ fontSize: '2.5rem', margin: '24px 0', color: '#FFD600' }}>VisionAssist</h1>
      <div style={{ display: 'flex', gap: '32px', marginTop: '40px' }}>
        <button
          type="button"
          className="btn btn-large"
          aria-label="Go to Picture Identification"
          tabIndex={0}
        >
          Picture Identification
        </button>
        <button
          type="button"
          className="btn btn-large"
          aria-label="Go to Text Reader"
          tabIndex={0}
        >
          Text Reader
        </button>
      </div>
    </main>
  );
}

export default Home;
