'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { resolvePostLoginPath } from '@/lib/auth/redirects';
import { startNavigation } from '@/lib/navigation';

export default function OAuth2CallbackPage() {
  const router = useRouter();
  const { completeOAuthLogin } = useMockAuth();
  const [message, setMessage] = useState('Completing sign-in…');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
      setMessage('Sign-in failed. Redirecting…');
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresIn = Number(params.get('expires_in') ?? '3600');

    if (!accessToken || !refreshToken) {
      setMessage('Missing tokens. Redirecting…');
      router.replace('/login?error=oauth');
      return;
    }

    void completeOAuthLogin({ accessToken, refreshToken, expiresIn })
      .then((user) => {
        setMessage('Success! Redirecting…');
        startNavigation();
        router.replace(resolvePostLoginPath(null, user.role));
      })
      .catch(() => {
        setMessage('Could not finish sign-in. Redirecting…');
        router.replace('/login?error=oauth');
      });
  }, [completeOAuthLogin, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
