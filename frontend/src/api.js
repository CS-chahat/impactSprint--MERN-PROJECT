// ── API helper — all backend communication flows through here ──
const API = "/api";

const getToken = () => localStorage.getItem("is_token");

const headers = (json = true) => {
  const h = {};
  const token = getToken();
  if (token) h["Authorization"] = `Bearer ${token}`;
  if (json) h["Content-Type"] = "application/json";
  return h;
};

const handleRes = async (res) => {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      res.ok
        ? "Server returned invalid JSON"
        : `Server error (${res.status})`
    );
  }
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};

// ── Auth ──
export const apiLogin = async (email, password) => {
  try {
    const response = await fetch(`${API}/auth/login`, { 
      method: "POST", 
      headers: headers(), 
      body: JSON.stringify({ email, password }), 
      credentials: "include" 
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseErr) {
        if (response.status === 404 || response.status >= 500) {
          throw new Error('Server Error');
        }
        throw new Error(`HTTP Error ${response.status}`);
      }
      throw new Error(errorData.message || 'Request failed');
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("apiLogin fetch exception:", err);
    throw err;
  }
};

export const apiRegister = (body) =>
  fetch(`${API}/auth/register`, { method: "POST", headers: headers(), body: JSON.stringify(body), credentials: "include" }).then(handleRes);

export const apiGetMe = () =>
  fetch(`${API}/auth/me`, { headers: headers(), credentials: "include" }).then(handleRes);

export const apiUpdateProfile = (body) =>
  fetch(`${API}/auth/profile`, { method: "PUT", headers: headers(), body: JSON.stringify(body), credentials: "include" }).then(handleRes);

export const apiLogout = () =>
  fetch(`${API}/auth/logout`, { method: "POST", headers: headers(), credentials: "include" }).then(handleRes);

export const apiGetAllUsers = () =>
  fetch(`${API}/auth/users`, { headers: headers(), credentials: "include" }).then(handleRes);

// ── Sprints ──
export const apiGetSprints = () =>
  fetch(`${API}/sprints`, { headers: headers(), credentials: "include" }).then(handleRes);

export const apiGetSprint = (id) =>
  fetch(`${API}/sprints/${id}`, { headers: headers(), credentials: "include" }).then(handleRes);

export const apiCreateSprint = (body) =>
  fetch(`${API}/sprints`, { method: "POST", headers: headers(), body: JSON.stringify(body), credentials: "include" }).then(handleRes);

export const apiAcceptSprint = (id) =>
  fetch(`${API}/sprints/${id}/accept`, { method: "PUT", headers: headers(), credentials: "include" }).then(handleRes);

export const apiSubmitSprint = (id, body) =>
  fetch(`${API}/sprints/${id}/submit`, { method: "PUT", headers: headers(), body: JSON.stringify(body), credentials: "include" }).then(handleRes);

export const apiStopSprint = (id) =>
  fetch(`${API}/sprints/${id}/stop`, { method: "PUT", headers: headers(), credentials: "include" }).then(handleRes);

export const apiVerifyImpact = (id) =>
  fetch(`${API}/sprints/${id}/verify-impact`, { method: "PUT", headers: headers(), credentials: "include" }).then(handleRes);

export const apiDisagreeSprint = (id, revisionNote) =>
  fetch(`${API}/sprints/${id}/disagree`, { method: "PUT", headers: headers(), body: JSON.stringify({ revisionNote }), credentials: "include" }).then(handleRes);

export const apiGetAIRecommendations = () =>
  fetch(`${API}/sprints/ai-recommendations`, { headers: headers(), credentials: "include" }).then(handleRes);

// ── Certificates ──
export const apiGetMyCertificates = () =>
  fetch(`${API}/sprints/certificates/me`, { headers: headers(), credentials: "include" }).then(handleRes);

export const apiGetAllCertificates = () =>
  fetch(`${API}/sprints/certificates/all`, { headers: headers(), credentials: "include" }).then(handleRes);

export const apiDownloadCertPDF = (certId) =>
  fetch(`${API}/sprints/certificates/${certId}/pdf`, { headers: headers(false), credentials: "include" })
    .then(res => {
      if (!res.ok) throw new Error("PDF download failed");
      return res.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ImpactSprint-Certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

// ── Admin ──
export const apiGetAdminFeed = () =>
  fetch(`${API}/sprints/admin/feed`, { headers: headers(), credentials: "include" }).then(handleRes);

export const apiDeleteUser = (userId) =>
  fetch(`${API}/auth/users/${userId}`, { method: "DELETE", headers: headers(), credentials: "include" }).then(handleRes);
