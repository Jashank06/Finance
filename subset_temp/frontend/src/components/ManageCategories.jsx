import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import categoriesAPI from '../api/categories';
import './ManageCategories.css';

const ManageCategories = ({ isOpen, onClose, onUpdate }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({ label: '', color: '#3B82F6' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ label: '', color: '' });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll();
      console.log('Fetched categories:', response.categories);
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.label.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      setLoading(true);
      await categoriesAPI.create(newCategory);
      setNewCategory({ label: '', color: '#3B82F6' });
      await fetchCategories();
      onUpdate?.();
    } catch (error) {
      console.error('Error adding category:', error);
      alert(error.response?.data?.error || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (id) => {
    if (!editForm.label.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      setLoading(true);
      await categoriesAPI.update(id, editForm);
      setEditingId(null);
      setEditForm({ label: '', color: '' });
      await fetchCategories();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating category:', error);
      alert(error.response?.data?.error || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      setLoading(true);
      await categoriesAPI.delete(id);
      await fetchCategories();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error.response?.data?.error || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (category) => {
    setEditingId(category._id);
    setEditForm({ label: category.label, color: category.color });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ label: '', color: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content manage-categories-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Categories</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          {/* Add New Category Form */}
          <form className="add-category-form" onSubmit={handleAddCategory}>
            <h3>Add New Category</h3>
            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                placeholder="Enter category name"
                value={newCategory.label}
                onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Color</label>
              <div className="color-picker-group">
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  disabled={loading}
                />
                <span className="color-preview" style={{ backgroundColor: newCategory.color }}></span>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              <FiPlus /> Add Category
            </button>
          </form>

          {/* Categories List */}
          <div className="categories-list">
            <h3>Your Categories</h3>
            {loading && categories.length === 0 ? (
              <div className="loading">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="empty-state">No categories found</div>
            ) : (
              <div className="categories-grid">
                {categories.map((category) => (
                  <div key={category._id} className="category-item">
                    {editingId === category._id ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          value={editForm.label}
                          onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                          disabled={loading}
                        />
                        <input
                          type="color"
                          value={editForm.color}
                          onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                          disabled={loading}
                        />
                        <div className="edit-actions">
                          <button 
                            className="btn-save"
                            onClick={() => handleEditCategory(category._id)}
                            disabled={loading}
                          >
                            Save
                          </button>
                          <button 
                            className="btn-cancel"
                            onClick={cancelEditing}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="category-info">
                          <span 
                            className="category-color" 
                            style={{ backgroundColor: category.color }}
                          ></span>
                          <span className="category-label">{category.label}</span>
                          {category.isDefault && <span className="default-badge">Default</span>}
                        </div>
                        <div className="category-actions">
                          <button
                            className="btn-icon"
                            onClick={() => startEditing(category)}
                            disabled={loading}
                            title="Edit category"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDeleteCategory(category._id)}
                            disabled={loading}
                            title="Delete category"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;
