import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import UpgradeModal from './UpgradeModal';

const FeatureGuard = ({ children, featureCategoryId, featureName }) => {
    const { hasFeatureAccess, hasRouteAccess, getRouteCategory } = useFeatureAccess();
    const location = useLocation();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Check access by category ID if provided
    if (featureCategoryId) {
        const hasAccess = hasFeatureAccess(featureCategoryId);
        
        if (!hasAccess) {
            return (
                <div style={{
                    padding: '3rem',
                    textAlign: 'center',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    margin: '2rem'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 1.5rem',
                        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem'
                    }}>
                        🔒
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
                        Feature Locked
                    </h2>
                    <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '1rem' }}>
                        {featureName || 'This feature'} is not included in your current plan.
                        <br />
                        Upgrade to unlock this and many more features!
                    </p>
                    <button
                        onClick={() => setShowUpgradeModal(true)}
                        style={{
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        View Upgrade Options
                    </button>
                    
                    <UpgradeModal
                        isOpen={showUpgradeModal}
                        onClose={() => setShowUpgradeModal(false)}
                        featureName={featureName || 'This Feature'}
                    />
                </div>
            );
        }
    }
    
    // Check access by route if no category ID provided
    else if (!hasRouteAccess(location.pathname)) {
        const category = getRouteCategory(location.pathname);
        
        return (
            <div style={{
                padding: '3rem',
                textAlign: 'center',
                background: '#f9fafb',
                borderRadius: '12px',
                margin: '2rem'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 1.5rem',
                    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                }}>
                    🔒
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
                    Access Restricted
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '1rem' }}>
                    {category ? category.name : 'This feature'} is not available in your current plan.
                    <br />
                    Upgrade to unlock full access!
                </p>
                <button
                    onClick={() => setShowUpgradeModal(true)}
                    style={{
                        padding: '1rem 2rem',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Upgrade Now
                </button>
                
                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    featureName={category ? category.name : 'This Feature'}
                />
            </div>
        );
    }

    // User has access, render children
    return <>{children}</>;
};

export default FeatureGuard;
