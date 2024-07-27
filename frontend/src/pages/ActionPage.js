import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

function ActionPage() {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedForm, setSelectedForm] = useState('100g');
  const [actionType, setActionType] = useState('increase');
  const [quantity, setQuantity] = useState(0);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) console.error('Error fetching products:', error);
    else setProducts(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (selectedProducts.length === 0 || !quantity) {
      setStatus('Please select at least one product and enter a quantity.');
      return;
    }

    setStatus('Processing...');

    const quantityChange = actionType === 'increase' ? quantity : -quantity;
    const updates = selectedProducts.map(async (productId) => {
      try {
        // Update stock level
        let { data: stockLevel, error: fetchError } = await supabase
          .from('stock_levels')
          .select('*')
          .eq('product_id', productId)
          .single();

        if (fetchError && fetchError.code === 'PGRST116') {
          const { data: newStockLevel, error: insertError } = await supabase
            .from('stock_levels')
            .insert({ product_id: productId, bar_count: 0, count_100g: 0, count_50g: 0 })
            .single();

          if (insertError) throw insertError;

          stockLevel = newStockLevel;
        } else if (fetchError) {
          throw fetchError;
        }

        let updatedStock = { ...stockLevel };
        let currentStock;
        switch (selectedForm) {
          case 'bar':
            currentStock = updatedStock.bar_count;
            updatedStock.bar_count = Math.max(0, currentStock + quantityChange);
            break;
          case '100g':
            currentStock = updatedStock.count_100g;
            updatedStock.count_100g = Math.max(0, currentStock + quantityChange);
            break;
          case '50g':
            currentStock = updatedStock.count_50g;
            updatedStock.count_50g = Math.max(0, currentStock + quantityChange);
            break;
          default:
            throw new Error('Invalid form selected');
        }

        if (actionType === 'decrease' && currentStock + quantityChange < 0) {
          throw new Error(`Insufficient stock level for ${selectedForm} of product ${productId}`);
        }

        const { error: updateError } = await supabase
          .from('stock_levels')
          .update(updatedStock)
          .eq('product_id', productId);

        if (updateError) throw updateError;

        // Create log entry
        const { error: logError } = await supabase
          .from('action_logs')
          .insert({
            product_id: productId,
            action_type: actionType,
            quantity: quantity,
            form: selectedForm
          });

        if (logError) throw logError;

        return true;
      } catch (error) {
        console.error(`Error updating stock for product ${productId}:`, error);
        setStatus(`Error: ${error.message}`);
        return false;
      }
    });

    const results = await Promise.all(updates);
    if (results.every(Boolean)) {
      setStatus('Stock levels updated successfully');
      // Reset form
      setSelectedProducts([]);
      setSelectedForm('100g');
      setActionType('increase');
      setQuantity(0);
    } else {
      setStatus('Some updates failed. Please check the console for details.');
    }
  }

  return (
    <div className="action-page">
      <h1>Stock Actions</h1>
      <form onSubmit={handleSubmit} className="action-form">
        <div className="form-group">
          <label>Products:</label>
          <select
            multiple
            value={selectedProducts}
            onChange={(e) => setSelectedProducts(Array.from(e.target.selectedOptions, option => option.value))}
            required
            className="product-select"
          >
            {products.map(product => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group">
            <label>Form:</label>
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="form-select"
            >
              <option value="100g">100g</option>
              <option value="50g">50g</option>
              <option value="bar">Bar</option>
            </select>
          </div>
          <div className="form-group">
            <label>Action:</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="form-select"
            >
              <option value="increase">Increase</option>
              <option value="decrease">Decrease</option>
            </select>
          </div>
          <div className="form-group">
            <label>Quantity:</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              required
              min="0"
              className="quantity-input"
            />
          </div>
        </div>
        <button type="submit" className="action-button">
          Perform Action
        </button>
      </form>
      {status && <p className="status-message">{status}</p>}
    </div>
  );
}

export default ActionPage;