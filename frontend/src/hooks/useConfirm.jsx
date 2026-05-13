/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, message: '', resolve: null })

  const confirm = (message) =>
    new Promise((resolve) => {
      setState({ open: true, message, resolve })
    })

  const handleResponse = (value) => {
    state.resolve(value)
    setState({ open: false, message: '', resolve: null })
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Overlay bloqueante */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div className="relative bg-dark-card border border-dark-border rounded-xl shadow-2xl w-full max-w-sm p-5">
            <p className="text-sm text-gray-200 mb-5 text-center leading-relaxed">
              {state.message}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => handleResponse(false)}
                className="px-4 py-2 text-sm rounded-lg border border-dark-border text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleResponse(true)}
                className="px-4 py-2 text-sm rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors font-medium"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export const useConfirm = () => useContext(ConfirmContext)
