import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SPDKNamespaceTypeLabels, SPDKNamespaceType } from 'app/enums/spdk.enum';
import { MapValuePipe } from 'app/modules/pipes/map-value/map-value.pipe';

@Component({
  selector: 'spdk-namespace-description',
  templateUrl: './spdk-namespace-description.component.html',
  styleUrl: './spdk-namespace-description.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MapValuePipe,
    TranslateModule,
  ],
})
export class SPDKNamespaceDescriptionComponent {
  namespace = input.required<{ device_type: SPDKNamespaceType; device_path: string }>();

  protected readonly typeLabels = SPDKNamespaceTypeLabels;
}
