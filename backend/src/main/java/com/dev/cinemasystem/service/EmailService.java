package com.dev.cinemasystem.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;

    public void sendForgotPasswordOtp(String to, String otp, int otpExpireMinutes) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Mã OTP đặt lại mật khẩu - Galaxy Cinema");
            helper.setText(buildForgotPasswordOtpHtml(otp, otpExpireMinutes), true);

            javaMailSender.send(message);
        } catch (MessagingException exception) {
            throw new RuntimeException("Không thể gửi email OTP", exception);
        }
    }

    private String buildForgotPasswordOtpHtml(String otp, int otpExpireMinutes) {
        return """
                <!doctype html>
                <html lang="vi">
                  <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Mã OTP đặt lại mật khẩu</title>
                  </head>
                  <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:24px 12px;">
                      <tr>
                        <td align="center">
                          <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 16px 40px rgba(15,23,42,0.12);">
                            <tr>
                              <td style="padding:0;background:linear-gradient(135deg,#F58020 0%%,#FB9440 100%%);">
                                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="padding:26px 28px 22px;">
                                      <div style="font-size:12px;letter-spacing:.12em;color:#fff3e8;text-transform:uppercase;font-weight:700;">
                                        Galaxy Cinema 
                                      </div>
                                      <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;color:#ffffff;">
                                        Xác thực đặt lại mật khẩu
                                      </h1>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:26px 28px 10px;">
                                <p style="margin:0 0 14px;font-size:15px;line-height:1.7;">
                                  Xin chào,
                                </p>
                                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
                                  Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Cinema Booking.
                                  Vui lòng sử dụng mã OTP bên dưới để tiếp tục.
                                </p>

                                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
                                  <tr>
                                    <td style="border:2px dashed #FDBA8C;border-radius:16px;background:#FFF7ED;padding:12px;text-align:center;">
                                      <div style="font-size:12px;color:#9a3412;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;">
                                        Mã OTP của bạn
                                      </div>
                                      <div style="font-size:36px;line-height:1.2;font-weight:800;letter-spacing:.28em;color:#EA580C;text-indent:.28em;">
                                        %s
                                      </div>
                                    </td>
                                  </tr>
                                </table>

                                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin:0 0 10px;">
                                  <tr>
                                    <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:14px 16px;">
                                      <p style="margin:0;font-size:14px;line-height:1.7;color:#334155;">
                                        Mã OTP có hiệu lực trong <strong style="color:#F58020;">%d phút</strong>.
                                        Không chia sẻ mã này với bất kỳ ai để bảo vệ tài khoản của bạn.
                                      </p>
                                    </td>
                                  </tr>
                                </table>

                                <p style="margin:16px 0 0;font-size:14px;line-height:1.7;color:#64748B;">
                                  Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
                                </p>
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:22px 28px 26px;border-top:1px solid #E2E8F0;">
                                <p style="margin:0;font-size:13px;line-height:1.7;color:#94A3B8;">
                                  Trân trọng,<br/>
                                  <strong style="color:#334155;">Galaxy Cinema</strong>
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(otp, otpExpireMinutes);
    }
}
