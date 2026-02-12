package com.checkout.payments;

import com.google.gson.annotations.SerializedName;

public enum ACHServiceType {
    @SerializedName("same_day")
    SAME_DAY,
    @SerializedName("standard")
    STANDARD,
}
