import { DebugElement, Directive, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CheckoutComPaymentDetails } from '@checkout-core/interfaces';
import { CheckoutComPaymentService } from '@checkout-services/payment/checkout-com-payment.service';
import { MockCxIconComponent, MockCxSpinnerComponent } from '@checkout-tests/components';
import { MockCxFeatureDirective } from '@checkout-tests/directives/cx-feature.directive.mock';
import { generateOneAddress } from '@checkout-tests/fake-data/address.mock';
import { CheckoutBillingAddressFormService } from '@spartacus/checkout/base/components';
import {
  Address,
  AddressValidation,
  GlobalMessageService,
  GlobalMessageType,
  I18nTestingModule,
  PaymentDetails,
  QueryState,
  Region,
  Translatable,
  TranslationService,
  UserAddressAdapter,
  UserAddressService,
  UserIdService,
  UserPaymentService
} from '@spartacus/core';
import { CardComponent, FocusDirective, LaunchDialogService } from '@spartacus/storefront';
import { EMPTY, Observable, of, throwError } from 'rxjs';
/*import { reducer } from '../../../core/store/checkout-com.reducer';
import { CHECKOUT_COM_FEATURE } from '../../../core/store/checkout-com.state';*/
import { CheckoutComPaymentMethodsFormModule } from './checkout-com-payment-methods-form/checkout-com-payment-methods-form.module';

import { CheckoutComPaymentMethodsComponent } from './checkout-com-payment-methods.component';

@Directive({
  selector: '[cxAtMessage]',
})
class MockAtMessageDirective {
  @Input() cxAtMessage: string | string[] | undefined;
}

const mockBillingAddress: Address = generateOneAddress();

const mockCardContent = {
  id: '2',
  defaultPayment: false,
  accountHolderName: 'Test User',
  expiryMonth: '11',
  expiryYear: '2020',
  cardNumber: '4242424242424242',
  cardType: {
    code: 'visa',
    name: 'Visa'
  },
};
const mockPayment: PaymentDetails = {
  defaultPayment: true,
  accountHolderName: 'John Doe',
  cardNumber: '4111 1111 1111 1111',
  expiryMonth: '11',
  expiryYear: '2020',
  id: '2',
  cardType: {
    code: 'master',
    name: 'Mastercard'
  },
};

class MockUserPaymentService {
  getPaymentMethodsLoading(): Observable<boolean> {
    return of();
  }

  getPaymentMethods(): Observable<PaymentDetails[]> {
    return of([mockPayment]);
  }

  loadPaymentMethods(): void {
  }

  deletePaymentMethod(_paymentMethodId: string): void {
  }

  setPaymentMethodAsDefault(_paymentMethodId: string): void {
  }
}

class MockCheckoutComPaymentService implements Partial<CheckoutComPaymentService> {
  updatePaymentDetails(paymentDetails) {
    return of(null);
  }

  getIsABC(): Observable<QueryState<boolean>> {
    return of({
      loading: false,
      error: false,
      data: false
    });
  }

  getIsABCFromState(): Observable<boolean> {
    return of(null);
  }
}

class MockUserIdService implements Partial<UserIdService> {
  getUserId() {
    return of('100');
  }
}

