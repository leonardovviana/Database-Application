export default function StatsCard({ title, value, icon, color = 'primary', subtitle, trend }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <div className={`bg-${color} bg-opacity-10 rounded-3 p-3 me-3 d-flex align-items-center justify-content-center`}
               style={{ width: 52, height: 52 }}>
            <i className={`bi ${icon} fs-4 text-${color}`}></i>
          </div>
          <div className="flex-grow-1 min-width-0">
            <small className="text-muted text-uppercase fw-semibold d-block text-truncate">{title}</small>
            <h4 className="mb-0 fw-bold">{value}</h4>
          </div>
        </div>
        {(subtitle || trend !== undefined) && (
          <div className="d-flex align-items-center gap-2 border-top pt-2 mt-1">
            {trend !== undefined && (
              <small className={`d-flex align-items-center gap-1 ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
                <i className={`bi bi-arrow-${trend >= 0 ? 'up' : 'down'}-short`}></i>
                {Math.abs(trend)}%
              </small>
            )}
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
        )}
      </div>
    </div>
  );
}
