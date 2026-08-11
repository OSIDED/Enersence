const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";

/**
 * All requests to Spring Boot must use credentials: "include" so the
 * browser sends the httpOnly auth_token cookie set at login. Without
 * this, every protected endpoint (everything except /api/auth/**) 401s
 * silently -- which is exactly what caused "Failed to add device/meter"
 * once SecurityConfig started requiring authentication on these routes.
 */
async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

export type Appliance = {
  applianceId: number;
  meterId: number | null;
  applianceName: string;
  location: string | null;
  powerRatingWatts: number;
  label: string;
};

export type Reading = {
  readingId: number;
  applianceName: string;
  hoursUsed: number;
  energyUsedKwh: number;
  estimatedCost: number;
};

export type Meter = {
  meterId: number;
  meterName: string;
  serialNumber: string;
  meterType: string;
  status: string;
  lastReadingKwh: number;
};

export type Recommendation = {
  recommendationId: number;
  userId: number;
  recommendationType: string;
  message: string;
  createdAt: string;
};

export type DailyUsage = {
  date: string;
  dayLabel: string;
  totalKwh: number;
};

export type CategoryBreakdown = {
  category: string;
  totalKwh: number;
  percentage: number;
};

export type MonthComparison = {
  currentMonthKwh: number;
  previousMonthKwh: number;
  kwhChange: number;
  percentChange: number;
  estimatedBill: number;
};

export type CurrentLoad = {
  currentLoadKw: number;
  activeDeviceCount: number;
};

export type Report = {
  reportId: number;
  reportType: string;
  startDate: string;
  endDate: string;
  totalConsumptionKwh: number;
  estimatedTotalCost: number;
  generatedAt: string;
};

export async function getAppliances(
  userId: number,
  meterId?: number,
): Promise<Appliance[]> {
  const query = meterId
    ? `/api/appliances?user_id=${userId}&meter_id=${meterId}`
    : `/api/appliances?user_id=${userId}`;
  const res = await apiFetch(query, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch appliances");
  return res.json();
}

export async function addAppliance(payload: {
  userId: number;
  meterId: number;
  applianceName: string;
  category: string;
  powerRatingWatts: number;
  location: string;
}): Promise<Appliance> {
  const res = await apiFetch(`/api/appliances`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || "Failed to add device");
  }
  return res.json();
}

export async function deleteAppliance(applianceId: number): Promise<void> {
  const res = await apiFetch(`/api/appliances/${applianceId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete device");
}

export async function getMeters(userId: number): Promise<Meter[]> {
  const res = await apiFetch(`/api/meters?user_id=${userId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch meters");
  return res.json();
}

export async function addMeter(payload: {
  userId: number;
  meterName: string;
  serialNumber: string;
  meterType: string;
}): Promise<Meter> {
  const res = await apiFetch(`/api/meters`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add meter");
  return res.json();
}

export async function deleteMeter(meterId: number): Promise<void> {
  const res = await apiFetch(`/api/meters/${meterId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete meter");
}

export async function getTodayReadings(userId: number): Promise<Reading[]> {
  const res = await apiFetch(`/api/readings/today?user_id=${userId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch today's readings");
  return res.json();
}

export async function getWeeklyHistory(userId: number): Promise<DailyUsage[]> {
  const res = await apiFetch(`/api/readings/history?user_id=${userId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch usage history");
  return res.json();
}

export async function getRecommendations(
  userId: number,
): Promise<Recommendation[]> {
  const res = await apiFetch(`/api/recommendations?user_id=${userId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
}

export async function dismissRecommendation(id: number): Promise<void> {
  const res = await apiFetch(`/api/recommendations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to dismiss recommendation");
}

export async function getCategoryBreakdown(
  userId: number,
): Promise<CategoryBreakdown[]> {
  const res = await apiFetch(
    `/api/reports/category-breakdown?user_id=${userId}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to fetch category breakdown");
  return res.json();
}

export async function getMonthComparison(
  userId: number,
): Promise<MonthComparison> {
  const res = await apiFetch(
    `/api/reports/month-comparison?user_id=${userId}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to fetch month comparison");
  return res.json();
}

export async function getCurrentLoad(userId: number): Promise<CurrentLoad> {
  const res = await apiFetch(`/api/readings/current-load?user_id=${userId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch current load");
  return res.json();
}

export async function getReports(userId: number): Promise<Report[]> {
  const res = await apiFetch(`/api/reports?user_id=${userId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
}

export async function generateReport(userId: number): Promise<Report[]> {
  const res = await apiFetch(`/api/reports/generate?user_id=${userId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to generate report");
  return res.json();
}
