import { computed, Injectable, inject } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { forkJoin, switchMap, tap } from 'rxjs';
import {
  SPDKHost, SPDKNamespace, SPDKPort, SPDKSubsystem,
  SPDKSubsystemDetails,
} from 'app/interfaces/spdk.interface';
import { ApiService } from 'app/modules/websocket/api.service';
import { ErrorHandlerService } from 'app/services/errors/error-handler.service';

export interface SPDKState {
  subsystems: SPDKSubsystem[];
  namespaces: SPDKNamespace[];
  hosts: SPDKHost[];
  ports: SPDKPort[];
  isLoading: boolean;
}

const initialState: SPDKState = {
  subsystems: [],
  namespaces: [],
  hosts: [],
  ports: [],
  isLoading: false,
};

@Injectable({
  providedIn: 'root',
})
export class SPDKStore extends ComponentStore<SPDKState> {
  private api = inject(ApiService);
  private errorHandler = inject(ErrorHandlerService);

  readonly subsystems = computed((): SPDKSubsystemDetails[] => {
    const state = this.state();
    return state.subsystems.map((subsystem) => {
      return {
        ...subsystem,
        hosts: state.hosts?.filter((host) => subsystem.hosts?.includes(host.id)) || [],
        ports: state.ports?.filter((port) => subsystem.ports?.includes(port.id)) || [],
        namespaces: state.namespaces?.filter((namespace) => subsystem.namespaces?.includes(namespace.id)) || [],
      };
    });
  });

  readonly ports = computed(() => this.state().ports);
  readonly namespaces = computed(() => this.state().namespaces);
  readonly hosts = computed(() => this.state().hosts);

  readonly isLoading = computed(() => this.state().isLoading);

  constructor() {
    super(initialState);
  }

  initialize = this.effect((trigger$) => {
    return trigger$.pipe(
      tap(() => {
        this.patchState({ isLoading: true });
      }),
      switchMap(() => {
        return forkJoin([
          this.api.call('spdk.subsys.query', [[], { extra: { verbose: true } }]),
          this.api.call('spdk.namespace.query'),
          this.api.call('spdk.host.query'),
          this.api.call('spdk.port.query'),
        ]).pipe(
          tapResponse(
            ([
              subsystems,
              namespaces,
              hosts,
              ports,
            ]: [SPDKSubsystem[], SPDKNamespace[], SPDKHost[], SPDKPort[]]) => {
              this.patchState({
                subsystems,
                namespaces,
                hosts,
                ports,
                isLoading: false,
              });
            },
            (error: unknown) => {
              this.errorHandler.showErrorModal(error);

              this.patchState({
                isLoading: false,
              });
            },
          ),
        );
      }),
    );
  });

  reloadPorts = this.effect((trigger$) => {
    return trigger$.pipe(
      switchMap(() => {
        return this.api.call('spdk.port.query').pipe(
          this.errorHandler.withErrorHandler(),
          tap((ports) => this.patchState({ ports })),
        );
      }),
    );
  });

  reloadHosts = this.effect((trigger$) => {
    return trigger$.pipe(
      switchMap(() => {
        return this.api.call('spdk.host.query').pipe(
          this.errorHandler.withErrorHandler(),
          tap((hosts) => this.patchState({ hosts })),
        );
      }),
    );
  });
}
