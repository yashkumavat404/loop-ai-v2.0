import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

type ReportContent = {
  summary?: string;
  topThemes?: Array<{
    name: string;
    count: number;
  }>;
  sentimentShifts?: Array<{
    sentiment: string;
    change: string;
  }>;
  quotes?: Array<{
    feedbackId: string;
    quote: string;
  }>;
  recommendedActions?: string[];
};

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Report ID is required." },
        { status: 400 },
      );
    }

    const report = await db.report.findFirst({
      where: {
        id,
        workspaceId: user.workspaceId,
      },
    });

    if (!report) {
      return NextResponse.json(
        { message: "Report not found." },
        { status: 404 },
      );
    }

    const content = report.content as ReportContent;

    const pdf = await PDFDocument.create();

    const font = await pdf.embedFont(
      StandardFonts.Helvetica,
    );

    const boldFont = await pdf.embedFont(
      StandardFonts.HelveticaBold,
    );

    let page = pdf.addPage([595, 842]);

    const margin = 45;
    const pageWidth = 595;
    const pageHeight = 842;
    const maxWidth = pageWidth - margin * 2;

    let y = pageHeight - margin;

    const addPageIfNeeded = (height = 20) => {
      if (y - height < margin) {
        page = pdf.addPage([595, 842]);
        y = pageHeight - margin;
      }
    };

    const drawText = (
      text: string,
      size = 11,
      bold = false,
    ) => {
      const lines = text.split("\n");

      for (const line of lines) {
        addPageIfNeeded(size + 8);

        page.drawText(line, {
          x: margin,
          y,
          size,
          font: bold ? boldFont : font,
          color: rgb(0.12, 0.16, 0.23),
          maxWidth,
        });

        y -= size + 7;
      }
    };

    const drawHeading = (text: string) => {
      addPageIfNeeded(35);

      y -= 8;

      page.drawText(text, {
        x: margin,
        y,
        size: 15,
        font: boldFont,
        color: rgb(0.18, 0.24, 0.45),
      });

      y -= 25;
    };

    // Title
    drawText("LOOP", 24, true);

    y -= 5;

    drawText(report.title, 18, true);

    drawText(
      `Period: ${report.periodStart.toLocaleDateString()} - ${report.periodEnd.toLocaleDateString()}`,
      10,
    );

    y -= 10;

    // Summary
    drawHeading("Executive Summary");

    drawText(
      content.summary ?? "No summary available.",
      11,
    );

    // Top Themes
    if (content.topThemes?.length) {
      drawHeading("Top Themes");

      for (const theme of content.topThemes) {
        drawText(
          `${theme.name} — ${theme.count} mentions`,
          11,
        );
      }
    }

    // Sentiment
    if (content.sentimentShifts?.length) {
      drawHeading("Sentiment Shifts");

      for (const item of content.sentimentShifts) {
        drawText(
          `${item.sentiment}: ${item.change}`,
          11,
        );
      }
    }

    // Quotes
    if (content.quotes?.length) {
      drawHeading("Customer Quotes");

      for (const item of content.quotes) {
        drawText(`"${item.quote}"`, 10);
        y -= 4;
      }
    }

    // Recommended Actions
    if (content.recommendedActions?.length) {
      drawHeading("Recommended Actions");

      content.recommendedActions.forEach(
        (action, index) => {
          drawText(
            `${index + 1}. ${action}`,
            11,
          );
        },
      );
    }

    const pdfBytes = await pdf.save();

    return new NextResponse(
      Buffer.from(pdfBytes),
      {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition":
            `attachment; filename="loop-report-${report.id}.pdf"`,
        },
      },
    );
  } catch (error) {
    console.error(
      "Report export error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "";

    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { message: "Failed to export report." },
      { status: 500 },
    );
  }
}