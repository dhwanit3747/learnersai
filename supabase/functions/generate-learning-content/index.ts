import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating ${mode} content for topic: ${topic}`);

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "quiz") {
      systemPrompt = `You are an educational AI that creates engaging quizzes. Generate exactly 5 multiple-choice questions about the given topic. Each question should have 4 options with one correct answer. Include explanations for the correct answers.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}`;
      userPrompt = `Create a quiz about: ${topic}`;
    } else if (mode === "flashcards") {
      systemPrompt = `You are an educational AI that creates effective flashcards. Generate exactly 8 flashcards about the given topic. Each flashcard should have a front (question or term) and back (answer or definition).

Return ONLY valid JSON in this exact format:
{
  "cards": [
    {
      "front": "Question or term",
      "back": "Answer or definition"
    }
  ]
}`;
      userPrompt = `Create flashcards about: ${topic}`;
    } else if (mode === "comic") {
      systemPrompt = `You are an educational AI that creates engaging comic-style educational content. Generate exactly 6 panels that explain the topic in a fun, narrative way. Each panel should have a character (professor, student, or narrator) with an emotion expressing content.

Return ONLY valid JSON in this exact format:
{
  "panels": [
    {
      "title": "Panel title",
      "content": "What the character says or explains (2-3 sentences)",
      "character": "professor",
      "emotion": "excited"
    }
  ]
}

Characters: professor, student, narrator
Emotions: happy, thinking, excited, explaining, confused, curious, understanding, amazed`;
      userPrompt = `Create a comic story explaining: ${topic}`;
    } else {
      throw new Error("Invalid mode specified");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    console.log("Raw AI response:", content);

    // Parse the JSON from the response
    let parsedContent;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Failed to parse AI response");
    }

    console.log("Successfully generated content");

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in generate-learning-content:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
