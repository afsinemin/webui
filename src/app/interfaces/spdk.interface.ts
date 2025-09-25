import { Required, Overwrite } from 'utility-types';
import { SPDKAddressFamily, SPDKNamespaceType, SPDKTransportType } from 'app/enums/spdk.enum';

export interface SPDKGlobalConfig {
  id: number;
  basenqn: string;
  worker_cores: string;
  kernel: boolean;
  ana: boolean;
  rdma: boolean;
  xport_referral: boolean;
  max_queue_depth: number
  max_io_qpairs: number
  in_caps: number
  num_shared_buffers: number

}

export type SPDKGlobalConfigUpdate = Partial<Omit<SPDKGlobalConfig, 'id'>>;

export interface SPDKSubsystem {
  id: number;
  name: string;
  subnqn: string;
  serial: string;
  allow_any_host: boolean;
  pi_enable: boolean | null;
  qix_max: number | null;
  ieee_oui: string | null;
  ana: boolean | null;

  /**
   * List of ids. Only populated with extra.options.verbose
   */
  ports: number[] | null;

  /**
   * List of ids. Only populated with extra.options.verbose
   */
  hosts: number[] | null;

  /**
   * List of ids. Only populated with extra.options.verbose
   */
  namespaces: number[] | null;
}

export type UpdateSPDKSubsystem = Partial<Omit<SPDKSubsystem, 'id'>>;
export type CreateSPDKSubsystem = Required<UpdateSPDKSubsystem, 'name'>;

export interface SPDKPort {
  id: number;
  index: number;
  addr_trtype: SPDKTransportType;
  addr_trsvcid: number | string;
  addr_traddr: string;
  addr_adrfam: SPDKAddressFamily;
  inline_data_size: number | null;
  max_queue_size: number | null;
  pi_enable: boolean | null;
  enabled: boolean;
}

export type UpdateSPDKPort = Partial<Omit<SPDKPort, 'id'>>;

export type CreateSPDKPort = Required<
  UpdateSPDKPort,
  'addr_trtype' | 'addr_trsvcid' | 'addr_traddr'
>;

export type SPDKTransportParams = [
  transportType: SPDKTransportType,
  force_ana?: boolean,
];

export interface SPDKNamespace {
  id: number;
  nsid: number | null;
  subsystem: SPDKSubsystem;
  device_type: SPDKNamespaceType;
  device_path: string;
  filesize: number | null;
  device_uuid: string;
  device_nguid: string;
  enabled: boolean;
  locked: boolean | null;
}

export type UpdateSPDKNamespace = Pick<
  Partial<SPDKNamespace>,
  'nsid' | 'device_type' | 'device_path' | 'filesize' | 'enabled'
> & { subsys_id?: number };
export type CreateSPDKNamespace = Required<UpdateSPDKNamespace, 'device_type' | 'device_path' | 'subsys_id'>;

export type DeleteNamespaceParams = [
  id: number,
  options?: {
    /**
     * Remove file underlying namespace if device_type is FILE.
     */
    remove?: boolean;
  },
];

export interface SPDKHost {
  id: number;
  hostnqn: string;
  dhchap_key: string | null;
  dhchap_ctrl_key: string | null;
  dhchap_dhgroup: string | null;
  dhchap_hash: string | null;
}

export type UpdateSPDKHost = Partial<Omit<SPDKHost, 'id'>>;
export type CreateSPDKHost = Required<UpdateSPDKHost, 'hostnqn'>;

export interface SubsystemPortAssociation {
  id: number;
  port: SPDKPort;
  subsystem: SPDKSubsystem;
  subsys_id: number;
  port_id: number;
}

export interface AssociateSubsystemPort {
  port_id: number;
  subsys_id: number;
}

export interface SubsystemHostAssociation {
  id: number;
  host: SPDKHost;
  subsystem: SPDKSubsystem;
  subsys_id: number;
  host_id: number;
}

export interface AssociateSubsystemHost {
  host_id: number;
  subsys_id: number;
}

export type GenerateNvmeHostParams = [
  dhchap_hash: string,
  nqn?: string,
];

export type SPDKSubsystemDetails = Overwrite<SPDKSubsystem, {
  hosts: SPDKHost[];
  ports: SPDKPort[];
  namespaces: SPDKNamespace[];
}>;

export enum PortOrHostDeleteType {
  Port = 'port',
  Host = 'host',
}

export interface PortOrHostDeleteDialogData {
  type: PortOrHostDeleteType;
  item: SPDKPort | SPDKHost;
  name: string;
  subsystemsInUse: SPDKSubsystemDetails[];
}
