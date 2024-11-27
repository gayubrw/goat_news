'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle forgot password logic here
        console.log('Reset password requested for:', email);
        setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-black p-8 rounded-xl shadow-lg">
                {/* Back to Login Link */}
                <div>
                    <Link
                        href="/login"
                        className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to login
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Enter your email address and we will send you
                        instructions to reset your password.
                    </p>
                </div>

                {!isSubmitted ? (
                    // Reset Password Form
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Email address
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white dark:bg-zinc-900 dark:text-white"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white transition-colors"
                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <Send
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </span>
                                Send Reset Instructions
                            </button>
                        </div>
                    </form>
                ) : (
                    // Success Message
                    <div className="mt-8 space-y-6">
                        <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-green-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                                        Check your email
                                    </h3>
                                    <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                                        <p>
                                            If an account exists for {email},
                                            you will receive password reset
                                            instructions.
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <div className="-mx-2 -my-1.5 flex">
                                            <Link
                                                href="/login"
                                                className="rounded-md bg-green-50 dark:bg-green-900/30 px-2 py-1.5 text-sm font-medium text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900/50 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                                            >
                                                Return to login
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Help text */}
                <div className="text-center text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                        Remember your password?{' '}
                        <Link
                            href="/login"
                            className="font-medium text-black dark:text-white hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
