import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { SPDKSubsystemDetails } from 'app/interfaces/spdk.interface';
import { IxIconComponent } from 'app/modules/ix-icon/ix-icon.component';

@Component({
  selector: 'spdk-subsystem-name-cell',
  templateUrl: './spdk-subsystem-name-cell.component.html',
  styleUrls: ['./spdk-subsystem-name-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, MatTooltipModule, IxIconComponent],
})
export class SPDKSubSystemNameCellComponent {
  subsystem = input.required<SPDKSubsystemDetails>();

  showWarning = computed(() => {
    const {
      ports, namespaces, hosts, allow_any_host: allowAnyHost,
    } = this.subsystem();

    return !namespaces.length || !ports.length || (!hosts.length && !allowAnyHost);
  });
}
