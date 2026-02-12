package com.checkout.hybris.core.flow.exception;

/**
 * Exception thrown from the Checkout.com integration errors
 */
public class CheckoutComPaymentSessionException extends RuntimeException {

    /**
     * Constructor
     *
     * @param message exception message
     */
    public CheckoutComPaymentSessionException(final String message) {
        super(message);
    }

    /**
     * Constructor
     *
     * @param message   exception message
     * @param throwable the throwable to pass
     */
    public CheckoutComPaymentSessionException(final String message, final Throwable throwable) {
        super(message, throwable);
    }

}
