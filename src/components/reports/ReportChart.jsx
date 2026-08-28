import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const ReportChart = ({
  type = 'bar',
  data,
  options = {},
  title = '',
  height = 260
}) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: { family: 'Inter', size: 12 }
        }
      },
      title: {
        display: Boolean(title),
        text: title,
        font: { family: 'Inter', size: 14, weight: '600' }
      }
    },
    ...options
  };

  return (
    <div style={{ height: `${height}px`, position: 'relative' }}>
      {type === 'bar' && <Bar data={data} options={defaultOptions} />}
      {type === 'doughnut' && <Doughnut data={data} options={defaultOptions} />}
      {type === 'pie' && <Pie data={data} options={defaultOptions} />}
      {type === 'line' && <Line data={data} options={defaultOptions} />}
    </div>
  );
};

export default ReportChart;
