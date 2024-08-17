const data = [
  {
    id: '7a6da26b-e0e7-4c66-b11e-75ab3dfe603c',
    date: '2024-04-07',
    page_end: 28,
    page_start: 0,
    time_spent: 70
  },
  {
    id: '7a6da26b-e0e7-4c66-b11e-75ab3dfe603d',
    date: '2024-04-07',
    page_end: 44,
    page_start: 28,
    time_spent: 40
  },
  {
    id: '7a6da26b-e0e7-4c66-b11e-75ab3dfe603e',
    date: '2024-04-08',
    page_end: 62,
    page_start: 44,
    time_spent: 50
  }
]

// convert this data to chart data
export function convertToChartData(input: typeof data): ChartData[] {
  const result: Record<string, (typeof data)[number][]> = {}
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
