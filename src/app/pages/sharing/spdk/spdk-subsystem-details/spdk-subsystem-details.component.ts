import {
  ChangeDetectionStrategy, Component, input, output,
} from '@angular/core';
import { UiSearchDirective } from 'app/directives/ui-search.directive';
import { SPDKSubsystemDetails } from 'app/interfaces/spdk.interface';

import { subsystemDetailsElements } from 'app/pages/sharing/nvme-of/subsystem-details/subsystem-details.elements';

import { SPDKSubsystemDetailsCardComponent } from 'app/pages/sharing/spdk/spdk-subsystem-details/spdk-subsystem-details-card/spdk-subsystem-details-card.component';
import { SPDKSubsystemHostsCardComponent } from 'app/pages/sharing/spdk/spdk-subsystem-details/spdk-subsystem-hosts-card/spdk-subsystem-hosts-card.component';
import { SPDKSubsystemNamespacesCardComponent } from 'app/pages/sharing/spdk/spdk-subsystem-details/spdk-subsystem-namespaces-card/spdk-subsystem-namespaces-card.component';
import { SPDKSubsystemPortsCardComponent } from 'app/pages/sharing/spdk/spdk-subsystem-details/spdk-subsystem-ports-card/spdk-subsystem-ports-card.component';

@Component({
  selector: 'spdk-subsystem-details',
  standalone: true,
  templateUrl: './spdk-subsystem-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SPDKSubsystemPortsCardComponent,
    SPDKSubsystemHostsCardComponent,
    SPDKSubsystemDetailsCardComponent,
    SPDKSubsystemNamespacesCardComponent,
    UiSearchDirective,
  ],
})
export class SPDKSubsystemDetailsComponent {
  readonly subsystem = input.required<SPDKSubsystemDetails>();
  readonly nameUpdated = output<string>();
  protected readonly searchableElements = subsystemDetailsElements;
}
