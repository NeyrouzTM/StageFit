import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StageService } from '../../services/stage.service';
import { Stage } from '../../model/stage';

@Component({
  selector: 'app-add-stage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-stage.component.html',
  styleUrls: ['./add-stage.component.css']
})
export class AddStageComponent {
  stageForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private stageService: StageService,
    private router: Router
  ) {
    this.stageForm = this.fb.group({
      ref: ['', Validators.required],
      titre: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      entreprise: ['', [Validators.required, this.capitalLetterValidator]],
      disponible: [false],
      nbrInteresse: [0, Validators.required],
      location: [''],
      mode: ['onsite'],
      durationMonths: [3],
      startDate: [''],
      domain: [''],
      educationLevel: [''],
      minExperienceYears: [0, [Validators.min(0)]],
      requiredSkills: ['', Validators.required],
      niceToHaveSkills: [''],
      languages: [''],
      salaryRange: ['']
    });
  }

  // Custom validator for capital letter
  capitalLetterValidator(control: any) {
    if (control.value && control.value.length > 0) {
      const firstChar = control.value.charAt(0);
      if (firstChar !== firstChar.toUpperCase() || !/[A-Z]/.test(firstChar)) {
        return { capitalLetter: true };
      }
    }
    return null;
  }

  onSubmit() {
    if (this.stageForm.valid) {
      const formValue = this.stageForm.value;
      const newStage: Stage = {
        ...formValue,
        requiredSkills: this.parseList(formValue.requiredSkills),
        niceToHaveSkills: this.parseList(formValue.niceToHaveSkills),
        languages: this.parseList(formValue.languages)
      } as Stage;
      this.stageService.addStage(newStage).subscribe({
        next: (data) => {
          console.log('Stage ajouté avec succès:', data);
          this.router.navigate(['/stages']);
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout du stage:', err);
        }
      });
    }
  }

  private parseList(raw: string): string[] {
    return raw
      ? raw
          .split(',')
          .map((v: string) => v.trim())
          .filter((v: string) => v.length > 0)
      : [];
  }
}
