import axios from "axios";

const base = "http://localhost:3000/api/v1";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTQ3YTEzZDEwMDE1YTE1NzIxNGQ3MGIiLCJyb2xlIjoiaGVhbHRoX3dvcmtlciIsIm1vdGhlclR5cGUiOm51bGwsImhlYWx0aFdvcmtlclR5cGUiOiJ3aXRoX2NsaW5pYyIsImlhdCI6MTc4MzA3OTIzMCwiZXhwIjoxNzgzMDgwMTMwfQ.yf0kp2s-dJCO98FGXyTPycpqa_6FYfphIRTtxCpaVic";

async function run() {
  try {
    const createPatientResp = await axios.post(
      `${base}/healthworker/patients`,
      { name: "AutoPatient", contact: "+19991112233", pregnancyStage: "2nd trimester" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("createPatient:", createPatientResp.data);
    const patientId = createPatientResp.data?.data?.id;
    if (!patientId) return;

    const addLogResp = await axios.post(
      `${base}/healthworker/patients/${patientId}/healthlogs`,
      { temperature: 36.9, weight: 62.3, bloodLevel: 11.9, bloodPressure: "118/78", riskStatus: "safe", medicalHistory: "none" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("addHealthLog:", addLogResp.data);

    const visitResp = await axios.post(
      `${base}/healthworker/patients/${patientId}/visits`,
      { visitDate: new Date().toISOString(), durationMinutes: 25, notes: "Routine CHW visit" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("logVisit:", visitResp.data);

    const dashboard = await axios.get(`${base}/healthworker/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
    console.log("dashboard:", JSON.stringify(dashboard.data, null, 2));
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

run();
