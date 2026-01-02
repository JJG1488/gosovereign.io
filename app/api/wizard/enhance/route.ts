import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Initialize Anthropic client
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

type EnhanceType = "tagline" | "about";

interface EnhanceRequest {
  type: EnhanceType;
  storeName: string;
  template: "goods" | "services" | "brochure";
  currentText?: string;
}

export async function POST(request: NextRequest) {
  // Verify user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if Anthropic is configured
  if (!anthropic) {
    return NextResponse.json(
      { error: "AI enhancement is not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json() as EnhanceRequest;
    const { type, storeName, template, currentText } = body;

    if (!storeName || storeName.trim().length === 0) {
      return NextResponse.json(
        { error: "Store name is required" },
        { status: 400 }
      );
    }

    // Build prompt based on type and template
    const prompt = buildPrompt(type, storeName.trim(), template, currentText?.trim());

    // Call Claude API using Haiku for speed and cost
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: type === "tagline" ? 100 : 300,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract the text response
    const textContent = message.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text"
    );
    if (!textContent) {
      throw new Error("No text response from AI");
    }

    const result = textContent.text.trim();

    return NextResponse.json({
      result,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    });
  } catch (err) {
    console.error("AI enhancement error:", err);

    // Handle specific Anthropic errors
    if (err instanceof Anthropic.APIError) {
      if (err.status === 429) {
        return NextResponse.json(
          { error: "Too many requests. Please try again in a moment." },
          { status: 429 }
        );
      }
      if (err.status === 401) {
        return NextResponse.json(
          { error: "AI service configuration error" },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to enhance text" },
      { status: 500 }
    );
  }
}

function buildPrompt(
  type: EnhanceType,
  storeName: string,
  template: "goods" | "services" | "brochure",
  currentText?: string
): string {
  const templateContext = {
    goods: "an e-commerce store selling physical products",
    services: "a service-based business",
    brochure: "a portfolio/personal brand website",
  };

  if (type === "tagline") {
    const base = `You are an expert marketing copywriter. Write a compelling tagline for "${storeName}", ${templateContext[template]}.`;

    const enhancement = currentText
      ? `\n\nThe user has written this draft tagline: "${currentText}"\n\nImprove it while keeping the core idea. Make it punchier and more memorable.`
      : `\n\nCreate a fresh, memorable tagline from scratch.`;

    return `${base}${enhancement}

Requirements:
- Maximum 10-12 words
- Be specific to what the business does (don't be generic)
- Evoke emotion or curiosity
- Avoid cliches like "your one-stop shop" or "where quality meets"
- No quotes around the tagline
- Sound natural and human

Respond with ONLY the tagline, nothing else.`;
  }

  if (type === "about") {
    const base = `You are an expert copywriter. Write an "About" section for "${storeName}", ${templateContext[template]}.`;

    const enhancement = currentText
      ? `\n\nThe user has written this draft: "${currentText}"\n\nImprove it while keeping the core message and tone. Make it more engaging and professional.`
      : `\n\nCreate a compelling About section from scratch.`;

    return `${base}${enhancement}

Requirements:
- 2-3 short paragraphs (about 100-150 words total)
- Focus on the story, mission, or unique value
- Use "we" or "I" perspective appropriately
- Be authentic and personable, not corporate
- Include a subtle call-to-action at the end
- Sound natural and human

Respond with ONLY the about text, no quotes, no prefix.`;
  }

  throw new Error(`Unknown enhancement type: ${type}`);
}
