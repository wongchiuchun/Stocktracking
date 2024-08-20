import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import StockTable from '../components/StockTable';

function SummaryPage() {
  const [stockData, setStockData] = useState([]);
  const [logData, setLogData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch stock data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name');
      if (productsError) throw productsError;

      const { data: stockLevels, error: stockError } = await supabase
        .from('stock_levels')
        .select('*');
      if (stockError) throw stockError;

      const formattedStockData = products.map(product => {
        const stockLevel = stockLevels.find(sl => sl.product_id === product.id) || {};
        return {
          name: product?.name || 'N/A',
          bar: stockLevel.bar_count || 0,
          '100g': stockLevel.count_100g || 0,
          '50g': stockLevel.count_50g || 0
        };
      });

      setStockData(formattedStockData);

      // Fetch action logs
      const { data: logs, error: logsError } = await supabase
        .from('action_logs')
        .select(`
          id,
          action_type,
          quantity,
          form,
          timestamp,
          products (name)
        `)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      setLogData(logs);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleExport = () => {
    const headers = ['Product', 'Bar', '100g', '50g'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + stockData.map(row => [row.name, row.bar, row['100g'], row['50g']].join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "stock_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div>Loading data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Inventory Summary</h1>
      {stockData.length > 0 ? (
        <>
          {/* Pass a style prop with the desired width */}
          <StockTable data={stockData} style={{ maxWidth: '800px' }} />
          <button onClick={handleExport}>Export to CSV</button>
        </>
      ) : (
        <p>No stock data available.</p>
      )}

      <h2>Recent Activity Log</h2>
      {logData.length > 0 ? (
        <ul>
          {logData.map(log => (
            <li key={log.id}>
              {`${log.action_type} - ${log.products?.name || 'N/A'} (${log.quantity} ${log.form}) at ${new Date(log.timestamp).toLocaleString()}`}
            </li>
          ))}
        </ul>
      ) : (
        <p>No recent activity.</p>
      )}
    </div>
  );
}

export default SummaryPage;