'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signupApi, uploadProfileImageApi } from '@/lib/auth-client';
import { useEmber } from '@/context/ember-context';
import {
  Flame,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  FileText,
  Camera,
  X,
  UploadCloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  const router = useRouter();
  const { updateUserProfile } = useEmber();

  // Block back button from cycling previous authenticated history URLs
  React.useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [description, setDescription] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [ageConfirmed, setAgeConfirmed] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Profile image must be smaller than 10MB.');
        return;
      }
      setProfileImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setProfileImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setProfileImageFile(null);
    if (profileImagePreview) {
      URL.revokeObjectURL(profileImagePreview);
      setProfileImagePreview('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!ageConfirmed) {
      setErrorMessage('You must confirm you are at least 16 years old to use Disciplr.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      let uploadedProfileImgUrl: string | undefined = undefined;

      // 1. Upload profile image to storage if selected
      if (profileImageFile) {
        try {
          uploadedProfileImgUrl = await uploadProfileImageApi(profileImageFile);
        } catch (uploadErr: any) {
          console.warn('Profile image storage upload error:', uploadErr);
        }
      }

      // 2. Call Signup API with profile_img
      const response = await signupApi({
        name: name.trim(),
        email: email.trim(),
        password,
        description: description.trim() || undefined,
        profile_img: uploadedProfileImgUrl,
        avatar_url: uploadedProfileImgUrl,
      });

      if (response.user) {
        updateUserProfile({
          id: response.user.id,
          name: response.user.name,
          username: response.user.name.toLowerCase().replace(/\s+/g, '_'),
          email: response.user.email,
          avatar: uploadedProfileImgUrl || response.user.avatar_url || response.user.profile_img || undefined,
          ageVerified: true,
        });
      }

      router.push('/today');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 selection:bg-orange-500/30 selection:text-orange-200">
      {/* Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent">
              Disciplr
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Create your account
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Join your Growth Network and build daily momentum without public noise.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-800/80">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-scale-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center justify-center pb-2">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-zinc-900 border-2 border-dashed border-zinc-700 hover:border-orange-500/80 transition-colors overflow-hidden flex items-center justify-center shadow-lg">
                  {profileImagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profileImagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-500 group-hover:text-orange-400 transition-colors">
                      <Camera className="w-7 h-7 mb-0.5" />
                      <span className="text-[9px] font-semibold uppercase tracking-wider">Photo</span>
                    </div>
                  )}
                </div>

                {/* Upload Action Label / Input */}
                <label className="absolute inset-0 cursor-pointer rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <UploadCloud className="w-6 h-6 text-white drop-shadow-md" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {/* Remove Image Button if selected */}
                {profileImagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <label className="mt-2 text-xs text-orange-400 hover:text-orange-300 font-semibold cursor-pointer transition-colors">
                <span>{profileImagePreview ? 'Change Profile Picture' : 'Upload Profile Picture (Optional)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <span className="text-[10px] text-zinc-500">Stored as profile_img in your account</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-400" />
                Full Name or Alias
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Jordan Miller"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-orange-400" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@domain.com"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-orange-400" />
                Password (min 6 chars)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-orange-400" />
                Focus / Bio (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Morning runner & deep focus builder"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* 16+ Age Gate Checkbox */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-500/10 border border-orange-500/25 text-xs text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 rounded accent-orange-500"
              />
              <div>
                <span className="font-bold text-orange-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Age Confirmation (16+)
                </span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  I confirm I am at least 16 years old to participate in closed photo check-ins.
                </p>
              </div>
            </label>

            <Button
              type="submit"
              variant="glow"
              fullWidth
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-zinc-500 mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-orange-400 font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
