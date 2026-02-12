package com.checkout.payments.request.source;

import com.checkout.common.AccountHolder;
import com.checkout.common.PaymentSourceType;
import com.google.gson.annotations.SerializedName;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public final class RequestCustomerSource extends AbstractRequestSource {

    private String id;

    @SerializedName("account_holder")
    private AccountHolder accountHolder;

    @Builder
    private RequestCustomerSource(final String id,
                                  final AccountHolder accountHolder) {
        super(PaymentSourceType.CUSTOMER);
        this.id = id;
        this.accountHolder = accountHolder;
    }

    public RequestCustomerSource() {
        super(PaymentSourceType.CUSTOMER);
    }

}
