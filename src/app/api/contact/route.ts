import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = contactFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Невалидни данни." },
        { status: 400 }
      );
    }

    // In production: forward to webhook / CRM / email service
    console.log("API contact submission:", result.data);

    return NextResponse.json({
      success: true,
      message: "Благодарим! Ще се свържем с вас до 24 часа.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Възникна грешка. Моля, опитайте отново." },
      { status: 500 }
    );
  }
}
