import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { json, useLoaderData } from '@remix-run/react'
import { AreaChart, BarChart } from '@tremor/react'
import { jsonWithError } from 'remix-toast'

import { getDbClient } from '~/libs/db/index.server'
import { getUserId } from '~/utils/session.server'
import { generateChartData, type ChartData } from './helper.server'

export const meta: MetaFunction = () => {
  return [{ title: 'Home - ReadLog' }, { name: 'description', content: 'Welcome to ReadLog!' }]
}

export async function loader({
  context,
  request
}: LoaderFunctionArgs): AsyncResult<{ userName: string; chartData: ChartData[] }, string> {
  const userId = await getUserId(request, context)

  if (userId) {
    const xata = getDbClient(context)
    const user = await xata.db.users.filter({ id: userId }).getFirst()
    if (!user) {
      return jsonWithError(
        { ok: false, error: 'User not found' },
        "We couldn't verify your identity. Please log in to continue.",
        { status: 401 }
      )
    }
    return json({ ok: true, data: { userName: user.fullname ?? 'Guest', chartData: [] } })
  }

  return json({ ok: true, data: { userName: 'Guest', chartData: generateChartData(5) } })
}

export default function IndexRoute() {
  const loaderData = useLoaderData<typeof loader>()
  const userName = loaderData.ok ? loaderData.data.userName : 'Guest'
  const chartData = loaderData.ok ? loaderData.data.chartData : []

  return (
    <div>
      <h1 className="text-3xl font-semibold">Hey, {userName}</h1>
      <span className="text-gray-500">
        {new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(
          new Date()
        )}
      </span>

      <dl className="mt-6 border rounded-lg md:flex divide-y md:divide-y-0 md:divide-x md:pt-4 md:pb-8">
        <div className="p-6 md:py-2 md:pl-8 md:pr-16">
          <dt className="text-gray-500 text-sm">Pages read</dt>
          <dd className="block text-3xl">{chartData.reduce((acc, item) => acc + item['Pages read'], 0)}</dd>
        </div>
        <div className="p-6 md:py-2 md:pl-8 md:pr-16">
          <dt className="text-gray-500 text-sm">Longest streak</dt>
          <dd className="block text-3xl">
            {chartData.reduce((acc, item) => Math.max(acc, item['Longest streak']), 0)}
          </dd>
        </div>
        <div className="p-6 md:py-2 md:pl-8 md:pr-16">
          <dt className="text-gray-500 text-sm">Time spent reading</dt>
          <dd className="block text-3xl">
            {chartData.reduce((acc, item) => acc + item['Time spent reading'], 0)} mins.
          </dd>
        </div>
      </dl>

      <div className="mt-6 border rounded-lg p-6 md:p-8">
        <h2 className="font-medium">Pages read</h2>
        <AreaChart
          categories={['Pages read']}
          className="h-80 mt-8"
          colors={['orange-300']}
          curveType="natural"
          data={chartData}
          index="startDate"
          showLegend={false}
        />
      </div>

      <div className="mt-6 flex gap-6 flex-col md:flex-row">
        <div className="border rounded-lg p-6 md:p-8 w-full">
          <h2 className="font-medium">Longest streak</h2>
          <BarChart
            categories={['Longest streak']}
            className="mt-8"
            colors={['orange-300']}
            data={chartData}
            index="startDate"
            showLegend={false}
            yAxisWidth={48}
          />
        </div>

        <div className="border rounded-lg p-6 md:p-8 w-full">
          <h2 className="font-medium">Time spent reading</h2>
          <BarChart
            categories={['Time spent reading']}
            className="mt-8"
            colors={['orange-300']}
            data={chartData}
            index="startDate"
            showLegend={false}
            yAxisWidth={48}
          />
        </div>
      </div>
    </div>
  )
}
