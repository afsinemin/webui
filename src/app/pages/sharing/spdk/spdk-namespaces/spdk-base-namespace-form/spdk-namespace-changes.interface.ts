import { SPDKNamespaceType } from 'app/enums/spdk.enum';

export interface SPDKNamespaceChanges {
  device_path: string;
  device_type: SPDKNamespaceType;
  filesize: number | null;
}
