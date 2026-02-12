import { Injectable } from '@angular/core';
import { ApmData, OccApmData, PaymentType } from '@checkout-model/ApmData';
import { Converter, Image, OccConfig } from '@spartacus/core';

@Injectable({
  providedIn: 'root'
})
export class ApmDataNormalizer implements Converter<OccApmData, ApmData> {

  /**
   * Constructor for the ApmDataNormalizer.
   *
   * @param {OccConfig} config - Configuration for the OCC backend.
   * @since 4.2.7
   */
  constructor(protected config: OccConfig) {
  }

  /**
   * Converts the source OccApmData object to an ApmData object.
   *
   * @param {OccApmData} source - The source object containing the original data.
   * @param {ApmData} [target] - The target object to which the data will be converted (optional).
   * @returns {ApmData} - The converted ApmData object.
   */
  convert(source: OccApmData, target?: ApmData): ApmData {
    if (target === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      target = { ...(source as any) };
    }

    target.code = source.code as PaymentType;
    target.name = source.name;
    target.isUserDataRequired = source.isUserDataRequired || false;
    target.isRedirect = source.isRedirect || false;

    if (source.media) {
      target.media =
        {
          mobile: {
            url: this.normalizeImageUrl(source.media.url),
            alt: source.name
          } as Image
        };
    }
    return target;
  }

  /** taken from product-image-normalizer.ts
   * Traditionally, in an on-prem world, medias and other backend related calls
   * are hosted at the same platform, but in a cloud setup, applications are
   * typically distributed cross different environments. For media, we use the
   * `backend.media.baseUrl` by default, but fallback to `backend.occ.baseUrl`
   * if none provided.
   *
   * Normalizes the given image URL.
   *
   * This method checks if the URL is already in a valid format (http, data:image, or //).
   * If not, it prepends the appropriate base URL from the configuration.
   *
   * @param {string} url - The URL to be normalized.
   * @returns {string} - The normalized URL.
   * @since 4.2.7
   */
  private normalizeImageUrl(url: string): string {
    if (new RegExp(/^(http|data:image|\/\/)/i).test(url)) {
      return url;
    }
    return (
      (this.config.backend.media.baseUrl ||
       this.config.backend.occ.baseUrl ||
       '') + url
    );
  }
}
