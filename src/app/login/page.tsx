'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignInPage, Testimonial } from '@/components/ui/sign-in';

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?q=80&w=2070&auto=format&fit=crop", 
    name: "Sarah Chen",
    handle: "Class 10 Student",
    text: "Naaguru's platform helped me find the perfect college path seamlessly. The user experience is incredible!"
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop", 
    name: "Marcus Johnson",
    handle: "Admissions Officer",
    text: "This dashboard has transformed how we manage student records and verify accreditations. Clean, powerful, and intuitive."
  },
];

import Image from 'next/image';

const NaaguruLogo = () => (
  <div className="flex items-center">
    <Image 
      src="/logo.svg" 
      alt="Naaguru Logo" 
      width={140} 
      height={40} 
      className="h-10 w-auto"
      priority
    />
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // First try to login as Admin
      const adminRes = await fetch('/api/v1/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (adminRes.ok) {
        router.push('/admin');
        return;
      }

      // If admin fails, try college login (if it exists, though college users might have a separate URL, we can unify or fail here)
      const collegeRes = await fetch('/api/v1/auth/college-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (collegeRes.ok) {
        router.push('/college/dashboard');
        return;
      }

      // If both fail, show error from the admin response (or generic)
      const errorData = await adminRes.json().catch(() => ({}));
      setError(errorData.error || 'Invalid credentials. Please try again.');
    } catch (err) {
      console.error(err);
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Continue with Google clicked");
    alert("Continue with Google clicked - Authentication not fully wired.");
  };
  
  const handleResetPassword = () => {
    alert("Reset Password clicked");
  }

  const handleCreateAccount = () => {
    alert("Create Account clicked");
  }

  return (
    <SignInPage
      logo={<NaaguruLogo />}
      heroImageSrc="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" 
      testimonials={sampleTestimonials}
      error={error}
      onSignIn={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
    />
  );
}
