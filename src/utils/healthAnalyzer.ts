import axios from "axios";
import { getGlobalStorage } from "../context/StorageContext";

export interface HealthReport {
  id: string;
  userId: string;
  date: string;
  symptoms: string[]; 
  causes: string[];
  deficiencies: string[];
  prevention: string[];
  cure: string[];
  medicines: string[];
  yoga: string[];
  exercises: string[];
  foodsToEat: string[];
  foodsToAvoid: string[];
  thingsToFollow: string[];
  thingsToAvoid: string[];
  naturalRemedies: string[];
  healthScore: number;
  summary: string;
  rawInput: string;
}

const API_URL = "http://localhost:5000/api/weekly-planner/generate-analysis?type=report"; // update as needed

export async function analyzeHealth(symptomsText: string, userId: string): Promise<HealthReport> {
  try {
    const response = await axios.post(`${API_URL}`, { symptomsText, userId });
    console.log("Backend response:", response);

    if (!response.data || !response.data.success) {
      throw new Error("Failed to fetch report from backend");
    }

    const aiData = response.data.data || {};
    const rawAI = response.data.rawAI || "";

    const report: HealthReport = {
      id: Date.now().toString(),
      userId,
      date: new Date().toISOString(),
      symptoms: aiData.symptoms || [],
      causes: aiData.causes || [],
      deficiencies: aiData.deficiencies || [],
      prevention: aiData.prevention || [],
      cure: aiData.cure || aiData.remedies || [],
      medicines: aiData.medicines || [],
      yoga: aiData.yoga || [],
      exercises: aiData.exercises || [],
      foodsToEat: aiData.foodsToEat || [],
      foodsToAvoid: aiData.foodsToAvoid || [],
      thingsToFollow: aiData.thingsToFollow || [],
      thingsToAvoid: aiData.thingsToAvoid || [],
      naturalRemedies: aiData.naturalRemedies || [],
      healthScore: aiData.healthScore || 70,
      summary:
        aiData.summary ||
        `Based on your symptoms, we've identified ${aiData.symptoms?.length || 0} health concern(s). 
         This report includes personalized causes, remedies, and lifestyle recommendations.`,
      rawInput: rawAI || symptomsText,
    };

    saveReport(report);
    return report;
  } catch (error: any) {
    console.error("Error analyzing health:", error.message || error);
    throw new Error("Unable to analyze health at the moment. Please try again later.");
  }
}

// Storage utilities
export function saveReport(report: HealthReport) {
  const storage = getGlobalStorage();
  const reports = JSON.parse(storage.getItem("healthReports") || "[]");
  reports.unshift(report);
  storage.setItem("healthReports", JSON.stringify(reports));
}

export function getReports(userId: string): HealthReport[] {
  const storage = getGlobalStorage();
  const reports = JSON.parse(storage.getItem("healthReports") || "[]");
  return reports.filter((r: HealthReport) => r.userId === userId);
}

export function getReportById(id: string): HealthReport | null {
  const storage = getGlobalStorage();
  const reports = JSON.parse(storage.getItem("healthReports") || "[]");
  return reports.find((r: HealthReport) => r.id === id) || null;
}

export function calculateAverageHealthScore(userId: string): number {
  const reports = getReports(userId);
  if (reports.length === 0) return 0;
  const sum = reports.reduce((acc, report) => acc + report.healthScore, 0);
  return Math.round(sum / reports.length);
}
