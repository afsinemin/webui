import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, OnInit, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatToolbarRow } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { filter, switchMap } from 'rxjs';
import { RequiresRolesDirective } from 'app/directives/requires-roles/requires-roles.directive';
import { EmptyType } from 'app/enums/empty-type.enum';
import { Role } from 'app/enums/role.enum';
import { ServiceName } from 'app/enums/service-name.enum';
import { EmptyComponent } from 'app/modules/empty/empty.component';
import { EmptyService } from 'app/modules/empty/empty.service';
import { iconMarker } from 'app/modules/ix-icon/icon-marker.util';
import { IxIconComponent } from 'app/modules/ix-icon/ix-icon.component';
import { ArrayDataProvider } from 'app/modules/ix-table/classes/array-data-provider/array-data-provider';
import { IxTableComponent } from 'app/modules/ix-table/components/ix-table/ix-table.component';
import { actionsWithMenuColumn } from 'app/modules/ix-table/components/ix-table-body/cells/ix-cell-actions-with-menu/ix-cell-actions-with-menu.component';
import { templateColumn } from 'app/modules/ix-table/components/ix-table-body/cells/ix-cell-template/ix-cell-template.component';
import { textColumn } from 'app/modules/ix-table/components/ix-table-body/cells/ix-cell-text/ix-cell-text.component';
import { IxTableBodyComponent } from 'app/modules/ix-table/components/ix-table-body/ix-table-body.component';
import { IxTableHeadComponent } from 'app/modules/ix-table/components/ix-table-head/ix-table-head.component';
import { IxTablePagerShowMoreComponent } from 'app/modules/ix-table/components/ix-table-pager-show-more/ix-table-pager-show-more.component';
import { IxTableCellDirective } from 'app/modules/ix-table/directives/ix-table-cell.directive';
import { IxTableEmptyDirective } from 'app/modules/ix-table/directives/ix-table-empty.directive';
import { SortDirection } from 'app/modules/ix-table/enums/sort-direction.enum';
import { createTable } from 'app/modules/ix-table/utils';
import { LoaderService } from 'app/modules/loader/loader.service';
import { SlideIn } from 'app/modules/slide-ins/slide-in';
import { TestDirective } from 'app/modules/test-id/test.directive';
import { ApiService } from 'app/modules/websocket/api.service';
import { ServiceExtraActionsComponent } from 'app/pages/sharing/components/shares-dashboard/service-extra-actions/service-extra-actions.component';
import { ServiceStateButtonComponent } from 'app/pages/sharing/components/shares-dashboard/service-state-button/service-state-button.component';
import { SubsystemDeleteDialogComponent } from 'app/pages/sharing/nvme-of/subsystem-details-header/subsystem-delete-dialog/subsystem-delete-dialog.component';
import { ErrorHandlerService } from 'app/services/errors/error-handler.service';
import { ServicesState } from 'app/store/services/services.reducer';
import { selectService } from 'app/store/services/services.selectors';
import { SPDKSubsystemDetails } from 'app/interfaces/spdk.interface';
import { SPDKSubSystemNameCellComponent } from 'app/pages/sharing/spdk/spdk-subsystems-list/spdk-subsystem-name-cell/spdk-subsystem-name-cell.component';
import { SPDKAddSubsystemComponent } from 'app/pages/sharing/spdk/spdk-add-subsystem/spdk-add-subsystem.component';
import { SPDKStore } from 'app/pages/sharing/spdk/spdk-services/spdk.store';
import { SPDKEmptyConfig } from 'app/pages/sharing/spdk/constants/empty-configs'

