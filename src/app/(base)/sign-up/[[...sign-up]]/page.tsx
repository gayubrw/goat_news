'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import * as Clerk from '@clerk/elements/common'
import * as SignUp from '@clerk/elements/sign-up'

export default function SignUpPage() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
        <Card className="max-w-md w-full px-4 py-2 rounded-xl space-y-2">
            <CardHeader className="space-y-1">
                <CardTitle className="text-3xl text-center">Create account</CardTitle>
                <CardDescription className="text-center">
                    Enter your information to get started
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SignUp.Root>
                    <SignUp.Step name="start" className='space-y-6'>
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
                            <Clerk.Field name="emailAddress">
                                <div className='flex flex-col space-y-2 text-sm'>
                                    <Clerk.Label>Email address</Clerk.Label>
                                    <Clerk.Input asChild>
                                        <Input className='h-9 rounded-lg'/>
                                    </Clerk.Input>
                                    <Clerk.FieldError className='text-red-500'/>
                                </div>
                            </Clerk.Field>

                            <Clerk.Field name="password">
                                <div className='flex flex-col space-y-2 text-sm'>
                                    <Clerk.Label>Password</Clerk.Label>
                                    <Clerk.Input asChild>
                                        <Input type="password" className='h-9 rounded-lg'/>
                                    </Clerk.Input>
                                    <Clerk.FieldError className='text-red-500'/>
                                </div>
                            </Clerk.Field>

                            <SignUp.Action submit asChild>
                                <Button className="w-full h-9 font-medium">Sign up</Button>
                            </SignUp.Action>

                            <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                                Already have an account?{' '}
                                <Link
                                    href="/sign-in"
                                    className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </div>
                    </SignUp.Step>

                    <SignUp.Step name="verifications">
                        <SignUp.Strategy name="email_code">
                            <h1 className="text-xl font-semibold mb-2">Check your email</h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                                We&apos;ve sent a verification code to your email
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

                            <SignUp.Action submit asChild>
                                <Button className="w-full h-9 font-medium mt-4">Verify email</Button>
                            </SignUp.Action>
                        </SignUp.Strategy>

                        <SignUp.Strategy name="phone_code">
                            <h1 className="text-xl font-semibold mb-2">Check your phone</h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                                We&apos;ve sent a verification code via SMS
                            </p>

                            <Clerk.Field name="code">
                                <div className='flex flex-col space-y-2 text-sm'>
                                    <Clerk.Label>Phone code</Clerk.Label>
                                    <Clerk.Input asChild>
                                        <Input className='h-9 rounded-lg'/>
                                    </Clerk.Input>
                                    <Clerk.FieldError className='text-red-500'/>
                                </div>
                            </Clerk.Field>

                            <SignUp.Action submit asChild>
                                <Button className="w-full h-9 font-medium mt-4">Verify phone</Button>
                            </SignUp.Action>
                        </SignUp.Strategy>
                    </SignUp.Step>
                    <div id="clerk-captcha" />
                </SignUp.Root>
            </CardContent>
        </Card>
    </div>
  )
}
