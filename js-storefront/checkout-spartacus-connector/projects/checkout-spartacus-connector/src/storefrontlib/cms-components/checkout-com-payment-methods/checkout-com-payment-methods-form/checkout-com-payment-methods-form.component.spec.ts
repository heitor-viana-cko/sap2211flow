import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MockCardComponent, MockCxBillingAddressFormComponent, MockCxIconComponent } from '@checkout-tests/components';
import { NgSelectModule } from '@ng-select/ng-select';
import { CheckoutBillingAddressFormService } from '@spartacus/checkout/base/components';
import { Address, AddressValidation, Country, GlobalMessageService, I18nTestingModule, Region, UserAddressService, UserPaymentService } from '@spartacus/core';
import { FormErrorsModule, LaunchDialogService } from '@spartacus/storefront';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { CheckoutComPaymentMethodsFormComponent } from './checkout-com-payment-methods-form.component';
import createSpy = jasmine.createSpy;

const mockBillingCountries: Country[] = [
  {
    isocode: 'CA',
    name: 'Canada',
  },
];

const mockBillingAddress: Address = {
  firstName: 'John',
  lastName: 'Doe',
  line1: 'Green Street',
  line2: '420',
  town: 'Montreal',
  postalCode: 'H3A',
  country: { isocode: 'CA' },
  region: { isocodeShort: 'QC' },
};

const mockPayment: any = {
  accountHolderName: 'Test Name',
  billingAddress: mockBillingAddress,
  cardType: '',
  cardNumber: '1234123412341234',
  defaultPayment: null,
  expiryMonth: '02',
  expiryYear: 2022,
  id: '',
  paymentToken: '',
  subscriptionId: ''
};

class MockCheckoutDeliveryService {
  getDeliveryAddress(): Observable<Address> {
    return of(null);
  }

  getAddressVerificationResults(): Observable<AddressValidation> {
    return of();
  }

  verifyAddress(_address: Address): void {
  }

  clearAddressVerificationResults(): void {
  }
}

class MockUserPaymentService {
  loadBillingCountries = createSpy();

  getAllBillingCountries(): Observable<Country[]> {
    return new BehaviorSubject(mockBillingCountries);
  }
}

class MockGlobalMessageService {
  add = createSpy();
}

const mockSuggestedAddressModalRef: any = {
  componentInstance: {
    enteredAddress: '',
    suggestedAddresses: '',
  },
  result: new Promise((resolve) => {
    return resolve(true);
  }),
};

class MockLaunchDialogService {
  open(): any {
    return mockSuggestedAddressModalRef;
  }
}

class MockUserAddressService {
  getRegions(): Observable<Region[]> {
    return of([]);
  }

  verifyAddress(): Observable<AddressValidation> {
    return of({});
  }
}

class MockCheckoutBillingAddressFormService implements Partial<CheckoutBillingAddressFormService> {
  getBillingAddress(): Address {
    return mockBillingAddress;
  }

  isBillingAddressSameAsDeliveryAddress(): boolean {
    return true;
  }

  isBillingAddressFormValid(): boolean {
    return true;
  }
}

describe('CheckoutComPaymentMethodsFormComponent', () => {
  let component: CheckoutComPaymentMethodsFormComponent;
  let fixture: ComponentFixture<CheckoutComPaymentMethodsFormComponent>;
  let mockUserPaymentService: MockUserPaymentService;
  let mockGlobalMessageService: MockGlobalMessageService;

  beforeEach(async () => {
    mockUserPaymentService = new MockUserPaymentService();
    mockGlobalMessageService = new MockGlobalMessageService();

    await TestBed.configureTestingModule({
        declarations: [
          CheckoutComPaymentMethodsFormComponent,
          MockCardComponent,
          MockCxBillingAddressFormComponent,
          MockCxIconComponent,
          MockCxIconComponent,
        ],
        imports: [
          ReactiveFormsModule,
          NgSelectModule,
          I18nTestingModule,
          FormErrorsModule,
        ],
        providers: [
          {
            provide: LaunchDialogService,
            useClass: MockLaunchDialogService
          },
          {
            provide: UserPaymentService,
            useValue: mockUserPaymentService
          },
          {
            provide: GlobalMessageService,
            useValue: mockGlobalMessageService
          },
          {
            provide: UserAddressService,
            useClass: MockUserAddressService
          },
          {
            provide: CheckoutBillingAddressFormService,
            useClass: MockCheckoutBillingAddressFormService
          }
        ],
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComPaymentMethodsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.paymentDetailsData = mockPayment;
    component.ngOnInit();
    spyOn(component.setPaymentDetails, 'emit').and.callThrough();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update payment details form', () => {
    expect(component.paymentForm.value).toEqual({
      accountHolderName: 'Test Name',
      billingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        line1: 'Green Street',
        line2: '420',
        town: 'Montreal',
        postalCode: 'H3A',
        country: { isocode: 'CA' },
        region: { isocodeShort: 'QC' },
      },
      cardType: '',
      cardNumber: '1234123412341234',
      defaultPayment: null,
      expiryMonth: '02',
      expiryYear: 2022,
      id: '',
      paymentToken: '',
      subscriptionId: ''
    });
  });

  it('should submit the update payment method form', () => {
    component.next();
    expect(component.setPaymentDetails.emit).toHaveBeenCalledWith(component.paymentForm.value);
  });

  it('should submit the update payment method form with error', () => {
    component.paymentForm.setValue({
      accountHolderName: '',
      billingAddress: '',
      cardType: '',
      cardNumber: '',
      defaultPayment: null,
      expiryMonth: null,
      expiryYear: null,
      id: '',
      paymentToken: '',
      subscriptionId: ''
    });
    component.next();
    expect(component.paymentForm.valid).toBeFalse();
  });

  it('should emit payment details when form is valid', () => {
    component.paymentForm.setValue({
      accountHolderName: 'Jane Doe',
      billingAddress: mockBillingAddress,
      cardType: 'Visa',
      cardNumber: '4111111111111111',
      defaultPayment: true,
      expiryMonth: '12',
      expiryYear: 2023,
      id: '123',
      paymentToken: 'token123',
      subscriptionId: 'sub123'
    });

    component.next();

    expect(component.setPaymentDetails.emit).toHaveBeenCalledWith(component.paymentForm.value);
  });

  it('should mark all fields as touched when form is invalid', () => {
    spyOn(component.paymentForm, 'markAllAsTouched');

    component.paymentForm.setValue({
      accountHolderName: '',
      billingAddress: '',
      cardType: '',
      cardNumber: '',
      defaultPayment: null,
      expiryMonth: null,
      expiryYear: null,
      id: '',
      paymentToken: '',
      subscriptionId: ''
    });

    component.next();

    expect(component.paymentForm.markAllAsTouched).toHaveBeenCalled();
    expect(component.paymentForm.valid).toBeFalse();
  });

  it('should not emit payment details when form is invalid', () => {
    component.paymentForm.setValue({
      accountHolderName: '',
      billingAddress: '',
      cardType: '',
      cardNumber: '',
      defaultPayment: null,
      expiryMonth: null,
      expiryYear: null,
      id: '',
      paymentToken: '',
      subscriptionId: ''
    });

    component.next();

    expect(component.setPaymentDetails.emit).not.toHaveBeenCalled();
  });
});
