import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle,
} from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SPDKNamespaceType } from 'app/enums/spdk.enum';
import { DeleteNamespaceParams } from 'app/interfaces/spdk.interface';
import { SPDKNamespace } from 'app/interfaces/spdk.interface';
import { FormActionsComponent } from 'app/modules/forms/ix-forms/components/form-actions/form-actions.component';
import { IxCheckboxComponent } from 'app/modules/forms/ix-forms/components/ix-checkbox/ix-checkbox.component';
import { LoaderService } from 'app/modules/loader/loader.service';
import { SnackbarService } from 'app/modules/snackbar/services/snackbar.service';
import { TestDirective } from 'app/modules/test-id/test.directive';
import { ApiService } from 'app/modules/websocket/api.service';
import { ErrorHandlerService } from 'app/services/errors/error-handler.service';

@UntilDestroy()
@Component({
  selector: 'spdk-delete-namespace-dialog',
  templateUrl: './spdk-delete-namespace-dialog.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    IxCheckboxComponent,
    ReactiveFormsModule,
    FormActionsComponent,
    MatButton,
    TestDirective,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
})
export class SPDKDeleteNamespaceDialogComponent {
  private dialogRef = inject<MatDialogRef<SPDKDeleteNamespaceDialogComponent>>(MatDialogRef);
  private api = inject(ApiService);
  private loader = inject(LoaderService);
  private errorHandler = inject(ErrorHandlerService);
  private snackbar = inject(SnackbarService);
  private translate = inject(TranslateService);
  protected namespace = inject<SPDKNamespace>(MAT_DIALOG_DATA);

  readonly removeFileControl = new FormControl(false);

  protected get isFile(): boolean {
    return this.namespace.device_type === SPDKNamespaceType.File;
  }

  protected onDelete(): void {
    const params: DeleteNamespaceParams = [this.namespace.id];
    if (this.isFile && this.removeFileControl.value) {
      params.push({ remove: true });
    }

    this.api.call('spdk.namespace.delete', params)
      .pipe(
        this.loader.withLoader(),
        this.errorHandler.withErrorHandler(),
        untilDestroyed(this),
      )
      .subscribe(() => {
        this.snackbar.success(this.translate.instant('Namespace deleted.'));
        this.dialogRef.close(true);
      });
  }
}
