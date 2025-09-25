import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { SPDKNamespace } from 'app/interfaces/spdk.interface';
import { LoaderService } from 'app/modules/loader/loader.service';
import { SlideInRef } from 'app/modules/slide-ins/slide-in-ref';
import { SnackbarService } from 'app/modules/snackbar/services/snackbar.service';
import { ApiService } from 'app/modules/websocket/api.service';

import { SPDKBaseNamespaceFormComponent } from 'app/pages/sharing/spdk/spdk-namespaces/spdk-base-namespace-form/spdk-base-namespace-form.component';
import { SPDKNamespaceChanges } from 'app/pages/sharing/spdk/spdk-namespaces/spdk-base-namespace-form/spdk-namespace-changes.interface';

export interface NamespaceFormParams {
  namespace?: SPDKNamespace;
  subsystemId: number;
}

@UntilDestroy()
@Component({
  selector: 'spdk-namespace-form',
  templateUrl: './spdk-namespace-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SPDKBaseNamespaceFormComponent,
  ],
})
export class SPDKNamespaceFormComponent {
  slideInRef = inject<SlideInRef<NamespaceFormParams, SPDKNamespaceChanges>>(SlideInRef);
  private api = inject(ApiService);
  private snackbar = inject(SnackbarService);
  private loader = inject(LoaderService);
  private translate = inject(TranslateService);
  protected existingNamespace = signal<SPDKNamespace>(undefined);
  protected error = signal<unknown>(null);

  constructor() {
    this.existingNamespace.set(this.slideInRef.getData().namespace);
  }

  protected get subsystemId(): number {
    return this.slideInRef.getData().subsystemId;
  }

  protected onSubmit(newNamespace: SPDKNamespaceChanges): void {
    const payload = {
      ...newNamespace,
      subsys_id: this.subsystemId,
    };

    const request$ = this.existingNamespace()
      ? this.api.call('spdk.namespace.update', [this.existingNamespace().id, payload])
      : this.api.call('spdk.namespace.create', [payload]);

    request$.pipe(
      this.loader.withLoader(),
      untilDestroyed(this),
    )
      .subscribe({
        next: () => {
          const message = this.existingNamespace()
            ? this.translate.instant('Namespace updated.')
            : this.translate.instant('Namespace created.');

          this.snackbar.success(message);

          this.slideInRef.close({
            response: newNamespace,
            error: null,
          });
        },
        error: (error: unknown) => {
          this.error.set(error);
        },
      });
  }
}
