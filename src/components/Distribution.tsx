import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { trophyDistribution } from '../lib/probability'
import type { Probabilities } from '../lib/probability'

interface DistributionProps {
  probs: Probabilities
}

export interface DistributionDataPoint {
  label: string
  value: number
}

export function prepareDistributionData(probs: Probabilities): DistributionDataPoint[] {
  return trophyDistribution(probs).map((p, n) => ({
    label: String(n),
    value: Math.round(p * 1000) / 10, // percentage to 1dp
  }))
}

const BAR_COLOURS = ['#6b7280', '#60a5fa', '#34d399', '#f59e0b', '#EF0107']

export function Distribution({ probs }: DistributionProps) {
  const data = prepareDistributionData(probs)

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4">Trophy Distribution</h2>
      <p className="text-white/50 text-sm mb-4">
        Probability of winning exactly N trophies this season
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 14 }}
            axisLine={false}
            tickLine={false}
            label={{
              value: 'Trophies',
              position: 'insideBottom',
              offset: -2,
              fill: 'rgba(255,255,255,0.4)',
              fontSize: 12,
            }}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Probability']}
            contentStyle={{
              backgroundColor: '#1e1e3a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white',
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_COLOURS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
