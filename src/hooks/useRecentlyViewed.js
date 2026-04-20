'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'depxtech-recently-viewed'
const MAX_ITEMS = 10

export function useRecentlyViewed() {
  const [items, setItems] = useState([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id)
      const updated = [
        {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.imgs?.[0] || product.image || null,
        },
        ...filtered,
      ].slice(0, MAX_ITEMS)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {}
      return updated
    })
  }, [])

  return { items, addItem }
}
