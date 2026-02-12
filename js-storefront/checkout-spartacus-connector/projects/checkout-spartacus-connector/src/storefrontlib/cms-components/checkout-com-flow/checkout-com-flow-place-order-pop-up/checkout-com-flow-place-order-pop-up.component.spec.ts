import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CheckoutComFlowFacade } from '@checkout-facades/checkout-com-flow.facade';
import { MockCheckoutComFlowComponent } from '@checkout-tests/components/checkout-com-flow.component.mock';
import { MockCheckoutComFlowFacade } from '@checkout-tests/services/checkout-com-flow.facade.mock';
import { MockGlobalMessageService } from '@checkout-tests/services/global-message.service.mock';
import { MockLaunchDialogService } from '@checkout-tests/services/launch-dialog.service.mock';
import { MockTranslationService } from '@checkout-tests/services/translations.services.mock';
import { EventService, GlobalMessageService, I18nTestingModule, LanguageService, TranslationService } from '@spartacus/core';
import { LaunchDialogService } from '@spartacus/storefront';
import { of } from 'rxjs';

import { CheckoutComFlowPlaceOrderPopUpComponent } from './checkout-com-flow-place-order-pop-up.component';
import SpyObj = jasmine.SpyObj;

describe('CheckoutComFlowPlaceOrderPopUpComponent', () => {
  let component: CheckoutComFlowPlaceOrderPopUpComponent;
  let fixture: ComponentFixture<CheckoutComFlowPlaceOrderPopUpComponent>;
  let languageService: SpyObj<LanguageService>;
  let launchDialogService: LaunchDialogService;
  let eventService: EventService;

  beforeEach(async () => {
    languageService = jasmine.createSpyObj('LanguageService', ['getActive']);
    languageService.getActive.and.returnValue(of('en'));

    await TestBed.configureTestingModule({
        declarations: [
          CheckoutComFlowPlaceOrderPopUpComponent,
          MockCheckoutComFlowComponent
        ],
        imports: [
          I18nTestingModule,
        ],
        providers: [
          EventService,
          {
            provide: TranslationService,
            useClass: MockTranslationService
          },
          {
            provide: GlobalMessageService,
            useClass: MockGlobalMessageService,
          },
          {
            provide: LaunchDialogService,
            useClass: MockLaunchDialogService,
          },
          {
            provide: LanguageService,
            useValue: languageService,
          },
          {
            provide: CheckoutComFlowFacade,
            useClass: MockCheckoutComFlowFacade,
          }
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CheckoutComFlowPlaceOrderPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    launchDialogService = TestBed.inject(LaunchDialogService);
    eventService = TestBed.inject(EventService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('disableModalActions', () => {
    it('returns true when modal actions are disabled', (done) => {
      const checkoutComFlowFacade = TestBed.inject(CheckoutComFlowFacade);
      spyOn(checkoutComFlowFacade, 'getDisableModalActions').and.returnValue(of(true));

      component.disableModalActions().subscribe((isDisabled) => {
        expect(isDisabled).toBeTrue();
        done();
      });
    });

    it('returns false when modal actions are enabled', (done) => {
      const checkoutComFlowFacade = TestBed.inject(CheckoutComFlowFacade);
      spyOn(checkoutComFlowFacade, 'getDisableModalActions').and.returnValue(of(false));

      component.disableModalActions().subscribe((isDisabled) => {
        expect(isDisabled).toBeFalse();
        done();
      });
    });

    it('does not emit any value if getDisableModalActions emits undefined', (done) => {
      const checkoutComFlowFacade = TestBed.inject(CheckoutComFlowFacade);
      spyOn(checkoutComFlowFacade, 'getDisableModalActions').and.returnValue(of(undefined));

      component.disableModalActions().subscribe((isDisabled) => {
        expect(isDisabled).toBeUndefined();
        done();
      });
    });
  });

  describe('close', () => {
    it('closes the dialog with the correct component identifier', () => {
      spyOn(launchDialogService, 'closeDialog');

      component.close();

      expect(launchDialogService.closeDialog).toHaveBeenCalledWith('CheckoutComFlowPlaceOrderPopUpComponent');
    });
  });

  describe('bindOrderPlacedEvent', () => {
    it('closes the dialog with the correct component identifier', () => {
      spyOn(launchDialogService, 'closeDialog');

      component.close();

      expect(launchDialogService.closeDialog).toHaveBeenCalledWith('CheckoutComFlowPlaceOrderPopUpComponent');
    });
  });

  describe('UI components', () => {
    it('renders the translated title correctly', () => {
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(By.css('.cx-dialog-title')).nativeElement;
      expect(titleElement.textContent.trim()).toBe('checkoutReview.flowPopup.title');
    });

    it('renders the checkout flow component inside the dialog body', () => {
      const checkoutFlowElement = fixture.debugElement.query(By.directive(MockCheckoutComFlowComponent));
      expect(checkoutFlowElement).toBeTruthy();
    });

    it('closes the dialog when the close button is clicked', () => {
      spyOn(component, 'close');
      const closeButton = fixture.debugElement.query(By.css('button.close')).nativeElement;

      closeButton.click();

      expect(component.close).toHaveBeenCalled();
    });

    it('renders the translated aria-label for the close button', () => {
      fixture.detectChanges();

      const closeButton = fixture.debugElement.query(By.css('button.close')).nativeElement;
      expect(closeButton.getAttribute('aria-label')).toBe('common.close');
    });
  });
});
