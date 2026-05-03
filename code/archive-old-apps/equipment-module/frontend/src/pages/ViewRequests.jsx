import { useState } from "react";
import { getPendingRequests } from "../utils/equipmentApi";

function ViewRequests() {

  const [regNo, setRegNo] = useState("");
  const [requests, setRequests] = useState([]);

  const searchRequests = async () => {
    try {
      const data = await getPendingRequests(regNo);
      setRequests(data);
    } catch (error) {
      alert("Error fetching requests");
    }
  };

  return (
    <div>
      <h2>View Equipment Requests</h2>

      <input
        type="text"
        placeholder="Enter Registration Number"
        value={regNo}
        onChange={(e) => setRegNo(e.target.value)}
      />

      <button onClick={searchRequests}>Search</button>

      <table border="1">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Equipment</th>
            <th>Quantity</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((req) => (
            <tr key={req.request_id}>
              <td>{req.request_id}</td>
              <td>{req.equipment_name}</td>
              <td>{req.requested_quantity}</td>
              <td>{req.request_status}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

export default ViewRequests;