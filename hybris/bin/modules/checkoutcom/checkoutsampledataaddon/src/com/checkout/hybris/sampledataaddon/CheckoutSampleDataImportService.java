package com.checkout.hybris.sampledataaddon;

import de.hybris.platform.addonsupport.setup.impl.DefaultAddonSampleDataImportService;
import de.hybris.platform.core.initialization.SystemSetupContext;

public class CheckoutSampleDataImportService extends DefaultAddonSampleDataImportService {

    /**
     * Imports Common Data
     */
    @Override
    protected void importCommonData(final SystemSetupContext context, final String importRoot)
    {
        importImpexFile(context, importRoot + "/common/flowUIConfiguration.impex", false);
        super.importCommonData(context, importRoot);
    }
}
