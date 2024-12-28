export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  const formattedMinutes = String(minutes).padStart(2, '0')
  const formattedSeconds = String(remainingSeconds).padStart(2, '0')

  return `${formattedMinutes}:${formattedSeconds}`
}

/**
 * Converts time in the format of 1w2d3h4m to minutes
 * @param input string in the format of 1w2d3h4m
 * @returns time in minutes
 */
export function parseTime(input: string) {
  const regex = /(\d+w)?(\d+d)?(\d+h)?(\d+m)?/
  const match = input.match(regex)

  if (!match) return 0

  const weeks = Number.parseInt(match[1]) || 0
  const days = Number.parseInt(match[2]) || 0
  const hours = Number.parseInt(match[3]) || 0
  const mins = Number.parseInt(match[4]) || 0

  const time = weeks * 7 * 24 * 60 + days * 24 * 60 + hours * 60 + mins
  return time
}
