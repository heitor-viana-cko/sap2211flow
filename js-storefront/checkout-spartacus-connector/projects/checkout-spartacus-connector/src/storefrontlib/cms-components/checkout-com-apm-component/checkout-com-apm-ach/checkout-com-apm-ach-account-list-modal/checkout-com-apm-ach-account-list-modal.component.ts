import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AccountMeta, AchSuccessMetadata } from '@checkout-model/Ach';
import { LoggerService } from '@spartacus/core';
import { LaunchDialogService } from '@spartacus/storefront';
import { take, tap } from 'rxjs/operators';

@Component({
  selector: 'lib-checkout-com-apm-ach-account-list-modal',
  templateUrl: './checkout-com-apm-ach-account-list-modal.component.html',
  styleUrls: ['./checkout-com-apm-ach-account-list-modal.component.scss'],
})
export class CheckoutComApmAchAccountListModalComponent implements OnInit {
  achMetadata: AchSuccessMetadata;
  achAccountListForm: UntypedFormGroup = this.fb.group({
    account_id: ['', Validators.required],
  });
  achAccountList: { [key: string]: AccountMeta[] } = {};
  Object: ObjectConstructor = Object;
  protected destroyRef: DestroyRef = inject(DestroyRef);
  protected logger: LoggerService = inject(LoggerService);

  /**
   * Constructor for the CheckoutComApmAchAccountListModalComponent.
   *
   * @param {LaunchDialogService} launchDialogService - Service to handle dialog operations.
   * @param {UntypedFormBuilder} fb - Form builder service to create forms.
   */
  constructor(
    protected launchDialogService: LaunchDialogService,
    protected fb: UntypedFormBuilder
  ) {
  }

  ngOnInit(): void {
    this.launchDialogService.data$
      .pipe(
        take(1),
        tap(({ achMetadata }: { achMetadata: AchSuccessMetadata }): void => {
          this.achMetadata = achMetadata;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ achMetadata }: { achMetadata: AchSuccessMetadata }): void => {
          achMetadata.accounts.map((account: AccountMeta): void => {
            if (this.achAccountList[account.subtype]) {
              this.achAccountList[account.subtype].push(account);
            } else {
              this.achAccountList[account.subtype] = [account];
            }
          });
          this.achAccountListForm.patchValue({ account_id: this.achMetadata.account_id });
        }
      });
  }

  /**
   * Submits the form data to the parent component.
   * Retrieves the selected account based on the account ID from the form.
   * If the account is found, it closes the dialog with the selected account data.
   * If the account is not found, logs an error message.
   *
   * @return {void}
   */
  onSubmit(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const account_id: any = this.achAccountListForm.get('account_id').value;
    const selectedAccount: AccountMeta[] = this.achMetadata.accounts.filter((account: AccountMeta): boolean => account.id === account_id);

    if (selectedAccount.length) {
      const parameters: AchSuccessMetadata = {
        ...this.achMetadata,
        account_id,
        account: selectedAccount[0]
      };
      this.launchDialogService.closeDialog({
        type: 'submit',
        parameters
      });
    } else {
      this.logger.error('Account Id Not found');
    }
  }

  /**
   * Closes the dialog with the specified reason.
   *
   * @param {string} reason - The reason for closing the dialog.
   * @return {void}
   */
  close(reason: string): void {
    this.launchDialogService.closeDialog({ type: reason });
  }
}
