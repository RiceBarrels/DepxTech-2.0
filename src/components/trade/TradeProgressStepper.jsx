'use client'

import { motion } from 'framer-motion'
import { Check, Layers, Building2, LayoutList, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  {
    id: 1,
    title: 'Category',
    shortTitle: 'Category',
    icon: Layers,
  },
  {
    id: 2,
    title: 'Brand',
    shortTitle: 'Brand',
    icon: Building2,
  },
  {
    id: 3,
    title: 'Series',
    shortTitle: 'Series',
    icon: LayoutList,
  },
  {
    id: 4,
    title: 'Model',
    shortTitle: 'Model',
    icon: Smartphone,
  },
]

export function TradeProgressStepper({ currentStep = 1, completedData = {} }) {
  const getStepState = (stepId) => {
    if (stepId < currentStep) return 'completed'
    if (stepId === currentStep) return 'active'
    return 'pending'
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Desktop Stepper */}
      <div className="hidden sm:block">
        <div className="relative">
          {/* Progress Line Background */}
          <div className="absolute top-5 left-[calc(12.5%)] right-[calc(12.5%)] h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />

          {/* Animated Progress Line */}
          <div className="absolute top-5 left-[calc(12.5%)] right-[calc(12.5%)] h-1 overflow-hidden rounded-full">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-primary to-emerald-500"
              initial={{ width: '0%' }}
              animate={{
                width: `${Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 100)}%`
              }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 20,
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const state = getStepState(step.id)
              const Icon = step.icon
              const completedValue = completedData[step.title.toLowerCase()]

              return (
                <motion.div
                  key={step.id}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / steps.length}%` }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Step Circle */}
                  <motion.div
                    className={cn(
                      'relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                      state === 'completed' && 'bg-primary border-primary text-white',
                      state === 'active' && 'bg-primary border-primary text-white shadow-lg shadow-primary/30',
                      state === 'pending' && 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                    )}
                    whileHover={state !== 'pending' ? { scale: 1.1 } : {}}
                    animate={state === 'active' ? {
                      boxShadow: ['0 0 0 0 rgba(16, 185, 129, 0.4)', '0 0 0 10px rgba(16, 185, 129, 0)', '0 0 0 0 rgba(16, 185, 129, 0)'],
                    } : {}}
                    transition={state === 'active' ? {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'loop',
                    } : {}}
                  >
                    {state === 'completed' ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <Check className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </motion.div>

                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <div
                      className={cn(
                        'text-sm font-semibold transition-colors',
                        state === 'active' && 'text-primary',
                        state === 'completed' && 'text-slate-900 dark:text-white',
                        state === 'pending' && 'text-slate-400'
                      )}
                    >
                      {step.title}
                    </div>
                    {completedValue && (
                      <motion.div
                        className="text-xs text-slate-500 mt-1 truncate max-w-[100px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {completedValue}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile Stepper */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between gap-2">
          {steps.map((step, index) => {
            const state = getStepState(step.id)
            const Icon = step.icon

            return (
              <div key={step.id} className="flex items-center flex-1">
                <motion.div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all',
                    state === 'completed' && 'bg-primary border-primary text-white',
                    state === 'active' && 'bg-primary border-primary text-white',
                    state === 'pending' && 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {state === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{step.id}</span>
                  )}
                </motion.div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: '0%' }}
                      animate={{ width: state === 'completed' ? '100%' : '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-3 text-center">
          <span className="text-sm font-semibold text-primary">
            Step {currentStep}: {steps[currentStep - 1]?.title}
          </span>
        </div>
      </div>
    </div>
  )
}
