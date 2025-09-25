import { marker as T } from '@biesbjerg/ngx-translate-extract-marker';
import { EmptyType } from "app/enums/empty-type.enum";
import { EmptyConfig } from 'app/interfaces/empty-config.interface';
import { iconMarker } from "app/modules/ix-icon/icon-marker.util";

export const SPDKEmptyConfig = {
  type: EmptyType.NoPageData,
  icon: iconMarker('ix-nvme-share'),
  large: true,
  message: T(`<p>Raw block storage using NVMe over Fabrics with SPDK (e.g. NVMe/TCP), appearing as a local disk on the client.</p>
<p>Compared to iSCSI, NVMe-oF offers significantly lower latency and higher throughput.</p>`),
} as EmptyConfig;