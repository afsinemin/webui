import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { helptextNvmeOf } from 'app/helptext/sharing/nvme-of/nvme-of';
import { NvmeOfHost } from 'app/interfaces/nvme-of.interface';
import { IxIconComponent } from 'app/modules/ix-icon/ix-icon.component';
import { TestDirective } from 'app/modules/test-id/test.directive';
import { SPDKAddHostMenuComponent } from 'app/pages/sharing/spdk/spdk-hosts/spdk-add-host-menu/spdk-add-host-menu.component';

@Component({
  selector: 'spdk-add-subsystem-hosts',
  templateUrl: './spdk-add-subsystem-hosts.component.html',
  styleUrl: './spdk-add-subsystem-hosts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SPDKAddHostMenuComponent,
    TranslateModule,
    IxIconComponent,
    MatIconButton,
    MatTooltip,
    TestDirective,
  ],
})

export class SPDKAddSubsystemHostsComponent {
  hostsControl = input.required<FormControl<NvmeOfHost[]>>();

  protected readonly helptext = helptextNvmeOf;

  protected onHostAdded(host: NvmeOfHost): void {
    const hosts = this.hostsControl().value;

    this.hostsControl().setValue([...hosts, host]);
  }
  protected onRemoveHost(hostToRemove: NvmeOfHost): void {
    const hosts = this.hostsControl().value;

    this.hostsControl().setValue(
      hosts.filter((host) => host.id !== hostToRemove.id),
    );
  }
}
