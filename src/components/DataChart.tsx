import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './DataChart.css';

interface ChartData {
  [key: string]: any;
}

interface DataChartProps {
  data: ChartData[];
  chartType: string;
  chartExplanation?: string;
  sqlQuery?: string;
}

const DataChart: React.FC<DataChartProps> = ({ 
  data, 
  chartType, 
  chartExplanation, 
  sqlQuery 
}) => {
  if (!data || data.length === 0) {
    return <div className="no-data">No data available to display</div>;
  }

  // Get the keys from the first data item to determine X and Y axes
  const dataKeys = Object.keys(data[0]);
  const xKey = dataKeys[0]; // First key as X-axis
  const yKey = dataKeys[1]; // Second key as Y-axis

  // Generate colors for charts
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
  ];

  const renderChart = () => {
    switch (chartType.toLowerCase()) {
      case 'line_chart':
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xKey} 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={yKey} 
                stroke="#0088FE" 
                strokeWidth={2}
                dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar_chart':
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xKey} 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey={yKey} fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie_chart':
      case 'pie':
        // Transform data for pie chart
        const pieData = data.map((item, index) => ({
          name: String(item[xKey]),
          value: Number(item[yKey]),
          fill: COLORS[index % COLORS.length]
        }));

        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        // Default to bar chart
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xKey} 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey={yKey} fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="data-chart">
      <div className="chart-header">
        <h4>Data Visualization</h4>
        {chartExplanation && (
          <p className="chart-explanation">{chartExplanation}</p>
        )}
      </div>
      
      <div className="chart-container">
        {renderChart()}
      </div>
      
      <div className="data-table">
        <h5>Raw Data:</h5>
        <table>
          <thead>
            <tr>
              {dataKeys.map(key => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {dataKeys.map(key => (
                  <td key={key}>{row[key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataChart;