import { ComponentFixture, TestBed } from '@angular/core/testing';
import { I18nTestingModule } from '@spartacus/core';
import { LaunchDialogService } from '@spartacus/storefront';

import { CheckoutComApmAchConsentsComponent } from './checkout-com-apm-ach-consents.component';

describe('CheckoutComApmAchConsentsComponent', () => {
  let component: CheckoutComApmAchConsentsComponent;
  let fixture: ComponentFixture<CheckoutComApmAchConsentsComponent>;
  let launchDialogService: jasmine.SpyObj<LaunchDialogService>;

  beforeEach(async () => {
    const launchDialogServiceSpy = jasmine.createSpyObj('LaunchDialogService', ['closeDialog']);
    await TestBed.configureTestingModule({
        declarations: [CheckoutComApmAchConsentsComponent],
        imports: [I18nTestingModule],
        providers: [
          {
            provide: LaunchDialogService,
            useValue: launchDialogServiceSpy
          }
        ]
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComApmAchConsentsComponent);
    component = fixture.componentInstance;
    launchDialogService = TestBed.inject(LaunchDialogService) as jasmine.SpyObj<LaunchDialogService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog', () => {
    component.close();
    expect(component['launchDialogService'].closeDialog).toHaveBeenCalledWith('');
  });
});

