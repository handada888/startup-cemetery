import ReactECharts from 'echarts-for-react';
import './index.scss';

interface StatsChartProps {
  option: Record<string, unknown>;
  height?: number;
  chartType?: 'pie' | 'bar' | 'line';
}

const darkColors = ['#f78166', '#58a6ff', '#3fb950', '#d29922', '#f85149', '#a371f7', '#79c0ff', '#56d364', '#e3b341', '#f0883e'];

const baseGrid = {
  top: 30,
  right: 20,
  bottom: 10,
  left: 10,
  containLabel: true,
};

const baseTooltip = {
  backgroundColor: '#161b22',
  borderColor: '#30363d',
  textStyle: { color: '#e6edf3', fontSize: 13 },
};

export default function StatsChart({ option, height = 280, chartType = 'pie' }: StatsChartProps) {
  const defaultOption: Record<string, unknown> = {
    color: darkColors,
    backgroundColor: 'transparent',
    textStyle: { color: '#8b949e', fontSize: 12 },
    tooltip: baseTooltip,
    grid: baseGrid,
  };

  // Only add axis defaults for non-pie charts
  if (chartType !== 'pie') {
    defaultOption.xAxis = {
      type: 'category',
      axisLabel: { color: '#8b949e', fontSize: 11 },
      axisLine: { lineStyle: { color: '#30363d' } },
      axisTick: { show: false },
    };
    defaultOption.yAxis = {
      type: 'value',
      axisLabel: { color: '#8b949e', fontSize: 11 },
      splitLine: { lineStyle: { color: '#21262d' } },
    };
  }

  const mergedOption = { ...defaultOption, ...option };

  return (
    <div className="stats-chart" style={{ height }}>
      <ReactECharts
        option={mergedOption}
        style={{ height: '100%', width: '100%' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
}
