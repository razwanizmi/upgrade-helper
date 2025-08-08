import { useEffect, useState } from 'react'
import { parseDiff } from 'react-diff-view'
import type { File } from 'gitdiff-parser'
import { getDiffURL } from '../utils'

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

const movePackageJsonToTop = (parsedDiff: File[]) =>
  parsedDiff.sort(({ newPath }) => (newPath.includes('package.json') ? -1 : 1))

interface UseFetchDiffProps {
  shouldShowDiff: boolean
  packageName: string
  language: string
  fromVersion: string
  toVersion: string
}
export const useFetchDiff = ({
  shouldShowDiff,
  packageName,
  language,
  fromVersion,
  toVersion,
}: UseFetchDiffProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDone, setIsDone] = useState<boolean>(false)
  const [diff, setDiff] = useState<File[]>([])

  useEffect(() => {
    const fetchDiff = async () => {
      setIsLoading(true)
      setIsDone(false)

      try {
        const [response] = await Promise.all([
          fetch(getDiffURL({ packageName, language, fromVersion, toVersion })),
          delay(300),
        ])

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        const diff = atob(data.content)

        setDiff(movePackageJsonToTop(parseDiff(diff)))
      } catch (error) {
        console.error('Failed to fetch diff:', error)
        setDiff([])
      }

      setIsLoading(false)
      setIsDone(true)

      return
    }

    if (shouldShowDiff) {
      fetchDiff()
    }
  }, [shouldShowDiff, packageName, language, fromVersion, toVersion])

  return {
    isLoading,
    isDone,
    diff,
  }
}
