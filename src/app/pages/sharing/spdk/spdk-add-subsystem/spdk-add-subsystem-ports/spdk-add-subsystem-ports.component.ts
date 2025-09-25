import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { helptextNvmeOf } from 'app/helptext/sharing/nvme-of/nvme-of';
import { SPDKPort } from 'app/interfaces/spdk.interface';
import { IxIconComponent } from 'app/modules/ix-icon/ix-icon.component';
import { TestDirective } from 'app/modules/test-id/test.directive';
import { SPDKAddPortMenuComponent } from 'app/pages/sharing/spdk/spdk-ports/spdk-add-port-menu/spdk-add-port-menu.component';
import { SPDKPortDescriptionComponent } from 'app/pages/sharing/spdk/spdk-ports/spdk-port-description/spdk-port-description.component';

@Component({
  selector: 'spdk-add-subsystem-ports',
  templateUrl: './spdk-add-subsystem-ports.component.html',
  styleUrl: './spdk-add-subsystem-ports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SPDKAddPortMenuComponent,
    TranslateModule,
    IxIconComponent,
    MatIconButton,
    TestDirective,
    SPDKPortDescriptionComponent,
  ],
})

export class SPDKAddSubsystemPortsComponent {
  portsControl = input.required<FormControl<SPDKPort[]>>();

  protected readonly helptext = helptextNvmeOf;

  protected onPortAdded(port: SPDKPort): void {
    const ports = this.portsControl().value;

    this.portsControl().setValue([...ports, port]);
  }

  protected onRemovePort(portToRemove: SPDKPort): void {
    const ports = this.portsControl().value;

    this.portsControl().setValue(
      ports.filter((port) => port.id !== portToRemove.id),
    );
  }
}
