import { ChangeDetectionStrategy, Component, computed, input, output, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { sortBy } from 'lodash-es';
import { filter } from 'rxjs/operators';
import { IxIconComponent } from 'app/modules/ix-icon/ix-icon.component';
import { SlideIn } from 'app/modules/slide-ins/slide-in';
import { TestDirective } from 'app/modules/test-id/test.directive';
import { SPDKHost } from 'app/interfaces/spdk.interface';
import { SPDKStore } from 'app/pages/sharing/spdk/spdk-services/spdk.store';
import { SPDKHostFormComponent } from 'app/pages/sharing/spdk/spdk-hosts/spdk-host-form/spdk-host-form.component';
import { SPDKManageHostsDialog } from 'app/pages/sharing/spdk/spdk-hosts/spdk-manage-hosts/spdk-manage-hosts-dialog.component';


@UntilDestroy()
@Component({
  selector: 'spdk-add-host-menu',
  templateUrl: './spdk-add-host-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IxIconComponent,
    MatButton,
    MatMenu,
    MatMenuItem,
    TestDirective,
    TranslateModule,
    MatMenuTrigger,
    MatDivider,
  ],
})
export class SPDKAddHostMenuComponent {
  private slideIn = inject(SlideIn);
  private matDialog = inject(MatDialog);
  private SPDKStore = inject(SPDKStore);

  hosts = input.required<SPDKHost[]>();
  showAllowAnyHost = input(false);
  hostSelected = output<SPDKHost>();
  allowAllHostsSelected = output();

  protected allHosts = this.SPDKStore.hosts;

  protected noHostsExist = computed(() => !this.allHosts().length);

  protected unusedHosts = computed(() => {
    const usedHostIds = this.hosts().map((host) => host.id);
    const unusedHosts = this.allHosts().filter((host) => !usedHostIds.includes(host.id));
    return sortBy(unusedHosts, ['hostnqn']);
  });

  protected openHostForm(): void {
    this.slideIn
      .open(SPDKHostFormComponent)
      .pipe(
        filter((response) => Boolean(response.response)),
        untilDestroyed(this),
      )
      .subscribe((response) => {
        this.selectHost(response.response);
      });
  }

  protected selectHost(host: SPDKHost): void {
    this.hostSelected.emit(host);
  }

  protected manageHosts(): void {
    this.matDialog.open(SPDKManageHostsDialog, {
      minWidth: '450px',
    });
  }

  protected allowAllHosts(): void {
    this.allowAllHostsSelected.emit();
  }
}
