package com.dev.cinemasystem.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;

    public void sendForgotPasswordOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Mã OTP đặt lại mật khẩu - Cinema Booking");
        message.setText("""
                Xin chào,

                Bạn đang yêu cầu đặt lại mật khẩu cho tài khoản Cinema Booking.

                Mã OTP của bạn là: %s

                Mã OTP này có hiệu lực trong 5 phút.
                Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.

                Trân trọng,
                Cinema Booking System
                """.formatted(otp));

        javaMailSender.send(message);
    }
}