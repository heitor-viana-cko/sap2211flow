import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckoutComBillingAddressFormComponent } from '@checkout-components/checkout-com-billing-address-form/checkout-com-billing-address-form.component';
import { CheckoutComConnector } from '@checkout-core/connectors/checkout-com/checkout-com.connector';
import { CheckoutComCheckoutBillingAddressFacade } from "@checkout-facades/checkout-com-checkout-billing-address.facade";
import { CheckoutComFlowFacade } from "@checkout-facades/checkout-com-flow.facade";
import { CheckoutComPaymentFacade } from '@checkout-facades/checkout-com-payment.facade';
import { PaymentType } from '@checkout-model/ApmData';
import { CheckoutComBillingAddressFormService } from '@checkout-services/billing-address-form/checkout-com-billing-address-form.service';
import { generateBillingFromFromAddress, generateOneAddress } from '@checkout-tests/fake-data/address.mock';
import { queryDebugElementByCss } from '@checkout-tests/finders.mock';
import { MockCheckoutComCheckoutBillingAddressFacade } from "@checkout-tests/services/checkout-com-checkout-billing-address.facade.mock";
import { MockCheckoutComFlowFacade } from "@checkout-tests/services/checkout-com-flow.facade.mock";
import { MockCheckoutComPaymentFacade } from '@checkout-tests/services/checkout-com-payment.facade.mock';
import { MockCheckoutComConnector } from '@checkout-tests/services/checkout-com.connector.mock';
import { MockCheckoutDeliveryAddressFacade } from '@checkout-tests/services/chekout-delivery-address.service.mock';
import { MockGlobalMessageService } from '@checkout-tests/services/global-message.service.mock';
import { MockLaunchDialogService } from '@checkout-tests/services/launch-dialog.service.mock';
import { MockTranslationService } from '@checkout-tests/services/translations.services.mock';
import { MockUserAddressService } from '@checkout-tests/services/user-address.service.mock';
import { MockUserPaymentService } from '@checkout-tests/services/user-payment.service.mock';
import { NgSelectModule } from '@ng-select/ng-select';
import { CheckoutBillingAddressFormService } from '@spartacus/checkout/base/components';
import { CheckoutDeliveryAddressFacade } from '@spartacus/checkout/base/root';
import {
  EventService,
  FeaturesConfigModule,
  GlobalMessageService,
  I18nTestingModule,
  LoggerService,
  TranslationService,
  UserAddressService,
  UserPaymentService
} from '@spartacus/core';
import { CardComponent, FormErrorsModule, LaunchDialogService, NgSelectA11yModule } from '@spartacus/storefront';
import { timeout } from 'rxjs/operators';
import { CheckoutComApmOxxoComponent } from './checkout-com-apm-oxxo.component';

function expectSubmitButtonIsDisabled(disabled) {
  expect(document.querySelector('button[data-test-id="oxxo-continue-btn"]')['disabled']).toEqual(disabled);
}

const billingAddress = generateOneAddress();
const billingAddressFormData = generateBillingFromFromAddress(billingAddress);

