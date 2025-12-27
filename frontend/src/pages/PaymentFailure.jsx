import { useNavigate } from 'react-router-dom';
import { FiXCircle } from 'react-icons/fi';

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '3rem',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#ef4444',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <FiXCircle size={48} color="white" />
        </div>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          Payment Failed
        </h1>

        <p style={{
          color: '#6b7280',
          fontSize: '1.1rem',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          We couldn't process your payment. This could be due to insufficient funds, 
          incorrect card details, or a technical issue.
        </p>

        <div style={{
          background: '#fef2f2',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <p style={{ color: '#991b1b', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            What to do next:
          </p>
          <ul style={{ color: '#7f1d1d', fontSize: '0.875rem', margin: 0, paddingLeft: '1.25rem' }}>
            <li>Check your payment details</li>
            <li>Ensure sufficient balance in your account</li>
            <li>Try a different payment method</li>
            <li>Contact your bank if issue persists</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              flex: 1,
              padding: '0.875rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              flex: 1,
              padding: '0.875rem',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Go Home
          </button>
        </div>

        <p style={{
          color: '#9ca3af',
          fontSize: '0.875rem',
          marginTop: '1.5rem'
        }}>
          Need help? Contact us at support@financeapp.com
        </p>
      </div>
    </div>
  );
};

export default PaymentFailure;
