import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [newProductName, setNewProductName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProductName.trim()) return;
    setIsLoading(true);
    try {
      // First, insert the new product
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert([{ name: newProductName.trim() }])
        .select()
        .single();

      if (productError) throw productError;

      // Then, create an initial stock level for the new product
      const { error: stockError } = await supabase
        .from('stock_levels')
        .insert([
          { 
            product_id: newProduct.id, 
            bar_count: 0, 
            count_100g: 0, 
            count_50g: 0 
          }
        ]);

      if (stockError) throw stockError;

      // Refresh the product list
      await fetchProducts();
      setNewProductName('');
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Failed to add product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setIsLoading(true);
    try {
      // Delete the product
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (productError) throw productError;

      // The stock level should be automatically deleted due to foreign key constraint
      // but if it's not set up that way, you might need to delete it manually here

      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Manage Products</h1>
      <form onSubmit={handleAddProduct}>
        <input
          type="text"
          value={newProductName}
          onChange={(e) => setNewProductName(e.target.value)}
          placeholder="New product name"
          required
        />
        <button type="submit">Add Product</button>
      </form>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            {product.name}
            <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductManagementPage;