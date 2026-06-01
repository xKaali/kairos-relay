'use client'

import { useState, useEffect } from 'react'

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState('')

  useEffect(() => {
    setApiKeyState(localStorage.getItem('relay_api_key') ?? '')
  }, [])

  function setApiKey(key: string) {
    setApiKeyState(key)
    localStorage.setItem('relay_api_key', key)
  }

  return { apiKey, setApiKey }
}