describe('CheckoutComApmOxxoComponent', () => {
  let component: CheckoutComApmOxxoComponent;
  let fixture: ComponentFixture<CheckoutComApmOxxoComponent>;
  const docId = '111111111111111111';
  let userAddressService: UserAddressService;
  let userPaymentService: UserPaymentService;
  let checkoutDeliveryAddressFacade: CheckoutDeliveryAddressFacade;
  let logger: LoggerService;
  let eventService: EventService;
  let checkoutComPaymentFacade: CheckoutComPaymentFacade;
  let billingAddressFormService: CheckoutComBillingAddressFormService;
  let checkoutComConnector: CheckoutComConnector;
  let checkoutComFlowFacade: CheckoutComFlowFacade;
  let checkoutComCheckoutBillingAddressFacade: CheckoutComCheckoutBillingAddressFacade;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        I18nTestingModule,
        NgSelectModule,
        FormErrorsModule,
        FeaturesConfigModule,
        NgSelectA11yModule,
      ],
      declarations: [
        CheckoutComApmOxxoComponent,
        CheckoutComBillingAddressFormComponent,
        CardComponent,
      ],
      providers: [
        {
          provide: LaunchDialogService,
          useClass: MockLaunchDialogService
        },
        {
          provide: CheckoutDeliveryAddressFacade,
          useClass: MockCheckoutDeliveryAddressFacade
        },
        {
          provide: UserPaymentService,
          useClass: MockUserPaymentService
        },
        {
          provide: GlobalMessageService,
          useClass: MockGlobalMessageService
        },
        {
          provide: UserAddressService,
          useClass: MockUserAddressService
        },
        CheckoutComBillingAddressFormService,
        {
          provide: CheckoutBillingAddressFormService,
          useClass: CheckoutComBillingAddressFormService
        },
        {
          provide: CheckoutComPaymentFacade,
          useClass: MockCheckoutComPaymentFacade
        },
        {
          provide: CheckoutComConnector,
          useClass: MockCheckoutComConnector
        },
        {
          provide: TranslationService,
          useClass: MockTranslationService
        },
        {
          provide: CheckoutComFlowFacade,
          useClass: MockCheckoutComFlowFacade
        },{
          provide: CheckoutComCheckoutBillingAddressFacade,
          useClass: MockCheckoutComCheckoutBillingAddressFacade
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComApmOxxoComponent);
    component = fixture.componentInstance;
    userAddressService = TestBed.inject(UserAddressService);
    userPaymentService = TestBed.inject(UserPaymentService);
    checkoutDeliveryAddressFacade = TestBed.inject(CheckoutDeliveryAddressFacade);
    component = fixture.componentInstance;
    checkoutComPaymentFacade = TestBed.inject(CheckoutComPaymentFacade);
    checkoutComConnector = TestBed.inject(CheckoutComConnector);
    billingAddressFormService = TestBed.inject(CheckoutComBillingAddressFormService);
    checkoutComFlowFacade = TestBed.inject(CheckoutComFlowFacade);
    checkoutComCheckoutBillingAddressFacade = TestBed.inject(CheckoutComCheckoutBillingAddressFacade);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have Document ID field', () => {
    fixture.detectChanges();
    expect(queryDebugElementByCss(fixture, 'input[data-test-id="oxxo-document-input"]')).toBeTruthy();
  });

  it('continue button should be disabled on init', () => {
    fixture.detectChanges();
    expectSubmitButtonIsDisabled(true);
  });

  it('continue button should be disabled on wrong format', () => {
    fixture.detectChanges();
    component.documentCtrl.setValue('11111111111111');
    fixture.detectChanges();
    expectSubmitButtonIsDisabled(true);
  });

  it('continue button should be enabled on correct format', () => {
    fixture.detectChanges();
    component.documentCtrl.setValue(docId);
    fixture.detectChanges();
    expectSubmitButtonIsDisabled(false);
  });

  it('should send Document ID field', (done) => {
    fixture.detectChanges();

    component.setPaymentDetails.subscribe((event) => {
      expect(event.billingAddress).toBeNull();
      expect(event.paymentDetails).toEqual({
        type: PaymentType.Oxxo,
        document: docId
      });

      done();
    });
    component.documentCtrl.setValue(docId);
    fixture.detectChanges();
    component.next();
  });

  it('should use the billing address if given', (done) => {
    component.documentCtrl.setValue(docId);
    component.sameAsShippingAddress = false;
    component.setPaymentDetails.subscribe((event) => {
      expect(event.billingAddress).toEqual(billingAddressFormData);
      done();
    });
    component.billingAddressForm.setValue(billingAddressFormData);
    fixture.detectChanges();
    component.next();
  });

  it('should not call setPaymentDetails event if billing address is not valid', (done) => {
    component.documentCtrl.setValue(docId);
    component.sameAsShippingAddress = false;
    component.setPaymentDetails.pipe(timeout(2)).subscribe({
      error: (err) => {
        expect(err.message).toEqual('Timeout has occurred');
        done();
      }
    });
    component.billingAddressForm.setValue(billingAddressFormData);
    fixture.detectChanges();
    component.next();
  });

  it('should detect invalid document ids', (done) => {
    component.documentCtrl.setValue('222');

    component.next();

    expectSubmitButtonIsDisabled(true);

    component.setPaymentDetails.pipe(timeout(2)).subscribe({
      error: (err) => {
        expect(err.message).toEqual('Timeout has occurred');
        done();
      }
    });

    const {
      dirty,
      touched
    } = component.form.get('document');
    expect(dirty).toBeTruthy();
    expect(touched).toBeTruthy();
  });
});
