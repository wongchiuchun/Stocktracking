import React, { useState } from 'react';

function ActionForm({ products, onSubmit }) {
  const [action, setAction] = useState('increase');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantity, setQuantity] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(action, selectedProducts, quantity);
    // Reset form
    setSelectedProducts([]);
    setQuantity(0);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Action:</label>
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="increase">Increase Stock</option>
          <option value="dispatch">Dispatch Stock</option>
          <option value="convert">Convert Stock</option>
        </select>
      </div>
      <div>
        <label>Products:</label>
        {products.map(product => (
          <label key={product.id}>
            <input
              type="checkbox"
              value={product.id}
              checked={selectedProducts.includes(product.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedProducts([...selectedProducts, product.id]);
                } else {
                  setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                }
              }}
            />
            {product.name}
          </label>
        ))}
      </div>
      <div>
        <label>Quantity:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          min="0"
        />
      </div>
      <button type="submit">Perform Action</button>
    </form>
  );
}

export default ActionForm;