import { ChangeDetectionStrategy, Component, computed, input, output, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { sortBy } from 'lodash-es';
import { filter } from 'rxjs/operators';
import { SPDKPort } from 'app/interfaces/spdk.interface';
import { IxIconComponent } from 'app/modules/ix-icon/ix-icon.component';
import { SlideIn } from 'app/modules/slide-ins/slide-in';
import { TestDirective } from 'app/modules/test-id/test.directive';
import { SPDKStore } from 'app/pages/sharing/spdk/spdk-services/spdk.store';
import { SPDKPortFormComponent } from 'app/pages/sharing/spdk/spdk-ports/spdk-port-form/spdk-port-form.component';
import { SPDKPortDescriptionComponent } from 'app/pages/sharing/spdk/spdk-ports/spdk-port-description/spdk-port-description.component';
import { SPDKManagePortsDialog } from 'app/pages/sharing/spdk/spdk-ports/spdk-manage-ports/spdk-manage-ports-dialog.component';

@UntilDestroy()
@Component({
  selector: 'spdk-add-port-menu',
  templateUrl: './spdk-add-port-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IxIconComponent,
    MatButton,
    MatMenu,
    MatMenuItem,
    TestDirective,
    TranslateModule,
    MatMenuTrigger,
    SPDKPortDescriptionComponent,
    MatDivider,
  ],
})
export class SPDKAddPortMenuComponent {
  private slideIn = inject(SlideIn);
  private matDialog = inject(MatDialog);
  private SPDKStore = inject(SPDKStore);

  subsystemPorts = input.required<SPDKPort[]>();
  portSelected = output<SPDKPort>();

  protected allPorts = this.SPDKStore.ports;

  protected noPortsExist = computed(() => !this.allPorts().length);

  protected unusedPorts = computed(() => {
    const usedPortIds = this.subsystemPorts().map((port) => port.id);
    const unusedPorts = this.allPorts().filter((port) => !usedPortIds.includes(port.id));
    return sortBy(unusedPorts, ['addr_trtype', 'addr_traddr', 'addr_trsvcid']);
  });

  protected openPortForm(): void {
    this.slideIn
      .open(SPDKPortFormComponent)
      .pipe(
        filter((response) => Boolean(response.response)),
        untilDestroyed(this),
      )
      .subscribe((response) => {
        this.selectPort(response.response);
      });
  }

  protected selectPort(port: SPDKPort): void {
    this.portSelected.emit(port);
  }

  protected onManagePorts(): void {
    this.matDialog.open(SPDKManagePortsDialog, {
      minWidth: '450px',
    });
  }
}
