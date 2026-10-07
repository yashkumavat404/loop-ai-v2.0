export async function sendSignupOtpEmail(
  email: string,
  otp: string,
) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  if (!fromEmail) {
    throw new Error("BREVO_FROM_EMAIL is not configured");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "LOOP",
        email: fromEmail,
      },
      to: [{ email }],
      subject: "Your LOOP verification code",
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#17263a">
          <h1 style="margin:0 0 8px;font-size:24px">Verify your LOOP account</h1>
          <p style="color:#64748b;line-height:1.6">Enter this 4-digit code to verify your email address and continue creating your workspace.</p>
          <div style="margin:28px 0;padding:20px;text-align:center;border-radius:14px;background:#f1f5ff;border:1px solid #dbe5ff">
            <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#2f6fed">${otp}</span>
          </div>
          <p style="color:#64748b;font-size:13px">This code expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>
          <p style="margin-top:28px;font-size:12px;color:#94a3b8">LOOP · AI-powered customer feedback intelligence</p>
        </div>
      `,
      textContent: `Your LOOP verification code is ${otp}. This code expires in 10 minutes.`,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Brevo email failed:", details);
    throw new Error("Unable to send verification email.");
  }
}
