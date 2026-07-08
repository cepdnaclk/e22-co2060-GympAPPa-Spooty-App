import '../styles/partner-finder.css';

const FilterBar = ({ filters, sports, onChange, onOnlyOpenChange }) => {
  return (
    <div className="partner-filters">
      <label className="filter-field">Sport<select value={filters.sport} onChange={(e) => onChange('sport', e.target.value)}><option value="">All</option>{sports.map((sport) => <option key={sport} value={sport}>{sport}</option>)}</select></label>
      <label className="filter-field">Registration Number<input value={filters.regNumber} onChange={(e) => onChange('regNumber', e.target.value)} placeholder="Reg no" /></label>
      <label className="filter-field">Student Name<input value={filters.studentName} onChange={(e) => onChange('studentName', e.target.value)} placeholder="Name" /></label>
      <label className="filter-field">Date<input type="date" value={filters.date} onChange={(e) => onChange('date', e.target.value)} /></label>
      <label className="filter-field">Skill Level<select value={filters.skillLevel} onChange={(e) => onChange('skillLevel', e.target.value)}><option value="">Any</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
      <label className="filter-field">Instant Search<input placeholder="Search anything" value={filters.search || ''} onChange={(e) => onChange('search', e.target.value)} /></label>
      <label className="filter-checkbox"><input type="checkbox" checked={filters.onlyOpen} onChange={(e) => onOnlyOpenChange(e.target.checked)} />Only Open Requests</label>
    </div>
  );
};

export default FilterBar;
