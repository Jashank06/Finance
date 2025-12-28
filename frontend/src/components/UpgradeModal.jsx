import { useNavigate } from 'react-router-dom';
import { FiX, FiLock, FiCheckCircle } from 'react-icons/fi';
import './UpgradeModal.css';

const UpgradeModal = ({ isOpen, onClose, featureName, requiredPlan = 'Premium' }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        onClose();
        navigate('/landing/pricing');
    };

    return (
        <div className="upgrade-modal-overlay" onClick={onClose}>
            <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
                <button className="upgrade-modal-close" onClick={onClose}>
                    <FiX />
                </button>

                <div className="upgrade-modal-icon">
                    <FiLock size={48} />
                </div>

                <h2 className="upgrade-modal-title">Upgrade Required</h2>
                
                <p className="upgrade-modal-description">
                    <strong>{featureName}</strong> is not included in your current plan.
                </p>

                <div className="upgrade-benefits">
                    <h3>Upgrade to unlock:</h3>
                    <ul>
                        <li>
                            <FiCheckCircle /> Access to {featureName}
                        </li>
                        <li>
                            <FiCheckCircle /> Advanced features and tools
                        </li>
                        <li>
                            <FiCheckCircle /> Priority support
                        </li>
                        <li>
                            <FiCheckCircle /> Regular updates and new features
                        </li>
                    </ul>
                </div>

                <div className="upgrade-modal-actions">
                    <button className="upgrade-btn-primary" onClick={handleUpgrade}>
                        View Plans & Upgrade
                    </button>
                    <button className="upgrade-btn-secondary" onClick={onClose}>
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
