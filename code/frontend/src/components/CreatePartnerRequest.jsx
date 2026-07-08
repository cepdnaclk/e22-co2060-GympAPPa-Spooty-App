import '../styles/partner-finder.css';

const CreatePartnerRequest = ({ form, sports, user, onChange, onSubmit, submitMessage, submitError }) => {
  return (
    <section className="partner-panel pastel-blue">
      <div className="partner-section-title">
        <h2>Create Partner Request</h2>
        <span>{user?.name || user?.userId || 'Student'}</span>
      </div>
      <form onSubmit={onSubmit} className="partner-form-grid">
        <label>Sport
          <select name="sport" value={form.sport} onChange={onChange}>
            {sports.map((sport) => <option key={sport} value={sport}>{sport}</option>)}
          </select>
        </label>
        <label>Date
          <input type="date" name="date" value={form.date} onChange={onChange} required />
        </label>
        <label>Start Time
          <input
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={onChange}
            min="08:00"
            max="20:00"
            required
          />
          <span style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>8:00 AM – 8:00 PM only</span>
        </label>
        <label>End Time
          <input
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={onChange}
            min="08:00"
            max="20:00"
          />
          <span style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>8:00 AM – 8:00 PM only</span>
        </label>
        <label>Venue
          <input type="text" name="venue" value={form.venue} onChange={onChange} placeholder="Optional" />
        </label>
        <label>Skill Level
          <select name="skillLevel" value={form.skillLevel} onChange={onChange}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </label>
        <label>Gender Preference
          <select name="genderPreference" value={form.genderPreference} onChange={onChange}>
            <option>Anyone</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </label>
        <label style={{ gridColumn: '1 / -1' }}>Additional Notes
          <textarea name="notes" value={form.notes} onChange={onChange} placeholder="Optional details" />
        </label>
        <div className="partner-form-actions" style={{ gridColumn: '1 / -1' }}>
          <button className="btn-primary" type="submit">Create Request</button>
        </div>
        {submitMessage && <div className="partner-inline-message success" style={{ gridColumn: '1 / -1' }}>{submitMessage}</div>}
        {submitError && <div className="partner-inline-message error" style={{ gridColumn: '1 / -1' }}>{submitError}</div>}
      </form>
    </section>
  );
};

export default CreatePartnerRequest;