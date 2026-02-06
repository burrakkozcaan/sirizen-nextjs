'use client';

import { useRef } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

function GoogleLoginButtonInner({ onSuccess, redirectTo }: GoogleLoginButtonProps) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const result = await loginWithGoogle(credentialResponse.credential);

      if (result.success) {
        toast.success('Google ile giriş başarılı!');
        onSuccess?.();
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push('/');
        }
      } else {
        toast.error(result.message || 'Google ile giriş başarısız');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google ile giriş sırasında bir hata oluştu');
    }
  };

  const handleError = () => {
    toast.error('Google ile giriş başarısız');
  };

  const handleCustomButtonClick = () => {
    // Gizli Google OAuth butonunu bul ve tıkla
    const googleButton = buttonRef.current?.querySelector('div[role="button"]') as HTMLElement;
    if (googleButton) {
      googleButton.click();
    } else {
      // Alternatif olarak, iframe içindeki butonu bulmaya çalış
      const iframe = buttonRef.current?.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        const iframeButton = iframe.contentWindow.document.querySelector('div[role="button"]') as HTMLElement;
        if (iframeButton) {
          iframeButton.click();
        }
      }
    }
  };

  // Google Client ID yoksa placeholder göster
  if (!GOOGLE_CLIENT_ID) {
    return (
      <Button
        variant="outline"
        type="button"
        className="w-full"
        onClick={() => toast.info('Google Client ID ayarlanmamış. .env.local dosyasına NEXT_PUBLIC_GOOGLE_CLIENT_ID ekleyin.')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        Google ile devam et
      </Button>
    );
  }

  return (
    <div className="w-full relative">
      {/* Gizli Google OAuth butonu */}
      <div 
        ref={buttonRef}
        className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden"
        aria-hidden="true"
      >
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={false}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
        />
      </div>
      {/* Özel buton */}
      <Button
        variant="outline"
        type="button"
        className="w-full"
        onClick={handleCustomButtonClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        Google ile devam et
      </Button>
    </div>
  );
}

export function GoogleLoginButton(props: GoogleLoginButtonProps) {
  if (!GOOGLE_CLIENT_ID) {
    return <GoogleLoginButtonInner {...props} />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleLoginButtonInner {...props} />
    </GoogleOAuthProvider>
  );
}

// Wrapper component for pages that need Google OAuth
export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  if (!GOOGLE_CLIENT_ID) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
