import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { SepaPaymentTypes } from '@checkout-core/interfaces';
import { PaymentType } from '@checkout-model/ApmData';
import { MockCxSpinnerComponent } from '@checkout-tests/components';
import { NgSelectModule } from '@ng-select/ng-select';
import { StoreModule } from '@ngrx/store';
import { I18nTestingModule, UserPaymentService } from '@spartacus/core';
import { FormErrorsModule } from '@spartacus/storefront';
import { of } from 'rxjs';

import { CheckoutComSepaApmComponent } from './checkout-com-sepa-apm.component';

class MockUserPaymentService {
  getAllBillingCountries() {
    return of([
      {
        isocode: 'NL',
        name: 'Netherlands'
      },
      {
        isocode: 'ES',
        name: 'Spain'
      },
      {
        isocode: 'UK',
        name: 'United Kingdom'
      }
    ]);
  }
}

describe('CheckoutComSepaApmComponent', () => {
  let component: CheckoutComSepaApmComponent;
  let fixture: ComponentFixture<CheckoutComSepaApmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        declarations: [
          CheckoutComSepaApmComponent,
          MockCxSpinnerComponent
        ],
        providers: [
          UntypedFormBuilder,
          {
            provide: UserPaymentService,
            useClass: MockUserPaymentService
          },
        ],
        imports: [
          StoreModule.forRoot({}),
          I18nTestingModule,
          ReactiveFormsModule,
          FormErrorsModule,
          NgSelectModule,
        ]
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComSepaApmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should get translations for the payment types', (done) => {

    component.paymentTypes$.subscribe((args) => {
      expect(args).toEqual([
        {
          code: SepaPaymentTypes.SINGLE,
          label: 'sepaForm.paymentTypes.single'
        },
        {
          code: SepaPaymentTypes.RECURRING,
          label: 'sepaForm.paymentTypes.recurring'
        }
      ]);

      done();
    });
  });

  describe('form validation', () => {

    it('should set payment details and billing addr with valid form', () => {
      component.sepaForm.setValue({
        firstName: 'John',
        lastName: 'Doe',
        accountIban: 'DE95100100101234567894',
        addressLine1: 'Street 1',
        addressLine2: '',
        postalCode: '9000',
        city: 'New York',
        country: { isocode: 'US' },
        paymentType: { code: SepaPaymentTypes.RECURRING }
      });

      component.setPaymentDetails.subscribe(({
        paymentDetails,
        billingAddress
      }) => {
        expect(paymentDetails).toEqual({
          type: PaymentType.Sepa,
          firstName: 'John',
          lastName: 'Doe',
          accountIban: 'DE95100100101234567894',
          addressLine1: 'Street 1',
          addressLine2: '',
          postalCode: '9000',
          city: 'New York',
          country: 'US',
          paymentType: SepaPaymentTypes.RECURRING,
        });

        expect(billingAddress).toEqual({
          firstName: 'John',
          lastName: 'Doe',
          line1: 'Street 1',
          line2: '',
          postalCode: '9000',
          town: 'New York',
          country: { isocode: 'US' },
        });
      });

      component.next();
    });

    it('should not call setPaymentDetails with invalid form', () => {
      spyOn(component, 'setPaymentDetails').and.callThrough();

      component.sepaForm.setValue({
        firstName: 'John',
        lastName: 'Doe',
        accountIban: '',
        addressLine1: 'Street 1',
        addressLine2: '',
        postalCode: '9000',
        city: 'New York',
        country: { isocode: 'US' },
        paymentType: { code: SepaPaymentTypes.SINGLE }
      });

      component.next();

      expect(component.setPaymentDetails).not.toHaveBeenCalled();
    });

    it('should not call setPaymentDetails with invalid form postal code - too long', () => {
      spyOn(component, 'setPaymentDetails').and.callThrough();

      component.sepaForm.setValue({
        firstName: 'John',
        lastName: 'Doe',
        accountIban: 'DE95100100101234567894',
        addressLine1: 'Street 1',
        addressLine2: '',
        postalCode: '9000xxxxinvalid',
        city: 'New York',
        country: { isocode: 'US' },
        paymentType: { code: SepaPaymentTypes.SINGLE }
      });

      component.next();

      expect(component.setPaymentDetails).not.toHaveBeenCalled();
    });

    it('should not call setPaymentDetails with invalid form postal code - empty', () => {
      spyOn(component, 'setPaymentDetails').and.callThrough();

      component.sepaForm.setValue({
        firstName: 'John',
        lastName: 'Doe',
        accountIban: 'DE95100100101234567894',
        addressLine1: 'Street 1',
        addressLine2: '',
        postalCode: '',
        city: 'New York',
        country: { isocode: 'US' },
        paymentType: { code: SepaPaymentTypes.SINGLE }
      });

      component.next();

      expect(component.setPaymentDetails).not.toHaveBeenCalled();
    });
  });
});

