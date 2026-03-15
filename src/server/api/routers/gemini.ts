import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(key!);
    // Usando text-only model para testar
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log("Tentando prompt ultra simples...");
    const result = await model.generateContent("Oi, diga 'Cinco Pila Online'");
    const response = await result.response;
    
    return NextResponse.json({ text: response.text() });
  } catch (error: any) {
    console.error("ERRO DETALHADO NO TERMINAL:", error); // OLHE O TERMINAL DO VS CODE
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}