@UntilDestroy()
@Component({
  selector: 'spdk-card',
  templateUrl: './spdk-card.component.html',
  styleUrls: ['./spdk-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatToolbarRow,
    TestDirective,
    IxIconComponent,
    ServiceStateButtonComponent,
    RequiresRolesDirective,
    MatButton,
    ServiceExtraActionsComponent,
    IxTableComponent,
    IxTableEmptyDirective,
    IxTableHeadComponent,
    IxTableBodyComponent,
    IxTablePagerShowMoreComponent,
    TranslateModule,
    AsyncPipe,
    RouterLink,
    IxTableCellDirective,
    EmptyComponent,
    SPDKSubSystemNameCellComponent,
  ],
})
export class SPDKCardComponent implements OnInit {
  private slideIn = inject(SlideIn);
  private translate = inject(TranslateService);
  protected emptyService = inject(EmptyService);
  private store$ = inject<Store<ServicesState>>(Store);
  private spdkStore = inject(SPDKStore);
  private matDialog = inject(MatDialog);
  private api = inject(ApiService);
  private loader = inject(LoaderService);
  private errorHandler = inject(ErrorHandlerService);
  private router = inject(Router);

  requiredRoles = [Role.SharingSPDKTargetWrite];
  protected readonly isLoading = this.spdkStore.isLoading;
  protected readonly emptyConfig = SPDKEmptyConfig;

  protected service$ = this.store$.select(selectService(ServiceName.SPDK));

  protected readonly subsystems = this.spdkStore.subsystems;

  protected dataProvider = computed<ArrayDataProvider<SPDKSubsystemDetails>>(() => {
    const subsystems = this.subsystems();
    const isLoading = this.isLoading();

    const dataProvider = new ArrayDataProvider<SPDKSubsystemDetails>();
    dataProvider.setEmptyType(EmptyType.None);
    if (isLoading) {
      dataProvider.setEmptyType(EmptyType.Loading);
      return dataProvider;
    }

    dataProvider.setRows(subsystems);
    dataProvider.setSorting({
      active: 0,
      direction: SortDirection.Asc,
      propertyName: 'name',
    });
    if (!subsystems.length) {
      dataProvider.setEmptyType(EmptyType.NoPageData);
    } else {
      dataProvider.expandedRow = subsystems[0];
    }

    return dataProvider;
  });

  protected columns = createTable<SPDKSubsystemDetails>([
    templateColumn({
      title: this.translate.instant('Name'),
    }),
    textColumn({
      title: this.translate.instant('Namespaces'),
      getValue: (row: SPDKSubsystemDetails) => {
        return row.namespaces.length;
      },
    }),
    textColumn({
      title: this.translate.instant('Ports'),
      getValue: (row) => {
        return row.ports.length;
      },
    }),
    textColumn({
      title: this.translate.instant('Hosts'),
      getValue: (row) => {
        return row.hosts.length;
      },
    }),
    actionsWithMenuColumn({
      actions: [
        {
          iconName: iconMarker('visibility'),
          tooltip: this.translate.instant('View'),
          onClick: (row) => this.router.navigate(['/sharing/spdk', row.name]),
          requiredRoles: this.requiredRoles,
        },
        {
          iconName: iconMarker('mdi-delete'),
          tooltip: this.translate.instant('Delete'),
          onClick: (row) => this.doDelete(row),
          requiredRoles: this.requiredRoles,
        },
      ],
    }),
  ], {
    uniqueRowTag: (row) => 'nvmeof-subsys-' + row.name,
    ariaLabels: (row) => [row.name, this.translate.instant('Subsystem')],
  });

  ngOnInit(): void {
    this.spdkStore.initialize();
  }

  openForm(): void {
    this.slideIn.open(SPDKAddSubsystemComponent).pipe(
      filter(({ response }) => !!response),
      untilDestroyed(this),
    ).subscribe(() => this.spdkStore.initialize());
  }

  doDelete(row: SPDKSubsystemDetails): void {
    this.matDialog.open(
      SubsystemDeleteDialogComponent,
      { data: row, minWidth: '500px' },
    )
      .afterClosed()
      .pipe(
        filter((data: { confirmed: boolean; force: boolean }) => data?.confirmed),
        switchMap(({ force }) => {
          return this.api.call('spdk.subsys.delete', [row.id, { force }]).pipe(
            this.loader.withLoader(),
            this.errorHandler.withErrorHandler(),
          );
        }),
        untilDestroyed(this),
      ).subscribe(() => {
        this.spdkStore.initialize();
      });
  }
}
