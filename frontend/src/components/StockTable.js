import React from 'react';

function StockTable({ data, style }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>No stock data available.</p>;
  }

  return (
    <table style={style}>
      <thead>
        <tr>
          <th>Product</th>
          <th>Bar</th>
          <th>100g</th>
          <th>50g</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={item.name || `product-${index}`}>
            <td>{item.name || 'Unknown Product'}</td>
            <td>{item.bar || 0}</td>
            <td>{item['100g'] || 0}</td>
            <td>{item['50g'] || 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default StockTable;