
import { Choices } from 'app/interfaces/choices.interface';
import { SubsystemPortAssociation, AssociateSubsystemPort, GenerateNvmeHostParams, SubsystemHostAssociation, AssociateSubsystemHost, DeleteNamespaceParams } from 'app/interfaces/nvme-of.interface';
import { QueryParams } from 'app/interfaces/query-api.interface';
import { SPDKGlobalConfig, SPDKGlobalConfigUpdate, SPDKSubsystem, CreateSPDKSubsystem, UpdateSPDKSubsystem, SPDKPort, CreateSPDKPort, UpdateSPDKPort, SPDKHost, CreateSPDKHost, UpdateSPDKHost, SPDKNamespace, CreateSPDKNamespace, UpdateSPDKNamespace, SPDKTransportParams } from 'app/interfaces/spdk.interface';

export interface ApiCallDirectory {
 

//SPDK

  'spdk.global.config': { params: void; response: SPDKGlobalConfig };
  'spdk.global.update': { params: [SPDKGlobalConfigUpdate]; response: SPDKGlobalConfig };
  'spdk.global.rdma_enabled': { params: void; response: boolean };
  'spdk.global.ana_enabled': { params: void; response: boolean };

  'spdk.subsys.query': { params: QueryParams<SPDKSubsystem, { extra: { verbose: boolean } }>; response: SPDKSubsystem[] };
  'spdk.subsys.create': { params: [CreateSPDKSubsystem]; response: SPDKSubsystem };
  'spdk.subsys.update': { params: [id: number, update: UpdateSPDKSubsystem]; response: SPDKSubsystem };
  'spdk.subsys.delete': { params: [id: number, { force: boolean }?]; response: void };

  'spdk.port.query': { params: QueryParams<SPDKPort>; response: SPDKPort[] };
  'spdk.port.create': { params: [CreateSPDKPort]; response: SPDKPort };
  'spdk.port.update': { params: [id: number, update: UpdateSPDKPort]; response: SPDKPort };
  'spdk.port.delete': { params: [id: number, { force: boolean }?]; response: void };

  'spdk.port_subsys.query': { params: QueryParams<SubsystemPortAssociation>; response: SubsystemPortAssociation[] };
  'spdk.port_subsys.create': { params: [AssociateSubsystemPort]; response: void };
  'spdk.port_subsys.delete': { params: [id: number]; response: void };

  'spdk.host.query': { params: QueryParams<SPDKHost>; response: SPDKHost[] };
  'spdk.host.create': { params: [CreateSPDKHost]; response: SPDKHost };
  'spdk.host.update': { params: [id: number, update: UpdateSPDKHost]; response: SPDKHost };
  'spdk.host.delete': { params: [id: number, { force: boolean }?]; response: void };
  'spdk.host.generate_key': { params: GenerateNvmeHostParams; response: string };
  'spdk.host.dhchap_dhgroup_choices': { params: void; response: string[] };
  'spdk.host.dhchap_hash_choices': { params: void; response: string[] };

  'spdk.host_subsys.query': { params: QueryParams<SubsystemHostAssociation>; response: SubsystemHostAssociation[] };
  'spdk.host_subsys.create': { params: [AssociateSubsystemHost]; response: void };
  'spdk.host_subsys.delete': { params: [id: number]; response: void };

  'spdk.namespace.query': { params: QueryParams<SPDKNamespace>; response: SPDKNamespace[] };
  'spdk.namespace.create': { params: [CreateSPDKNamespace]; response: SPDKNamespace };
  'spdk.namespace.update': { params: [id: number, update: UpdateSPDKNamespace]; response: SPDKNamespace };
  'spdk.namespace.delete': { params: DeleteNamespaceParams; response: void };

  'spdk.port.transport_address_choices': { params: SPDKTransportParams; response: Choices };


}


