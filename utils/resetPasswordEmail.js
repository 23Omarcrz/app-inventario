export const resetPasswordEmail = (resetUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Restablecer contraseña</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="500" style="background:#ffffff; border-radius:8px; padding:30px;">
          <tr>
            <td>
              <h2 style="color:#333;">Restablecer contraseña</h2>
              <p style="color:#555;">
                Recibimos una solicitud para restablecer tu contraseña.
              </p>

              <p style="text-align:center; margin:30px 0;">
                <a href="${resetUrl}"
                   style="background:#6d4afe; color:#fff; padding:12px 20px;
                          border-radius:6px; text-decoration:none;">
                  Cambiar contraseña
                </a>
              </p>

              <p style="color:#777; font-size:14px;">
                Este enlace expirará en 15 minutos.
              </p>

              <p style="color:#777; font-size:14px;">
                Si no solicitaste este cambio, puedes ignorar este correo.
              </p>

              <hr />

              <p style="font-size:12px; color:#aaa;">
                Si el botón no funciona, copia y pega este enlace:<br/>
                ${resetUrl}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
