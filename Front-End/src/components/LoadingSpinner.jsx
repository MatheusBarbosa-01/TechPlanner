import './LoadingSpinner.css'

function LoadingSpinner() {
  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
