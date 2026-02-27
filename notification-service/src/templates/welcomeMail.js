export const welcomeTemplate = (name) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Welcome</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f6f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:40px;">
          <tr>
            <td align="center" style="font-size:24px;font-weight:bold;color:#111;">
              Welcome to Our Platform 🚀
            </td>
          </tr>
          <tr>
            <td style="padding:20px 0;font-size:16px;color:#444;">
              Hi ${name},<br/><br/>
              We're excited to have you onboard. You can now explore courses, attempt quizzes, and track your progress.
            </td>
          </tr>
          <tr>
            <td align="center">
              <a href="https://yourdomain.com/dashboard"
                 style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">
                Go to Dashboard
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-top:30px;font-size:13px;color:#888;text-align:center;">
              If you have any questions, reply to this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;