const API_BASE = "http://localhost:3001/api";

function getHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("mr-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const adminAnalytics = async () => {
  const res = await fetch(`${API_BASE}/admin/analytics`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
};

export const adminCheckSelf = async () => {
  const userStr = typeof window !== "undefined" ? localStorage.getItem("mr-user") : null;
  if (!userStr) return { isAdmin: false };
  try {
    const user = JSON.parse(userStr);
    const isAdmin = user.role === "admin" || (user.email && user.email.toLowerCase() === "mediroutehealth@gmail.com");
    return { isAdmin };
  } catch {
    return { isAdmin: false };
  }
};

export const adminListPending = async () => {
  const res = await fetch(`${API_BASE}/pending-hospitals`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch pending submissions");
  return res.json();
};

export const adminApproveHospital = async ({ id }) => {
  const res = await fetch(`${API_BASE}/pending-hospitals/${id}/approve`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to approve hospital");
  return res.json();
};

export const adminRejectHospital = async ({ id }) => {
  const res = await fetch(`${API_BASE}/pending-hospitals/${id}/reject`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to reject hospital");
  return res.json();
};

export const adminListMessages = async () => {
  const res = await fetch(`${API_BASE}/contact-messages`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
};

export const adminResolveMessage = async ({ id, resolved }) => {
  const res = await fetch(`${API_BASE}/contact-messages/${id}/resolve`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ resolved }),
  });
  if (!res.ok) throw new Error("Failed to update message");
  return res.json();
};

export const adminListDoctors = async () => {
  const res = await fetch(`${API_BASE}/doctors`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch doctors");
  return res.json();
};

export const adminCreateDoctor = async (data) => {
  const res = await fetch(`${API_BASE}/doctors`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create doctor");
  return res.json();
};

export const adminUpdateDoctor = async ({ id, patch }) => {
  const res = await fetch(`${API_BASE}/doctors/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update doctor");
  return res.json();
};

export const adminDeleteDoctor = async ({ id }) => {
  const res = await fetch(`${API_BASE}/doctors/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete doctor");
  return res.json();
};

export const adminCreateHospital = async (data) => {
  const res = await fetch(`${API_BASE}/hospitals`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create hospital");
  return res.json();
};

export const adminUpdateHospital = async ({ id, patch }) => {
  const res = await fetch(`${API_BASE}/hospitals/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update hospital");
  return res.json();
};

export const adminDeleteHospital = async ({ id }) => {
  const res = await fetch(`${API_BASE}/hospitals/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete hospital");
  return res.json();
};

export const adminListDepartments = async () => {
  const res = await fetch(`${API_BASE}/departments`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch departments");
  return res.json();
};

export const adminCreateDepartment = async (data) => {
  const res = await fetch(`${API_BASE}/departments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create department");
  return res.json();
};

export const adminDeleteDepartment = async ({ id }) => {
  const res = await fetch(`${API_BASE}/departments/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete department");
  return res.json();
};

export const adminListFacilities = async () => {
  const res = await fetch(`${API_BASE}/facilities`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch facilities");
  return res.json();
};

export const adminCreateFacility = async (data) => {
  const res = await fetch(`${API_BASE}/facilities`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create facility");
  return res.json();
};

export const adminDeleteFacility = async ({ id }) => {
  const res = await fetch(`${API_BASE}/facilities/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete facility");
  return res.json();
};