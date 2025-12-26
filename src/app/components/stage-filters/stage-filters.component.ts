import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface StageFilterCriteria {
  search?: string;
  domain?: string;
  mode?: 'onsite' | 'remote' | 'hybrid' | 'any';
  location?: string;
  minExperienceYears?: number;
  availableOnly?: boolean;
  requiredSkill?: string;
  onlyFavorites?: boolean;
}

@Component({
  selector: 'app-stage-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stage-filters.component.html',
  styleUrls: ['./stage-filters.component.css']
})
export class StageFiltersComponent {
  @Input() initial: StageFilterCriteria | null = null;
  @Output() filtersChange = new EventEmitter<StageFilterCriteria>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      search: [''],
      domain: [''],
      mode: ['any'],
      location: [''],
      minExperienceYears: [0],
      availableOnly: [false],
      requiredSkill: [''],
      onlyFavorites: [false]
    });

    this.form.valueChanges.subscribe((v) => this.filtersChange.emit(this.normalize(v)));
  }

  ngOnInit(): void {
    if (this.initial) {
      this.form.patchValue(this.initial, { emitEvent: true });
    } else {
      this.filtersChange.emit(this.normalize(this.form.value));
    }
  }

  reset(): void {
    this.form.reset({
      search: '',
      domain: '',
      mode: 'any',
      location: '',
      minExperienceYears: 0,
      availableOnly: false,
      requiredSkill: '',
      onlyFavorites: false
    });
  }

  private normalize(raw: any): StageFilterCriteria {
    return {
      search: (raw.search || '').toLowerCase(),
      domain: (raw.domain || '').toLowerCase(),
      mode: raw.mode,
      location: (raw.location || '').toLowerCase(),
      minExperienceYears: Number(raw.minExperienceYears) || 0,
      availableOnly: !!raw.availableOnly,
      requiredSkill: (raw.requiredSkill || '').toLowerCase(),
      onlyFavorites: !!raw.onlyFavorites
    };
  }
}
