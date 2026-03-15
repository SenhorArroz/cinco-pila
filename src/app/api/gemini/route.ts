import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, financeData } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key não configurada" }, { status: 500 });
    }

    // 1. Definimos o modelo e a URL da API estável (v1)
    const MODEL = "gemini-2.5-flash";
    const URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${apiKey}`;

    // 2. Montamos o corpo da requisição manualmente
    const body = {
      contents: [
        {
          parts: [
            { 
              text: `Você é o assistente financeiro do app Cinco Pila. 
                     Dados do usuário: ${JSON.stringify(financeData)}
                     Pergunta: ${prompt}` 
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 20000,
      }
    };

    // 3. Chamada via Fetch nativo
    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // 4. Tratamento de erro da API
    if (!response.ok) {
      console.error("Erro na API do Google:", data);
      return NextResponse.json({ 
        error: "Erro na API do Google", 
        details: data.error?.message || "Erro desconhecido" 
      }, { status: response.status });
    }

    // 5. Extração do texto da resposta
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Não recebi resposta.";

    return NextResponse.json({ text: aiText });

  } catch (error: any) {
    console.error("Erro interno:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}