import { useState, useEffect } from 'react'
import api from '../utils/api'

interface User {
  id: number
  name: string
  email: string
  role: string
}

export function useFetchUsers() {
  const [data, setData] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    api
      .get('/users')
      .then((response) => {
        setData(response.data)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err)
        setIsLoading(false)
      })
  }, [])

  return { data, isLoading, error }
}
