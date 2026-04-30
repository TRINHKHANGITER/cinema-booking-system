package com.dev.cinemasystem.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;


@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION("UNCATEGORIZED_EXCEPTION", HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi chưa xác định"),
    UNAUTHENTICATED("UNAUTHENTICATED", HttpStatus.UNAUTHORIZED, "Chưa xác thực"),
    UNAUTHORIZED("UNAUTHORIZED", HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập"),
    TOKEN_INVALID("TOKEN_INVALID", HttpStatus.BAD_REQUEST, "Mã token không hợp lệ"),


    // user
    USER_NOT_FOUND("USER_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"),
    FULLNAME_BLANK("FULLNAME_BLANK", HttpStatus.BAD_REQUEST, "Họ và tên là bắt buộc"),
    PHONE_NUMBER_BLANK("PHONE_NUMBER_BLANK", HttpStatus.BAD_REQUEST, "Số điện thoại là bắt buộc"),
    IDENTITY_CODE_BLANK("IDENTITY_CODE_BLANK", HttpStatus.BAD_REQUEST, "Số CCCD/CMND là bắt buộc"),
    SEX_INVALID("SEX_INVALID", HttpStatus.BAD_REQUEST, "Giới tính phải là nam, nữ hoặc khác"),
    EMAIL_BLANK("EMAIL_BLANK", HttpStatus.BAD_REQUEST, "Email là bắt buộc"),
    PASSWORD_BLANK("PASSWORD_BLANK", HttpStatus.BAD_REQUEST, "Mật khẩu là bắt buộc"),
    PASSWORD_INVALID("PASSWORD_INVALID", HttpStatus.BAD_REQUEST, "Mật khẩu phải có ít nhất 8 ký tự"),
    USERNAME_EXISTS("USERNAME_EXISTS", HttpStatus.BAD_REQUEST, "Tên đăng nhập đã tồn tại"),
    EMAIL_EXISTS("EMAIL_EXISTS", HttpStatus.BAD_REQUEST, "Email đã tồn tại"),
    PHONE_NUMBER_EXISTS("PHONE_NUMBER_EXISTS", HttpStatus.BAD_REQUEST, "Số điện thoại đã tồn tại"),
    ROLE_BLANK("ROLE_BLANK", HttpStatus.BAD_REQUEST, "Vai trò là bắt buộc"),
    USER_STATUS_BLANK("USER_STATUS_BLANK", HttpStatus.BAD_REQUEST, "Trạng thái là bắt buộc"),
    EMAIL_INVALID("EMAIL_INVALID", HttpStatus.BAD_REQUEST, "Email không hợp lệ"),
    PHONE_NUMBER_INVALID("PHONE_NUMBER_INVALID", HttpStatus.BAD_REQUEST, "Số điện thoại phải từ 10 đến 15 chữ số"),
    USERNAME_BLANK("USERNAME_BLANK", HttpStatus.BAD_REQUEST, "Tên đăng nhập là bắt buộc"),

    ADDRESS_NOT_FOUND("ADDRESS_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ"),
    ADDRESS_BLANK("ADDRESS_BLANK", HttpStatus.BAD_REQUEST, "Địa chỉ là bắt buộc"),
    PROVINCE_ID_BLANK("PROVINCE_ID_BLANK", HttpStatus.BAD_REQUEST, "Mã tỉnh/thành là bắt buộc"),
    PROVINCE_ID_INVALID("PROVINCE_ID_INVALID", HttpStatus.BAD_REQUEST, "Mã tỉnh/thành phải lớn hơn hoặc bằng 1"),

    INVALID_PAGE_NUMBER("INVALID_PAGE_NUMBER", HttpStatus.BAD_REQUEST, "Số trang phải lớn hơn hoặc bằng 1"),
    INVALID_PAGE_SIZE("INVALID_PAGE_SIZE", HttpStatus.BAD_REQUEST, "Kích thước trang phải trong khoảng từ 1 đến 10"),

    CINEMA_ADDRESS_EXISTS("CINEMA_ADDRESS_EXISTS", HttpStatus.BAD_REQUEST, "Rạp tại địa chỉ này đã tồn tại"),
    CINEMA_NOT_FOUND("CINEMA_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy rạp"),
    CINEMA_NAME_EXISTS("CINEMA_NAME_EXISTS", HttpStatus.BAD_REQUEST, "Tên rạp đã tồn tại"),
    CINEMA_HAS_ACTIVE_ROOMS("CINEMA_HAS_ACTIVE_ROOMS", HttpStatus.BAD_REQUEST, "Không thể xóa rạp vì còn phòng đang hoạt động sử dụng"),

    CINEMA_ALREADY_EXISTS_AT_THIS_ADDRESS("CINEMA_ALREADY_EXISTS_AT_THIS_ADDRESS", HttpStatus.BAD_REQUEST, "Rạp tại địa chỉ này đã tồn tại"),
    PROVINCE_NOT_FOUND("PROVINCE_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy tỉnh/thành"),
    PROVINCE_NAME_BLANK("PROVINCE_NAME_BLANK", HttpStatus.BAD_REQUEST, "Tên tỉnh/thành là bắt buộc"),
    PROVINCE_NAME_EXISTS("PROVINCE_NAME_EXISTS", HttpStatus.BAD_REQUEST, "Tên tỉnh/thành đã tồn tại"),
    PROVINCE_HAS_ACTIVE_CINEMAS("PROVINCE_HAS_ACTIVE_CINEMAS", HttpStatus.BAD_REQUEST, "Không thể xóa tỉnh/thành vì còn rạp đang hoạt động sử dụng"),
    ROOM_NOT_FOUND("ROOM_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy phòng"),
    ROOM_TYPE_BLANK("ROOM_TYPE_BLANK", HttpStatus.BAD_REQUEST, "Loại phòng là bắt buộc"),
    ROOM_NAME_BLANK("ROOM_NAME_BLANK", HttpStatus.BAD_REQUEST, "Tên phòng là bắt buộc"),
    CAPACITY_BLANK("CAPACITY_BLANK", HttpStatus.BAD_REQUEST, "Sức chứa là bắt buộc"),
    CINEMA_BLANK("CINEMA_BLANK", HttpStatus.BAD_REQUEST, "Rạp là bắt buộc"),
    CAPACITY_INVALID("CAPACITY_INVALID", HttpStatus.BAD_REQUEST, "Sức chứa phải lớn hơn hoặc bằng 1"),
    ROOM_TYPE_ID_INVALID("ROOM_TYPE_ID_INVALID", HttpStatus.BAD_REQUEST, "Mã loại phòng phải lớn hơn hoặc bằng 1"),
    CINEMA_ID_INVALID("CINEMA_ID_INVALID", HttpStatus.BAD_REQUEST, "Mã rạp phải lớn hơn hoặc bằng 1"),
    ROOM_HAS_ACTIVE_SEATS("ROOM_HAS_ACTIVE_SEATS", HttpStatus.BAD_REQUEST, "Không thể xóa phòng vì còn ghế đang hoạt động sử dụng"),

    ROOM_TYPE_NOT_FOUND("ROOM_TYPE_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy loại phòng"),

    ROOM_TYPE_NAME_EXISTS("ROOM_TYPE_NAME_EXISTS", HttpStatus.BAD_REQUEST, "Tên loại phòng đã tồn tại"),
    ROOM_TYPE_HAS_ACTIVE_ROOMS("ROOM_TYPE_HAS_ACTIVE_ROOMS", HttpStatus.BAD_REQUEST, "Không thể xóa loại phòng vì còn phòng đang hoạt động sử dụng"),
    ROOM_TYPE_NAME_BLANK("ROOM_TYPE_NAME_BLANK", HttpStatus.BAD_REQUEST, "Tên loại phòng là bắt buộc"),
    DESCRIPTION_BLANK("DESCRIPTION_BLANK", HttpStatus.BAD_REQUEST, "Mô tả là bắt buộc"),
    WARD_NOT_FOUND("WARD_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy phường/xã"),
    CINEMA_ALREADY_EXISTS("CINEMA_ALREADY_EXISTS", HttpStatus.BAD_REQUEST, "Rạp tại địa chỉ này đã tồn tại"),

    ROW_BLANK("ROW_BLANK", HttpStatus.BAD_REQUEST, "Hàng ghế là bắt buộc"),
    ROW_INVALID("ROW_INVALID", HttpStatus.BAD_REQUEST, "Hàng ghế phải là một ký tự chữ cái in hoa từ A đến Z"),
    COLUMN_INVALID("COLUMN_INVALID", HttpStatus.BAD_REQUEST, "Cột ghế phải lớn hơn hoặc bằng 1"),
    SEAT_TYPE_ID_INVALID("SEAT_TYPE_ID_INVALID", HttpStatus.BAD_REQUEST, "Mã loại ghế phải lớn hơn hoặc bằng 1"),
    SEAT_TYPE_BLANK("SEAT_TYPE_BLANK", HttpStatus.BAD_REQUEST, "Loại ghế là bắt buộc"),
    ROOM_ID_INVALID("ROOM_ID_INVALID", HttpStatus.BAD_REQUEST, "Mã phòng phải lớn hơn hoặc bằng 1"),
    ROOM_BLANK("ROOM_BLANK", HttpStatus.BAD_REQUEST, "Phòng là bắt buộc"),
    SEAT_TYPE_NAME_BLANK("SEAT_TYPE_NAME_BLANK", HttpStatus.BAD_REQUEST, "Tên loại ghế là bắt buộc"),
    SEAT_TYPE_NOT_FOUND("SEAT_TYPE_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy loại ghế"),
    SEAT_TYPE_NAME_EXISTS("SEAT_TYPE_NAME_EXISTS", HttpStatus.BAD_REQUEST, "Tên loại ghế đã tồn tại"),
    SEAT_TYPE_HAS_ACTIVE_SEATS("SEAT_TYPE_HAS_ACTIVE_SEATS", HttpStatus.BAD_REQUEST, "Không thể xóa loại ghế vì còn ghế đang hoạt động sử dụng"),
    SEAT_NOT_FOUND("SEAT_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy ghế"),
    SEAT_ALREADY_EXISTS_IN_ROOM("SEAT_ALREADY_EXISTS_IN_ROOM", HttpStatus.BAD_REQUEST, "Ghế đã tồn tại trong phòng với hàng ghế và cột ghế đã cho"),
    SEAT_HAS_ACTIVE_TICKETS_OR_HOLDS("SEAT_HAS_ACTIVE_TICKETS_OR_HOLDS", HttpStatus.BAD_REQUEST, "Không thể xóa ghế vì còn vé hoặc giữ chỗ đang hoạt động sử dụng"),


    MOVIE_TYPE_NAME_BLANK("MOVIE_TYPE_NAME_BLANK", HttpStatus.BAD_REQUEST, "Tên thể loại phim là bắt buộc"),
    MOVIE_TYPE_NOT_FOUND("MOVIE_TYPE_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy thể loại phim"),
    MOVIE_TYPE_NAME_EXISTS("MOVIE_TYPE_NAME_EXISTS", HttpStatus.BAD_REQUEST, "Tên thể loại phim đã tồn tại"),
    MOVIE_TYPE_HAS_ACTIVE_MOVIES("MOVIE_TYPE_HAS_ACTIVE_MOVIES", HttpStatus.BAD_REQUEST, "Không thể xóa thể loại phim vì còn phim đang hoạt động sử dụng"),
    MOVIE_NOT_FOUND("MOVIE_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy phim"),
    MOVIE_NAME_BLANK("MOVIE_NAME_BLANK", HttpStatus.BAD_REQUEST, "Tên phim là bắt buộc"),
    MOVIE_NAME_EXISTS("MOVIE_NAME_EXISTS", HttpStatus.BAD_REQUEST, "Tên phim đã tồn tại"),
    VIDEO_TRAILER_BLANK("VIDEO_TRAILER_BLANK", HttpStatus.BAD_REQUEST, "Đường dẫn trailer là bắt buộc"),
    DURATION_MINUTES_INVALID("DURATION_MINUTES_INVALID", HttpStatus.BAD_REQUEST, "Thời lượng phải lớn hơn hoặc bằng 1 phút"),
    MOVIE_TYPE_ID_INVALID("MOVIE_TYPE_ID_INVALID", HttpStatus.BAD_REQUEST, "Mã thể loại phim phải lớn hơn hoặc bằng 1"),
    DURATION_MINUTES_BLANK("DURATION_MINUTES_BLANK", HttpStatus.BAD_REQUEST, "Thời lượng là bắt buộc"),
    MOVIE_TYPE_ID_BLANK("MOVIE_TYPE_ID_BLANK", HttpStatus.BAD_REQUEST, "Mã thể loại phim là bắt buộc"),
    MOVIE_STATUS_BLANK("MOVIE_STATUS_BLANK", HttpStatus.BAD_REQUEST, "Trạng thái phim là bắt buộc"),
    RELEASE_DATE_BLANK("RELEASE_DATE_BLANK", HttpStatus.BAD_REQUEST, "Ngày khởi chiếu là bắt buộc"),
    END_DATE_BLANK("END_DATE_BLANK", HttpStatus.BAD_REQUEST, "Ngày kết thúc là bắt buộc"),
    MOVIE_END_DATE_INVALID("MOVIE_END_DATE_INVALID", HttpStatus.BAD_REQUEST, "Ngày kết thúc phải lớn hơn hoặc bằng ngày khởi chiếu"),
    MOVIE_HAS_ACTIVE_SHOWTIMES("MOVIE_HAS_ACTIVE_SHOWTIMES", HttpStatus.BAD_REQUEST, "Không thể xóa phim vì còn suất chiếu đang hoạt động sử dụng"),

    TICKET_NOT_FOUND("TICKET_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy vé"),
    PRICE_BLANK("PRICE_BLANK", HttpStatus.BAD_REQUEST, "Giá là bắt buộc"),
    PRICE_INVALID("PRICE_INVALID", HttpStatus.BAD_REQUEST, "Giá phải lớn hơn hoặc bằng 0"),
    ROOM_TYPE_ID_BLANK("ROOM_TYPE_ID_BLANK", HttpStatus.BAD_REQUEST, "Mã loại phòng là bắt buộc"),
    SEAT_TYPE_ID_BLANK("SEAT_TYPE_ID_BLANK", HttpStatus.BAD_REQUEST, "Mã loại ghế là bắt buộc"),
    PRICE_TICKET_NOT_FOUND("PRICE_TICKET_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy giá vé"),
    PRICE_TICKET_EXISTS("PRICE_TICKET_EXISTS", HttpStatus.BAD_REQUEST, "Giá vé đã tồn tại cho tổ hợp đã cho"),
    PRICE_TICKET_HAS_ACTIVE_TICKETS("PRICE_TICKET_HAS_ACTIVE_TICKETS", HttpStatus.BAD_REQUEST, "Không thể xóa giá vé vì còn vé đang hoạt động sử dụng"),


    SHOWTIME_NOT_FOUND("SHOWTIME_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy suất chiếu"),
    SHOWTIME_ALREADY_EXISTS("SHOWTIME_ALREADY_EXISTS", HttpStatus.BAD_REQUEST, "Suất chiếu đã tồn tại cho phim, phòng và thời gian bắt đầu đã cho"),
    SHOWTIME_STATUS_BLANK("SHOWTIME_STATUS_BLANK", HttpStatus.BAD_REQUEST, "Trạng thái suất chiếu là bắt buộc"),
    SHOWTIME_BEFORE_MOVIE_RELEASE_DATE("SHOWTIME_BEFORE_MOVIE_RELEASE_DATE", HttpStatus.BAD_REQUEST, "Suất chiếu phải lớn hơn hoặc bằng ngày khởi chiếu của phim"),
    SHOWTIME_BEFORE_CURRENT_TIME("SHOWTIME_BEFORE_CURRENT_TIME", HttpStatus.BAD_REQUEST, "Suất chiếu phải lớn hơn hoặc bằng ngày giờ hiện tại"),
    SHOWTIME_HAS_ACTIVE_TICKETS("SHOWTIME_HAS_ACTIVE_TICKETS", HttpStatus.BAD_REQUEST, "Không thể xóa suất chiếu vì còn vé đang hoạt động sử dụng suất chiếu này"),
    START_TIME_BLANK("START_TIME_BLANK", HttpStatus.BAD_REQUEST, "Thời gian bắt đầu là bắt buộc"),
    END_TIME_BLANK("END_TIME_BLANK", HttpStatus.BAD_REQUEST, "Thời gian kết thúc là bắt buộc"),
    INVALID_SHOWTIME_RANGE("INVALID_SHOWTIME_RANGE", HttpStatus.BAD_REQUEST, "Thời gian kết thúc phải lớn hơn thời gian bắt đầu"),
    ROOM_HAS_NO_SEATS("ROOM_HAS_NO_SEATS", HttpStatus.BAD_REQUEST, "Không thể tạo suất chiếu vì phòng chưa có ghế"),
    TIME_INVALID("TIME_INVALID", HttpStatus.BAD_REQUEST, "Thời gian phải có định dạng hh:mm:ss hoặc hh:mm"),
    INVALID_REQUEST("INVALID_REQUEST", HttpStatus.BAD_REQUEST, "Yêu cầu không hợp lệ"),
    ORDER_NOT_FOUND("ORDER_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"),
    ORDER_STATUS_INVALID("ORDER_STATUS_INVALID", HttpStatus.BAD_REQUEST, "Trạng thái đơn hàng không hợp lệ cho thao tác này"),
    ORDER_EXPIRED("ORDER_EXPIRED", HttpStatus.BAD_REQUEST, "Đơn hàng đã hết hạn"),
    SHOWTIME_SEAT_NOT_AVAILABLE("SHOWTIME_SEAT_NOT_AVAILABLE", HttpStatus.BAD_REQUEST, "Một hoặc nhiều ghế đã chọn không còn trống"),
    INVALID_SEAT_SELECTION("INVALID_SEAT_SELECTION", HttpStatus.BAD_REQUEST, "Danh sách ghế đã chọn không hợp lệ"),
    PAYMENT_NOT_FOUND("PAYMENT_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy thanh toán"),
    COMBO_NOT_FOUND("COMBO_NOT_FOUND", HttpStatus.NOT_FOUND, "Không tìm thấy combo"),
    COMBO_NAME_BLANK("COMBO_NAME_BLANK", HttpStatus.BAD_REQUEST, "Tên combo là bắt buộc"),
    COMBO_NAME_EXISTS("COMBO_NAME_EXISTS", HttpStatus.BAD_REQUEST, "Tên combo đã tồn tại"),
    COMBO_HAS_ACTIVE_ORDER_COMBOS("COMBO_HAS_ACTIVE_ORDER_COMBOS", HttpStatus.BAD_REQUEST, "Không thể xóa combo vì còn đơn hàng-combo đang hoạt động sử dụng"),

    FILE_UPLOAD_FAILED("FILE_UPLOAD_FAILED", HttpStatus.INTERNAL_SERVER_ERROR, "Tải tệp lên thất bại"),
    FILE_SIZE_EXCEEDED("FILE_SIZE_EXCEEDED", HttpStatus.PAYLOAD_TOO_LARGE, "Tệp tải lên vượt quá dung lượng cho phép"),
    IMAGE_BLANK("IMAGE_BLANK", HttpStatus.BAD_REQUEST, "Hình ảnh là bắt buộc"),
    PASSWORD_NOT_BLANK("PASSWORD_NOT_BLANK", HttpStatus.BAD_REQUEST, "Mật khẩu là bắt buộc"),
    EMAIL_OR_USERNAME_NOT_BLANK("EMAIL_OR_USERNAME_NOT_BLANK", HttpStatus.BAD_REQUEST, "Email hoặc tên đăng nhập là bắt buộc"),



    ID_TOKEN_INVALID("ID_TOKEN_INVALID", HttpStatus.BAD_REQUEST, "Mã ID token không hợp lệ"),
    EMAIL_SENDING_FAILED("EMAIL_SENDING_FAILED", HttpStatus.INTERNAL_SERVER_ERROR, "Gửi email thất bại"),

    ;


    ErrorCode(String code, HttpStatusCode httpStatusCode , String message) {
        this.code = code;
        this.statusCode = httpStatusCode;
        this.message = message;
    }

    private String code;
    private HttpStatusCode statusCode;
    private String message;

}
