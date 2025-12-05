const PlaceholderPage = ({ title }) => {
  return (
    <div style={{ 
      padding: '40px',
      animation: 'fadeIn 0.5s ease-in'
    }}>
      <h1 style={{
        fontSize: '42px',
        fontWeight: '800',
        background: 'linear-gradient(135deg, #C084FC 0%, #9333EA 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '20px'
      }}>
        {title}
      </h1>
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 5px 25px rgba(0, 0, 0, 0.08)',
        textAlign: 'center',
        border: '1px solid rgba(102, 126, 234, 0.1)'
      }}>
        <div style={{
          fontSize: '60px',
          marginBottom: '20px'
        }}>🚧</div>
        <p style={{
          fontSize: '18px',
          color: '#5a6c7d',
          fontWeight: '500'
        }}>
          This page is under construction.
        </p>
        <p style={{
          fontSize: '15px',
          color: '#8a9ba8',
          marginTop: '10px'
        }}>
          Coming soon with amazing features!
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
