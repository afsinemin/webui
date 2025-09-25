import { ChangeDetectionStrategy, ChangeDetectorRef, Component, input, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { uniqBy } from 'lodash-es';
import { filter } from 'rxjs';
import { IxIconComponent } from 'app/modules/ix-icon/ix-icon.component';
import { SlideIn } from 'app/modules/slide-ins/slide-in';
import { TestDirective } from 'app/modules/test-id/test.directive';

import { SPDKNamespaceChanges } from 'app/pages/sharing/spdk/spdk-namespaces/spdk-base-namespace-form/spdk-namespace-changes.interface';
import { SPDKAddSubsystemNamespaceComponent } from 'app/pages/sharing/spdk/spdk-add-subsystem/spdk-add-subsystem-namespaces/spdk-add-subsystem-namespace/spdk-add-subsystem-namespace.component';
import { SPDKNamespaceDescriptionComponent } from 'app/pages/sharing/spdk/spdk-namespaces/spdk-namespace-description/spdk-namespace-description.component';

@UntilDestroy()
@Component({
  selector: 'spdk-add-subsystem-namespaces',
  templateUrl: './spdk-add-subsystem-namespaces.component.html',
  styleUrl: './spdk-add-subsystem-namespaces.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    MatButton,
    MatIconButton,
    IxIconComponent,
    MatTooltip,
    TestDirective,
    SPDKNamespaceDescriptionComponent,
  ],
})
export class SPDKAddSubsystemNamespacesComponent {
  private slideIn = inject(SlideIn);
  private cdr = inject(ChangeDetectorRef);

  namespacesControl = input.required<FormControl<SPDKNamespaceChanges[]>>();

  protected get namespaces(): SPDKNamespaceChanges[] {
    return this.namespacesControl()?.value || [];
  }

  protected onAddNamespace(): void {
    this.slideIn.open(SPDKAddSubsystemNamespaceComponent)
      .pipe(
        filter((response) => Boolean(response.response)),
        untilDestroyed(this),
      )
      .subscribe((response) => {
        const newNamespaces = [...this.namespaces, response.response];
        this.namespacesControl().setValue(uniqBy(newNamespaces, 'device_path'));

        this.cdr.markForCheck();
      });
  }

  protected onDeleteNamespace(indexToRemove: number): void {
    const currentNamespaces = this.namespacesControl().value.filter((_, i) => i !== indexToRemove);
    this.namespacesControl().setValue(currentNamespaces);
  }
}
