import '../styles/template.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

/**
 * TEMPLATE PAGE COMPONENT
 * 
 * This is a template page that shows the structure and styling conventions
 * used in the GympAPPa application. Use this as a reference when creating
 * new pages for the application.
 * 
 * Key features:
 * - Responsive design for mobile, tablet, and desktop
 * - Navigation and header integration
 * - Color theme implementation
 * - Consistent spacing and layout
 * - Accessibility considerations
 */

const TemplatePage = ({ userProfile }) => {
  return (
    <>
      <div className="template-container">
        <div className="template-header">
          <h1>Page Title</h1>
          <p>Page description or subtitle</p>
        </div>

        <div className="template-content">
          <div className="template-section">
            <h2>Section 1: Cards Layout</h2>
            <div className="cards-grid">
              <div className="card">
                <div className="card-icon">📋</div>
                <h3>Card Title</h3>
                <p>Card description goes here. You can use this layout for displaying information, actions, or data.</p>
                <button className="btn-primary">Action Button</button>
              </div>

              <div className="card">
                <div className="card-icon">⚙️</div>
                <h3>Card Title</h3>
                <p>Card description goes here. You can use this layout for displaying information, actions, or data.</p>
                <button className="btn-primary">Action Button</button>
              </div>

              <div className="card">
                <div className="card-icon">📊</div>
                <h3>Card Title</h3>
                <p>Card description goes here. You can use this layout for displaying information, actions, or data.</p>
                <button className="btn-primary">Action Button</button>
              </div>
            </div>
          </div>

          <div className="template-section">
            <h2>Section 2: Data Table</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Column 1</th>
                    <th>Column 2</th>
                    <th>Column 3</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Data 1</td>
                    <td>Data 2</td>
                    <td>Data 3</td>
                    <td>
                      <button className="btn-small">Edit</button>
                      <button className="btn-small danger">Delete</button>
                    </td>
                  </tr>
                  <tr>
                    <td>Data 1</td>
                    <td>Data 2</td>
                    <td>Data 3</td>
                    <td>
                      <button className="btn-small">Edit</button>
                      <button className="btn-small danger">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="template-section">
            <h2>Section 3: Form Example</h2>
            <form className="template-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="input1">Input Field</label>
                  <input 
                    type="text" 
                    id="input1" 
                    placeholder="Enter text here"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="input2">Select Field</label>
                  <select id="input2">
                    <option>Select an option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="textarea">Text Area</label>
                <textarea 
                  id="textarea" 
                  rows="4"
                  placeholder="Enter longer text here"
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Submit</button>
                <button type="reset" className="btn-outline">Clear</button>
              </div>
            </form>
          </div>

          <div className="template-section">
            <h2>Section 4: Typography & Colors</h2>
            <div className="colors-display">
              <div className="color-box" style={{ backgroundColor: 'rgb(244, 240, 228)' }}>
                <span>Light</span>
                <code>(244, 240, 228)</code>
              </div>
              <div className="color-box" style={{ backgroundColor: 'rgb(68, 161, 148)' }}>
                <span>Green</span>
                <code>(68, 161, 148)</code>
              </div>
              <div className="color-box" style={{ backgroundColor: 'rgb(83, 125, 150)' }}>
                <span>Blue</span>
                <code>(83, 125, 150)</code>
              </div>
              <div className="color-box" style={{ backgroundColor: 'rgb(236, 143, 141)' }}>
                <span>Pink</span>
                <code>(236, 143, 141)</code>
              </div>
            </div>

            <div className="typography-guide">
              <h3>Typography</h3>
              <h4>Heading 4</h4>
              <p>Regular paragraph text. This is how body text should look like in the application.</p>
              <h5>Heading 5</h5>
              <small>Small text for captions or meta information</small>
            </div>
          </div>

          <div className="template-section">
            <h2>Section 5: Alerts & Messages</h2>
            <div className="error-message">
              ❌ This is an error message. Use this for errors or important warnings.
            </div>
            <div className="success-message">
              ✅ This is a success message. Use this for confirmations or completed actions.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplatePage;
