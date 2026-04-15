import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './BusinessSelector.css';

const BusinessSelector = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(localStorage.getItem('selectedBusinessId') || 'all');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch if we are in the business section
    if (location.pathname.startsWith('/business')) {
      fetchBusinesses();
    }
  }, [location.pathname]);

  const fetchBusinesses = async () => {
    try {
      // Force section=business just in case, though interceptor does it.
      const response = await api.get('/static/company-records', { params: { section: 'business' } });
      setBusinesses(response.data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  const handleChange = (e) => {
    const newId = e.target.value;
    
    if (newId === 'add_new') {
      // Redirect to the Company Profile page to create a new business profile
      navigate('/company-profile');
      return;
    }

    setSelectedBusiness(newId);
    
    if (newId === 'all') {
      localStorage.removeItem('selectedBusinessId');
    } else {
      localStorage.setItem('selectedBusinessId', newId);
    }
    
    // Force reload to apply new businessId to all fetches on the page
    window.location.reload();
  };

  if (!location.pathname.startsWith('/business')) {
    return null;
  }

  return (
    <div className="business-selector">
      <label htmlFor="business-select" className="business-selector-label">Business: </label>
      <select
        id="business-select"
        value={selectedBusiness}
        onChange={handleChange}
        className="business-selector-dropdown"
      >
        <option value="all">All Businesses</option>
        {businesses.map((biz) => (
          <option key={biz._id} value={biz._id}>
            {biz.companyName || biz.name || 'Unnamed Business'}
          </option>
        ))}
        <option disabled>──────────</option>
        <option value="add_new">+ Add New Business</option>
      </select>
    </div>
  );
};

export default BusinessSelector;
