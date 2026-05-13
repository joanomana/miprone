'use client'

interface Step {
  number: number
  label: string
}

interface StepIndicatorProps {
  currentStep: 1 | 2
}

const STEPS: Step[] = [
  { number: 1, label: 'Tu Negocio' },
  { number: 2, label: 'Tu Galpón' },
]

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full mb-8">
      {STEPS.map((step, index) => {
        const isActive = step.number === currentStep
        const isDone = step.number < currentStep

        return (
          <div key={step.number} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                  transition-all duration-300 shadow-sm
                  ${isActive
                    ? 'bg-green-600 text-white ring-4 ring-green-100'
                    : isDone
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                  }
                `}
              >
                {isDone ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`
                  mt-2 text-xs font-medium whitespace-nowrap
                  ${isActive ? 'text-green-700' : isDone ? 'text-green-500' : 'text-gray-400'}
                `}
              >
                Paso {step.number}: {step.label}
              </span>
            </div>

            {/* Connector line between steps */}
            {index < STEPS.length - 1 && (
              <div
                className={`
                  h-0.5 w-16 sm:w-24 mx-2 mb-5 rounded-full transition-all duration-300
                  ${isDone ? 'bg-green-500' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
