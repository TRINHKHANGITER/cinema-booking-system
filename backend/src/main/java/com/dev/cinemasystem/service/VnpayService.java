package com.dev.cinemasystem.service;

import com.dev.cinemasystem.configuration.booking.BookingProperties;
import com.dev.cinemasystem.configuration.payment.VnPayConfig;
import com.dev.cinemasystem.constant.VnpayParamsRequest;
import com.dev.cinemasystem.dto.vnpayDTO.VnpayRequest;
import com.dev.cinemasystem.utils.VnPayUtil;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VnpayService {
    static final DateTimeFormatter VNP_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    static final DateTimeFormatter TXN_REF_TIME_FORMAT = DateTimeFormatter.ofPattern("yyMMddHHmmssSSS");
    static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    final VnPayConfig vnPayConfig;
    final BookingProperties bookingProperties;

    public String buildVnpayUrl(VnpayRequest vnpayRequest, String clientIp) {
        String infoTransactionOrder = PaymentService.buildTransferContent(vnpayRequest.getOrderId());
        ZonedDateTime now = ZonedDateTime.now(VIETNAM_ZONE);
        ZonedDateTime expireAt = now.plusMinutes(bookingProperties.getHoldMinutes());
        String transactionReference = buildTransactionReference(vnpayRequest.getOrderId(), now);

        Map<String, String> params = new LinkedHashMap<>();
        params.put(VnpayParamsRequest.VERSION, vnPayConfig.getVersion());
        params.put(VnpayParamsRequest.COMMAND, vnPayConfig.getCommand());
        params.put(VnpayParamsRequest.TERMINAL_CODE, vnPayConfig.getTmnCode());
        params.put(VnpayParamsRequest.AMOUNT, vnpayRequest.getAmount().multiply(BigDecimal.valueOf(100)).toBigInteger().toString());
        params.put(VnpayParamsRequest.CURRENCY_CODE, vnPayConfig.getCurrCode());
        params.put(VnpayParamsRequest.TRANSACTION_REFERENCE, transactionReference);
        params.put(VnpayParamsRequest.ORDER_INFORMATION, infoTransactionOrder);
        params.put(VnpayParamsRequest.ORDER_TYPE, vnPayConfig.getOrderType());
        params.put(VnpayParamsRequest.LOCALE, vnPayConfig.getLocale());
        params.put(VnpayParamsRequest.RETURN_URL, vnPayConfig.getReturnUrl());
        params.put(VnpayParamsRequest.IP_ADDRESS, clientIp);
        params.put(VnpayParamsRequest.CREATE_DATE, now.format(VNP_DATE_FORMAT));
        params.put(VnpayParamsRequest.EXPIRE_DATE, expireAt.format(VNP_DATE_FORMAT));

        String hashData = VnPayUtil.buildQueryData(params, true);
        String secureHas = VnPayUtil.hmacSha512(vnPayConfig.getHashSecret(), hashData);
        String queryString = hashData + "&vnp_SecureHash=" + secureHas;

        return vnPayConfig.getPayUrl() + "?" + queryString;
    }

    private String buildTransactionReference(Integer orderId, ZonedDateTime now) {
        String timePart = now.format(TXN_REF_TIME_FORMAT);
        int randomSuffix = ThreadLocalRandom.current().nextInt(100, 1000);
        // Keep orderId at the beginning so callback can map back safely.
        return orderId + "T" + timePart + randomSuffix;
    }

}
