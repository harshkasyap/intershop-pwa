import { ComponentFixture, TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { IconModule } from 'ish-core/icon.module';
import { Filter } from 'ish-core/models/filter/filter.model';

import { FilterDropdownComponent } from './filter-dropdown.component';

describe('Filter Dropdown Component', () => {
  let component: FilterDropdownComponent;
  let fixture: ComponentFixture<FilterDropdownComponent>;
  let element: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [IconModule, NgbCollapseModule, ReactiveFormsModule, TranslateModule.forRoot()],
      declarations: [FilterDropdownComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    const filterElement = {
      name: 'Brands',
      facets: [
        { name: 'AsusName', count: 4, link: { title: 'Asus' } },
        { name: 'LogitechName', count: 5, link: { title: 'Logitech' }, selected: true },
      ],
    } as Filter;

    fixture = TestBed.createComponent(FilterDropdownComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    component.filterElement = filterElement;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(element).toMatchSnapshot();
  });

  it('should toggle unselected filter facets when filter group header is clicked', fakeAsync(() => {
    fixture.detectChanges();
    const filterGroupHead = fixture.nativeElement.querySelectorAll('h3')[0];
    filterGroupHead.click();
    tick(500);
    fixture.detectChanges();

    const selectedFilterFacet = element.getElementsByClassName('filter-selected')[0];
    expect(selectedFilterFacet.textContent).toContain('Logitech');

    const hiddenFilters = element.querySelector('div [data-testing-id=collapseFilterBrands]');
    expect(hiddenFilters.className).not.toContain('show');
  }));
});