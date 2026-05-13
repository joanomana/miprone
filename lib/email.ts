import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const baseStyle = `
  font-family: 'Segoe UI', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
`

const headerStyle = `
  background: #16a34a;
  padding: 32px 24px;
  text-align: center;
`

const bodyStyle = `
  padding: 32px 24px;
  color: #374151;
  line-height: 1.6;
`

const footerStyle = `
  background: #f9fafb;
  padding: 16px 24px;
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  border-top: 1px solid #e5e7eb;
`

export async function enviarEmailBienvenida(
  email: string,
  nombre: string,
  nombreFinca: string
): Promise<void> {
  const html = `
    <div style="${baseStyle}">
      <div style="${headerStyle}">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">MiProne</h1>
        <p style="color: #bbf7d0; margin: 8px 0 0; font-size: 14px;">Mi Producción, Mi Negocio</p>
      </div>

      <div style="${bodyStyle}">
        <h2 style="color: #111827; margin-top: 0;">¡Bienvenido/a, ${nombre}!</h2>
        <p>
          Tu cuenta ha sido creada exitosamente y la finca
          <strong style="color: #16a34a;">${nombreFinca}</strong>
          ya está registrada en MiProne.
        </p>
        <p>Ahora puedes:</p>
        <ul style="padding-left: 20px; color: #4b5563;">
          <li>Registrar la producción diaria de huevos por galpón</li>
          <li>Controlar el consumo y el inventario de alimento</li>
          <li>Recibir alertas inteligentes sobre tu producción</li>
          <li>Ver reportes y tendencias de tu negocio</li>
        </ul>
        <div style="margin-top: 32px; text-align: center;">
          <a href="${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/dashboard"
             style="background: #16a34a; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
            Ir al Dashboard
          </a>
        </div>
      </div>

      <div style="${footerStyle}">
        <p style="margin: 0;">MiProne — Proyecto de Ingeniería II · UNAD 2026</p>
        <p style="margin: 4px 0 0;">Este correo fue generado automáticamente. Por favor no respondas.</p>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? `MiProne <${process.env.SMTP_USER}>`,
    to: email,
    subject: `¡Bienvenido/a a MiProne, ${nombre}!`,
    html,
  })
}

export async function enviarEmailAlertaCritica(
  email: string,
  alerta: { titulo: string; mensaje: string; galpon: string }
): Promise<void> {
  const html = `
    <div style="${baseStyle}">
      <div style="background: #dc2626; padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">MiProne</h1>
        <p style="color: #fecaca; margin: 8px 0 0; font-size: 14px;">Alerta Crítica</p>
      </div>

      <div style="${bodyStyle}">
        <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
          <p style="color: #dc2626; font-weight: 700; margin: 0 0 4px; font-size: 16px;">
            ⚠ ${alerta.titulo}
          </p>
          <p style="color: #374151; margin: 0; font-size: 14px;">Galpón: <strong>${alerta.galpon}</strong></p>
        </div>

        <p style="color: #374151;">${alerta.mensaje}</p>

        <p style="color: #6b7280; font-size: 14px;">
          Ingresa a tu panel para revisar el estado del galpón y tomar las acciones necesarias.
        </p>

        <div style="margin-top: 24px; text-align: center;">
          <a href="${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/alertas"
             style="background: #dc2626; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
            Ver Alertas
          </a>
        </div>
      </div>

      <div style="${footerStyle}">
        <p style="margin: 0;">MiProne — Proyecto de Ingeniería II · UNAD 2026</p>
        <p style="margin: 4px 0 0;">Este correo fue generado automáticamente. Por favor no respondas.</p>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? `MiProne <${process.env.SMTP_USER}>`,
    to: email,
    subject: `🚨 Alerta crítica: ${alerta.titulo}`,
    html,
  })
}