class MockLaunchDialogService implements Partial<LaunchDialogService> {
  openDialogAndSubscribe() {
    return EMPTY;
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

class MockGlobalMessageService implements Partial<GlobalMessageService> {
  add(_: string | Translatable, __: GlobalMessageType, ___?: number): void {
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

describe('CheckoutComPaymentMethodsComponent', () => {
  let component: CheckoutComPaymentMethodsComponent;
  let fixture: ComponentFixture<CheckoutComPaymentMethodsComponent>;
  let userService: UserPaymentService;
  let checkoutComPaymentService: CheckoutComPaymentService;
  let userIdService: UserIdService;
  let globalMessageService: GlobalMessageService;
  let translationService: TranslationService;
  let userAddressService: UserAddressService;
  let spy: any;
  let el: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        declarations: [
          CheckoutComPaymentMethodsComponent,
          MockCxSpinnerComponent,
          CardComponent,
          FocusDirective,
          MockAtMessageDirective,
          MockCxIconComponent,
          MockCxFeatureDirective,
        ],
        imports: [
          I18nTestingModule,
          CheckoutComPaymentMethodsFormModule,
        ],
        providers: [
          UserAddressAdapter,
          {
            provide: LaunchDialogService,
            useClass: MockLaunchDialogService
          },
          {
            provide: CheckoutBillingAddressFormService,
            useClass: MockCheckoutBillingAddressFormService,
          },
          {
            provide: UserPaymentService,
            useClass: MockUserPaymentService
          },
          {
            provide: CheckoutComPaymentService,
            useClass: MockCheckoutComPaymentService,
          },
          {
            provide: GlobalMessageService,
            useClass: MockGlobalMessageService
          },
          {
            provide: UserIdService,
            useClass: MockUserIdService,
          },
          {
            provide: UserAddressService,
            useClass: MockUserAddressService
          }
        ],
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComPaymentMethodsComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
    userService = TestBed.inject(UserPaymentService);
    checkoutComPaymentService = TestBed.inject(CheckoutComPaymentService);
    userIdService = TestBed.inject(UserIdService);
    translationService = TestBed.inject(TranslationService);
    globalMessageService = TestBed.inject(GlobalMessageService);
    userAddressService = TestBed.inject(UserAddressService);
    spy = spyOn(checkoutComPaymentService, 'getIsABCFromState');
    spy.and.returnValue(of(false));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show basic information', () => {
    function getTitle(elem: DebugElement) {
      return elem.query(By.css('.cx-header')).nativeElement.textContent;
    }

    function getBodyMessage(elem: DebugElement) {
      return elem.query(By.css('.cx-msg')).nativeElement.textContent;
    }

    component.ngOnInit();
    fixture.detectChanges();
    expect(getTitle(el)).toContain('paymentMethods.paymentMethods');
    expect(getBodyMessage(el)).toContain(' paymentMethods.newPaymentMethodsAreAddedDuringCheckout ');
  });

  it('should show spinner if payment methods are loading', () => {
    spyOn(userService, 'getPaymentMethodsLoading').and.returnValue(of(true));

    function getSpinner(elem: DebugElement) {
      return elem.query(By.css('cx-spinner'));
    }

    component.ngOnInit();
    fixture.detectChanges();
    expect(getSpinner(el)).toBeTruthy();
  });

  it('should show payment methods after loading', () => {
    spyOn(userService, 'getPaymentMethodsLoading').and.returnValue(of(false));

    function getCard(elem: DebugElement) {
      return elem.query(By.css('cx-card'));
    }

    component.ngOnInit();
    fixture.detectChanges();
    expect(getCard(el)).toBeTruthy();
  });

  it('should render all payment methods', () => {
    spyOn(userService, 'getPaymentMethodsLoading').and.returnValue(of(false));
    spyOn(userService, 'getPaymentMethods').and.returnValue(
      of([mockPayment, mockPayment])
    );

    function getCards(elem: DebugElement): DebugElement[] {
      return elem.queryAll(By.css('cx-card'));
    }

    component.ngOnInit();
    fixture.detectChanges();
    expect(getCards(el).length).toEqual(2);
  });

  it('should render correct content in card', () => {
    spyOn(userService, 'getPaymentMethodsLoading').and.returnValue(of(false));
    spyOn(userService, 'getPaymentMethods').and.returnValue(
      of([mockPayment, {
        ...mockPayment,
        defaultPayment: false
      }])
    );

    function getCardHeader(elem: DebugElement): string {
      return elem.query(By.css('cx-card .card-header')).nativeElement.textContent;
    }

    function getTextBold(elem: DebugElement): string {
      return elem.query(By.css('cx-card .cx-card-label-bold')).nativeElement.textContent;
    }

    function getCardNumber(elem: DebugElement): string {
      return elem.queryAll(By.css('cx-card .cx-card-label'))[0].nativeElement.textContent;
    }

    function getExpiration(elem: DebugElement): string {
      return elem.queryAll(By.css('cx-card .cx-card-label'))[1].nativeElement.textContent;
    }

    function getCardIcon(elem: DebugElement): any {
      return elem.query(By.css('.cx-card-img-container cx-icon'));
    }

    component.ngOnInit();
    fixture.detectChanges();
    expect(getCardHeader(el)).toContain('paymentCard.defaultPaymentMethod');
    expect(getTextBold(el)).toContain(mockPayment.accountHolderName);
    expect(getCardNumber(el)).toContain(mockPayment.cardNumber);
    expect(getExpiration(el)).toContain(
      `paymentCard.expires month:${mockPayment.expiryMonth} year:${mockPayment.expiryYear}`
    );
    expect(getCardIcon(el)).not.toBe(null);
  });

  it('should show confirm on delete', () => {
    spyOn(userService, 'getPaymentMethodsLoading').and.returnValue(of(false));

    function getDeleteMsg(elem: DebugElement): string {
      return elem.query(By.css('cx-card .cx-card-delete-msg')).nativeElement.textContent;
    }

    function getDeleteButton(elem: DebugElement): any {
      return elem.queryAll(By.css('cx-card .cx-card-actions .btn'))[1].nativeElement;
    }

    function getCancelButton(elem: DebugElement): DebugElement {
      return elem.query(By.css('cx-card .btn-secondary'));
    }

    component.ngOnInit();
    fixture.detectChanges();
    getDeleteButton(el).click();
    fixture.detectChanges();
    expect(getDeleteMsg(el)).toContain('paymentCard.deleteConfirmation');
    getCancelButton(el).nativeElement.click();
    fixture.detectChanges();
    expect(getCancelButton(el)).toBeFalsy();
  });

  it('should successfully delete card', () => {
    spyOn(userService, 'getPaymentMethodsLoading').and.returnValue(of(false));
    spyOn(userService, 'deletePaymentMethod').and.stub();
    spyOn(userService, 'getPaymentMethods').and.returnValue(
      of([mockPayment, {
        ...mockPayment,
        defaultPayment: false
      }])
    );

    function getDeleteButton(elem: DebugElement): any {
      return elem.queryAll(By.css('cx-card .cx-card-actions .btn'))[1].nativeElement;
    }

    function getConfirmButton(elem: DebugElement): DebugElement {
      return elem.query(By.css('cx-card .cx-card-body-delete .btn-primary'));
    }

    component.ngOnInit();
    fixture.detectChanges();
    getDeleteButton(el).click();
    fixture.detectChanges();
    getConfirmButton(el).nativeElement.click();
    fixture.detectChanges();
    expect(userService.deletePaymentMethod).toHaveBeenCalledWith(
      mockPayment.id
    );
  });

  it('should show update payment method form', () => {
    spyOn(userService, 'getPaymentMethodsLoading').and.returnValue(of(false));
    spyOn(userService, 'getPaymentMethods').and.returnValue(
      of([mockPayment])
    );

    function getEditButton(elem: DebugElement): any {
      return elem.queryAll(By.css('cx-card .btn'))[0]?.nativeElement;
    }

    function getPaymentMethodForm(elem: DebugElement): DebugElement {
      return elem.query(By.css('y-checkout-com-payment-form'));
    }

    component.ngOnInit();
    fixture.detectChanges();
    getEditButton(el).click();
    fixture.detectChanges();
    expect(getPaymentMethodForm(el)).toBeTruthy();
  });

  it('should not show edit button', () => {
    spyOn(userService, 'getPaymentMethodsLoading').and.returnValue(of(false));
    spyOn(userService, 'getPaymentMethods').and.returnValue(
      of([mockPayment])
    );
    spy.and.returnValue(of(true));

    function getActionButtons(elem: DebugElement): any {
      return elem.queryAll(By.css('cx-card .btn'));
    }

    function getPaymentMethodForm(elem: DebugElement): DebugElement {
      return elem.query(By.css('y-checkout-com-payment-form'));
    }

    component.ngOnInit();
    fixture.detectChanges();
    expect(getActionButtons(el).length).toBe(1);
    expect(getPaymentMethodForm(el)).toBeFalsy();
  });

  describe('hidePaymentForm', () => {
    it('should hide the payment form when hidePaymentForm is called', () => {
      component.showEditAddressForm = true;
      component.hidePaymentForm();
      expect(component.showEditAddressForm).toBeFalse();
    });
  });

  describe('editPaymentMethodButtonHandle', () => {
    it('should set showEditAddressForm to true and set selectedPaymentMethod', () => {
      const paymentMethod: CheckoutComPaymentDetails = {
        id: '1',
        cardNumber: '4111 1111 1111 1111'
      };
      component.editPaymentMethodButtonHandle(paymentMethod);
      expect(component.showEditAddressForm).toBeTrue();
      expect(component.selectedPaymentMethod).toEqual(paymentMethod);
    });

    it('should not change selectedPaymentMethod if paymentMethod is undefined', () => {
      component.selectedPaymentMethod = {
        id: '1',
        cardNumber: '4111 1111 1111 1111'
      };
      component.editPaymentMethodButtonHandle(undefined);
      expect(component.selectedPaymentMethod).toEqual(undefined);
    });
  });

  describe('getCardContent', () => {
    it('should return card content with default payment method header', (done) => {
      const paymentDetails: PaymentDetails = {
        defaultPayment: true,
        accountHolderName: 'John Doe',
        expiryMonth: '11',
        expiryYear: '2020',
        cardNumber: '4111 1111 1111 1111',
        cardType: { code: 'visa' },
        id: '1'
      };

      spyOn(translationService, 'translate').and.callFake((key: string) => {
        const translations = {
          'paymentCard.setAsDefault': 'Set as default',
          'common.delete': 'Delete',
          'common.edit': 'Edit',
          'paymentCard.deleteConfirmation': 'Are you sure?',
          'paymentCard.expires': 'Expires 11/2020',
          'paymentCard.defaultPaymentMethod': 'Default Payment Method'
        };
        return of(translations[key]);
      });

      component.getCardContent(paymentDetails).subscribe((card) => {
        expect(card.header).toBe('Default Payment Method');
        expect(card.textBold).toBe('John Doe');
        expect(card.text).toEqual(['4111 1111 1111 1111', 'Expires 11/2020']);
        expect(card.actions.length).toBe(2);
        expect(card.actions[0].name).toBe('Edit');
        expect(card.actions[1].name).toBe('Delete');
        done();
      });
    });

    it('should return card content without default payment method header', (done) => {
      const paymentDetails: PaymentDetails = {
        defaultPayment: false,
        accountHolderName: 'Jane Doe',
        expiryMonth: '12',
        expiryYear: '2023',
        cardNumber: '4222 2222 2222 2222',
        cardType: { code: 'master' },
        id: '2'
      };

      spyOn(translationService, 'translate').and.callFake((key: string) => {
        const translations = {
          'paymentCard.setAsDefault': 'Set as default',
          'common.delete': 'Delete',
          'common.edit': 'Edit',
          'paymentCard.deleteConfirmation': 'Are you sure?',
          'paymentCard.expires': 'Expires 12/2023',
          'paymentCard.defaultPaymentMethod': 'Default Payment Method'
        };
        return of(translations[key]);
      });

      // @ts-ignore
      spyOn(component, 'getIsABCParam').and.returnValue(of(false));

      component.getCardContent(paymentDetails).subscribe((card) => {
        expect(card.header).toBeUndefined();
        expect(card.textBold).toBe('Jane Doe');
        expect(card.text).toEqual(['4222 2222 2222 2222', 'Expires 12/2023']);
        expect(card.actions.length).toBe(3);
        expect(card.actions[0].name).toBe('Set as default');
        expect(card.actions[1].name).toBe('Edit');
        expect(card.actions[2].name).toBe('Delete');
        done();
      });
    });

    it('should return card content without edit action if isABC is true', (done) => {
      const paymentDetails: PaymentDetails = {
        defaultPayment: false,
        accountHolderName: 'Jane Doe',
        expiryMonth: '12',
        expiryYear: '2023',
        cardNumber: '4222 2222 2222 2222',
        cardType: { code: 'master' },
        id: '2'
      };

      spyOn(translationService, 'translate').and.callFake((key: string) => {
        const translations = {
          'paymentCard.setAsDefault': 'Set as default',
          'common.delete': 'Delete',
          'common.edit': 'Edit',
          'paymentCard.deleteConfirmation': 'Are you sure?',
          'paymentCard.expires': 'Expires 12/2023',
          'paymentCard.defaultPaymentMethod': 'Default Payment Method'
        };
        return of(translations[key]);
      });

      // @ts-ignore
      spyOn(component, 'getIsABCParam').and.returnValue(of(true));

      component.getCardContent(paymentDetails).subscribe((card) => {
        expect(card.header).toBeUndefined();
        expect(card.textBold).toBe('Jane Doe');
        expect(card.text).toEqual(['4222 2222 2222 2222', 'Expires 12/2023']);
        expect(card.actions.length).toBe(2);
        expect(card.actions[0].name).toBe('Set as default');
        expect(card.actions[1].name).toBe('Delete');
        done();
      });
    });
  });

  describe('setPaymentDetails', () => {
    it('should call updatePaymentDetails and hide the payment form on success', (done) => {
      const paymentDetails: CheckoutComPaymentDetails = {
        id: '1',
        cardNumber: '4111 1111 1111 1111'
      };
      spyOn(checkoutComPaymentService, 'updatePaymentDetails').and.returnValue(of(null));
      spyOn(component, 'hidePaymentForm');

      component.setPaymentDetails(paymentDetails);

      expect(checkoutComPaymentService.updatePaymentDetails).toHaveBeenCalledWith(paymentDetails);
      setTimeout(() => {
        expect(component.hidePaymentForm).toHaveBeenCalled();
        done();
      });
    });

    it('should log error and not hide the payment form on failure', (done) => {
      const paymentDetails: CheckoutComPaymentDetails = {
        id: '1',
        cardNumber: '4111 1111 1111 1111'
      };
      const error = new Error('error');
      spyOn(checkoutComPaymentService, 'updatePaymentDetails').and.returnValue(throwError(() => error));
      spyOn(component, 'hidePaymentForm');
      spyOn(component['logger'], 'error');
      spyOn(globalMessageService, 'add');

      component.setPaymentDetails(paymentDetails);

      expect(checkoutComPaymentService.updatePaymentDetails).toHaveBeenCalledWith(paymentDetails);
      setTimeout(() => {
        expect(component.hidePaymentForm).not.toHaveBeenCalled();
        expect(globalMessageService?.add).toHaveBeenCalledWith({ key: 'paymentForm.merchantKeyFailed' }, GlobalMessageType.MSG_TYPE_ERROR);
        expect(component['logger'].error).toHaveBeenCalledWith('updatePaymentDetails with errors', { error });
        done();
      });
    });
  });

  describe('setEditPaymentMethod', () => {
    it('should set editCard to paymentDetails id if it is different', () => {
      component.editCard = '2';
      const paymentDetails: PaymentDetails = {
        id: '1',
        cardNumber: '4111 1111 1111 1111'
      };
      component.setEditPaymentMethod(paymentDetails);
      expect(component.editCard).toBe('1');
    });

    it('should call deletePaymentMethod if editCard is the same as paymentDetails id', () => {
      component.editCard = '1';
      const paymentDetails: PaymentDetails = {
        id: '1',
        cardNumber: '4111 1111 1111 1111'
      };
      spyOn(component, 'deletePaymentMethod');
      component.setEditPaymentMethod(paymentDetails);
      expect(component.deletePaymentMethod).toHaveBeenCalledWith(paymentDetails);
    });
  });

  describe('getIsABCParam', () => {
    it('should return true when userId is valid and getIsABCFromState returns true', (done) => {
      spyOn(userIdService, 'getUserId').and.returnValue(of('123'));
      spy.and.returnValue(of(true));

      component['getIsABCParam']().subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should return false when userId is valid and getIsABCFromState returns false', (done) => {
      spyOn(userIdService, 'getUserId').and.returnValue(of('123'));
      spy.and.returnValue(of(false));

      component['getIsABCParam']().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });
  });
});
