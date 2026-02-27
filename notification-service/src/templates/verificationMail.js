export const verifyEmailTemplate = (name, otp) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Email Verification</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f6f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:40px;">
          <tr>
            <td align="center" style="font-size:22px;font-weight:bold;color:#111;">
              Verify Your Email
            </td>
          </tr>
          <tr>
            <td style="padding:20px 0;font-size:16px;color:#444;">
              Hi ${name},<br/><br/>
              Please verify your email using this OTP.
            </td>
          </tr>
          <tr>
            <td align="center">
              <div style="display:inline-block;padding:12px 24px;background:#16a34a;color:#fff;border-radius:4px;font-weight:bold;font-size:24px;letter-spacing:2px;">
                ${otp}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding-top:30px;font-size:13px;color:#888;text-align:center;">
              This OTP expires in 15 minutes.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;