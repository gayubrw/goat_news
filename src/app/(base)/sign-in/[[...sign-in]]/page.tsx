'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'

export default function SignInPage() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
        <Card className="max-w-md w-full px-4 py-2 rounded-xl space-y-2">
            <CardHeader className="space-y-1">
                <CardTitle className="text-3xl text-center">Welcome back</CardTitle>
                <CardDescription className="text-center">
                    Please sign in to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SignIn.Root>
                    <SignIn.Step name="start" className='space-y-6'>
                        <div className='w-full flex space-x-2 text-sm'>
                            <Clerk.Connection
                                name="google"
                                className="w-full flex gap-2 items-center justify-center bg-white hover:bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 font-medium border shadow-sm py-1.5 px-4 rounded-lg transition-colors"
                            >
                                <Clerk.Icon className="size-4"/>
                                Google
                            </Clerk.Connection>

                            <Clerk.Connection
                                name="facebook"
                                className="w-full flex gap-2 items-center justify-center bg-white hover:bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 font-medium border shadow-sm py-1.5 px-4 rounded-lg transition-colors"
                            >
                                <Clerk.Icon className="size-4"/>
                                Facebook
                            </Clerk.Connection>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-background px-8 text-zinc-500 dark:text-zinc-400">
                                    or
                                </span>
                            </div>
                        </div>

                        <div className='space-y-4'>
                            <Clerk.Field name="identifier">
                                <div className='flex flex-col space-y-2 text-sm'>
                                    <Clerk.Label>Email address</Clerk.Label>
                                    <Clerk.Input asChild>
                                        <Input className='h-9 rounded-lg'/>
                                    </Clerk.Input>
                                    <Clerk.FieldError className='text-red-500'/>
                                </div>
                            </Clerk.Field>

                            <Tabs defaultValue="password" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 h-9">
                                    <TabsTrigger value="password">Password</TabsTrigger>
                                    <TabsTrigger value="code">Email Code</TabsTrigger>
                                </TabsList>
                                <TabsContent value="password" className="space-y-4">
                                    <Clerk.Field name="password">
                                        <div className='flex flex-col space-y-2 text-sm'>
                                            <Clerk.Label>Password</Clerk.Label>
                                            <Clerk.Input asChild>
                                                <Input type="password" className='h-9 rounded-lg'/>
                                            </Clerk.Input>
                                            <Clerk.FieldError className='text-red-500'/>
                                        </div>
                                    </Clerk.Field>
                                    <div className="text-right">
                                        <Button
                                            variant="link"
                                            className="text-xs text-blue-600 hover:text-blue-500 h-auto p-0"
                                            onClick={() => {
                                                const elem = document.querySelector('[data-clerk-navigate="forgot-password"]');
                                                if (elem) {
                                                    (elem as HTMLElement).click();
                                                }
                                            }}
                                        >
                                            Forgot password?
                                        </Button>
                                    </div>
                                </TabsContent>
                                <TabsContent value="code">
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        We&apos;ll send a secure login code to your email
                                    </p>
                                </TabsContent>
                            </Tabs>

                            <SignIn.Action submit asChild>
                                <Button className="w-full h-9 font-medium">Continue</Button>
                            </SignIn.Action>

                            <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                                Don&apos;t have an account?{' '}
                                <Link
                                    href="/sign-up"
                                    className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                                >
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    </SignIn.Step>

                    <SignIn.Step name="verifications">
                        <SignIn.Strategy name="email_code">
                            <h1 className="text-xl font-semibold mb-2">Check your email</h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                                We sent a code to <SignIn.SafeIdentifier />.
                            </p>

                            <Clerk.Field name="code">
                                <div className='flex flex-col space-y-2 text-sm'>
                                    <Clerk.Label>Email code</Clerk.Label>
                                    <Clerk.Input asChild>
                                        <Input className='h-9 rounded-lg'/>
                                    </Clerk.Input>
                                    <Clerk.FieldError className='text-red-500'/>
                                </div>
                            </Clerk.Field>

                            <SignIn.Action submit asChild>
                                <Button className="w-full h-9 font-medium mt-4">Continue</Button>
                            </SignIn.Action>
                        </SignIn.Strategy>
                    </SignIn.Step>

                    <SignIn.Step name="forgot-password">
                        <h1 className="text-xl font-semibold mb-2">Forgot your password?</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                            No worries, we&apos;ll send you reset instructions.
                        </p>

                        <SignIn.SupportedStrategy name="reset_password_email_code">
                            <SignIn.Action submit asChild>
                                <Button className="w-full h-9 font-medium">Reset password</Button>
                            </SignIn.Action>
                        </SignIn.SupportedStrategy>

                        <SignIn.Action navigate="start" asChild>
                            <Button
                                variant="ghost"
                                className="w-full h-9 font-medium mt-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                            >
                                Back to login
                            </Button>
                        </SignIn.Action>
                    </SignIn.Step>

                    <SignIn.Step name="reset-password">
                        <h1 className="text-xl font-semibold mb-2">Reset your password</h1>
                        <div className="space-y-4">
                            <Clerk.Field name="password">
                                <div className='flex flex-col space-y-2 text-sm'>
                                    <Clerk.Label>New password</Clerk.Label>
                                    <Clerk.Input asChild>
                                        <Input type="password" className='h-9 rounded-lg'/>
                                    </Clerk.Input>
                                    <Clerk.FieldError className='text-red-500'/>
                                </div>
                            </Clerk.Field>

                            <Clerk.Field name="confirmPassword">
                                <div className='flex flex-col space-y-2 text-sm'>
                                    <Clerk.Label>Confirm password</Clerk.Label>
                                    <Clerk.Input asChild>
                                        <Input type="password" className='h-9 rounded-lg'/>
                                    </Clerk.Input>
                                    <Clerk.FieldError className='text-red-500'/>
                                </div>
                            </Clerk.Field>

                            <SignIn.Action submit asChild>
                                <Button className="w-full h-9 font-medium">Reset password</Button>
                            </SignIn.Action>
                        </div>
                    </SignIn.Step>
                    <div id="clerk-captcha" />
                </SignIn.Root>
            </CardContent>
        </Card>
    </div>
  )
}
