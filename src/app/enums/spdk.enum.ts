import { marker as T } from '@biesbjerg/ngx-translate-extract-marker';

export enum SPDKTransportType {
  Tcp = 'TCP',
  Rdma = 'RDMA',
  FibreChannel = 'FC',
}

export const SPDKTransportTypeLabels = new Map<SPDKTransportType, string>([
  [SPDKTransportType.Tcp, 'TCP'],
  [SPDKTransportType.Rdma, 'RDMA'],
  [SPDKTransportType.FibreChannel, 'Fibre Channel'],
]);

export enum SPDKAddressFamily {
  Ipv4 = 'IPV4',
  Ipv6 = 'IPV6',
  FibreChannel = 'FC',
}

export enum SPDKNamespaceType {
  Zvol = 'ZVOL',
  File = 'FILE',
}

export const SPDKNamespaceTypeLabels = new Map<SPDKNamespaceType, string>([
  [SPDKNamespaceType.Zvol, 'Zvol'],
  [SPDKNamespaceType.File, T('File')],
]);
