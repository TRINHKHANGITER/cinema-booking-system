package com.dev.cinemasystem.service;

import com.dev.cinemasystem.entity.*;
import com.dev.cinemasystem.enums.PaymentStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.repository.*;
import com.nimbusds.jose.Payload;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.checkerframework.checker.nullness.qual.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class EmailService {
    @NonFinal
    @Value("${spring.mail.username}")
    String myEmail;

    final JavaMailSender javaMailSender;
    final OrderRepository orderRepository;
    final OrderComboRepository orderComboRepository;
    final TicketRepository ticketRepository;
    final UserRepository userRepository;
    final PaymentRepository paymentRepository;

    public void sendForgotPasswordOtp(String to, String otp, int otpExpireMinutes) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

            helper.setFrom(myEmail);
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

    public void sendVerifyEmailOtp(String to, String otp, int otpExpireMinutes) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

            helper.setFrom(myEmail);
            helper.setTo(to);
            helper.setSubject("Mã OTP xác thực tài khoản - Galaxy Cinema");
            helper.setText(buildVerifyEmailOtpHtml(otp, otpExpireMinutes), true);

            javaMailSender.send(message);
        } catch (MessagingException exception) {
            throw new RuntimeException("Không thể gửi email OTP xác thực", exception);
        }
    }

    private String buildVerifyEmailOtpHtml(String otp, int otpExpireMinutes) {
        return """
                <!doctype html>
                <html lang="vi">
                  <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Mã OTP xác thực email</title>
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
                                        Xác thực địa chỉ email
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
                                  Cảm ơn bạn đã đăng ký tài khoản tại Cinema Booking.
                                  Vui lòng nhập mã OTP bên dưới để hoàn tất xác thực email.
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
                                  Nếu bạn không thực hiện đăng ký tài khoản, vui lòng bỏ qua email này.
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

    public void sendChangeEmailOtp(String to, String otp, int otpExpireMinutes) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

            helper.setFrom(myEmail);
            helper.setTo(to);
            helper.setSubject("Mã OTP đổi email - Cinema Booking");
            helper.setText(buildChangeEmailOtpHtml(otp, otpExpireMinutes), true);

            javaMailSender.send(message);
        } catch (MessagingException exception) {
            throw new RuntimeException("Không thể gửi email OTP đổi email", exception);
        }
    }

    private String buildChangeEmailOtpHtml(String otp, int otpExpireMinutes) {
        return """
                <!doctype html>
                <html lang="vi">
                  <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Mã OTP đổi email</title>
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
                                        Cinema Booking
                                      </div>
                                      <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;color:#ffffff;">
                                        Xác thực đổi email
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
                                  Bạn đang yêu cầu đổi email cho tài khoản Cinema Booking.
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
                                        Mã OTP này có hiệu lực trong <strong style="color:#F58020;">%d phút</strong>.
                                        Nếu bạn không yêu cầu, vui lòng bỏ qua email này.
                                      </p>
                                    </td>
                                  </tr>
                                </table>

                                <p style="margin:16px 0 0;font-size:14px;line-height:1.7;color:#64748B;">
                                  Trân trọng,
                                </p>
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:22px 28px 26px;border-top:1px solid #E2E8F0;">
                                <p style="margin:0;font-size:13px;line-height:1.7;color:#94A3B8;">
                                  <strong style="color:#334155;">Cinema Booking System</strong>
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

    public void sendTicketWithCombo(int orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        Payment payment = paymentRepository
                .findTopByOrder_OrderIdAndStatusOrderByPaymentIdDesc(orderId, PaymentStatus.SUCCESS)
                .or(() -> paymentRepository.findTopByOrder_OrderIdOrderByPaymentIdDesc(orderId))
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (order.getUser() == null || order.getUser().getUserId() == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        User user = userRepository.findById(order.getUser().getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

            helper.setFrom(myEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Thông tin đặt vé xem phim - Mã Thanh toán %s".formatted(payment.getPaymentId()));
            helper.setText(buildTicketEmailHtml(order), true);

            javaMailSender.send(message);
        } catch (MessagingException exception) {
            throw new RuntimeException("Không thể gửi email OTP đổi email", exception);
        }
    }

//    private String buildTicketEmailHtml(Order order) {
//        if (order == null) {
//            throw new AppException(ErrorCode.ORDER_NOT_FOUND);
//        }
//
//        List<OrderCombo> orderCombos = orderComboRepository.findAllByOrder_OrderId(order.getOrderId());
//        List<Ticket> tickets = ticketRepository.findAllByOrder_OrderId(order.getOrderId());
//        ShowTime showTime = tickets.get(0).getShow();
//        Movie movie = showTime.getMovie();
//        Room room = showTime.getRoom();
//        Cinema cinema = room.getCinema();
//        long seatQuantity = tickets.toArray().length;
//        StringBuilder itemRows = buildItemRows(tickets, orderCombos);
//
//        return """
//            <!doctype html>
//            <html lang="vi">
//              <head>
//                <meta charset="UTF-8" />
//                <title>Xác nhận đặt vé</title>
//              </head>
//              <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#2b2b2b;">
//                <table width="100%%" cellpadding="0" cellspacing="0" style="padding:20px;background:#f6f7fb;">
//                  <tr>
//                    <td align="center">
//                      <table width="100%%" cellpadding="0" cellspacing="0" style="max-width:720px;background:#fff;border:1px solid #e5e7eb;padding:28px;">
//
//                        <tr>
//                          <td>
//                            <table width="100%%">
//                              <tr>
//                                <td>
//                                  <h2 style="margin:0 0 20px;font-size:22px;">%s</h2>
//                                  <p style="margin:0 0 18px;font-size:14px;">%s</p>
//                                  <p style="margin:0 0 24px;color:#8a2be2;font-size:16px;">
//                                    XÁC NHẬN ĐẶT VÉ THÀNH CÔNG
//                                  </p>
//                                </td>
//                                <td align="right">
//                                  <div style="font-size:28px;font-weight:800;color:#111;">CINEMA</div>
//                                </td>
//                              </tr>
//                            </table>
//                          </td>
//                        </tr>
//
//                        <tr>
//                          <td>
//                            <h3 style="font-size:20px;margin:0 0 24px;">MÃ VÉ: %s</h3>
//
//                            <table cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.8;margin-bottom:26px;">
//                              <tr>
//                                <td style="width:120px;">PHIM</td>
//                                <td>: %s</td>
//                              </tr>
//                              <tr>
//                                <td>SUẤT CHIẾU</td>
//                                <td>: %s</td>
//                              </tr>
//                              <tr>
//                                <td>PHÒNG CHIẾU</td>
//                                <td>: %s</td>
//                              </tr>
//                              <tr>
//                                <td>RẠP</td>
//                                <td>: %s</td>
//                              </tr>
//                              <tr>
//                                <td>SỐ GHẾ</td>
//                                <td>: %s</td>
//                              </tr>
//                            </table>
//                          </td>
//                        </tr>
//
//                        <tr>
//                          <td>
//                            <table width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
//                              <thead>
//                                <tr style="background:#8a2be2;color:#fff;">
//                                  <th style="padding:12px;border:1px solid #8a2be2;">STT</th>
//                                  <th style="padding:12px;border:1px solid #8a2be2;">MẶT HÀNG</th>
//                                  <th style="padding:12px;border:1px solid #8a2be2;">SỐ LƯỢNG</th>
//                                  <th style="padding:12px;border:1px solid #8a2be2;">ĐƠN GIÁ</th>
//                                  <th style="padding:12px;border:1px solid #8a2be2;">THÀNH TIỀN (VNĐ)</th>
//                                </tr>
//                              </thead>
//                              <tbody>
//                                %s
//                                <tr style="background:#8a2be2;color:#fff;font-weight:bold;">
//                                  <td colspan="4" style="padding:12px;border:1px solid #8a2be2;">TỔNG TIỀN (VNĐ)</td>
//                                  <td style="padding:12px;border:1px solid #8a2be2;text-align:right;">%s</td>
//                                </tr>
//                              </tbody>
//                            </table>
//                          </td>
//                        </tr>
//
//                        <tr>
//                          <td>
//                            <p style="margin:22px 0 0;font-size:13px;">
//                              Cảm ơn Quý khách đã tin tưởng và đặt vé xem phim tại Cinema. Chúc Quý khách xem phim vui vẻ.
//                            </p>
//                          </td>
//                        </tr>
//
//                      </table>
//                    </td>
//                  </tr>
//                </table>
//              </body>
//            </html>
//            """.formatted(
//                "CINEMA",
//                cinema.getCinemaName(),
//                order.getOrderId(),
//                showTime.getMovie().getMovieName(),
//                showTime.getStartTime(),
//                room.getRoomName(),
//                cinema.getCinemaName(),
//                seatQuantity,
//                itemRows.toString(),
//                formatCurrency(order.getNetAmount())
//        );
//    }

    private String buildTicketEmailHtml(Order order) {
        if (order == null) {
            throw new AppException(ErrorCode.ORDER_NOT_FOUND);
        }

        List<OrderCombo> orderCombos = orderComboRepository.findAllByOrder_OrderId(order.getOrderId());
        List<Ticket> tickets = ticketRepository.findAllByOrder_OrderId(order.getOrderId());

        ShowTime showTime = tickets.get(0).getShow();
        Movie movie = showTime.getMovie();
        Room room = showTime.getRoom();
        Cinema cinema = room.getCinema();

        long seatQuantity = tickets.size();
        StringBuilder itemRows = buildItemRows(tickets, orderCombos);

        return """
            <!doctype html>
            <html lang="vi">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Xác nhận đặt vé</title>
              </head>

              <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:24px 12px;">
                  <tr>
                    <td align="center">
                      <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:720px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 16px 40px rgba(15,23,42,0.12);">

                        <tr>
                          <td style="padding:0;background:linear-gradient(135deg,#F58020 0%%,#FB9440 100%%);">
                            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding:26px 28px 22px;">
                                  <div style="font-size:12px;letter-spacing:.12em;color:#fff3e8;text-transform:uppercase;font-weight:700;">
                                    Galaxy Cinema
                                  </div>
                                  <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;color:#ffffff;">
                                    Xác nhận đặt vé thành công
                                  </h1>
                                  <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#fff7ed;">
                                    Cảm ơn bạn đã đặt vé tại %s.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                        <tr>
                          <td style="padding:26px 28px 10px;">
                            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
                              <tr>
                                <td style="border:2px dashed #FDBA8C;border-radius:16px;background:#FFF7ED;padding:16px;text-align:center;">
                                  <div style="font-size:12px;color:#9a3412;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;">
                                    Mã vé của bạn
                                  </div>
                                  <div style="font-size:28px;line-height:1.3;font-weight:800;color:#EA580C;">
                                    %s
                                  </div>
                                </td>
                              </tr>
                            </table>

                            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
                              <tr>
                                <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:16px 18px;">
                                  <h2 style="margin:0 0 12px;font-size:18px;line-height:1.4;color:#111827;">
                                    Thông tin suất chiếu
                                  </h2>

                                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.8;color:#334155;">
                                    <tr>
                                      <td style="width:130px;color:#64748B;">Phim</td>
                                      <td style="font-weight:700;color:#1f2937;">%s</td>
                                    </tr>
                                    <tr>
                                      <td style="color:#64748B;">Suất chiếu</td>
                                      <td>%s</td>
                                    </tr>
                                    <tr>
                                      <td style="color:#64748B;">Phòng chiếu</td>
                                      <td>%s</td>
                                    </tr>
                                    <tr>
                                      <td style="color:#64748B;">Rạp</td>
                                      <td>%s</td>
                                    </tr>
                                    <tr>
                                      <td style="color:#64748B;">Số ghế</td>
                                      <td>%s</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>

                            <h2 style="margin:0 0 12px;font-size:18px;line-height:1.4;color:#111827;">
                              Chi tiết đơn hàng
                            </h2>

                            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;font-size:14px;overflow:hidden;border-radius:14px;border:1px solid #E2E8F0;">
                              <thead>
                                <tr style="background:#F58020;color:#ffffff;">
                                  <th style="padding:12px 10px;text-align:center;">STT</th>
                                  <th style="padding:12px 10px;text-align:left;">Mặt hàng</th>
                                  <th style="padding:12px 10px;text-align:center;">Số lượng</th>
                                  <th style="padding:12px 10px;text-align:right;">Đơn giá</th>
                                  <th style="padding:12px 10px;text-align:right;">Thành tiền</th>
                                </tr>
                              </thead>
                              <tbody>
                                %s
                                <tr style="background:#FFF7ED;font-weight:800;color:#EA580C;">
                                  <td colspan="4" style="padding:14px 10px;border-top:1px solid #FDBA8C;text-align:right;">
                                    Tổng tiền
                                  </td>
                                  <td style="padding:14px 10px;border-top:1px solid #FDBA8C;text-align:right;">
                                    %s
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin:18px 0 0;">
                              <tr>
                                <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:14px 16px;">
                                  <p style="margin:0;font-size:14px;line-height:1.7;color:#334155;">
                                    Vui lòng xuất trình mã vé này tại quầy hoặc khu vực soát vé trước giờ chiếu.
                                    Chúc bạn xem phim vui vẻ!
                                  </p>
                                </td>
                              </tr>
                            </table>

                            <p style="margin:16px 0 0;font-size:14px;line-height:1.7;color:#64748B;">
                              Nếu bạn không thực hiện giao dịch này, vui lòng liên hệ rạp để được hỗ trợ.
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
            """.formatted(
                cinema.getCinemaName(),
                order.getOrderId(),
                movie.getMovieName(),
                showTime.getStartTime(),
                room.getRoomName(),
                cinema.getCinemaName(),
                seatQuantity,
                itemRows.toString(),
                formatCurrency(order.getNetAmount())
        );
    }

    private @NonNull StringBuilder buildItemRows(List<Ticket> tickets, List<OrderCombo> orderCombos) {
        StringBuilder itemRows = new StringBuilder();

        int index = 1;

        for (Ticket ticket : tickets) {
            itemRows.append("""
            <tr style="background:%s;">
              <td style="padding:12px 10px;border-top:1px solid #E2E8F0;text-align:center;">
                %d
              </td>

              <td style="padding:12px 10px;border-top:1px solid #E2E8F0;text-align:left;color:#1F2937;font-weight:600;">
                %s
              </td>

              <td style="padding:12px 10px;border-top:1px solid #E2E8F0;text-align:center;">
                %d
              </td>

              <td style="padding:12px 10px;border-top:1px solid #E2E8F0;text-align:right;color:#334155;">
                %s
              </td>

              <td style="padding:12px 10px;border-top:1px solid #E2E8F0;text-align:right;font-weight:700;color:#EA580C;">
                %s
              </td>
            </tr>
            """.formatted(
                    index % 2 == 0 ? "#FFFFFF" : "#F8FAFC", // zebra rows
                    index++,
                    "Ghế " + ticket.getSeat().getSeatRow() + ticket.getSeat().getSeatColumn(),
                    1,
                    formatCurrency(ticket.getUnitPrice()),
                    formatCurrency(ticket.getNetAmount())
            ));
        }

        for (OrderCombo orderCombo : orderCombos) {
            itemRows.append("""
            <tr style="background:%s;">
              <td style="padding:12px 10px;border-top:1px solid #E2E8F0;text-align:center;">
                %d
              </td>

              <td style="padding:12px 10px;border-top:1px solid #E2E8F0;text-align:left;color:#1F2937;font-weight:600;">
                %s
              </td>

              <td style="padding:12px 10px;border-top:1px solid #E2E8F0;text-align:center;">
                %d
              </td>

              <td style="padding:12px 10px;border-top:1px solid #E2E8F0;text-align:right;color:#334155;">
                %s
              </td>

              <td style="padding:12px 10px;border-top:1px solid #E2E8F0;text-align:right;font-weight:700;color:#EA580C;">
                %s
              </td>
            </tr>
            """.formatted(
                    index % 2 == 0 ? "#FFFFFF" : "#F8FAFC",
                    index++,
                    orderCombo.getCombo().getComboName(),
                    orderCombo.getQuantity(),
                    formatCurrency(orderCombo.getUnitPrice()),
                    formatCurrency(orderCombo.getNetAmount())
            ));
        }

        return itemRows;
    }
    
    private String formatCurrency(BigDecimal amount) {
        return String.format("%,.0f", amount);
    }

}
