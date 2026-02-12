import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { I18nTestingModule } from '@spartacus/core';
import { LaunchDialogService } from '@spartacus/storefront';
import { of } from 'rxjs';

import { CheckoutComApmAchAccountListModalComponent } from './checkout-com-apm-ach-account-list-modal.component';

const institutionMeta = {
  name: 'Bank of America',
  institution_id: 'ins_127989'
};

const accountMeta1 = {
  id: '4lgVyA4wVqSZVAjQ7Q1BimzZKzDb7ac3ajKVD',
  name: 'Plaid Checking',
  mask: '0000',
  type: 'depository',
  subtype: 'checking',
  verification_status: null,
  class_type: null
};

const accountMeta2 = {
  id: '5QqJxWGn7zCBrqKv5jAMUk61aKmRDBtpNvwRq',
  name: 'Plaid Savings',
  mask: '1111',
  type: 'depository',
  subtype: 'savings',
  verification_status: null,
  class_type: null
};

const achMetadata = {
  status: null,
  link_session_id: 'session_id',
  institution: institutionMeta,
  accounts: [accountMeta1, accountMeta2],
  account: accountMeta1,
  account_id: accountMeta1.id,
  transfer_status: null,
  public_token: 'public-sandbox-676e2b36-b1cd-49ab-9a27-3933a001393e'
};

describe('CheckoutComApmAchAccountListModalComponent', () => {
  let component: CheckoutComApmAchAccountListModalComponent;
  let fixture: ComponentFixture<CheckoutComApmAchAccountListModalComponent>;
  let launchDialogService: jasmine.SpyObj<LaunchDialogService>;
  let formElement: DebugElement;

  beforeEach(async () => {
    const launchDialogServiceSpy = jasmine.createSpyObj(
      'LaunchDialogService',
      ['closeDialog'],
      { data$: of({ achMetadata }) },
    );
    await TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          I18nTestingModule,
        ],
        declarations: [
          CheckoutComApmAchAccountListModalComponent,
        ],
        providers: [
          UntypedFormBuilder,
          {
            provide: LaunchDialogService,
            useValue: launchDialogServiceSpy
          },
        ]
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComApmAchAccountListModalComponent);
    component = fixture.componentInstance;
    component.achMetadata = achMetadata;
    launchDialogService = TestBed.inject(LaunchDialogService) as jasmine.SpyObj<LaunchDialogService>;
    formElement = fixture.debugElement.query(By.css('form'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should verify archMetaData is not empty', () => {
    expect(component.achMetadata).toBe(achMetadata);
  });

  it('should set default value as account_id', () => {
    expect(component.achAccountListForm.get('account_id').value).toBe(achMetadata.account_id);
  });

  it('should close dialog with specified reason', () => {
    component.close('close');
    expect(launchDialogService.closeDialog).toHaveBeenCalledWith({ type: 'close' });
  });

  it('should close dialog with different reason', () => {
    component.close('cancel');
    expect(launchDialogService.closeDialog).toHaveBeenCalledWith({ type: 'cancel' });
  });

  it('should close dialog with selected account data on form submit', () => {
    component.achAccountListForm.patchValue({ account_id: accountMeta2.id });
    component.onSubmit();
    expect(launchDialogService.closeDialog).toHaveBeenCalledWith({
      type: 'submit',
      parameters: {
        ...achMetadata,
        account_id: accountMeta2.id,
        account: accountMeta2
      }
    });
  });

  it('should log error message if selected account is not found on form submit', () => {
    spyOn(component['logger'], 'error');
    component.achAccountListForm.patchValue({ account_id: 'invalid_id' });
    component.onSubmit();
    expect(component['logger'].error).toHaveBeenCalledWith('Account Id Not found');
  });

  it('should add account to existing subtype group', () => {
    component.achAccountList = { checking: [accountMeta1] };
    const newAccount = {
      ...accountMeta1,
      id: 'new_id'
    };
    component['achAccountList'][newAccount.subtype].push(newAccount);
    expect(component.achAccountList['checking'].length).toBe(2);
    expect(component.achAccountList['checking'][1]).toEqual(newAccount);
  });

  it('should create new subtype group if it does not exist', () => {
    component.achAccountList = {};
    const newAccount = { ...accountMeta2 };
    component['achAccountList'][newAccount.subtype] = [newAccount];
    expect(component.achAccountList['savings'].length).toBe(1);
    expect(component.achAccountList['savings'][0]).toEqual(newAccount);
  });

  describe('UI Components', () => {
    describe('should update  form with selected value', () => {

      beforeEach(() => {
        expect(formElement).toBeTruthy();
        const options = formElement.queryAll(By.css('form .cx-list-group-item'));
        expect(options).toBeTruthy();
        const newValue = achMetadata.accounts[1].id;
        expect(component.achAccountListForm.get('account_id').value).toBe(achMetadata.account_id);
        expect(options.length === achMetadata.accounts.length).toBeTrue();
        options[1].query(By.css(`#input-${newValue}`)).nativeElement.click();
        fixture.detectChanges();
        expect(component.achAccountListForm.get('account_id').value).toBe(newValue);
      });

      it('should submit form using selected id', () => {
        const submitButton = formElement.query(By.css('button.btn-primary'));
        expect(submitButton).toBeTruthy();
        submitButton.nativeElement.click();
        const parameters = {
          ...achMetadata,
          account_id: '5QqJxWGn7zCBrqKv5jAMUk61aKmRDBtpNvwRq',
          account: accountMeta2,
        };
        expect(launchDialogService.closeDialog).toHaveBeenCalledWith({
          type: 'submit',
          parameters
        });
      });
    });

    it('should close modal', () => {
      const closeButton = formElement.query(By.css('.close'));
      expect(closeButton).toBeTruthy();
      closeButton.nativeElement.click();
      expect(launchDialogService.closeDialog).toHaveBeenCalledWith({ type: 'close' });
    });
  });

});

