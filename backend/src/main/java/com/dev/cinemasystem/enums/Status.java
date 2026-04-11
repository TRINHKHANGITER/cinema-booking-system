
package com.dev.cinemasystem.enums;

import lombok.Getter;


@Getter
public enum Status {
    // legacy values (kept for compatibility)
    active,
    inactive,
    deleted,

    // designed values
    ACTIVE,
    INACTIVE,
    LOCKED,
    SUSPENDED,
    DELETED,
    UNDER_MAINTENANCE,
    BLOCKED,
    BROKEN,
    DRAFT,
    COMING_SOON,
    NOW_SHOWING,
    ENDED,
    HIDDEN,
    SCHEDULED,
    SELLING,
    STOPPED,
    COMPLETED,
    CANCELLED,
    AVAILABLE,
    UNAVAILABLE,
    DISCONTINUED,
    CREATED,
    HOLDING,
    AWAITING_PAYMENT,
    PAID,
    EXPIRED,
    REFUNDED,
    PENDING,
    SUCCESS,
    FAILED,
    HELD,
    BOOKED,
    CHECKED_IN

}



