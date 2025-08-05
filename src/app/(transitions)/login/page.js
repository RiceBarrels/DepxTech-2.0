'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeftIcon, Forward, LogInIcon } from 'lucide-react'
import { BackLink, ForwardLink } from '@/components/ui/pageTransitions'
import { LoadingUI } from '@/components/ui/loadingUI'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(0)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/') // Redirect to home page after successful login
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col  py-4 px-4 gap-2 w-full justify-between items-center">
      <div className="w-full flex justify-start">
        <BackLink href="/">
          <Button variant="outline" className="size-10">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </BackLink>
      </div>

      <div className='flex-1 flex flex-col justify-center items-center max-w-256 w-full'>
        <div className="flex flex-col md:flex-row w-full md:h-100 items-center m-8 border rounded-4xl">
          <div className="w-full flex flex-col md:h-100 p-12 pb-8 md:p-12 gap-5">
            <h1 className="text-2xl font-black">DepxTech</h1>
            <h2 className="text-4xl font-bold flex items-center gap-4"><LogInIcon className="size-8" />Login</h2>
            <p className="text-md">Get access to your Orders, Wishlist and Recommendations......</p>
          </div>
          <div className="h-72 hidden md:block">
            <Separator orientation="vertical" className="h-72"/>
          </div>
          <div className="w-72 block md:hidden">
            <Separator orientation="horizontal" className="w-72"/>
          </div>
          <div className="w-full flex flex-col p-8 pt-6 md:p-12">
            <form onSubmit={handleLogin} className="space-y-4 w-full p-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <AnimatePresence mode='popLayout'>
                {step === 0 && <motion.div
                  initial={{opacity:0, scale:0.5}}
                  animate={{opacity:1, scale:1}}
                  exit={{opacity:0, scale:0.5}}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <label htmlFor="email" className="block font-medium text-gray-300/75 mb-1">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="w-full"
                    
                  />
                </motion.div>}
              </AnimatePresence>

              <AnimatePresence mode='popLayout'>
                {step === 1 && <motion.div
                  initial={{opacity:0, scale:0.5}}
                  animate={{opacity:1, scale:1}}
                  exit={{opacity:0, scale:0.5}}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <label htmlFor="password" className="block font-medium text-gray-300/75 mb-1">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full"
                  />
                </motion.div>}
              </AnimatePresence>

              <p className="text-sm text-muted-foreground">
                
              </p>

              <div className="flex flex-row-reverse gap-2 pt-4">
                <AnimatePresence mode='popLayout'>
                  {step === 0 && <motion.div
                    initial={{opacity:0, scale:0.5}}
                    animate={{opacity:1, scale:1}}
                    exit={{opacity:0, scale:0.5}}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex-2"
                  >
                    <Button
                      className="w-full"
                      onClick={() => {
                        if(email.length > 0){
                          setStep(1)
                        } else {
                          setError('Please enter your email')
                        }
                      }}
                    >
                      Next
                    </Button>
                  </motion.div>}
                </AnimatePresence>

                <AnimatePresence mode='popLayout'>
                  {step === 1 && <motion.div
                    initial={{opacity:0, scale:0.5}}
                    animate={{opacity:1, scale:1}}
                    exit={{opacity:0, scale:0.5}}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex-2"
                  >
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Signing in...' : 'Sign in'}
                    </Button>
                  </motion.div>}
                </AnimatePresence>

                <AnimatePresence mode='popLayout'>
                  {step === 0 && <motion.div
                    initial={{opacity:0, scale:0.5}}
                    animate={{opacity:1, scale:1}}
                    exit={{opacity:0, scale:0.5}}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <ForwardLink href="/signup">
                      <Button variant="outline" className="flex-1">
                        Create an Account
                      </Button>
                    </ForwardLink>
                  </motion.div>}
                </AnimatePresence>

                <AnimatePresence mode='popLayout'>
                  {step === 1 && <motion.div
                    initial={{opacity:0, scale:0.5}}
                    animate={{opacity:1, scale:1}}
                    exit={{opacity:0, scale:0.5}}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
                      Back
                    </Button>
                  </motion.div>}
                </AnimatePresence>
              </div>
            </form>
          </div>
        </div>
        
      </div>
    </div>
  )
} 