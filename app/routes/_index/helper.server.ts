export type Data = {
  id: string
  date: string
  page_end: number
  page_start: number
  time_spent: number
}

// convert this data to chart data
export function convertToChartData(input: Data[]): ChartData[] {
  const result: Record<string, Data[]> = {}
  for (const entry of input) {
    if (!result[entry.date]) {
      result[entry.date] = []
    }
    result[entry.date].push(entry)
  }

  const output: ChartData[] = []
  for (const date in result) {
    const pagesRead = result[date].reduce((acc, entry) => acc + entry.page_end - entry.page_start, 0)
    const longestStreak = result[date].reduce((acc, entry) => Math.max(acc, entry.page_end - entry.page_start), 0)
    const timeSpentReading = result[date].reduce((acc, entry) => acc + entry.time_spent, 0)
    const entry: ChartData = {
      'Pages read': pagesRead,
      startDate: date,
      'Longest streak': longestStreak,
      'Time spent reading': timeSpentReading
    }
    output.push(entry)
  }
  return output
}

export type ChartData = {
  'Pages read': number
  startDate: string
  'Longest streak': number
  'Time spent reading': number
}

export function generateChartData(numEntries: number): ChartData[] {
  const chartData: ChartData[] = []

  const startDate = new Date()

  for (let i = 0; i < numEntries; i++) {
    const pagesRead = Math.floor(Math.random() * 100) + 1 // Random number between 1 and 100
    const longestStreak = Math.floor(Math.random() * 50) + 1 // Random number between 1 and 50
    const timeSpentReading = Math.floor(Math.random() * 200) + 1 // Random number between 1 and 200

    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() - i)

    const entry: ChartData = {
      'Pages read': pagesRead,
      startDate: `${currentDate.getDate()} ${currentDate.toLocaleString('default', {
        month: 'short'
      })} ${currentDate.getFullYear()}`,
      'Longest streak': longestStreak,
      'Time spent reading': timeSpentReading
    }

    chartData.push(entry)
  }

  return chartData.reverse()
}
