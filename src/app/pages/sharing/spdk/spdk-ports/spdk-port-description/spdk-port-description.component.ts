import {
  ChangeDetectionStrategy, Component, computed, input,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SPDKTransportTypeLabels } from 'app/enums/spdk.enum';
import { SPDKPort } from 'app/interfaces/spdk.interface';

import { MapValuePipe } from 'app/modules/pipes/map-value/map-value.pipe';

@Component({
  selector: 'spdk-port-description',
  templateUrl: './spdk-port-description.component.html',
  styleUrl: './spdk-port-description.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MapValuePipe,
    TranslateModule,
  ],
})
export class SPDKPortDescriptionComponent {
  port = input.required<SPDKPort>();

  protected typeLabels = SPDKTransportTypeLabels;

  protected description = computed(() => {
    const description = this.port().addr_traddr;
    if (this.port().addr_trsvcid) {
      return `${description}:${this.port().addr_trsvcid}`;
    }

    return description;
  });
}
