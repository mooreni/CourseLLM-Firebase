"use client";

import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import app from "@/lib/firebase"; // change if your export name/path differs

export const ai = getAI(app, { backend: new GoogleAIBackend() });
export const geminiModel = getGenerativeModel(ai, { model: "gemini-2.5-flash-lite" });
