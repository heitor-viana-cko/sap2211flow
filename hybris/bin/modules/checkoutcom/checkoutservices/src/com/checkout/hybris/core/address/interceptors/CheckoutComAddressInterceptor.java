package com.checkout.hybris.core.address.interceptors;

import de.hybris.platform.core.model.c2l.RegionModel;
import de.hybris.platform.core.model.user.AddressModel;
import de.hybris.platform.servicelayer.interceptor.InterceptorContext;
import de.hybris.platform.servicelayer.interceptor.PrepareInterceptor;

import java.util.Collection;

public class CheckoutComAddressInterceptor implements PrepareInterceptor<AddressModel> {

    @Override
    public void onPrepare(final AddressModel addressModel, final InterceptorContext interceptorContext) {
        final RegionModel regionModel = addressModel.getRegion();
        final Collection<RegionModel> regions = addressModel.getCountry().getRegions();

        if (!regions.contains(regionModel)) {
            addressModel.setRegion(null);
        }
    }

}
