import { useEffect, useState } from 'react'
import { getReleasesFileURL } from '../utils'

export const useFetchReleaseVersions = ({
  packageName,
}: {
  packageName: string
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDone, setIsDone] = useState<boolean>(false)
  const [releaseVersions, setReleaseVersions] = useState<string[]>([])

  useEffect(() => {
    const fetchReleaseVersions = async () => {
      setIsLoading(true)
      setIsDone(false)

      const response = await fetch(getReleasesFileURL({ packageName }))
      const apiResponse = await response.json()

      const releaseVersions = atob(apiResponse.content)
        .split('\n')
        .filter(Boolean)

      setReleaseVersions(releaseVersions)

      setIsLoading(false)
      setIsDone(true)

      return
    }

    fetchReleaseVersions()
  }, [packageName])

  return {
    isLoading,
    isDone,
    releaseVersions,
  }
}
