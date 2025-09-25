import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import {
  MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious,
} from '@angular/material/stepper';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  catchError,
  finalize, forkJoin, map, Observable, of, switchMap,
  tap,
} from 'rxjs';
import { ServiceName } from 'app/enums/service-name.enum';
import { helptextNvmeOf } from 'app/helptext/sharing/nvme-of/nvme-of';
import {
  CreateSPDKNamespace, SPDKHost, SPDKPort, SPDKSubsystem,
} from 'app/interfaces/spdk.interface';
import { DetailsItemComponent } from 'app/modules/details-table/details-item/details-item.component';
import { DetailsTableComponent } from 'app/modules/details-table/details-table.component';
import { SubsystemPartiallyCreatedDialogComponent } from 'app/modules/dialog/components/subsystem-partially-created-dialog/subsystem-partially-created-dialog.component';
import { EditableComponent } from 'app/modules/forms/editable/editable.component';
import { IxCheckboxComponent } from 'app/modules/forms/ix-forms/components/ix-checkbox/ix-checkbox.component';
import { IxInputComponent } from 'app/modules/forms/ix-forms/components/ix-input/ix-input.component';
import {
  UseIxIconsInStepperComponent,
} from 'app/modules/ix-icon/use-ix-icons-in-stepper/use-ix-icons-in-stepper.component';
import { ModalHeaderComponent } from 'app/modules/slide-ins/components/modal-header/modal-header.component';
import { SlideInRef } from 'app/modules/slide-ins/slide-in-ref';
import { SnackbarService } from 'app/modules/snackbar/services/snackbar.service';
import { TestDirective } from 'app/modules/test-id/test.directive';
import { ApiService } from 'app/modules/websocket/api.service';

import { ErrorHandlerService } from 'app/services/errors/error-handler.service';
import { AppState } from 'app/store';
import { checkIfServiceIsEnabled } from 'app/store/services/services.actions';
import { SPDKNamespaceChanges } from 'app/pages/sharing/spdk/spdk-namespaces/spdk-base-namespace-form/spdk-namespace-changes.interface';
import { SPDKService } from 'app/pages/sharing/spdk/spdk-services/spdk.service';
import { SPDKAddSubsystemHostsComponent } from 'app/pages/sharing/spdk/spdk-add-subsystem/spdk-add-subsystem-hosts/spdk-add-subsystem-hosts.component';
import { SPDKAddSubsystemNamespacesComponent } from 'app/pages/sharing/spdk/spdk-add-subsystem/spdk-add-subsystem-namespaces/spdk-add-subsystem-namespaces.component';
import { SPDKAddSubsystemPortsComponent } from 'app/pages/sharing/spdk/spdk-add-subsystem/spdk-add-subsystem-ports/spdk-add-subsystem-ports.component';

@UntilDestroy()
@Component({
  selector: 'spdk-add-subsystem',
  styleUrls: ['./spdk-add-subsystem.component.scss'],
  templateUrl: './spdk-add-subsystem.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ModalHeaderComponent,
    TranslateModule,
    MatCard,
    ReactiveFormsModule,
    MatStep,
    MatStepLabel,
    MatStepper,
    UseIxIconsInStepperComponent,
    MatButton,
    MatStepperNext,
    TestDirective,
    IxInputComponent,
    MatStepperPrevious,
    IxCheckboxComponent,
    SPDKAddSubsystemHostsComponent,
    SPDKAddSubsystemNamespacesComponent,
    SPDKAddSubsystemPortsComponent,
    DetailsItemComponent,
    DetailsTableComponent,
    EditableComponent,
  ],
})
export class SPDKAddSubsystemComponent {
  private formBuilder = inject(FormBuilder);
  slideInRef = inject<SlideInRef<void, false | SPDKSubsystem>>(SlideInRef);
  private api = inject(ApiService);
  private snackbar = inject(SnackbarService);
  private translate = inject(TranslateService);
  private errorHandler = inject(ErrorHandlerService);
  private SPDKService = inject(SPDKService);
  private store$ = inject<Store<AppState>>(Store);
  private matDialog = inject(MatDialog);

  protected isLoading = signal(false);

  protected form = this.formBuilder.group({
    name: ['', Validators.required],
    subnqn: [''],
    namespaces: [[] as SPDKNamespaceChanges[]],

    allowAnyHost: [true],

    allowedHosts: [[] as SPDKHost[]],

    ports: [[] as SPDKPort[]],
  });

  protected readonly helptext = helptextNvmeOf;

  protected onSubmit(): void {
    this.isLoading.set(true);

    this.createSubsystem().pipe(
      switchMap((subsystem) => {
        return this.createRelatedEntities(subsystem).pipe(
          map((relatedErrors) => ({ subsystem, relatedErrors })),
        );
      }),
      tap(() => this.store$.dispatch(checkIfServiceIsEnabled({ serviceName: ServiceName.SPDK }))),
      finalize(() => this.isLoading.set(false)),
      this.errorHandler.withErrorHandler(),
      untilDestroyed(this),
    ).subscribe(({ subsystem, relatedErrors }) => {
      if (subsystem && relatedErrors?.length > 0) {
        this.matDialog.open(SubsystemPartiallyCreatedDialogComponent, {
          data: {
            subsystem,
            relatedErrors,
          },
        });
      }

      this.snackbar.success(this.translate.instant('New subsystem added'));
      this.slideInRef.close({ response: subsystem });
    });
  }

  private createRelatedEntities(subsystem: SPDKSubsystem): Observable<string[]> {
    const errors: string[] = [];

    const withErrorHandling = (source$: Observable<unknown>, label: string): Observable<unknown> => {
      return source$.pipe(
        catchError((err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          errors.push(this.translate.instant('{label} Error: {error}', { label, error: message }));
          return of(null);
        }),
      );
    };

    const operations: Observable<unknown>[] = [
      withErrorHandling(this.SPDKService.associatePorts(subsystem, this.form.value.ports), this.translate.instant('Ports')),
    ];

    if (!this.form.value.allowAnyHost) {
      operations.push(
        withErrorHandling(this.SPDKService.associateHosts(subsystem, this.form.value.allowedHosts), this.translate.instant('Hosts')),
      );
    }

    if (this.form.value.namespaces?.length) {
      const namespaceOps = this.createNamespaces(subsystem, this.form.value.namespaces)
        .map((ns$) => withErrorHandling(ns$, 'Namespaces'));
      operations.push(...namespaceOps);
    }

    return forkJoin(operations).pipe(
      map(() => errors),
    );
  }

  private createSubsystem(): Observable<SPDKSubsystem> {
    const values = this.form.value;
    const payload = {
      name: values.name,
      subnqn: values.subnqn || null,
      allow_any_host: values.allowAnyHost,
      
    };

    return this.api.call('spdk.subsys.create', [payload]);
  }

  private createNamespaces(subsystem: SPDKSubsystem, namespaces: SPDKNamespaceChanges[]): Observable<unknown>[] {
    return namespaces.map((namespace) => {
      const payload: CreateSPDKNamespace = {
        subsys_id: subsystem.id,
        device_type: namespace.device_type,
        filesize: namespace.filesize,
        device_path: namespace.device_path,
      };
      return this.api.call('spdk.namespace.create', [payload]);
    });
  }
}
