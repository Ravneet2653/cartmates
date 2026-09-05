// Sends transactional email via EmailJS's REST API. EmailJS is normally
// called from browser JavaScript with just a public key (origin-restricted
// for security) — calling it from a backend (a "non-browser" context)
// requires also sending the private key as accessToken, which is what
// tells EmailJS to trust this request despite it not coming from a browser.
export const sendOTPEmail = async (toEmail, otp) => {
  const expiryTime = new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString();

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      // Variable names here MUST exactly match the {{...}} placeholders
      // used inside the EmailJS template itself — this template's fields
      // are email, passcode, and time, not the generic names used elsewhere.
      template_params: {
        email: toEmail,
        passcode: otp,
        time: expiryTime,
      },
    }),
  });

  // EmailJS returns plain text "OK" on success, not JSON — only parse
  // the body when something went wrong, to get a useful error message.
  if (!response.ok) {
    const text = await response.text();
    console.error("EmailJS API error:", text);
    throw new Error("Failed to send verification email");
  }
  return true;
};
