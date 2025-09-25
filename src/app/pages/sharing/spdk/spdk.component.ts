import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, OnInit, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { RequiresRolesDirective } from 'app/directives/requires-roles/requires-roles.directive';
import { UiSearchDirective } from 'app/directives/ui-search.directive';
import { EmptyType } from 'app/enums/empty-type.enum';
import { Role } from 'app/enums/role.enum';
import { ArrayDataProvider } from 'app/modules/ix-table/classes/array-data-provider/array-data-provider';
import { SortDirection } from 'app/modules/ix-table/enums/sort-direction.enum';
import { MasterDetailViewComponent } from 'app/modules/master-detail-view/master-detail-view.component';
import { PageHeaderComponent } from 'app/modules/page-header/page-title-header/page-header.component';
import { SlideIn } from 'app/modules/slide-ins/slide-in';
import { TestDirective } from 'app/modules/test-id/test.directive';
import { setSubsystemNameInUrl } from 'app/pages/sharing/spdk/utils/router-utils';
import { SPDKStore } from 'app/pages/sharing/spdk/spdk-services/spdk.store';
import { SPDKElements } from 'app/pages/sharing/spdk/spdk.elements';
import { SPDKSubsystemDetails, SPDKSubsystem } from 'app/interfaces/spdk.interface';
import { SPDKConfigurationComponent } from 'app/pages/sharing/spdk/sdpk-configuration/spdk-configuration.component';
import { SPDKSubsystemDetailsComponent } from 'app/pages/sharing/spdk/spdk-subsystem-details/spdk-subsystem-details.component';
import { SPDKSubsystemsDetailsHeaderComponent } from 'app/pages/sharing/spdk/spdk-subsystem-details-header/spdk-subsystems-details-header.component';
import { SPDKSubsystemsListComponent } from 'app/pages/sharing/spdk/spdk-subsystems-list/spdk-subsystems-list.component';
import { SPDKAddSubsystemComponent } from 'app/pages/sharing/spdk/spdk-add-subsystem/spdk-add-subsystem.component';

@UntilDestroy()
@Component({
  selector: 'spdk',
  templateUrl: './spdk.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButton,
    PageHeaderComponent,
    RequiresRolesDirective,
    TestDirective,
    TranslateModule,
    UiSearchDirective,
    MasterDetailViewComponent,
    SPDKSubsystemDetailsComponent,
    SPDKSubsystemsDetailsHeaderComponent,
    SPDKSubsystemsListComponent,
  ],
})
export class SPDKComponent implements OnInit {
  private SPDKStore = inject(SPDKStore);
  private slideIn = inject(SlideIn);
  private activatedRoute = inject(ActivatedRoute);
  private location = inject(Location);

  protected readonly subsystems = this.SPDKStore.subsystems;

  protected dataProvider = new ArrayDataProvider<SPDKSubsystemDetails>();

  private selectedSubsystemName: string | null = null;

  protected readonly isLoading = this.SPDKStore.isLoading;
  protected readonly searchableElements = SPDKElements;
  protected readonly requiredRoles = [Role.SharingNvmeTargetWrite];

  constructor() {
    this.setupDataProvider();
  }

  ngOnInit(): void {
    this.SPDKStore.initialize();
  }

  private setupDataProvider(): void {
    this.dataProvider.setSorting({
      active: 0,
      direction: SortDirection.Asc,
      propertyName: 'name',
    });

    effect(() => {
      const subsystems = this.subsystems();
      const isLoading = this.isLoading();

      this.dataProvider.setRows(subsystems);

      if (!isLoading) {
        if (!subsystems.length) {
          this.dataProvider.setEmptyType(EmptyType.NoPageData);
        } else {
          const urlName = this.activatedRoute.snapshot.paramMap.get('name');
          const selectedName = this.selectedSubsystemName || urlName;
          const routeSelectedRow = subsystems.find((subsystem) => subsystem.name === selectedName);
          this.dataProvider.expandedRow = routeSelectedRow || subsystems[0];
          this.selectedSubsystemName = this.dataProvider.expandedRow?.name || null;
          setSubsystemNameInUrl(this.location, this.selectedSubsystemName);
        }
      }
    });

    this.dataProvider.expandedRow$
      .pipe(filter((row): row is SPDKSubsystemDetails => !!row))
      .pipe(untilDestroyed(this))
      .subscribe((row) => {
        this.selectedSubsystemName = row.name;
        setSubsystemNameInUrl(this.location, row.name);
      });
  }

  protected onFilter(query: string): void {
    this.dataProvider.setFilter({
      list: this.subsystems(),
      query,
      columnKeys: ['name'],
    });
  }

  protected openGlobalConfiguration(): void {
    this.slideIn.open(SPDKConfigurationComponent);
  }

  protected addSubsystem(): void {
    this.slideIn.open(SPDKAddSubsystemComponent).pipe(
      filter(({ response }) => !!response),
      untilDestroyed(this),
    ).subscribe(({ response }) => {
      this.selectedSubsystemName = (response as SPDKSubsystem).name;
      this.SPDKStore.initialize();
    });
  }

  protected onSubsystemSelected(subsystem: SPDKSubsystemDetails): void {
    this.dataProvider.expandedRow = subsystem;
    this.selectedSubsystemName = subsystem.name;
    setSubsystemNameInUrl(this.location, subsystem.name);
  }

  protected onSubsystemRenamed(newName: string): void {
    this.selectedSubsystemName = newName;
    setSubsystemNameInUrl(this.location, newName);
  }

  protected onSubsystemRemoved(): void {
    this.SPDKStore.initialize();
    this.dataProvider.expandedRow = null;
  }
}
