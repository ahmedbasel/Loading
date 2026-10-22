import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingDetails } from './loading-details';

describe('LoadingDetails', () => {
  let component: LoadingDetails;
  let fixture: ComponentFixture<LoadingDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
