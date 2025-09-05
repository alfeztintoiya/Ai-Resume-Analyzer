import { useEffect, useRef } from 'react';
import { googleLoginWithCredential } from '../services/authService';

declare global {
  interface Window {
    google?: any;
  }
}

type Props = {
  onSuccess: (user: any) => void;
  onError?: (message: string) => void;
};

export default function GoogleSignInButton({ onSuccess, onError }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
    if (!clientId) {
      onError?.('Missing VITE_GOOGLE_CLIENT_ID');
      return;
    }

    const init = () => {
      const id = window.google?.accounts?.id;
      if (!id) return;

      id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            const data = await googleLoginWithCredential(response.credential);
            onSuccess(data.user);
          } catch (e: any) {
            onError?.(e?.message || 'Google sign-in failed');
          }
        },
        auto_select: false,
        ux_mode: 'popup',
      });

      if (btnRef.current) {
        id.renderButton(btnRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
        });
      }
    };

    if (window.google?.accounts?.id) {
      init();
      return;
    }
    const t = setTimeout(init, 300);
    return () => clearTimeout(t);
  }, [onSuccess, onError]);

  return <div ref={btnRef} />;
}