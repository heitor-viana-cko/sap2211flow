package com.checkout.hybris.core.address.interceptors;

import de.hybris.platform.core.model.c2l.CountryModel;
import de.hybris.platform.core.model.c2l.RegionModel;
import de.hybris.platform.core.model.user.AddressModel;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;


@RunWith(MockitoJUnitRunner.class)
public class CheckoutComAddressInterceptorTest {

    @InjectMocks
    private CheckoutComAddressInterceptor testObj;
    @Mock
    private AddressModel addressModelMock;
    @Mock
    private RegionModel regionModelMock, regionModelTwoMock;
    @Mock
    private CountryModel countryModelMock;

    @Test
    public void onPrepare_shouldLetRegionAsItIs_whenAddressRegionBelongsToAddressCountry() {
        when(addressModelMock.getRegion()).thenReturn(regionModelMock);
        when(addressModelMock.getCountry()).thenReturn(countryModelMock);
        when(countryModelMock.getRegions()).thenReturn(List.of(regionModelMock));

        testObj.onPrepare(addressModelMock, null);

        verify(addressModelMock, never()).setRegion((any()));
    }

    @Test
    public void onPrepare_shouldRemoveAddressRegion_whenAddressRegionDoesNotBelongsToAddressCountry() {
        when(addressModelMock.getRegion()).thenReturn(regionModelMock);
        when(addressModelMock.getCountry()).thenReturn(countryModelMock);
        when(countryModelMock.getRegions()).thenReturn(List.of(regionModelTwoMock));

        testObj.onPrepare(addressModelMock, null);

        verify(addressModelMock).setRegion((null));
    }
}