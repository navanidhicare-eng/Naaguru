import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);


// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  logo?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  error?: string;
  isLoading?: boolean;
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}

// --- SUB-COMPONENTS ---

const CleanInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border border-zinc-200 bg-white transition-colors focus-within:border-brand-teal focus-within:ring-1 focus-within:ring-brand-teal shadow-sm">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-xl bg-white/95 backdrop-blur-md border border-white/40 shadow-xl p-5 w-72`}>
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-full flex-shrink-0 border border-zinc-100" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-semibold text-brand-text">{testimonial.name}</p>
      <p className="text-brand-muted text-[11px] font-medium">{testimonial.handle}</p>
      <p className="mt-2 text-brand-text/90 text-xs leading-relaxed">{testimonial.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  logo,
  title = <span className="font-bold text-brand-text tracking-tight">Welcome to Naaguru</span>,
  description = "Access your educational dashboard and continue your journey.",
  heroImageSrc,
  testimonials = [],
  error,
  isLoading,
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row bg-brand-bg w-[100dvw] font-sans antialiased">
      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-8">
            <div className="text-center md:text-left">
              {logo && <div className="mb-6 inline-block">{logo}</div>}
              <h1 className="animate-element animate-delay-100 text-3xl md:text-4xl leading-tight">{title}</h1>
              <p className="animate-element animate-delay-200 mt-2 text-sm text-brand-muted">{description}</p>
              {error && (
                <div className="animate-element animate-delay-200 mt-4 p-3 rounded-lg bg-brand-error/10 border border-brand-error/20 text-brand-error text-sm font-medium">
                  {error}
                </div>
              )}
            </div>

            <form className="space-y-5" onSubmit={onSignIn}>
              <div className="animate-element animate-delay-300">
                <label className="text-xs font-semibold text-brand-text uppercase tracking-wide mb-1.5 block">Email Address</label>
                <CleanInputWrapper>
                  <input name="email" type="email" placeholder="Enter your email address" className="w-full bg-transparent text-sm p-3 rounded-lg focus:outline-none text-brand-text placeholder-zinc-400" />
                </CleanInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-xs font-semibold text-brand-text uppercase tracking-wide mb-1.5 block">Password</label>
                <CleanInputWrapper>
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className="w-full bg-transparent text-sm p-3 pr-12 rounded-lg focus:outline-none text-brand-text placeholder-zinc-400" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                      {showPassword ? <EyeOff className="w-4 h-4 text-zinc-400 hover:text-brand-text transition-colors" /> : <Eye className="w-4 h-4 text-zinc-400 hover:text-brand-text transition-colors" />}
                    </button>
                  </div>
                </CleanInputWrapper>
              </div>

              <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" name="rememberMe" className="w-4 h-4 rounded border-zinc-300 text-brand-teal focus:ring-brand-teal cursor-pointer" />
                  <span className="text-brand-text font-medium group-hover:text-brand-teal transition-colors">Keep me signed in</span>
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} className="text-brand-teal hover:text-brand-teal-dark hover:underline font-semibold transition-colors">Reset password</a>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="animate-element animate-delay-600 w-full rounded-lg bg-brand-teal py-3 font-semibold text-white hover:bg-brand-teal-dark transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="animate-element animate-delay-700 relative flex items-center justify-center">
              <span className="w-full border-t border-zinc-200"></span>
              <span className="px-4 text-xs font-medium text-brand-muted bg-brand-bg absolute uppercase tracking-wider">Or continue with</span>
            </div>

            <button onClick={onGoogleSignIn} className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border border-zinc-200 bg-white rounded-lg py-3 hover:bg-zinc-50 transition-colors shadow-sm text-sm font-semibold text-brand-text">
                <GoogleIcon />
                Continue with Google
            </button>

            <p className="animate-element animate-delay-900 text-center text-sm text-brand-muted">
              New to our platform? <a href="#" onClick={(e) => { e.preventDefault(); onCreateAccount?.(); }} className="text-brand-teal font-semibold hover:underline transition-colors">Create Account</a>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-2xl bg-cover bg-center shadow-lg" style={{ backgroundImage: `url(${heroImageSrc})` }}>
            {/* Subtle overlay to ensure text readability if needed */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-teal-dark/60 via-transparent to-transparent rounded-2xl"></div>
          </div>
          {testimonials.length > 0 && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-5 px-8 w-full justify-center">
              <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
              {testimonials[1] && <div className="hidden xl:flex"><TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" /></div>}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
