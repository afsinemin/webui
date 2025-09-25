import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatCard, MatCardContent, MatCardHeader, MatCardTitle,
} from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { UiSearchDirective } from 'app/directives/ui-search.directive';
import { IxIconComponent } from 'app/modules/ix-icon/ix-icon.component';
import { SlideIn } from 'app/modules/slide-ins/slide-in';
import { TestDirective } from 'app/modules/test-id/test.directive';


import { subsystemNamespacesCardElements } from 'app/pages/sharing/nvme-of/subsystem-details/subsystem-namespaces-card/subsystem-namespaces-card.elements';
import { SPDKDeleteNamespaceDialogComponent } from './spdk-delete-namespace-dialog/spdk-delete-namespace-dialog.component';
import { helptextNvmeOf } from 'app/helptext/sharing/nvme-of/nvme-of';
import { SPDKNamespace, SPDKSubsystemDetails } from 'app/interfaces/spdk.interface';
import { SPDKStore } from 'app/pages/sharing/spdk/spdk-services/spdk.store';
import { SPDKNamespaceFormComponent } from 'app/pages/sharing/spdk/spdk-subsystem-details/spdk-subsystem-namespaces-card/spdk-spdk-namespace-form/spdk-namespace-form.component';
import { SPDKNamespaceDescriptionComponent } from 'app/pages/sharing/spdk/spdk-namespaces/spdk-namespace-description/spdk-namespace-description.component';

@UntilDestroy()
@Component({
  selector: 'spdk-subsystem-namespaces-card',
  templateUrl: './spdk-subsystem-namespaces-card.component.html',
  styleUrl: './spdk-subsystem-namespaces-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    TranslateModule,
    IxIconComponent,
    MatCardContent,
    MatIconButton,
    SPDKNamespaceDescriptionComponent,
    MatTooltip,
    TestDirective,
    UiSearchDirective,
    MatButton,
  ],
})
export class SPDKSubsystemNamespacesCardComponent {
  private slideIn = inject(SlideIn);
  private SPDKStore = inject(SPDKStore);
  private matDialog = inject(MatDialog);

  subsystem = input.required<SPDKSubsystemDetails>();

  protected readonly helptext = helptextNvmeOf;

  protected readonly searchableElements = subsystemNamespacesCardElements;

  protected onAddNamespace(): void {
    this.slideIn.open(SPDKNamespaceFormComponent, {
      data: { subsystemId: this.subsystem().id },
    })
      .pipe(
        filter((response) => Boolean(response.response)),
        untilDestroyed(this),
      )
      .subscribe(() => {
        this.SPDKStore.initialize();
      });
  }

  protected onDeleteNamespace(namespace: SPDKNamespace): void {
    this.matDialog.open(SPDKDeleteNamespaceDialogComponent, { data: namespace })
      .afterClosed()
      .pipe(
        filter(Boolean),
        untilDestroyed(this),
      )
      .subscribe(() => {
        this.SPDKStore.initialize();
      });
  }
}
