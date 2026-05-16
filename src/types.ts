export type UserRole = "USER" | "RESCUE_TEAM" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface DisasterReport {
  id: string;
  userId: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  disasterType: string;
  description: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  resourcesReq: string[];
  status: "REPORTED" | "ASSIGNED" | "RESOLVED";
  assignedTeamId?: string;
  createdAt: string;
}

export interface SOSAlert {
  id: string;
  userId: string;
  location: {
    lat: number;
    lng: number;
  };
  missingPersonName: string;
  status: "ACTIVE" | "RESOLVED";
  createdAt: string;
}

export interface ResourceItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  location: string;
}
