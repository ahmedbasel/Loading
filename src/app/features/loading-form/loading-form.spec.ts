import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingForm } from './loading-form';

describe('LoadingForm', () => {
  let component: LoadingForm;
  let fixture: ComponentFixture<LoadingForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingForm],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
