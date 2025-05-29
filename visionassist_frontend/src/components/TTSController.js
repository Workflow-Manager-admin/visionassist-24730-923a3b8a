import React, { createContext } from 'react';

/**
 * TTSController utility for VisionAssist
 * - Exposes TTS methods and manages TTS API abstraction for the app.
 * - Designed as a context/provider or reusable utility.
 *
 * PUBLIC_INTERFACE
 */

// Placeholder TTS context; real logic to be implemented.
export const TTSContext = createContext({
  speak: (text) => {},    // Speak a message via TTS
  cancel: () => {},       // Cancel current speech
  isTTSEnabled: () => false, // Check if TTS is supported/enabled
});

/**
 * TTSProvider component (skeleton)--In future will provide TTS actions to child components.
 */
export function TTSProvider({ children }) {
  return (
    <TTSContext.Provider value={{
      speak: () => {},
      cancel: () => {},
      isTTSEnabled: () => false,
    }}>
      {children}
    </TTSContext.Provider>
  );
}
