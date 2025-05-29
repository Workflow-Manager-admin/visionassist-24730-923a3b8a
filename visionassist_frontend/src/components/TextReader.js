import React from 'react';

/**
 * TextReader component for VisionAssist
 * - Displays a "Ready to Read" button and sample paragraph.
 * - Designed for large font and prominent controls.
 *
 * PUBLIC_INTERFACE
 */
function TextReader() {
  return (
    <section
      aria-label="Text Reader"
      style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <h2 style={{ fontSize: '2rem', color: '#FFD600' }}>Text Reader</h2>
      <button
        type="button"
        className="btn btn-large"
        style={{ margin: '32px 0' }}
        aria-label="Ready to Read"
      >
        Ready to Read
      </button>
      <div
        style={{ fontSize: '1.4rem', lineHeight: '2.2rem', maxWidth: 600, textAlign: 'center', color: '#fff' }}
      >
        <em>[Sample text will appear here]</em>
      </div>
    </section>
  );
}

export default TextReader;
