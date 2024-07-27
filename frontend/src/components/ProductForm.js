import React from 'react';

function StockTable({ data }) {
  return (
    <table>
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
          <tr key={item.name || index}>
            <td>{item.name}</td>
            <td>{item.bar}</td>
            <td>{item['100g']}</td>
            <td>{item['50g']}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default StockTable;