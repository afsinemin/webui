import { ChangeDetectionStrategy, Component, computed, OnInit, signal, inject } from '@angular/core';
import {
  FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  finalize, switchMap,
} from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { choicesToOptions } from 'app/helpers/operators/options.operators';
import { mapToOptions } from 'app/helpers/options.helper';
import { helptextNvmeOf} from 'app/helptext/sharing/nvme-of/nvme-of';

import { FormActionsComponent } from 'app/modules/forms/ix-forms/components/form-actions/form-actions.component';
import { IxFieldsetComponent } from 'app/modules/forms/ix-forms/components/ix-fieldset/ix-fieldset.component';
import { IxInputComponent } from 'app/modules/forms/ix-forms/components/ix-input/ix-input.component';
import { IxSelectComponent } from 'app/modules/forms/ix-forms/components/ix-select/ix-select.component';
import { FormErrorHandlerService } from 'app/modules/forms/ix-forms/services/form-error-handler.service';
import { ModalHeaderComponent } from 'app/modules/slide-ins/components/modal-header/modal-header.component';
import { SlideInRef } from 'app/modules/slide-ins/slide-in-ref';
import { TestDirective } from 'app/modules/test-id/test.directive';
import { ApiService } from 'app/modules/websocket/api.service';
import { SPDKService } from 'app/pages/sharing/spdk/spdk-services/spdk.service';
import { SPDKTransportTypeLabels, SPDKTransportType } from 'app/enums/spdk.enum';
import { SPDKPort } from 'app/interfaces/spdk.interface';

@UntilDestroy()
@Component({
  selector: 'spdk-port-form',
  templateUrl: './spdk-port-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    IxFieldsetComponent,
    MatCard,
    MatCardContent,
    ModalHeaderComponent,
    TranslateModule,
    ReactiveFormsModule,
    IxSelectComponent,
    IxInputComponent,
    FormActionsComponent,
    MatButton,
    TestDirective,
  ],
})
export class SPDKPortFormComponent implements OnInit {
  private api = inject(ApiService);
  private SPDKService = inject(SPDKService);
  private formBuilder = inject(NonNullableFormBuilder);
  private translate = inject(TranslateService);
  private formErrorHandler = inject(FormErrorHandlerService);
  slideInRef = inject<SlideInRef<SPDKPort | undefined, SPDKPort | null>>(SlideInRef);

  protected isLoading = signal(false);

  private existingPort = signal<SPDKPort | null>(null);

  protected isNew = computed(() => !this.existingPort());

  protected types$ = this.SPDKService.getSupportedTransports().pipe(
    map((supportedTransports) => {
      const allOptions = mapToOptions(SPDKTransportTypeLabels, this.translate);

      return allOptions.filter((option) => supportedTransports.includes(option.value));
    }),
  );

  protected readonly helptext = helptextNvmeOf;

  protected form = this.formBuilder.group({
    addr_trtype: [SPDKTransportType.Tcp],
    addr_trsvcid: [null as number | string, Validators.required],
    addr_traddr: ['', Validators.required],
  });

  protected addresses$ = this.form.controls.addr_trtype.valueChanges.pipe(
    startWith(this.form.value.addr_trtype),
    switchMap((type) => {
      return this.api.call('spdk.port.transport_address_choices', [type]);
    }),
    choicesToOptions(),
  );

  get isTcp(): boolean {
    return this.form.value.addr_trtype === SPDKTransportType.Tcp;
  }

  get isFibreChannel(): boolean {
    return this.form.value.addr_trtype === SPDKTransportType.FibreChannel;
  }

  ngOnInit(): void {
    const existingPort = this.slideInRef.getData();

    if (existingPort) {
      this.existingPort.set(existingPort);

      this.form.patchValue(existingPort);
    }
  }

  protected onSubmit(): void {
    this.isLoading.set(true);

    const payload = this.form.getRawValue();

    const request$ = this.isNew()
      ? this.api.call('spdk.port.create', [payload])
      : this.api.call('spdk.port.update', [this.existingPort().id, payload]);

    request$.pipe(
      finalize(() => this.isLoading.set(false)),
      untilDestroyed(this),
    ).subscribe({
      next: (port) => {
        this.slideInRef.close({
          response: port,
        });
      },
      error: (error: unknown) => {
        this.formErrorHandler.handleValidationErrors(error, this.form);
      },
    });
  }
}
