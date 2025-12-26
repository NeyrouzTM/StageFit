import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StageService } from '../../services/stage.service';
import { Stage } from '../../model/stage';

interface AdvisorProfile {
  nom: string;
  profil: string;
  competences: string[];
  langues: string[];
  localisation: string;
  mode: 'onsite' | 'remote' | 'hybrid' | 'any';
  experience: number;
}

interface StageMatchResult {
  stage: Stage;
  score: number;
  acceptance: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasons: string[];
}

@Component({
  selector: 'app-stage-advisor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stage-advisor.component.html',
  styleUrls: ['./stage-advisor.component.css']
})
export class StageAdvisorComponent {
  advisorForm: FormGroup;

  results: StageMatchResult[] = [];
  loading = false;
  error?: string;

  constructor(private fb: FormBuilder, private stageService: StageService) {
    this.advisorForm = this.fb.group({
      nom: ['', Validators.required],
      profil: ['', Validators.required],
      competences: ['', Validators.required],
      langues: [''],
      localisation: [''],
      mode: ['any'],
      experience: [0, [Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.advisorForm.invalid) {
      this.advisorForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = undefined;

    const profile = this.buildProfile();

    this.stageService.getStages().subscribe({
      next: (stages) => {
        this.results = this.rankStages(stages, profile).slice(0, 3);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des stages', err);
        this.error = 'Impossible de récupérer les stages.';
        this.loading = false;
      }
    });
  }

  private buildProfile(): AdvisorProfile {
    const raw = this.advisorForm.value;
    return {
      nom: raw.nom || '',
      profil: raw.profil || '',
      competences: this.parseList((raw.competences as string) || ''),
      langues: this.parseList((raw.langues as string) || ''),
      localisation: (raw.localisation as string || '').toLowerCase(),
      mode: raw.mode as AdvisorProfile['mode'],
      experience: Number(raw.experience) || 0
    };
  }

  private parseList(value?: string): string[] {
    return value
      ? value
          .split(',')
          .map((v) => v.trim().toLowerCase())
          .filter((v) => v.length > 0)
      : [];
  }

  private rankStages(stages: Stage[], profile: AdvisorProfile): StageMatchResult[] {
    return stages
      .map((stage) => this.scoreStage(stage, profile))
      .sort((a, b) => b.score - a.score);
  }

  private scoreStage(stage: Stage, profile: AdvisorProfile): StageMatchResult {
    const required = (stage.requiredSkills || []).map((s) => s.toLowerCase());
    const bonus = (stage.niceToHaveSkills || []).map((s) => s.toLowerCase());
    const langs = (stage.languages || []).map((s) => s.toLowerCase());

    const matchedSkills = required.filter((r) => profile.competences.includes(r));
    const missingSkills = required.filter((r) => !profile.competences.includes(r));
    const bonusMatched = bonus.filter((r) => profile.competences.includes(r));
    const langsMatched = langs.filter((l) => profile.langues.includes(l));

    const requiredScore = required.length > 0 ? matchedSkills.length / required.length : 0.35;
    const bonusScore = bonus.length > 0 ? bonusMatched.length / bonus.length : 0;
    const langScore = langs.length > 0 ? langsMatched.length / langs.length : 0.1;

    const locationScore = stage.location && profile.localisation
      ? this.fuzzyMatch(stage.location, profile.localisation) ? 1 : 0
      : 0.2;

    const modeScore = this.scoreMode(stage.mode, profile.mode);
    const experienceScore = this.scoreExperience(stage.minExperienceYears, profile.experience);

    const weighted =
      requiredScore * 0.55 +
      bonusScore * 0.1 +
      langScore * 0.1 +
      locationScore * 0.1 +
      modeScore * 0.1 +
      experienceScore * 0.05;

    const acceptance = Math.round(Math.min(98, Math.max(25, weighted * 100)));

    const reasons = this.buildReasons({ matchedSkills, missingSkills, bonusMatched, langsMatched, stage, profile, acceptance });

    return {
      stage,
      score: weighted,
      acceptance,
      matchedSkills,
      missingSkills,
      reasons
    };
  }

  private scoreMode(stageMode: Stage['mode'], userMode: AdvisorProfile['mode']): number {
    if (!userMode || userMode === 'any') return 0.2;
    if (!stageMode) return 0.1;
    return stageMode === userMode ? 1 : 0.1;
  }

  private scoreExperience(stageMin?: number, userExp?: number): number {
    if (stageMin === undefined || stageMin === null) return 0.3;
    const exp = userExp || 0;
    if (exp >= stageMin) return 1;
    const ratio = exp / Math.max(stageMin, 1);
    return Math.max(0, Math.min(1, ratio));
  }

  private fuzzyMatch(a?: string, b?: string): boolean {
    if (!a || !b) return false;
    return a.toLowerCase().includes(b) || b.toLowerCase().includes(a);
  }

  private buildReasons(params: {
    matchedSkills: string[];
    missingSkills: string[];
    bonusMatched: string[];
    langsMatched: string[];
    stage: Stage;
    profile: AdvisorProfile;
    acceptance: number;
  }): string[] {
    const reasons: string[] = [];
    if (params.matchedSkills.length) {
      reasons.push(`Compétences alignées: ${params.matchedSkills.join(', ')}`);
    }
    if (params.missingSkills.length) {
      reasons.push(`À travailler: ${params.missingSkills.join(', ')}`);
    }
    if (params.bonusMatched.length) {
      reasons.push(`Bonus correspondants: ${params.bonusMatched.join(', ')}`);
    }
    if (params.langsMatched.length) {
      reasons.push(`Langues ok: ${params.langsMatched.join(', ')}`);
    }
    if (params.stage.mode && params.profile.mode !== 'any') {
      reasons.push(`Mode souhaité: ${params.stage.mode}`);
    }
    reasons.push(`Probabilité d'acceptation estimée: ${params.acceptance}%`);
    return reasons;
  }
}
