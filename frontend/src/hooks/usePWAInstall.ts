import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      console.log('PWA: App is already installed');
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      console.log('PWA: Install prompt available');
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('PWA: App installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Debug: Log why install might not be available
    const checkInstallability = () => {
      if (!isInstallable && !isInstalled) {
        console.log('PWA: Install prompt not available. Possible reasons:');
        console.log('- Missing PWA PNG icons (pwa-192x192.png, pwa-512x512.png) - SVG icons may not be sufficient for all browsers');
        console.log('- Not served over HTTPS or localhost');
        console.log('- Service worker not registered');
        console.log('- Browser does not support PWA installation');
        console.log('- App already installed or dismissed previously');
        console.log('Note: The app will still work, but installation may require PNG icons for some browsers.');
      }
    };

    // Show fallback instructions after a delay if no prompt appears
    const fallbackTimer = setTimeout(() => {
      if (!isInstallable && !isInstalled) {
        setShowFallback(true);
        checkInstallability();
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(fallbackTimer);
    };
  }, [isInstallable, isInstalled]);

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  };

  // Detect platform for fallback instructions
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;

  return {
    isInstallable,
    isInstalled,
    showFallback,
    isIOS,
    isAndroid,
    isMobile,
    promptInstall,
  };
};

