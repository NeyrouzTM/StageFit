import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApplicationService } from '../../services/application.service';
import { StageService } from '../../services/stage.service';
import { Application } from '../../model/application';
import { Stage } from '../../model/stage';

@Component({
  selector: 'app-apply-stage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './apply-stage.component.html',
  styleUrls: ['./apply-stage.component.css']
})
export class ApplyStageComponent implements OnInit {
  stage?: Stage;
  form: FormGroup;
  submitting = false;
  error?: string;
  success?: string;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private stageService: StageService,
    private applicationService: ApplicationService,
    private router: Router
  ) {
    this.form = this.fb.group({
      candidatNom: ['', Validators.required],
      candidatEmail: ['', [Validators.required, Validators.email]],
      cvUrl: [''],
      portfolioUrl: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    const ref = Number(this.route.snapshot.paramMap.get('ref'));
    if (Number.isNaN(ref)) {
      this.error = 'Référence de stage invalide';
      return;
    }

    this.stageService.getStages().subscribe({
      next: (stages) => {
        this.stage = stages.find((s) => s.ref === ref);
        if (!this.stage) {
          this.error = 'Stage introuvable';
        }
      },
      error: () => {
        this.error = 'Impossible de charger les stages';
      }
    });
  }

  submit(): void {
    if (!this.stage) {
      this.error = 'Stage introuvable';
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = undefined;

    const now = new Date().toISOString();
    const payload: Application = {
      stageRef: this.stage.ref,
      candidatNom: this.form.value.candidatNom,
      candidatEmail: this.form.value.candidatEmail,
      cvUrl: this.form.value.cvUrl,
      portfolioUrl: this.form.value.portfolioUrl,
      notes: this.form.value.notes,
      status: 'envoye',
      createdAt: now
    };

    this.applicationService.create(payload).subscribe({
      next: () => {
        this.success = 'Candidature envoyée';
        this.submitting = false;
        setTimeout(() => this.router.navigate(['/stages']), 800);
      },
      error: () => {
        this.error = 'Échec de l\'envoi de la candidature';
        this.submitting = false;
      }
    });
  }
}
