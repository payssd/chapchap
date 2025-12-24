import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, teamSize, message } = await request.json();

    if (!name || !email || !company) {
      return NextResponse.json(
        { error: "Name, email, and company are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Store the inquiry
    const { error } = await supabase.from("enterprise_inquiries").insert({
      name,
      email,
      company,
      team_size: teamSize ? parseInt(teamSize.split("-")[0]) : null,
      message,
      status: "new",
    });

    if (error) {
      console.error("Error storing inquiry:", error);
      return NextResponse.json(
        { error: "Failed to submit inquiry" },
        { status: 500 }
      );
    }

    // TODO: Send notification email to sales team
    // TODO: Send auto-response email to prospect

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing inquiry:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
