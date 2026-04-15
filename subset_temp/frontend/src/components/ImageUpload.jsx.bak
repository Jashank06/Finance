import { useState } from 'react';
import axios from 'axios';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

const ImageUpload = ({ label, value, onChange, name }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(value || '');

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size should be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/upload/image`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Cloudinary returns full URL, no need to prepend API_URL
            const imageUrl = response.data.url;
            setPreview(imageUrl);
            onChange({ target: { name, value: imageUrl } });
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview('');
        onChange({ target: { name, value: '' } });
    };

    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                {label}
            </label>
            
            <div style={{ 
                border: '2px dashed rgba(0, 0, 0, 0.15)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
                background: '#FFFFFF',
                transition: 'all 0.3s',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {preview ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img 
                            src={preview} 
                            alt="Preview" 
                            style={{ 
                                maxWidth: '100%',
                                maxHeight: '200px',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                display: 'block'
                            }} 
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            style={{
                                position: 'absolute',
                                top: '-10px',
                                right: '-10px',
                                background: '#ef4444',
                                color: 'white',
                                border: '2px solid white',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                                transition: 'all 0.3s',
                                zIndex: 10
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#dc2626';
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#ef4444';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <FiX size={20} strokeWidth={3} />
                        </button>
                    </div>
                ) : (
                    <div style={{ width: '100%' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <FiImage size={48} color="#9ca3af" style={{ display: 'block', margin: '0 auto' }} />
                        </div>
                        <p style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '1rem' }}>
                            Click to upload or drag and drop
                        </p>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            PNG, JPG, GIF, WebP up to 5MB
                        </p>
                        <label 
                            htmlFor={`file-${name}`}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: uploading ? '#6b7280' : 'linear-gradient(135deg, #0A0A0A 0%, #404040 100%)',
                                color: 'white',
                                borderRadius: '10px',
                                cursor: uploading ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                                transition: 'all 0.3s',
                                border: 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (!uploading) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.2)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!uploading) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                                }
                            }}
                        >
                            <FiUpload size={18} />
                            {uploading ? 'Uploading...' : 'Choose Image'}
                        </label>
                        <input
                            id={`file-${name}`}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={uploading}
                            style={{ display: 'none' }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUpload;
