import React from 'react';

const TextOverlay: React.FC = () => {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      color: 'transparent', // Make text transparent for gradient effect
      background: 'linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.9))', // More white gradient
      WebkitBackgroundClip: 'text', // Clip the background to the text
      fontSize: '3.5rem', // Increased font size for "ROHAN"
      fontWeight: 'bold',
      backgroundClip: 'text', // For non-WebKit browsers
      letterSpacing: '0.1em', // Increased letter spacing
    }}>
      <h1 style={{ margin: '0' }}>ROHAN</h1>
      <p style={{ margin: '0', fontSize: '1.5rem' }}>software engineer.</p> {/* Reduced font size */}
    </div>
  );
};

export default TextOverlay;